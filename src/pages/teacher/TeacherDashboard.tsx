import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  CalendarCheck,
  Award,
  Download,
  School,
  UserCheck,
  UserX,
  ArrowRight,
  ChevronRight,
  Phone,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { classService } from '../../services/classService';
import { studentService } from '../../services/studentService';
import { excelService } from '../../services/excelService';
import { ClassRoom, Student } from '../../types';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assignedClass, setAssignedClass] = useState<ClassRoom | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTeacherData = async () => {
      setIsLoading(true);
      try {
        const classes = await classService.getClasses();
        const myClass = classes.find(
          c => `Class ${c.class_number}` === user?.assigned_class || c.id === user?.assigned_class_id
        ) || classes[3]; // fallback to Class 4 for preview

        setAssignedClass(myClass);

        if (myClass) {
          const stList = await studentService.getStudents({ class_id: myClass.id });
          setStudents(stList);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadTeacherData();
  }, [user]);

  if (isLoading || !assignedClass) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Loading classroom roster...</span>
        </div>
      </div>
    );
  }

  const attendancePct = assignedClass.attendance_percentage || 0;

  return (
    <div className="space-y-8">
      {/* 1. HERO EXECUTIVE BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-cyan-300 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Assigned to Class {assignedClass.class_number} • Section {assignedClass.section}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Faculty Classroom Command
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Welcome back, <span className="text-white font-semibold">{user?.full_name || 'Faculty Member'}</span>. Record today's attendance and student assessment scores.
            </p>
          </div>

          {/* Quick Action Capsules */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('/teacher/attendance')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Take Attendance</span>
            </button>
            <button
              onClick={() => navigate('/teacher/marks')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer"
            >
              <Award className="w-4 h-4 text-cyan-300" />
              <span>Enter Marks</span>
            </button>
            <button
              onClick={() => excelService.exportClassAttendance(assignedClass.class_number)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Class Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE 4-METRIC GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Assigned Class */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Grade</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">Class {assignedClass.class_number}</span>
            <span className="text-xs text-slate-400 font-medium ml-2">Sec {assignedClass.section}</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Academic Year 2026-27</span>
            <span className="text-purple-600 font-bold">Active</span>
          </div>
        </div>

        {/* Card 2: Total Students */}
        <div
          onClick={() => navigate('/teacher/students')}
          className="group bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class Roster</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{students.length}</span>
            <span className="text-xs text-slate-400 font-medium ml-2">Enrolled</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Class Directory</span>
            <span className="text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
              View <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 3: Today's Present */}
        <div
          onClick={() => navigate('/teacher/attendance')}
          className="group bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200 cursor-pointer overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Present Today</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">{assignedClass.present_today || 0}</span>
            <span className="text-xs text-slate-500 font-medium">Students</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Absent: {assignedClass.absent_today || 0}</span>
            <span className="text-emerald-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
              Roll Call <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 4: Attendance Rate */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-600 tracking-tight">{attendancePct}%</span>
            <span className="text-xs text-slate-400 font-medium">Today</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mr-2">
              <div
                className={`h-full rounded-full ${attendancePct >= 75 ? 'bg-cyan-500' : 'bg-amber-500'}`}
                style={{ width: `${attendancePct}%` }}
              />
            </div>
            <span className="font-bold text-slate-600 whitespace-nowrap">{attendancePct >= 75 ? 'Good' : 'Review'}</span>
          </div>
        </div>

      </div>

      {/* 3. QUICK ACTION TILES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => navigate('/teacher/attendance')}
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold mb-3">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Mark Today's Attendance</h3>
            <p className="text-xs text-slate-500 mt-1">Take class roll call with one-click toggles and instant save</p>
          </div>
          <span className="mt-4 text-xs font-bold text-cyan-600 flex items-center gap-1">
            Open Roll Call <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => navigate('/teacher/marks')}
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Enter Subject Marks</h3>
            <p className="text-xs text-slate-500 mt-1">Input exam scores with maximum score validation and automated grades</p>
          </div>
          <span className="mt-4 text-xs font-bold text-indigo-600 flex items-center gap-1">
            Enter Marks <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => navigate('/teacher/reports')}
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Student Progress Cards</h3>
            <p className="text-xs text-slate-500 mt-1">View student marksheet summaries and generate printable progress report cards</p>
          </div>
          <span className="mt-4 text-xs font-bold text-emerald-600 flex items-center gap-1">
            Generate Reports <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* 4. CLASS STUDENT ROSTER PREVIEW */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Class {assignedClass.class_number} Student Directory
            </h3>
            <p className="text-xs text-slate-500">{students.length} students enrolled in your class</p>
          </div>
          <button
            onClick={() => navigate('/teacher/students')}
            className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
          >
            <span>View Full Profiles</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Roll No</th>
                <th className="py-3 px-5">Admission No</th>
                <th className="py-3 px-5">Student Name</th>
                <th className="py-3 px-5">Gender</th>
                <th className="py-3 px-5">Parent Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No students currently enrolled in this class.
                  </td>
                </tr>
              ) : (
                students.map(st => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 inline-flex items-center justify-center text-xs">
                        #{st.roll_number}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono font-semibold text-cyan-600">{st.admission_number}</td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">{st.student_name}</td>
                    <td className="py-3.5 px-5 text-slate-600">{st.gender}</td>
                    <td className="py-3.5 px-5 font-mono text-slate-500">
                      {st.parent_phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {st.parent_phone}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
