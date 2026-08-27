import { ClassRoom, Student, Teacher, Subject, Attendance, Mark, AuditLog, Profile } from '../types';

const STORAGE_KEY_PREFIX = 'eduprime_db_';

// Initial Classes 1 through 6
export const INITIAL_CLASSES: ClassRoom[] = [
  { id: 'c1111111-0000-0000-0000-000000000001', class_number: 1, section: 'A', academic_year: '2026-2027', created_at: '2026-06-01T00:00:00Z' },
  { id: 'c2222222-0000-0000-0000-000000000002', class_number: 2, section: 'A', academic_year: '2026-2027', created_at: '2026-06-01T00:00:00Z' },
  { id: 'c3333333-0000-0000-0000-000000000003', class_number: 3, section: 'A', academic_year: '2026-2027', created_at: '2026-06-01T00:00:00Z' },
  { id: 'c4444444-0000-0000-0000-000000000004', class_number: 4, section: 'A', academic_year: '2026-2027', created_at: '2026-06-01T00:00:00Z' },
  { id: 'c5555555-0000-0000-0000-000000000005', class_number: 5, section: 'A', academic_year: '2026-2027', created_at: '2026-06-01T00:00:00Z' },
  { id: 'c6666666-0000-0000-0000-000000000006', class_number: 6, section: 'A', academic_year: '2026-2027', created_at: '2026-06-01T00:00:00Z' },
];

// Initial Profiles
export const INITIAL_PROFILES: Profile[] = [
  { id: '11111111-1111-1111-1111-111111111111', email: 'admin@school.edu', full_name: 'System Administrator', role: 'admin', phone: '+1 (555) 019-2831', is_active: true },
  { id: '22222222-2222-2222-2222-222222222222', email: 'headmaster@school.edu', full_name: 'Dr. Robert Vance', role: 'head_master', phone: '+1 (555) 019-2832', is_active: true },
  { id: '33333333-3333-3333-3333-333333333301', email: 'teacher1@school.edu', full_name: 'Mrs. Sarah Jenkins', role: 'teacher', phone: '+1 (555) 019-2833', is_active: true },
  { id: '33333333-3333-3333-3333-333333333302', email: 'teacher2@school.edu', full_name: 'Mr. David Kumar', role: 'teacher', phone: '+1 (555) 019-2834', is_active: true },
  { id: '33333333-3333-3333-3333-333333333303', email: 'teacher3@school.edu', full_name: 'Ms. Elena Rodriguez', role: 'teacher', phone: '+1 (555) 019-2835', is_active: true },
  { id: '33333333-3333-3333-3333-333333333304', email: 'teacher4@school.edu', full_name: 'Mr. James Wilson', role: 'teacher', phone: '+1 (555) 019-2836', is_active: true },
  { id: '33333333-3333-3333-3333-333333333305', email: 'teacher5@school.edu', full_name: 'Mrs. Priya Sharma', role: 'teacher', phone: '+1 (555) 019-2837', is_active: true },
  { id: '33333333-3333-3333-3333-333333333306', email: 'teacher6@school.edu', full_name: 'Mr. Michael Chang', role: 'teacher', phone: '+1 (555) 019-2838', is_active: true },
];

