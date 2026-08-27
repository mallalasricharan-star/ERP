// User and Role definitions
export type UserRole = 'admin' | 'head_master' | 'teacher';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClassRoom {
  id: string;
  class_number: number; // 1 to 6
  section: string; // 'A', 'B'
  academic_year: string; // '2026-2027'
  created_at?: string;
  // Computed fields
  student_count?: number;
  present_today?: number;
  absent_today?: number;
  attendance_percentage?: number;
  assigned_teacher_name?: string;
}

export interface Student {
  id: string;
  admission_number: string;
  student_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  father_name: string;
  mother_name: string;
  parent_phone: string;
  address: string;
  class_id: string;
  section: string;
  roll_number: number;
  admission_date: string;
  created_at?: string;
  updated_at?: string;
  // Joined fields
  class_number?: number;
  class_name?: string;
}

export interface Teacher {
  id: string;
  profile_id?: string;
  employee_id: string;
  full_name: string;
  email: string;
  phone: string;
  assigned_class: string; // e.g. "Class 1", "Class 4"
  assigned_class_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Subject {
  id: string;
  subject_name: string;
  class_id: string;
  maximum_marks: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  // Joined fields
  class_number?: number;
}

export interface Attendance {
  id: string;
  student_id: string;
  class_id: string;
  attendance_date: string; // YYYY-MM-DD
  status: 'present' | 'absent';
  taken_by?: string;
  created_at?: string;
  updated_at?: string;
  // Joined fields
  student_name?: string;
  admission_number?: string;
  roll_number?: number;
}

export interface Mark {
  id: string;
  student_id: string;
  class_id: string;
  subject_id: string;
  marks: number;
  entered_by?: string;
  created_at?: string;
  updated_at?: string;
  // Joined fields
  student_name?: string;
  admission_number?: string;
  subject_name?: string;
  maximum_marks?: number;
}

export interface AdminSetting {
  id: string;
  pin_hash: string;
  updated_at?: string;
  updated_by?: string;
  created_at?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  user_role?: string;
  action: string;
  table_name?: string;
  record_id?: string;
  description: string;
  created_at: string;
}

export interface SubjectMarkSummary {
  subject_id: string;
  subject_name: string;
  maximum_marks: number;
  obtained_marks: number;
  percentage: number;
  grade: string;
}

export interface StudentReport {
  student: Student;
  class_number: number;
  marks: SubjectMarkSummary[];
  total_maximum: number;
  total_obtained: number;
  overall_percentage: number;
  overall_grade: string;
  attendance_summary: {
    total_days: number;
    present_days: number;
    absent_days: number;
    percentage: number;
  };
}

// Book Inventory Model
export interface Book {
  id: string;
  book_title: string;
  class_id: string;
  subject: string;
  total_stock: number;
  issued_stock: number;
  available_stock: number;
  publisher?: string;
  academic_year: string;
  created_at?: string;
  updated_at?: string;
  // Joined
  class_number?: number;
}

// Hierarchical Leave Request Model
export type LeaveType = 'Casual Leave' | 'Medical Leave' | 'Personal Leave' | 'Emergency Leave';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  applicant_id: string;
  applicant_name: string;
  applicant_role: 'teacher' | 'head_master';
  assigned_class?: string;
  leave_type: LeaveType;
  from_date: string;
  to_date: string;
  days_count: number;
  reason: string;
  status: LeaveStatus;
  reviewer_id?: string;
  reviewer_name?: string;
  reviewer_comment?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    phone?: string;
    assigned_class?: string;
    assigned_class_id?: string;
  };
  token: string;
}

export interface DashboardStats {
  total_students: number;
  total_teachers: number;
  total_classes: number;
  total_subjects: number;
  today_present: number;
  today_absent: number;
  today_attendance_percentage: number;
  class_stats: {
    class_id: string;
    class_number: number;
    section: string;
    student_count: number;
    present_today: number;
    absent_today: number;
    attendance_percentage: number;
  }[];
  recent_logs: AuditLog[];
}
