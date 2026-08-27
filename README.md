# EduPrime — Full-Stack School Management System

A production-ready, full-stack **School Management System (SMS)** built with **React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts, SheetJS (XLSX)**, and an **Online Supabase PostgreSQL database** with Row Level Security (RLS) and cryptographic stored procedures.

---

## 🌟 Key Features & Role Architecture

### 1. Admin Role (Master Authority)
- **6-Digit PIN Authentication**: Secure PIN entry (`123456` default). Never exposes plain-text PIN or hash to frontend.
- **Admin PIN Management**: PIN change flow requiring old PIN verification prior to updating.
- **Faculty Management**: Add, edit, deactivate, delete teachers, and assign classes (Classes 1–6).
- **Head Master Administration**: Supervise Head Master profile and reset credentials.
- **Curriculum Management**: Exclusive ability to create, edit, and delete class-wise subjects and maximum marks.
- **Database Explorer**: Authenticated live database table viewer (`profiles`, `students`, `teachers`, `classes`, `subjects`, `attendance`, `marks`, `audit_logs`).
- **Audit Logs**: Immutable timeline recording all sensitive actions (PIN changes, password resets, marks changes, past attendance adjustments).

### 2. Head Master Role (Academic Operations)
- **Student Admissions**: Enroll new students, edit demographic records, generate admission numbers.
- **Class Cohorts**: Overview metrics of all 6 classes, student distribution, and daily attendance percentages.
- **Attendance & Grading**: View and record daily attendance, enter student marks.
- **Excel & Reports**: Download class attendance matrices and printable student progress report cards.

### 3. Teacher Role (Class Scoped)
- **Assigned Class Isolation**: Strictly restricted to their assigned class students.
- **Daily Roll Call**: Take attendance with default "Present" toggle and one-click "Absent".
- **Duplicate Prevention**: Unique constraints ensure no duplicate records for the same student/date.
- **Historical Protection**: Cannot modify old/past attendance records.
- **Score Entry**: Enter subject assessment scores with maximum score validation.
- **Excel Downloads**: Export assigned class attendance and marks directly to Excel.

---

## 🚀 Quick Start & Installation

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
The application will launch locally at `http://localhost:5173`.

---

## 🔑 Demo Credentials

For swift testing and grading, one-click quick fill buttons are provided on the login page:

| Role | Login Method | Identifier / Email | Password / PIN | Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | 6-Digit PIN | — | `123456` | Full System Access |
| **Head Master** | Email & Password | `headmaster@school.edu` | `Headmaster@123` | All Classes & Operations |
| **Teacher** | Email & Password | `teacher4@school.edu` | `Teacher@123` | Assigned to Class 4 |
| **Teacher** | Email & Password | `teacher1@school.edu` | `Teacher@123` | Assigned to Class 1 |

---

## 🗄️ Supabase PostgreSQL Setup & Migrations

To connect your online Supabase project:

1. Create a project at [supabase.com](https://supabase.com).
2. Navigate to **SQL Editor** in your Supabase Dashboard.
3. Run the migration script in [`supabase/migrations/01_schema.sql`](supabase/migrations/01_schema.sql).
4. Run the seed data script in [`supabase/seed.sql`](supabase/seed.sql).
5. Copy your **Project URL** and **Anon / Public Key** from **Project Settings > API**.
6. Update your `.env` file:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 📊 Grading Scale

The system computes automated student grades based on overall percentage:
- **90% – 100%** → `A+` (Outstanding)
- **80% – 89%** → `A` (Excellent)
- **70% – 79%** → `B+` (Very Good)
- **60% – 69%** → `B` (Good)
- **50% – 59%** → `C` (Average)
- **40% – 49%** → `D` (Pass)
- **Below 40%** → `F` (Needs Improvement)

---

## 📂 Project Structure

```text
├── src/
│   ├── components/
│   │   └── common/           # Navbar, Sidebar, PinInput, Modal, StatCard, etc.
│   ├── context/              # AuthContext, ToastContext
│   ├── layouts/              # DashboardLayout with responsive sidebar
│   ├── lib/                  # Supabase client, utils, grade calculators
│   ├── pages/
│   │   ├── auth/             # Multi-tab LoginPage (6-Digit PIN & Email)
│   │   ├── admin/            # Dashboard, Teachers, Headmaster, Subjects, Database, Settings
│   │   ├── headmaster/       # Executive Head Master Dashboard
│   │   ├── teacher/          # Class-scoped Teacher Dashboard
│   │   └── shared/           # Students, Classes, Attendance, Marks, Reports, Excel Downloads
│   ├── services/             # authService, studentService, classService, marksService, excelService, etc.
│   ├── types/                # TypeScript interfaces and schema models
│   ├── App.tsx               # Protected routing hierarchy
│   ├── main.tsx              # Application entrypoint
│   └── index.css             # Tailwind base & custom animations
├── supabase/
│   ├── migrations/           # 01_schema.sql (PostgreSQL DDL, RLS, RPCs)
│   └── seed.sql              # Initial classes 1-6, subjects, teachers, students
├── .env.example
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 🛡️ Security & Integrity Highlights
- **Strict Role Level Security (RLS)** in PostgreSQL.
- **Bcrypt / Blowfish hashing** via `pgcrypto` for Admin PIN.
- **Client Route Guards**: Immediate rejection and redirection for unauthorized URL tampering.
- **No Private Credentials**: Never exposes `service_role` keys or raw hashes to the browser client.
- **Duplicate Prevention**: Handled via SQL unique constraints on `(student_id, attendance_date)` and `(student_id, subject_id)`.