// Initial Teachers
export const INITIAL_TEACHERS: Teacher[] = [
  { id: 't1111111-0000-0000-0000-000000000001', profile_id: '33333333-3333-3333-3333-333333333301', employee_id: 'EMP-T01', full_name: 'Mrs. Sarah Jenkins', email: 'teacher1@school.edu', phone: '+1 (555) 019-2833', assigned_class: 'Class 1', assigned_class_id: 'c1111111-0000-0000-0000-000000000001', is_active: true },
  { id: 't2222222-0000-0000-0000-000000000002', profile_id: '33333333-3333-3333-3333-333333333302', employee_id: 'EMP-T02', full_name: 'Mr. David Kumar', email: 'teacher2@school.edu', phone: '+1 (555) 019-2834', assigned_class: 'Class 2', assigned_class_id: 'c2222222-0000-0000-0000-000000000002', is_active: true },
  { id: 't3333333-0000-0000-0000-000000000003', profile_id: '33333333-3333-3333-3333-333333333303', employee_id: 'EMP-T03', full_name: 'Ms. Elena Rodriguez', email: 'teacher3@school.edu', phone: '+1 (555) 019-2835', assigned_class: 'Class 3', assigned_class_id: 'c3333333-0000-0000-0000-000000000003', is_active: true },
  { id: 't4444444-0000-0000-0000-000000000004', profile_id: '33333333-3333-3333-3333-333333333304', employee_id: 'EMP-T04', full_name: 'Mr. James Wilson', email: 'teacher4@school.edu', phone: '+1 (555) 019-2836', assigned_class: 'Class 4', assigned_class_id: 'c4444444-0000-0000-0000-000000000004', is_active: true },
  { id: 't5555555-0000-0000-0000-000000000005', profile_id: '33333333-3333-3333-3333-333333333305', employee_id: 'EMP-T05', full_name: 'Mrs. Priya Sharma', email: 'teacher5@school.edu', phone: '+1 (555) 019-2837', assigned_class: 'Class 5', assigned_class_id: 'c5555555-0000-0000-0000-000000000005', is_active: true },
  { id: 't6666666-0000-0000-0000-000000000006', profile_id: '33333333-3333-3333-3333-333333333306', employee_id: 'EMP-T06', full_name: 'Mr. Michael Chang', email: 'teacher6@school.edu', phone: '+1 (555) 019-2838', assigned_class: 'Class 6', assigned_class_id: 'c6666666-0000-0000-0000-000000000006', is_active: true },
];

// Generate Subjects for all classes 1-6
export const INITIAL_SUBJECTS: Subject[] = [
  ...[1, 2, 3, 4, 5, 6].flatMap(classNum => {
    const classId = INITIAL_CLASSES[classNum - 1].id;
    return [
      { id: `s${classNum}01-0000-0000-0000-000000000001`, subject_name: 'English', class_id: classId, maximum_marks: 100, class_number: classNum },
      { id: `s${classNum}02-0000-0000-0000-000000000002`, subject_name: 'Mathematics', class_id: classId, maximum_marks: 100, class_number: classNum },
      { id: `s${classNum}03-0000-0000-0000-000000000003`, subject_name: 'Science', class_id: classId, maximum_marks: 100, class_number: classNum },
      { id: `s${classNum}04-0000-0000-0000-000000000004`, subject_name: 'Social Studies', class_id: classId, maximum_marks: 100, class_number: classNum },
      { id: `s${classNum}05-0000-0000-0000-000000000005`, subject_name: 'Telugu', class_id: classId, maximum_marks: 100, class_number: classNum },
      { id: `s${classNum}06-0000-0000-0000-000000000006`, subject_name: 'Hindi', class_id: classId, maximum_marks: 100, class_number: classNum },
    ];
  })
];

