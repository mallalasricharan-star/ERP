import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  School,
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Download,
  CalendarCheck,
  Award,
  ArrowRight,
  User
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { classService } from '../../services/classService';
import { studentService } from '../../services/studentService';
import { excelService } from '../../services/excelService';
import { ClassRoom, Student } from '../../types';

export const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  const { role } = useAuth();
  const navigate = useNavigate();

  const loadClasses = async () => {
    setIsLoading(true);
    try {
      const data = await classService.getClasses();
      setClasses(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleOpenClassDetails = async (cls: ClassRoom) => {
    setSelectedClass(cls);
    setIsLoadingStudents(true);
    try {
      const students = await studentService.getStudents({ class_id: cls.id });
      setClassStudents(students);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Classes Management</h1>
          <p className="text-sm text-slate-500 mt-1">Class 1 to Class 6 grade cohorts, faculty allocations, and live attendance metrics</p>
        </div>

        <button
          onClick={() => excelService.exportMarksReport()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-colors"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Export All Classes Excel</span>
        </button>
      </div>

      {/* Class 1 to 6 Cards Grid as per requirement #15 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))
        ) : (
          classes.map(cls => (
            <div
              key={cls.id}
              onClick={() => handleOpenClassDetails(cls)}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card hover:shadow-elevated hover:border-blue-300 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                      <School className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Class {cls.class_number}</h2>
                      <span className="text-xs font-semibold text-slate-400">Section {cls.section} • {cls.academic_year}</span>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      (cls.attendance_percentage || 0) >= 75
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {cls.attendance_percentage || 0}% Att.
                  </span>
                </div>

                {/* Class Teacher */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4 flex items-center gap-2.5 text-xs text-slate-700">
                  <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Teacher</span>
                    <span className="font-semibold">{cls.assigned_teacher_name}</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Enrolled</span>
                    <span className="text-base font-extrabold text-slate-900 mt-0.5 block">{cls.student_count || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block">Present</span>
                    <span className="text-base font-extrabold text-emerald-600 mt-0.5 block">{cls.present_today || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-500 block">Absent</span>
                    <span className="text-base font-extrabold text-rose-600 mt-0.5 block">{cls.absent_today || 0}</span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-4 pt-3 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                <span>Open Class Dashboard</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Class Deep-Dive Modal */}
      <Modal
        isOpen={Boolean(selectedClass)}
        onClose={() => setSelectedClass(null)}
        title={selectedClass ? `Class ${selectedClass.class_number} Overview & Student Roster` : ''}
        subtitle={selectedClass ? `Section ${selectedClass.section} • Teacher: ${selectedClass.assigned_teacher_name}` : ''}
        maxWidth="4xl"
      >
        {selectedClass && (
          <div className="space-y-6">
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block">Total Enrolled</span>
                  <span className="text-sm font-bold text-slate-900">{selectedClass.student_count} Students</span>
                </div>
                <div className="h-6 w-px bg-slate-200"></div>
                <div>
                  <span className="text-slate-400 font-semibold block">Today's Attendance</span>
                  <span className="text-sm font-bold text-emerald-600">{selectedClass.present_today} Present / {selectedClass.absent_today} Absent</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    excelService.exportClassAttendance(selectedClass.class_number);
                  }}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download Attendance Excel</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedClass(null);
                    navigate(role === 'teacher' ? '/teacher/attendance' : role === 'head_master' ? '/headmaster/attendance' : '/admin/attendance');
                  }}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Take Attendance</span>
                </button>
              </div>
            </div>

            {/* Enrolled Students Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Enrolled Students Roster</h4>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase">
                      <th className="py-2.5 px-3">Roll No</th>
                      <th className="py-2.5 px-3">Admission No</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Gender</th>
                      <th className="py-2.5 px-3">Parent Name</th>
                      <th className="py-2.5 px-3">Parent Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoadingStudents ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">Loading student roster...</td>
                      </tr>
                    ) : classStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">No students currently enrolled in this class.</td>
                      </tr>
                    ) : (
                      classStudents.map(st => (
                        <tr key={st.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-slate-900">#{st.roll_number}</td>
                          <td className="py-2.5 px-3 font-mono text-blue-600 font-semibold">{st.admission_number}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{st.student_name}</td>
                          <td className="py-2.5 px-3">{st.gender}</td>
                          <td className="py-2.5 px-3">{st.father_name || st.mother_name || '—'}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{st.parent_phone || '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
