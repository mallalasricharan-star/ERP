import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Award,
  FileText,
  Database,
  Settings,
  LogOut,
  Download,
  School,
  UserCheck,
  CreditCard,
  CalendarClock,
  Package,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role, user, logout } = useAuth();

  const adminNavItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Teachers', path: '/admin/teachers', icon: Users },
    { name: 'Head Master', path: '/admin/headmaster', icon: UserCheck },
    { name: 'Students', path: '/admin/students', icon: GraduationCap },
    { name: 'Classes', path: '/admin/classes', icon: School },
    { name: 'Subjects', path: '/admin/subjects', icon: BookOpen },
    { name: 'Attendance', path: '/admin/attendance', icon: CalendarCheck },
    { name: 'Marks', path: '/admin/marks', icon: Award },
    { name: 'Reports', path: '/admin/reports', icon: FileText },
    { name: 'Book Stock', path: '/admin/books', icon: Package },
    { name: 'Student ID Cards', path: '/admin/id-cards', icon: CreditCard },
    { name: 'Leave Approvals', path: '/admin/leaves', icon: CalendarClock },
    { name: 'Animation Engine', path: '/admin/animation-settings', icon: Sparkles },
    { name: 'Database', path: '/admin/database', icon: Database },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const headmasterNavItems = [
    { name: 'Dashboard', path: '/headmaster/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/headmaster/students', icon: GraduationCap },
    { name: 'Classes', path: '/headmaster/classes', icon: School },
    { name: 'Attendance', path: '/headmaster/attendance', icon: CalendarCheck },
    { name: 'Marks', path: '/headmaster/marks', icon: Award },
    { name: 'Reports', path: '/headmaster/reports', icon: FileText },
    { name: 'Book Stock', path: '/headmaster/books', icon: Package },
    { name: 'Leave Approvals', path: '/headmaster/leaves', icon: CalendarClock },
    { name: 'Excel Downloads', path: '/headmaster/excel-downloads', icon: Download },
  ];

  const teacherNavItems = [
    { name: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/teacher/students', icon: GraduationCap },
    { name: 'Attendance', path: '/teacher/attendance', icon: CalendarCheck },
    { name: 'Marks', path: '/teacher/marks', icon: Award },
    { name: 'Reports', path: '/teacher/reports', icon: FileText },
    { name: 'My Leaves', path: '/teacher/leaves', icon: CalendarClock },
    { name: 'Excel Downloads', path: '/teacher/excel-downloads', icon: Download },
  ];

  let navItems = adminNavItems;
  if (role === 'head_master') navItems = headmasterNavItems;
  else if (role === 'teacher') navItems = teacherNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden print:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 print:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide">EduPrime</h1>
              <p className="text-[10px] uppercase font-semibold text-blue-400 tracking-wider">School ERP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Card */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-sm">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
              <span
                className={`inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                  role === 'admin'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : role === 'head_master'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {role === 'head_master' ? 'Head Master' : role}
              </span>
              {user?.assigned_class && (
                <span className="block text-[10px] text-slate-400 mt-0.5 font-medium">
                  {user.assigned_class}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Logout Action */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-150"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