// Initial Students
export const INITIAL_STUDENTS: Student[] = [
  // Class 1
  { id: 'st101', admission_number: 'ADM-2026-001', student_name: 'Aarav Patel', date_of_birth: '2020-05-14', gender: 'Male', father_name: 'Rajesh Patel', mother_name: 'Meena Patel', parent_phone: '+1 (555) 123-4501', address: '120 Lotus Garden, Hyderabad', class_id: INITIAL_CLASSES[0].id, section: 'A', roll_number: 1, admission_date: '2026-06-01' },
  { id: 'st102', admission_number: 'ADM-2026-002', student_name: 'Diya Reddy', date_of_birth: '2020-08-22', gender: 'Female', father_name: 'Srinivas Reddy', mother_name: 'Kavitha Reddy', parent_phone: '+1 (555) 123-4502', address: '45 Jubilee Hills, Hyderabad', class_id: INITIAL_CLASSES[0].id, section: 'A', roll_number: 2, admission_date: '2026-06-01' },
  { id: 'st103', admission_number: 'ADM-2026-003', student_name: 'Vivaan Sharma', date_of_birth: '2020-03-10', gender: 'Male', father_name: 'Anand Sharma', mother_name: 'Pooja Sharma', parent_phone: '+1 (555) 123-4503', address: '88 Banjara Hills, Hyderabad', class_id: INITIAL_CLASSES[0].id, section: 'A', roll_number: 3, admission_date: '2026-06-02' },
  { id: 'st104', admission_number: 'ADM-2026-004', student_name: 'Ananya Gupta', date_of_birth: '2020-11-05', gender: 'Female', father_name: 'Vikas Gupta', mother_name: 'Sunita Gupta', parent_phone: '+1 (555) 123-4504', address: '12 Madhapur, Hyderabad', class_id: INITIAL_CLASSES[0].id, section: 'A', roll_number: 4, admission_date: '2026-06-03' },
  { id: 'st105', admission_number: 'ADM-2026-005', student_name: 'Reyansh Rao', date_of_birth: '2020-02-18', gender: 'Male', father_name: 'Kiran Rao', mother_name: 'Swapna Rao', parent_phone: '+1 (555) 123-4505', address: '71 Gachibowli, Hyderabad', class_id: INITIAL_CLASSES[0].id, section: 'A', roll_number: 5, admission_date: '2026-06-04' },
  
  // Class 2
  { id: 'st201', admission_number: 'ADM-2026-006', student_name: 'Ishaan Verma', date_of_birth: '2019-06-12', gender: 'Male', father_name: 'Ramesh Verma', mother_name: 'Geeta Verma', parent_phone: '+1 (555) 123-4506', address: '33 Kondapur, Hyderabad', class_id: INITIAL_CLASSES[1].id, section: 'A', roll_number: 1, admission_date: '2026-06-01' },
  { id: 'st202', admission_number: 'ADM-2026-007', student_name: 'Myra Joshi', date_of_birth: '2019-09-30', gender: 'Female', father_name: 'Sanjay Joshi', mother_name: 'Shalini Joshi', parent_phone: '+1 (555) 123-4507', address: '19 Hitech City, Hyderabad', class_id: INITIAL_CLASSES[1].id, section: 'A', roll_number: 2, admission_date: '2026-06-01' },
  { id: 'st203', admission_number: 'ADM-2026-008', student_name: 'Kabir Das', date_of_birth: '2019-04-15', gender: 'Male', father_name: 'Gopal Das', mother_name: 'Laxmi Das', parent_phone: '+1 (555) 123-4508', address: '54 Begumpet, Hyderabad', class_id: INITIAL_CLASSES[1].id, section: 'A', roll_number: 3, admission_date: '2026-06-02' },
  { id: 'st204', admission_number: 'ADM-2026-009', student_name: 'Sara Ali', date_of_birth: '2019-12-08', gender: 'Female', father_name: 'Imran Ali', mother_name: 'Farha Ali', parent_phone: '+1 (555) 123-4509', address: '66 Somajiguda, Hyderabad', class_id: INITIAL_CLASSES[1].id, section: 'A', roll_number: 4, admission_date: '2026-06-03' },

  // Class 3
  { id: 'st301', admission_number: 'ADM-2026-010', student_name: 'Aditya Singh', date_of_birth: '2018-07-21', gender: 'Male', father_name: 'Manish Singh', mother_name: 'Rekha Singh', parent_phone: '+1 (555) 123-4510', address: '90 Ameerpet, Hyderabad', class_id: INITIAL_CLASSES[2].id, section: 'A', roll_number: 1, admission_date: '2026-06-01' },
  { id: 'st302', admission_number: 'ADM-2026-011', student_name: 'Riya Sen', date_of_birth: '2018-01-14', gender: 'Female', father_name: 'Tapan Sen', mother_name: 'Monika Sen', parent_phone: '+1 (555) 123-4511', address: '14 Kukatpally, Hyderabad', class_id: INITIAL_CLASSES[2].id, section: 'A', roll_number: 2, admission_date: '2026-06-01' },
  { id: 'st303', admission_number: 'ADM-2026-012', student_name: 'Sai Krishna', date_of_birth: '2018-10-09', gender: 'Male', father_name: 'Venkatesh Rao', mother_name: 'Padma Rao', parent_phone: '+1 (555) 123-4512', address: '27 Dilsukhnagar, Hyderabad', class_id: INITIAL_CLASSES[2].id, section: 'A', roll_number: 3, admission_date: '2026-06-02' },

  // Class 4
  { id: 'st401', admission_number: 'ADM-2026-013', student_name: 'Rahul Sharma', date_of_birth: '2017-03-25', gender: 'Male', father_name: 'Deepak Sharma', mother_name: 'Anju Sharma', parent_phone: '+1 (555) 123-4513', address: '102 Secunderabad, Telangana', class_id: INITIAL_CLASSES[3].id, section: 'A', roll_number: 1, admission_date: '2026-06-01' },
  { id: 'st402', admission_number: 'ADM-2026-014', student_name: 'Priya Nair', date_of_birth: '2017-09-17', gender: 'Female', father_name: 'Mohan Nair', mother_name: 'Radha Nair', parent_phone: '+1 (555) 123-4514', address: '48 Sainikpuri, Hyderabad', class_id: INITIAL_CLASSES[3].id, section: 'A', roll_number: 2, admission_date: '2026-06-01' },
  { id: 'st403', admission_number: 'ADM-2026-015', student_name: 'Kiran Kumar', date_of_birth: '2017-05-11', gender: 'Male', father_name: 'Satish Kumar', mother_name: 'Bhavani Kumar', parent_phone: '+1 (555) 123-4515', address: '62 Tarnaka, Hyderabad', class_id: INITIAL_CLASSES[3].id, section: 'A', roll_number: 3, admission_date: '2026-06-02' },
  { id: 'st404', admission_number: 'ADM-2026-016', student_name: 'Anil Mehta', date_of_birth: '2017-12-03', gender: 'Male', father_name: 'Prakash Mehta', mother_name: 'Kanta Mehta', parent_phone: '+1 (555) 123-4516', address: '81 Uppal, Hyderabad', class_id: INITIAL_CLASSES[3].id, section: 'A', roll_number: 4, admission_date: '2026-06-03' },
  { id: 'st405', admission_number: 'ADM-2026-017', student_name: 'Sita Ram', date_of_birth: '2017-08-19', gender: 'Female', father_name: 'Hanumanth Rao', mother_name: 'Janaki Rao', parent_phone: '+1 (555) 123-4517', address: '35 LB Nagar, Hyderabad', class_id: INITIAL_CLASSES[3].id, section: 'A', roll_number: 5, admission_date: '2026-06-04' },

  // Class 5
  { id: 'st501', admission_number: 'ADM-2026-018', student_name: 'Devansh Yadav', date_of_birth: '2016-04-18', gender: 'Male', father_name: 'Vijay Yadav', mother_name: 'Mamta Yadav', parent_phone: '+1 (555) 123-4518', address: '94 Miyapur, Hyderabad', class_id: INITIAL_CLASSES[4].id, section: 'A', roll_number: 1, admission_date: '2026-06-01' },
  { id: 'st502', admission_number: 'ADM-2026-019', student_name: 'Kavya S', date_of_birth: '2016-10-24', gender: 'Female', father_name: 'Suresh Babu', mother_name: 'Gayathri S', parent_phone: '+1 (555) 123-4519', address: '21 Nizampet, Hyderabad', class_id: INITIAL_CLASSES[4].id, section: 'A', roll_number: 2, admission_date: '2026-06-01' },
  { id: 'st503', admission_number: 'ADM-2026-020', student_name: 'Tanmay Roy', date_of_birth: '2016-02-09', gender: 'Male', father_name: 'Subhash Roy', mother_name: 'Aparna Roy', parent_phone: '+1 (555) 123-4520', address: '15 Tolichowki, Hyderabad', class_id: INITIAL_CLASSES[4].id, section: 'A', roll_number: 3, admission_date: '2026-06-02' },

  // Class 6
  { id: 'st601', admission_number: 'ADM-2026-021', student_name: 'Nikhil Choudhary', date_of_birth: '2015-05-30', gender: 'Male', father_name: 'Mahesh Choudhary', mother_name: 'Anita Choudhary', parent_phone: '+1 (555) 123-4521', address: '53 Mehdipatnam, Hyderabad', class_id: INITIAL_CLASSES[5].id, section: 'A', roll_number: 1, admission_date: '2026-06-01' },
  { id: 'st602', admission_number: 'ADM-2026-022', student_name: 'Zoya Khan', date_of_birth: '2015-11-16', gender: 'Female', father_name: 'Arif Khan', mother_name: 'Shabana Khan', parent_phone: '+1 (555) 123-4522', address: '77 Attapur, Hyderabad', class_id: INITIAL_CLASSES[5].id, section: 'A', roll_number: 2, admission_date: '2026-06-01' },
  { id: 'st603', admission_number: 'ADM-2026-023', student_name: 'Varun Reddy', date_of_birth: '2015-08-04', gender: 'Male', father_name: 'Chandra Reddy', mother_name: 'Sumathi Reddy', parent_phone: '+1 (555) 123-4523', address: '10 Manikonda, Hyderabad', class_id: INITIAL_CLASSES[5].id, section: 'A', roll_number: 3, admission_date: '2026-06-02' }
];

