-- ==============================================================================
-- School Management System - Supabase PostgreSQL Schema & RLS Policies
-- ==============================================================================

-- Enable pgcrypto for secure cryptographic hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'head_master', 'teacher')),
    phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CLASSES TABLE (Classes 1 through 6)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_number INTEGER NOT NULL CHECK (class_number BETWEEN 1 AND 6),
    section TEXT NOT NULL DEFAULT 'A',
    academic_year TEXT NOT NULL DEFAULT '2026-2027',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_class_section_year UNIQUE (class_number, section, academic_year)
);

-- 3. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_number TEXT UNIQUE NOT NULL,
    student_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    father_name TEXT,
    mother_name TEXT,
    parent_phone TEXT,
    address TEXT,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    section TEXT NOT NULL DEFAULT 'A',
    roll_number INTEGER NOT NULL,
    admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TEACHERS TABLE
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    employee_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    assigned_class TEXT NOT NULL, -- e.g. "Class 1", "Class 2"
    assigned_class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SUBJECTS TABLE (Only Admin can manage)
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_name TEXT NOT NULL,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    maximum_marks INTEGER NOT NULL DEFAULT 100 CHECK (maximum_marks > 0),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_subject_per_class UNIQUE (subject_name, class_id)
);

-- 6. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
    taken_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_attendance_date UNIQUE (student_id, attendance_date)
);

-- 7. MARKS TABLE
CREATE TABLE IF NOT EXISTS public.marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    marks NUMERIC NOT NULL CHECK (marks >= 0),
    entered_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_subject_marks UNIQUE (student_id, subject_id)
);

-- 8. ADMIN SETTINGS TABLE (Single active Admin PIN hash)
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pin_hash TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_email TEXT,
    user_role TEXT,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id TEXT,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERIES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_admission_no ON public.students(admission_number);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON public.attendance(class_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_marks_student_id ON public.marks(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_class_subject ON public.marks(class_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_subjects_class_id ON public.subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_teachers_profile_id ON public.teachers(profile_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- SECURE STORED PROCEDURES (RPCs)
-- ==============================================================================

-- 1. Verify Admin PIN (Uses bcrypt / crypt)
CREATE OR REPLACE FUNCTION public.verify_admin_pin(input_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    stored_hash TEXT;
BEGIN
    SELECT pin_hash INTO stored_hash FROM public.admin_settings LIMIT 1;
    IF stored_hash IS NULL THEN
        RETURN FALSE;
    END IF;
    -- Compare input PIN with stored blowfish hash
    RETURN stored_hash = crypt(input_pin, stored_hash);
END;
$$;

-- 2. Change Admin PIN (Verifies previous PIN first)
CREATE OR REPLACE FUNCTION public.change_admin_pin(old_pin TEXT, new_pin TEXT, admin_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_valid_old BOOLEAN;
    new_hash TEXT;
BEGIN
    -- Verify input constraints
    IF length(new_pin) != 6 OR new_pin !~ '^\d{6}$' THEN
        RAISE EXCEPTION 'New PIN must be exactly 6 digits';
    END IF;

    -- Verify previous PIN
    is_valid_old := public.verify_admin_pin(old_pin);
    IF NOT is_valid_old THEN
        RAISE EXCEPTION 'Previous Admin PIN is incorrect';
    END IF;

    -- Generate secure hash for new PIN
    new_hash := crypt(new_pin, gen_salt('bf', 10));

    -- Update admin_settings
    UPDATE public.admin_settings
    SET pin_hash = new_hash,
        updated_at = NOW(),
        updated_by = admin_id;

    -- Log to audit_logs
    INSERT INTO public.audit_logs (user_id, user_role, action, table_name, description)
    VALUES (admin_id, 'admin', 'UPDATE_ADMIN_PIN', 'admin_settings', 'Admin changed the 6-digit Admin PIN securely');

    RETURN TRUE;
END;
$$;

-- 3. Log Audit Action Function
CREATE OR REPLACE FUNCTION public.log_audit_entry(
    p_user_id UUID,
    p_user_email TEXT,
    p_user_role TEXT,
    p_action TEXT,
    p_table_name TEXT,
    p_record_id TEXT,
    p_description TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.audit_logs (user_id, user_email, user_role, action, table_name, record_id, description)
    VALUES (p_user_id, p_user_email, p_user_role, p_action, p_table_name, p_record_id, p_description)
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper to get current profile role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- PROFILES POLICIES
CREATE POLICY "Profiles readable by authenticated users" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Profiles manageable by admin only" ON public.profiles
    FOR ALL USING (public.get_current_user_role() = 'admin' OR auth.role() = 'service_role');

-- CLASSES POLICIES
CREATE POLICY "Classes readable by all authenticated" ON public.classes
    FOR SELECT USING (true);

CREATE POLICY "Classes manageable by admin" ON public.classes
    FOR ALL USING (public.get_current_user_role() = 'admin' OR auth.role() = 'service_role');

-- STUDENTS POLICIES
CREATE POLICY "Students readable by all authenticated users" ON public.students
    FOR SELECT USING (true);

CREATE POLICY "Students manageable by Admin and Head Master" ON public.students
    FOR ALL USING (
        public.get_current_user_role() IN ('admin', 'head_master') 
        OR auth.role() = 'service_role'
    );

-- TEACHERS POLICIES
CREATE POLICY "Teachers readable by all authenticated" ON public.teachers
    FOR SELECT USING (true);

CREATE POLICY "Teachers manageable by Admin only" ON public.teachers
    FOR ALL USING (public.get_current_user_role() = 'admin' OR auth.role() = 'service_role');

-- SUBJECTS POLICIES
CREATE POLICY "Subjects readable by all authenticated" ON public.subjects
    FOR SELECT USING (true);

CREATE POLICY "Subjects manageable by Admin only" ON public.subjects
    FOR ALL USING (public.get_current_user_role() = 'admin' OR auth.role() = 'service_role');

-- ATTENDANCE POLICIES
CREATE POLICY "Attendance readable by all authenticated" ON public.attendance
    FOR SELECT USING (true);

CREATE POLICY "Attendance insertable by teachers, HM and admin" ON public.attendance
    FOR INSERT WITH CHECK (
        public.get_current_user_role() IN ('admin', 'head_master', 'teacher')
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Attendance updatable by Admin and Head Master" ON public.attendance
    FOR UPDATE USING (
        public.get_current_user_role() IN ('admin', 'head_master')
        OR auth.role() = 'service_role'
    );

-- MARKS POLICIES
CREATE POLICY "Marks readable by all authenticated" ON public.marks
    FOR SELECT USING (true);

CREATE POLICY "Marks insertable and updatable by all roles" ON public.marks
    FOR ALL USING (
        public.get_current_user_role() IN ('admin', 'head_master', 'teacher')
        OR auth.role() = 'service_role'
    );

-- ADMIN SETTINGS POLICIES (Strictly Admin only)
CREATE POLICY "Admin settings only accessible by admin" ON public.admin_settings
    FOR ALL USING (public.get_current_user_role() = 'admin' OR auth.role() = 'service_role');

-- AUDIT LOGS POLICIES (Viewable by Admin only)
CREATE POLICY "Audit logs readable by admin only" ON public.audit_logs
    FOR SELECT USING (public.get_current_user_role() = 'admin' OR auth.role() = 'service_role');

CREATE POLICY "Audit logs insertable by system/authenticated" ON public.audit_logs
    FOR INSERT WITH CHECK (true);
