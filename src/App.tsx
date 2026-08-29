import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Landing Page
import { LandingPage } from './pages/public/LandingPage';

// 3 Separate Dedicated Login Pages
import { AdminLoginPage } from './pages/auth/AdminLoginPage';
import { HeadmasterLoginPage } from './pages/auth/HeadmasterLoginPage';
import { TeacherLoginPage } from './pages/auth/TeacherLoginPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminTeachers } from './pages/admin/AdminTeachers';
import { AdminHeadmaster } from './pages/admin/AdminHeadmaster';
import { AdminSubjects } from './pages/admin/AdminSubjects';
import { AdminIdCardsPage } from './pages/admin/AdminIdCardsPage';
import { AdminAnimationSettingsPage } from './pages/admin/AdminAnimationSettingsPage';
import { AdminDatabase } from './pages/admin/AdminDatabase';
import { AdminSettings } from './pages/admin/AdminSettings';

// Head Master Pages
import { HeadmasterDashboard } from './pages/headmaster/HeadmasterDashboard';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';

// Shared Pages
import { StudentsPage } from './pages/shared/StudentsPage';
import { ClassesPage } from './pages/shared/ClassesPage';
import { AttendancePage } from './pages/shared/AttendancePage';
import { MarksPage } from './pages/shared/MarksPage';
import { ReportsPage } from './pages/shared/ReportsPage';
import { BookStockPage } from './pages/shared/BookStockPage';
import { LeaveManagementPage } from './pages/shared/LeaveManagementPage';
import { ExcelDownloadsPage } from './pages/shared/ExcelDownloadsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* 1. Initial Landing Page: Choose Your Path (3 Options) */}
            <Route path="/" element={<LandingPage />} />

            {/* 2. Three Separate Dedicated Login Pages */}
            <Route path="/login/admin" element={<AdminLoginPage />} />
            <Route path="/login/headmaster" element={<HeadmasterLoginPage />} />
            <Route path="/login/teacher" element={<TeacherLoginPage />} />
            <Route path="/login" element={<Navigate to="/" replace />} />

            {/* 3. ADMIN ROUTES */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="teachers" element={<AdminTeachers />} />
              <Route path="headmaster" element={<AdminHeadmaster />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="classes" element={<ClassesPage />} />
              <Route path="subjects" element={<AdminSubjects />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="marks" element={<MarksPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="books" element={<BookStockPage />} />
              <Route path="id-cards" element={<AdminIdCardsPage />} />
              <Route path="leaves" element={<LeaveManagementPage />} />
              <Route path="animation-settings" element={<AdminAnimationSettingsPage />} />
              <Route path="database" element={<AdminDatabase />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* 4. HEAD MASTER ROUTES */}
            <Route
              path="/headmaster"
              element={
                <ProtectedRoute allowedRoles={['head_master']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/headmaster/dashboard" replace />} />
              <Route path="dashboard" element={<HeadmasterDashboard />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="classes" element={<ClassesPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="marks" element={<MarksPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="books" element={<BookStockPage />} />
              <Route path="leaves" element={<LeaveManagementPage />} />
              <Route path="excel-downloads" element={<ExcelDownloadsPage />} />
            </Route>

            {/* 5. TEACHER ROUTES */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/teacher/dashboard" replace />} />
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="marks" element={<MarksPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="leaves" element={<LeaveManagementPage />} />
              <Route path="excel-downloads" element={<ExcelDownloadsPage />} />
            </Route>

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