// Initial Attendance
export const INITIAL_ATTENDANCE: Attendance[] = [
  // Class 4 - Today (2026-08-26)
  { id: 'att-401', student_id: 'st401', class_id: INITIAL_CLASSES[3].id, attendance_date: '2026-08-26', status: 'present', taken_by: '33333333-3333-3333-3333-333333333304' },
  { id: 'att-402', student_id: 'st402', class_id: INITIAL_CLASSES[3].id, attendance_date: '2026-08-26', status: 'present', taken_by: '33333333-3333-3333-3333-333333333304' },
  { id: 'att-403', student_id: 'st403', class_id: INITIAL_CLASSES[3].id, attendance_date: '2026-08-26', status: 'absent', taken_by: '33333333-3333-3333-3333-333333333304' },
  { id: 'att-404', student_id: 'st404', class_id: INITIAL_CLASSES[3].id, attendance_date: '2026-08-26', status: 'present', taken_by: '33333333-3333-3333-3333-333333333304' },
  { id: 'att-405', student_id: 'st405', class_id: INITIAL_CLASSES[3].id, attendance_date: '2026-08-26', status: 'absent', taken_by: '33333333-3333-3333-3333-333333333304' },
  // Class 1 - Today
  { id: 'att-101', student_id: 'st101', class_id: INITIAL_CLASSES[0].id, attendance_date: '2026-08-26', status: 'present', taken_by: '33333333-3333-3333-3333-333333333301' },
  { id: 'att-102', student_id: 'st102', class_id: INITIAL_CLASSES[0].id, attendance_date: '2026-08-26', status: 'present', taken_by: '33333333-3333-3333-3333-333333333301' },
  { id: 'att-103', student_id: 'st103', class_id: INITIAL_CLASSES[0].id, attendance_date: '2026-08-26', status: 'present', taken_by: '33333333-3333-3333-3333-333333333301' },
  { id: 'att-104', student_id: 'st104', class_id: INITIAL_CLASSES[0].id, attendance_date: '2026-08-26', status: 'absent', taken_by: '33333333-3333-3333-3333-333333333301' },
  { id: 'att-105', student_id: 'st105', class_id: INITIAL_CLASSES[0].id, attendance_date: '2026-08-26', status: 'present', taken_by: '33333333-3333-3333-3333-333333333301' },
];

