import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  School,
  UserCheck,
  UserX,
  PlusCircle,
  Database,
  ArrowRight,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CalendarCheck,
  Layers,
  ChevronRight,
  Activity
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

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await classService.getDashboardStats();
      setStats(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Loading live telemetry...</span>
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-cyan-300 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Master Administrator Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Institutional Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Live school governance, student enrollment analytics, and daily attendance telemetry.
            </p>
          </div>

          {/* Quick Action Capsules */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('/admin/students')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Enroll Student</span>
            </button>
            <button
              onClick={() => navigate('/admin/teachers')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-cyan-300" />
              <span>Faculty</span>
            </button>
            <button
              onClick={() => navigate('/admin/database')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Database</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE 4-STAT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Students */}
        <div
          onClick={() => navigate('/admin/students')}
          className="group relative bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Students</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.total_students}</span>
            <span className="text-xs text-slate-400 font-medium ml-2">Enrolled</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Classes 1 through 6</span>
            <span className="text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
              View <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 2: Faculty */}
        <div
          onClick={() => navigate('/admin/teachers')}
          className="group relative bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200 cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Faculty</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.total_teachers}</span>
            <span className="text-xs text-slate-400 font-medium ml-2">Teachers</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Class-Assigned Staff</span>
            <span className="text-purple-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
              Manage <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 3: Today's Attendance Rate */}
        <div
          onClick={() => navigate('/admin/attendance')}
          className="group relative bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200 cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
              {stats.today_attendance_percentage}%
            </span>
            <span className="text-xs text-slate-500 font-semibold">Today</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-emerald-700 font-semibold">{stats.today_present} Present</span>
            <span className="text-rose-600 font-semibold">{stats.today_absent} Absent</span>
          </div>
        </div>

        {/* Card 4: Academic Cohorts */}
        <div
          onClick={() => navigate('/admin/classes')}
          className="group relative bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all duration-200 cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Cohorts</span>
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <School className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">6</span>
            <span className="text-xs text-slate-400 font-medium ml-2">Grades (1–6)</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{stats.total_subjects} Curriculum Subjects</span>
            <span className="text-cyan-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
              Classes <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

      </div>

      {/* 3. CLASS COHORT BREAKDOWN (CLASSES 1 TO 6) */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Class Cohort Distribution & Live Roll Call</h2>
            <p className="text-xs text-slate-500">Real-time attendance progress per grade tier</p>
          </div>
          <button
            onClick={() => navigate('/admin/classes')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Class Roster</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {stats.class_stats.map(c => {
            const pct = c.attendance_percentage || 0;
            return (
              <div
                key={c.class_id}
                onClick={() => navigate('/admin/classes')}
                className="group p-4 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/70 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-extrabold text-slate-800">Class {c.class_number}</span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100/70 px-1.5 py-0.5 rounded-md">
                      Sec {c.section}
                    </span>
                  </div>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">{c.student_count} <span className="text-xs font-medium text-slate-400">Students</span></p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-500">Att.</span>
                    <span className={pct >= 75 ? 'text-emerald-600' : 'text-amber-600'}>{pct}%</span>
                  </div>
                  {/* Visual Progress Bar */}
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

      {/* 4. VISUAL ANALYTICS & LIVE ACTIVITY STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Chart: Class Enrollment & Daily Roll Call */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Class Cohort Demographics</h3>
              <p className="text-xs text-slate-500">Student enrollment and daily attendance comparison</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" /> Students
              </span>
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Present
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
                <Bar dataKey="Students" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar dataKey="Present" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Section: Attendance Ratio Donut & Recent Audit Feed */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Today's Ratio Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Attendance</span>
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

          {/* Real-Time Security & Audit Activity Feed */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Live Audit Activity</h4>
              </div>
              <button
                onClick={() => navigate('/admin/settings')}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
              >
                View Log
              </button>
            </div>

            <div className="space-y-2.5">
              {(!stats.recent_logs || stats.recent_logs.length === 0) ? (
                <p className="text-xs text-slate-400 py-3 text-center">No recent security events</p>
              ) : (
                stats.recent_logs.slice(0, 3).map(log => (
                  <div key={log.id} className="p-2.5 rounded-2xl bg-slate-50 text-xs flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 truncate max-w-[140px]">{log.action}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] truncate">{log.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
