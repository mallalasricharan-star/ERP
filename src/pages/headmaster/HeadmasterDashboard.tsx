import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  School,
  UserCheck,
  UserX,
  CalendarCheck,
  Award,
  Download,
  ArrowRight,
  PlusCircle,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Clock,
  Layers
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { classService } from '../../services/classService';
import { DashboardStats } from '../../types';

export const HeadmasterDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const data = await classService.getDashboardStats();
        setStats(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Loading academic data...</span>
        </div>
      </div>
    );
  }

  // Chart data
  const classChartData = stats.class_stats.map(c => ({
    name: `Class ${c.class_number}`,
    Students: c.student_count,
    Present: c.present_today,
    Absent: c.absent_today
  }));

  const attendancePieData = [
    { name: 'Present', value: stats.today_present || 1, color: '#10b981' },
    { name: 'Absent', value: stats.today_absent || 0, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. HERO EXECUTIVE BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-emerald-300 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Head Master Executive Authority</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Academic Operations Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Supervision of student admissions, daily attendance records, and academic progress cards.
            </p>
          </div>

          {/* Quick Action Capsules */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('/headmaster/students')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Student</span>
            </button>
            <button
              onClick={() => navigate('/headmaster/attendance')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-emerald-300" />
              <span>Attendance</span>
            </button>
            <button
              onClick={() => navigate('/headmaster/excel-downloads')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-cyan-300" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE 4-METRIC GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Total Students */}
        <div
          onClick={() => navigate('/headmaster/students')}
          className="group relative bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200 cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.total_students}</span>
            <span className="text-xs text-slate-400 font-medium ml-2">Students</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Classes 1 to 6 Active</span>
            <span className="text-emerald-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
              Directory <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 2: Today's Present */}
        <div
          onClick={() => navigate('/headmaster/attendance')}
          className="group relative bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recorded Present</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-blue-600 tracking-tight">{stats.today_present}</span>
            <span className="text-xs text-slate-400 font-medium ml-2">Students Today</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Overall: {stats.today_attendance_percentage}%</span>
            <span className="text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
              Roll Call <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 3: Today's Absent */}
        <div
          onClick={() => navigate('/headmaster/attendance')}
          className="group relative bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-rose-300 transition-all duration-200 cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recorded Absent</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-rose-600 tracking-tight">{stats.today_absent}</span>
            <span className="text-xs text-slate-400 font-medium ml-2">Flagged</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Requires Follow-up</span>
            <span className="text-rose-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
              Inspect <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 4: Class Cohorts */}
        <div
          onClick={() => navigate('/headmaster/classes')}
          className="group relative bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200 cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Classes</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <School className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">6</span>
            <span className="text-xs text-slate-400 font-medium ml-2">Classes (1–6)</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>All Sections Active</span>
            <span className="text-purple-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
              Cohorts <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

      </div>

      {/* 3. CLASS COHORT BREAKDOWN (CLASSES 1 TO 6) */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Class Cohort Overview</h2>
            <p className="text-xs text-slate-500">Live attendance percentage and student counts per class</p>
          </div>
          <button
            onClick={() => navigate('/headmaster/classes')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Cohorts</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {stats.class_stats.map(c => {
            const pct = c.attendance_percentage || 0;
            return (
              <div
                key={c.class_id}
                onClick={() => navigate('/headmaster/classes')}
                className="group p-4 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/70 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-extrabold text-slate-800">Class {c.class_number}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-md">
                      Sec {c.section}
                    </span>
                  </div>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">{c.student_count} <span className="text-xs font-medium text-slate-400">Students</span></p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-500">Today</span>
                    <span className={pct >= 75 ? 'text-emerald-600' : 'text-amber-600'}>{pct}%</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct >= 75 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. VISUAL ANALYTICS & QUICK ACTION TILES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Chart: Class Demographics */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Academic Roster Demographics</h3>
              <p className="text-xs text-slate-500">Student enrollment and attendance comparison</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" /> Students
              </span>
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Present
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                  }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="Students" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar dataKey="Present" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Section: Attendance Ratio & Action Tiles */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Today's Ratio Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">School Attendance</span>
              <h4 className="text-2xl font-extrabold text-slate-900">{stats.today_attendance_percentage}%</h4>
              <p className="text-xs text-slate-500">{stats.today_present} present of {stats.today_present + stats.today_absent} marked</p>
            </div>
            <div className="w-24 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendancePieData}
                    innerRadius={26}
                    outerRadius={38}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {attendancePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Hub */}
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => navigate('/headmaster/marks')}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Enter Marks</span>
                <span className="text-[11px] text-slate-400">Score entries</span>
              </div>
            </div>

            <div
              onClick={() => navigate('/headmaster/excel-downloads')}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Excel Center</span>
                <span className="text-[11px] text-slate-400">Matrices & lists</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