// Initial Marks (Class 4 sample marks)
export const INITIAL_MARKS: Mark[] = [
  // Rahul Sharma (st401)
  { id: 'm-401-1', student_id: 'st401', class_id: INITIAL_CLASSES[3].id, subject_id: INITIAL_SUBJECTS[18].id, marks: 84, entered_by: '33333333-3333-3333-3333-333333333304' }, // English
  { id: 'm-401-2', student_id: 'st401', class_id: INITIAL_CLASSES[3].id, subject_id: INITIAL_SUBJECTS[19].id, marks: 91, entered_by: '33333333-3333-3333-3333-333333333304' }, // Mathematics
  { id: 'm-401-3', student_id: 'st401', class_id: INITIAL_CLASSES[3].id, subject_id: INITIAL_SUBJECTS[20].id, marks: 88, entered_by: '33333333-3333-3333-3333-333333333304' }, // Science
  { id: 'm-401-4', student_id: 'st401', class_id: INITIAL_CLASSES[3].id, subject_id: INITIAL_SUBJECTS[21].id, marks: 79, entered_by: '33333333-3333-3333-3333-333333333304' }, // Social
  { id: 'm-401-5', student_id: 'st401', class_id: INITIAL_CLASSES[3].id, subject_id: INITIAL_SUBJECTS[22].id, marks: 90, entered_by: '33333333-3333-3333-3333-333333333304' }, // Telugu
  { id: 'm-401-6', student_id: 'st401', class_id: INITIAL_CLASSES[3].id, subject_id: INITIAL_SUBJECTS[23].id, marks: 82, entered_by: '33333333-3333-3333-3333-333333333304' }, // Hindi
  
  // Priya Nair (st402)
  { id: 'm-402-1', student_id: 'st402', class_id: INITIAL_CLASSES[3].id, subject_id: INITIAL_SUBJECTS[18].id, marks: 92, entered_by: '33333333-3333-3333-3333-333333333304' },
  { id: 'm-402-2', student_id: 'st402', class_id: INITIAL_CLASSES[3].id, subject_id: INITIAL_SUBJECTS[19].id, marks: 96, entered_by: '33333333-3333-3333-3333-333333333304' },
  { id: 'm-402-3', student_id: 'st402', class_id: INITIAL_CLASSES[3].id, subject_id: INITIAL_SUBJECTS[20].id, marks: 94, entered_by: '33333333-3333-3333-3333-333333333304' },
  { id: 'm-402-4', student_id: 'st402', class_id: INITIAL_CLASSES[3].id, subject_id: INITIAL_SUBJECTS[21].id, marks: 89, entered_by: '33333333-3333-3333-3333-333333333304' },
  { id: 'm-402-5', student_id: 'st402', class_id: INITIAL_CLASSES[3].id, subject_id: INITIAL_SUBJECTS[22].id, marks: 95, entered_by: '33333333-3333-3333-3333-333333333304' },
  { id: 'm-402-6', student_id: 'st402', class_id: INITIAL_CLASSES[3].id, subject_id: INITIAL_SUBJECTS[23].id, marks: 91, entered_by: '33333333-3333-3333-3333-333333333304' },
];

