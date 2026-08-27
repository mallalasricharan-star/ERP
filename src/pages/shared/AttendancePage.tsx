import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Calendar,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Filter,
  Eye,
  Edit2,
  School,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { attendanceService, AttendanceSummary } from '../../services/attendanceService';
import { classService } from '../../services/classService';
import { studentService } from '../../services/studentService';
import { excelService } from '../../services/excelService';
import { ClassRoom, Student, Attendance } from '../../types';
import { formatDate, toISODate } from '../../lib/utils';

export const AttendancePage: React.FC = () => {
  const { role, user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'take' | 'history'>('take');
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(toISODate());

  // Attendance taking state
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<{ [studentId: string]: 'present' | 'absent' }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSummary, setSaveSummary] = useState<{ total: number; present: number; absent: number } | null>(null);

  // History state
  const [historySummaries, setHistorySummaries] = useState<AttendanceSummary[]>([]);
  const [historyDateFrom, setHistoryDateFrom] = useState<string>('2026-08-01');
  const [historyDateTo, setHistoryDateTo] = useState<string>(toISODate());
  const [selectedHistorySummary, setSelectedHistorySummary] = useState<AttendanceSummary | null>(null);

  const todayStr = toISODate();
  const isPastDate = selectedDate < todayStr;
  const isTeacher = role === 'teacher';

  // Load classes and initial state
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const clsList = await classService.getClasses();
        setClasses(clsList);

        let defaultClassId = clsList[0]?.id || '';
        if (isTeacher && user?.assigned_class) {
          const matched = clsList.find(
            c => `Class ${c.class_number}` === user.assigned_class || c.id === user.assigned_class_id
          );
          if (matched) defaultClassId = matched.id;
        }

        setSelectedClassId(defaultClassId);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [isTeacher, user]);

  // Load students and existing attendance when class or date changes
  useEffect(() => {
    if (!selectedClassId) return;

    const loadStudentsAndAttendance = async () => {
      setIsLoading(true);
      setSaveSummary(null);
      try {
        const [studentList, existingAttendance] = await Promise.all([
          studentService.getStudents({ class_id: selectedClassId }),
          attendanceService.getClassAttendance(selectedClassId, selectedDate)
        ]);

        setStudents(studentList);

        // Populate attendance map (default: 'present')
        const map: { [id: string]: 'present' | 'absent' } = {};
        studentList.forEach(s => {
          const recorded = existingAttendance.find(a => a.student_id === s.id);
          map[s.id] = recorded ? recorded.status : 'present';
        });
        setAttendanceMap(map);
      } finally {
        setIsLoading(false);
      }
    };

    loadStudentsAndAttendance();
  }, [selectedClassId, selectedDate]);

  // Load history when tab is switched to history
  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab, selectedClassId, historyDateFrom, historyDateTo]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const hist = await attendanceService.getAttendanceHistory({
        class_id: selectedClassId || undefined,
        date_from: historyDateFrom || undefined,
        date_to: historyDateTo || undefined
      });
      setHistorySummaries(hist);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = (studentId: string) => {
    if (isTeacher && isPastDate) {
      toast.error('Teachers cannot modify old attendance records.');
      return;
    }
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }));
  };

  const handleMarkAll = (status: 'present' | 'absent') => {
    if (isTeacher && isPastDate) {
      toast.error('Teachers cannot modify old attendance records.');
      return;
    }
    const newMap: { [id: string]: 'present' | 'absent' } = {};
    students.forEach(s => {
      newMap[s.id] = status;
    });
    setAttendanceMap(newMap);
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassId) return;
    if (isTeacher && isPastDate) {
      toast.error('Permission Denied: Teachers cannot modify past attendance.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = students.map(s => ({
        student_id: s.id,
        status: attendanceMap[s.id] || 'present'
      }));

      const summary = await attendanceService.saveClassAttendance(selectedClassId, selectedDate, payload);
      setSaveSummary(summary);
      toast.success(`Attendance Saved: ${summary.present} Present, ${summary.absent} Absent`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  const currentPresentCount = Object.values(attendanceMap).filter(s => s === 'present').length;
  const currentAbsentCount = Object.values(attendanceMap).filter(s => s === 'absent').length;
  const selectedClassObj = classes.find(c => c.id === selectedClassId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Management System</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isTeacher
              ? `Daily roll call for your assigned class (${user?.assigned_class || 'Class'})`
              : 'Class-wise attendance tracking, historical audits, and master telemetry'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('take')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'take'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily Attendance
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Attendance History
          </button>
        </div>
      </div>

      {activeTab === 'take' ? (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Class Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Select Class
                </label>
                <select
                  disabled={isTeacher}
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-100"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      Class {c.class_number} (Sec {c.section})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Attendance Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    max={todayStr}
                    className="px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>
            </div>

            {/* Quick Presets & Export */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              {selectedClassObj && (
                <button
                  type="button"
                  onClick={() => excelService.exportClassAttendance(selectedClassObj.class_number)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download Excel</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleMarkAll('present')}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
              >
                Mark All Present
              </button>

              <button
                type="button"
                onClick={() => handleMarkAll('absent')}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
              >
                Mark All Absent
              </button>
            </div>
          </div>

          {/* Past Date Notice for Teacher */}
          {isTeacher && isPastDate && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                You are viewing attendance for a past date ({formatDate(selectedDate)}). Teachers cannot modify past attendance. Please contact Admin for corrections.
              </span>
            </div>
          )}

          {/* Real-time Summary Counters */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Students</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{students.length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-sm text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Marked Present</span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">{currentPresentCount}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-sm text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Marked Absent</span>
              <p className="text-2xl font-extrabold text-rose-600 mt-1">{currentAbsentCount}</p>
            </div>
          </div>

          {/* Save Success Summary Notification */}
          {saveSummary && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Attendance saved successfully for {formatDate(selectedDate)}</span>
              </div>
              <div className="text-xs font-bold space-x-3">
                <span>Total: {saveSummary.total}</span>
                <span>Present: {saveSummary.present}</span>
                <span>Absent: {saveSummary.absent}</span>
              </div>
            </div>
          )}

          {/* Attendance Roster Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Student Roll Call ({students.length} Students)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Click the toggle button or row to change status</p>
              </div>

              <button
                type="button"
                disabled={isSaving || (isTeacher && isPastDate)}
                onClick={handleSaveAttendance}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Attendance'}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Roll</th>
                    <th className="py-3 px-4">Admission No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Parent Phone</th>
                    <th className="py-3 px-4 text-center">Current Status</th>
                    <th className="py-3 px-4 text-right">Quick Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No students enrolled in this class.
                      </td>
                    </tr>
                  ) : (
                    students.map(student => {
                      const status = attendanceMap[student.id] || 'present';
                      const isPresent = status === 'present';

                      return (
                        <tr
                          key={student.id}
                          onClick={() => handleToggleStatus(student.id)}
                          className={`cursor-pointer transition-colors ${
                            isPresent ? 'hover:bg-slate-50/70' : 'bg-rose-50/30 hover:bg-rose-50/50'
                          }`}
                        >
                          <td className="py-3.5 px-4 font-bold text-slate-700">#{student.roll_number}</td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-blue-600 text-xs">{student.admission_number}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">{student.student_name}</td>
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{student.parent_phone || '—'}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                                isPresent
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {isPresent ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Present</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Absent</span>
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleToggleStatus(student.id);
                              }}
                              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors border ${
                                isPresent
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              Mark {isPresent ? 'Absent' : 'Present'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Save Bar */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {currentPresentCount} of {students.length} students marked present ({students.length > 0 ? Math.round((currentPresentCount / students.length) * 100) : 0}%)
              </span>

              <button
                type="button"
                disabled={isSaving || (isTeacher && isPastDate)}
                onClick={handleSaveAttendance}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Attendance Record'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ATTENDANCE HISTORY TAB */
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {role !== 'teacher' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Class
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={e => setSelectedClassId(e.target.value)}
                    className="py-1.5 px-3 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="">All Classes</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>Class {c.class_number}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={historyDateFrom}
                  onChange={e => setHistoryDateFrom(e.target.value)}
                  className="py-1.5 px-3 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={historyDateTo}
                  onChange={e => setHistoryDateTo(e.target.value)}
                  className="py-1.5 px-3 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (selectedClassObj) excelService.exportClassAttendance(selectedClassObj.class_number);
                else excelService.exportClassAttendance(1);
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export History Excel</span>
            </button>
          </div>

          {/* History Summary Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Class & Section</th>
                  <th className="py-3 px-4">Total Students</th>
                  <th className="py-3 px-4 text-emerald-600">Present</th>
                  <th className="py-3 px-4 text-rose-600">Absent</th>
                  <th className="py-3 px-4">Attendance %</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">Loading history...</td>
                  </tr>
                ) : historySummaries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No attendance history records found for the selected date range.
                    </td>
                  </tr>
                ) : (
                  historySummaries.map((summary, idx) => (
                    <tr
                      key={idx}
                      onClick={() => setSelectedHistorySummary(summary)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{formatDate(summary.date)}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <School className="w-3 h-3" />
                          Class {summary.class_number} ({summary.section})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{summary.total_students}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">{summary.present_count}</td>
                      <td className="py-3.5 px-4 font-bold text-rose-600">{summary.absent_count}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          summary.percentage >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {summary.percentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedHistorySummary(summary)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History Deep Dive Modal */}
      <Modal
        isOpen={Boolean(selectedHistorySummary)}
        onClose={() => setSelectedHistorySummary(null)}
        title={selectedHistorySummary ? `Attendance Roster: ${formatDate(selectedHistorySummary.date)}` : ''}
        subtitle={selectedHistorySummary ? `Class ${selectedHistorySummary.class_number} • Present: ${selectedHistorySummary.present_count} / Absent: ${selectedHistorySummary.absent_count}` : ''}
        maxWidth="lg"
      >
        {selectedHistorySummary && (
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200">
              {selectedHistorySummary.records.map((r, i) => (
                <div key={i} className="p-3 flex items-center justify-between hover:bg-slate-50 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-500">#{r.roll_number}</span>
                    <div>
                      <p className="font-semibold text-slate-900">{r.student_name}</p>
                      <span className="font-mono text-[11px] text-slate-400">{r.admission_number}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                    r.status === 'present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
