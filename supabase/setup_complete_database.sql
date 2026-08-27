-- ==============================================================================
-- EDUPRIME SCHOOL MANAGEMENT SYSTEM - COMPLETE ONLINE SUPABASE DATABASE SETUP
-- Copy and paste this ENTIRE script into your Supabase SQL Editor and click RUN.
-- ==============================================================================

-- Enable pgcrypto for secure cryptographic hashing & blowfish
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if re-initializing
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.admin_settings CASCADE;
DROP TABLE IF EXISTS public.marks CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.subjects CASCADE;
DROP TABLE IF EXISTS public.teachers CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. PROFILES TABLE
CREATE TABLE public.profiles (
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
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_number INTEGER NOT NULL CHECK (class_number BETWEEN 1 AND 6),
    section TEXT NOT NULL DEFAULT 'A',
    academic_year TEXT NOT NULL DEFAULT '2026-2027',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_class_section_year UNIQUE (class_number, section, academic_year)
);

-- 3. STUDENTS TABLE
CREATE TABLE public.students (
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
CREATE TABLE public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    employee_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    assigned_class TEXT NOT NULL,
    assigned_class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SUBJECTS TABLE (Admin managed)
CREATE TABLE public.subjects (
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
CREATE TABLE public.attendance (
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
CREATE TABLE public.marks (
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

-- 8. ADMIN SETTINGS TABLE (Single active 6-digit Admin PIN hash)
CREATE TABLE public.admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pin_hash TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AUDIT LOGS TABLE
CREATE TABLE public.audit_logs (
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

-- Indexes for performance
CREATE INDEX idx_students_class_id ON public.students(class_id);
CREATE INDEX idx_students_admission_no ON public.students(admission_number);
CREATE INDEX idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX idx_attendance_class_date ON public.attendance(class_id, attendance_date);
CREATE INDEX idx_marks_student_id ON public.marks(student_id);
CREATE INDEX idx_marks_class_subject ON public.marks(class_id, subject_id);
CREATE INDEX idx_subjects_class_id ON public.subjects(class_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- STORED DATABASE FUNCTIONS (RPCs)
-- ==============================================================================

-- 1. Verify Admin PIN Function
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
    RETURN stored_hash = crypt(input_pin, stored_hash);
END;
$$;

-- 2. Change Admin PIN Function
CREATE OR REPLACE FUNCTION public.change_admin_pin(old_pin TEXT, new_pin TEXT, admin_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_valid_old BOOLEAN;
    new_hash TEXT;
BEGIN
    IF length(new_pin) != 6 OR new_pin !~ '^\d{6}$' THEN
        RAISE EXCEPTION 'New PIN must be exactly 6 digits';
    END IF;

    is_valid_old := public.verify_admin_pin(old_pin);
    IF NOT is_valid_old THEN
        RAISE EXCEPTION 'Previous Admin PIN is incorrect';
    END IF;

    new_hash := crypt(new_pin, gen_salt('bf', 10));

    UPDATE public.admin_settings
    SET pin_hash = new_hash,
        updated_at = NOW(),
        updated_by = admin_id;

    INSERT INTO public.audit_logs (user_id, user_role, action, table_name, description)
    VALUES (admin_id, 'admin', 'UPDATE_ADMIN_PIN', 'admin_settings', 'Admin changed the 6-digit Master PIN');

    RETURN TRUE;
END;
$$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Anonymous and Authenticated Access policies
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public write profiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Public read classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Public write classes" ON public.classes FOR ALL USING (true);

CREATE POLICY "Public read students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Public write students" ON public.students FOR ALL USING (true);

CREATE POLICY "Public read teachers" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Public write teachers" ON public.teachers FOR ALL USING (true);

CREATE POLICY "Public read subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Public write subjects" ON public.subjects FOR ALL USING (true);

CREATE POLICY "Public read attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Public write attendance" ON public.attendance FOR ALL USING (true);

CREATE POLICY "Public read marks" ON public.marks FOR SELECT USING (true);
CREATE POLICY "Public write marks" ON public.marks FOR ALL USING (true);

CREATE POLICY "Public read admin_settings" ON public.admin_settings FOR SELECT USING (true);
CREATE POLICY "Public write admin_settings" ON public.admin_settings FOR ALL USING (true);

CREATE POLICY "Public read audit_logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Public write audit_logs" ON public.audit_logs FOR ALL USING (true);

-- ==============================================================================
-- SEED INITIAL DATA (100% Standard Valid Hexadecimal UUIDs)
-- ==============================================================================

-- 1. Default Admin PIN = 123456
INSERT INTO public.admin_settings (id, pin_hash)
VALUES ('90000000-0000-0000-0000-000000000001', crypt('123456', gen_salt('bf', 10)));

-- 2. Profiles
INSERT INTO public.profiles (id, email, full_name, role, phone)
VALUES 
    ('10000000-0000-0000-0000-000000000001', 'admin@school.edu', 'System Administrator', 'admin', '+1 (555) 019-2831'),
    ('20000000-0000-0000-0000-000000000001', 'headmaster@school.edu', 'Dr. Robert Vance', 'head_master', '+1 (555) 019-2832'),
    ('30000000-0000-0000-0000-000000000001', 'teacher1@school.edu', 'Mrs. Sarah Jenkins', 'teacher', '+1 (555) 019-2833'),
    ('30000000-0000-0000-0000-000000000002', 'teacher2@school.edu', 'Mr. David Kumar', 'teacher', '+1 (555) 019-2834'),
    ('30000000-0000-0000-0000-000000000003', 'teacher3@school.edu', 'Ms. Elena Rodriguez', 'teacher', '+1 (555) 019-2835'),
    ('30000000-0000-0000-0000-000000000004', 'teacher4@school.edu', 'Mr. James Wilson', 'teacher', '+1 (555) 019-2836'),
    ('30000000-0000-0000-0000-000000000005', 'teacher5@school.edu', 'Mrs. Priya Sharma', 'teacher', '+1 (555) 019-2837'),
    ('30000000-0000-0000-0000-000000000006', 'teacher6@school.edu', 'Mr. Michael Chang', 'teacher', '+1 (555) 019-2838');

-- 3. Classes (Classes 1 through 6)
INSERT INTO public.classes (id, class_number, section, academic_year)
VALUES
    ('00000001-0000-0000-0000-000000000001', 1, 'A', '2026-2027'),
    ('00000001-0000-0000-0000-000000000002', 2, 'A', '2026-2027'),
    ('00000001-0000-0000-0000-000000000003', 3, 'A', '2026-2027'),
    ('00000001-0000-0000-0000-000000000004', 4, 'A', '2026-2027'),
    ('00000001-0000-0000-0000-000000000005', 5, 'A', '2026-2027'),
    ('00000001-0000-0000-0000-000000000006', 6, 'A', '2026-2027');

-- 4. Teachers
INSERT INTO public.teachers (id, profile_id, employee_id, full_name, email, phone, assigned_class, assigned_class_id)
VALUES
    ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'EMP-T01', 'Mrs. Sarah Jenkins', 'teacher1@school.edu', '+1 (555) 019-2833', 'Class 1', '00000001-0000-0000-0000-000000000001'),
    ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'EMP-T02', 'Mr. David Kumar', 'teacher2@school.edu', '+1 (555) 019-2834', 'Class 2', '00000001-0000-0000-0000-000000000002'),
    ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 'EMP-T03', 'Ms. Elena Rodriguez', 'teacher3@school.edu', '+1 (555) 019-2835', 'Class 3', '00000001-0000-0000-0000-000000000003'),
    ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', 'EMP-T04', 'Mr. James Wilson', 'teacher4@school.edu', '+1 (555) 019-2836', 'Class 4', '00000001-0000-0000-0000-000000000004'),
    ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', 'EMP-T05', 'Mrs. Priya Sharma', 'teacher5@school.edu', '+1 (555) 019-2837', 'Class 5', '00000001-0000-0000-0000-000000000005'),
    ('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000006', 'EMP-T06', 'Mr. Michael Chang', 'teacher6@school.edu', '+1 (555) 019-2838', 'Class 6', '00000001-0000-0000-0000-000000000006');

-- 5. Subjects
INSERT INTO public.subjects (id, subject_name, class_id, maximum_marks, created_by)
VALUES
    ('50000001-0000-0000-0000-000000000001', 'English', '00000001-0000-0000-0000-000000000001', 100, '10000000-0000-0000-0000-000000000001'),
    ('50000001-0000-0000-0000-000000000002', 'Mathematics', '00000001-0000-0000-0000-000000000001', 100, '10000000-0000-0000-0000-000000000001'),
    ('50000001-0000-0000-0000-000000000003', 'Science', '00000001-0000-0000-0000-000000000001', 100, '10000000-0000-0000-0000-000000000001'),
    ('50000001-0000-0000-0000-000000000004', 'Social Studies', '00000001-0000-0000-0000-000000000001', 100, '10000000-0000-0000-0000-000000000001'),
    ('50000001-0000-0000-0000-000000000005', 'Telugu', '00000001-0000-0000-0000-000000000001', 100, '10000000-0000-0000-0000-000000000001'),
    ('50000001-0000-0000-0000-000000000006', 'Hindi', '00000001-0000-0000-0000-000000000001', 100, '10000000-0000-0000-0000-000000000001'),
    -- Class 4 Subjects
    ('50000004-0000-0000-0000-000000000001', 'English', '00000001-0000-0000-0000-000000000004', 100, '10000000-0000-0000-0000-000000000001'),
    ('50000004-0000-0000-0000-000000000002', 'Mathematics', '00000001-0000-0000-0000-000000000004', 100, '10000000-0000-0000-0000-000000000001'),
    ('50000004-0000-0000-0000-000000000003', 'Science', '00000001-0000-0000-0000-000000000004', 100, '10000000-0000-0000-0000-000000000001'),
    ('50000004-0000-0000-0000-000000000004', 'Social Studies', '00000001-0000-0000-0000-000000000004', 100, '10000000-0000-0000-0000-000000000001'),
    ('50000004-0000-0000-0000-000000000005', 'Telugu', '00000001-0000-0000-0000-000000000004', 100, '10000000-0000-0000-0000-000000000001'),
    ('50000004-0000-0000-0000-000000000006', 'Hindi', '00000001-0000-0000-0000-000000000004', 100, '10000000-0000-0000-0000-000000000001');

-- 6. Students
INSERT INTO public.students (id, admission_number, student_name, date_of_birth, gender, father_name, mother_name, parent_phone, address, class_id, section, roll_number, admission_date)
VALUES
    ('60000000-0000-0000-0000-000000000001', 'ADM-2026-001', 'Aarav Patel', '2020-05-14', 'Male', 'Rajesh Patel', 'Meena Patel', '+1 (555) 123-4501', '120 Lotus Garden, Hyderabad', '00000001-0000-0000-0000-000000000001', 'A', 1, '2026-06-01'),
    ('60000000-0000-0000-0000-000000000002', 'ADM-2026-002', 'Diya Reddy', '2020-08-22', 'Female', 'Srinivas Reddy', 'Kavitha Reddy', '+1 (555) 123-4502', '45 Jubilee Hills, Hyderabad', '00000001-0000-0000-0000-000000000001', 'A', 2, '2026-06-01'),
    ('60000000-0000-0000-0000-000000000003', 'ADM-2026-013', 'Rahul Sharma', '2017-03-25', 'Male', 'Deepak Sharma', 'Anju Sharma', '+1 (555) 123-4513', '102 Secunderabad, Telangana', '00000001-0000-0000-0000-000000000004', 'A', 1, '2026-06-01'),
    ('60000000-0000-0000-0000-000000000004', 'ADM-2026-014', 'Priya Nair', '2017-09-17', 'Female', 'Mohan Nair', 'Radha Nair', '+1 (555) 123-4514', '48 Sainikpuri, Hyderabad', '00000001-0000-0000-0000-000000000004', 'A', 2, '2026-06-01'),
    ('60000000-0000-0000-0000-000000000005', 'ADM-2026-015', 'Kiran Kumar', '2017-05-11', 'Male', 'Satish Kumar', 'Bhavani Kumar', '+1 (555) 123-4515', '62 Tarnaka, Hyderabad', '00000001-0000-0000-0000-000000000004', 'A', 3, '2026-06-02'),
    ('60000000-0000-0000-0000-000000000006', 'ADM-2026-016', 'Anil Mehta', '2017-12-03', 'Male', 'Prakash Mehta', 'Kanta Mehta', '+1 (555) 123-4516', '81 Uppal, Hyderabad', '00000001-0000-0000-0000-000000000004', 'A', 4, '2026-06-03'),
    ('60000000-0000-0000-0000-000000000007', 'ADM-2026-017', 'Sita Ram', '2017-08-19', 'Female', 'Hanumanth Rao', 'Janaki Rao', '+1 (555) 123-4517', '35 LB Nagar, Hyderabad', '00000001-0000-0000-0000-000000000004', 'A', 5, '2026-06-04');

-- 7. Attendance
INSERT INTO public.attendance (id, student_id, class_id, attendance_date, status, taken_by)
VALUES
    ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000003', '00000001-0000-0000-0000-000000000004', '2026-08-26', 'present', '30000000-0000-0000-0000-000000000004'),
    ('70000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000004', '00000001-0000-0000-0000-000000000004', '2026-08-26', 'present', '30000000-0000-0000-0000-000000000004'),
    ('70000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000005', '00000001-0000-0000-0000-000000000004', '2026-08-26', 'absent',  '30000000-0000-0000-0000-000000000004'),
    ('70000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000006', '00000001-0000-0000-0000-000000000004', '2026-08-26', 'present', '30000000-0000-0000-0000-000000000004'),
    ('70000000-0000-0000-0000-000000000005', '60000000-0000-0000-0000-000000000007', '00000001-0000-0000-0000-000000000004', '2026-08-26', 'absent',  '30000000-0000-0000-0000-000000000004');

-- 8. Marks
INSERT INTO public.marks (id, student_id, class_id, subject_id, marks, entered_by)
VALUES
    ('80000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000003', '00000001-0000-0000-0000-000000000004', '50000004-0000-0000-0000-000000000001', 84, '30000000-0000-0000-0000-000000000004'),
    ('80000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000003', '00000001-0000-0000-0000-000000000004', '50000004-0000-0000-0000-000000000002', 91, '30000000-0000-0000-0000-000000000004'),
    ('80000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000003', '00000001-0000-0000-0000-000000000004', '50000004-0000-0000-0000-000000000003', 88, '30000000-0000-0000-0000-000000000004'),
    ('80000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000003', '00000001-0000-0000-0000-000000000004', '50000004-0000-0000-0000-000000000004', 79, '30000000-0000-0000-0000-000000000004'),
    ('80000000-0000-0000-0000-000000000005', '60000000-0000-0000-0000-000000000003', '00000001-0000-0000-0000-000000000004', '50000004-0000-0000-0000-000000000005', 90, '30000000-0000-0000-0000-000000000004'),
    ('80000000-0000-0000-0000-000000000006', '60000000-0000-0000-0000-000000000003', '00000001-0000-0000-0000-000000000004', '50000004-0000-0000-0000-000000000006', 82, '30000000-0000-0000-0000-000000000004');

-- 9. Audit Logs
INSERT INTO public.audit_logs (user_id, user_email, user_role, action, table_name, description)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'admin@school.edu', 'admin', 'INITIAL_SYSTEM_SETUP', 'system', 'EduPrime School Management System online database initialized with full schema and seed data');