// Initial Audit Logs
export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    user_id: '11111111-1111-1111-1111-111111111111',
    user_email: 'admin@school.edu',
    user_role: 'admin',
    action: 'SYSTEM_BOOTSTRAP',
    table_name: 'system',
    description: 'School Management System successfully initialized with Class 1-6 database schema and academic subjects.',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'log-002',
    user_id: '11111111-1111-1111-1111-111111111111',
    user_email: 'admin@school.edu',
    user_role: 'admin',
    action: 'ASSIGN_FACULTY',
    table_name: 'teachers',
    description: 'Assigned teachers to respective classes: Mrs. Sarah Jenkins (Class 1) to Mr. Michael Chang (Class 6).',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

// In-Memory & LocalStorage Data Store
class DBStore {
  private get<T>(key: string, initial: T): T {
    try {
      const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return item ? JSON.parse(item) : initial;
    } catch {
      return initial;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  // Admin PIN Hash (Default PIN is '123456', stored as hash)
  // sha256('123456') = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'
  getAdminPinHash(): string {
    return this.get<string>('admin_pin_hash', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92');
  }

  setAdminPinHash(newHash: string): void {
    this.set<string>('admin_pin_hash', newHash);
  }

  getProfiles(): Profile[] {
    return this.get<Profile[]>('profiles', INITIAL_PROFILES);
  }

  setProfiles(profiles: Profile[]): void {
    this.set('profiles', profiles);
  }

  getClasses(): ClassRoom[] {
    return this.get<ClassRoom[]>('classes', INITIAL_CLASSES);
  }

  setClasses(classes: ClassRoom[]): void {
    this.set('classes', classes);
  }

  getTeachers(): Teacher[] {
    return this.get<Teacher[]>('teachers', INITIAL_TEACHERS);
  }

  setTeachers(teachers: Teacher[]): void {
    this.set('teachers', teachers);
  }

  getSubjects(): Subject[] {
    return this.get<Subject[]>('subjects', INITIAL_SUBJECTS);
  }

  setSubjects(subjects: Subject[]): void {
    this.set('subjects', subjects);
  }

  getStudents(): Student[] {
    return this.get<Student[]>('students', INITIAL_STUDENTS);
  }

  setStudents(students: Student[]): void {
    this.set('students', students);
  }

  getAttendance(): Attendance[] {
    return this.get<Attendance[]>('attendance', INITIAL_ATTENDANCE);
  }

  setAttendance(attendance: Attendance[]): void {
    this.set('attendance', attendance);
  }

  getMarks(): Mark[] {
    return this.get<Mark[]>('marks', INITIAL_MARKS);
  }

  setMarks(marks: Mark[]): void {
    this.set('marks', marks);
  }

  getAuditLogs(): AuditLog[] {
    return this.get<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    };
    this.set('audit_logs', [newLog, ...logs]);
  }

  resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'profiles');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'classes');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'teachers');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'subjects');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'students');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'attendance');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'marks');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'admin_pin_hash');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'audit_logs');
  }
}

export const dbStore = new DBStore();
