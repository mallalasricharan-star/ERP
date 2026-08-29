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
  AlertCircle,
  Lock,
  Unlock,
  ShieldCheck,
  User,
  Check,
  X,
  AlertTriangle,
  UserCheck,
  ArrowRight
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { attendanceService, AttendanceSummary } from '../../services/attendanceService';
import { classService } from '../../services/classService';
import { teacherService } from '../../services/teacherService';
import { studentService } from '../../services/studentService';
import { excelService } from '../../services/excelService';
import { ClassRoom, Student, Attendance, Teacher } from '../../types';
import { formatDate, toISODate } from '../../lib/utils';

export const AttendancePage: React.FC = () => {
  const { role, user } = useAuth();
  const toast = useToast();

  const isAdmin = role === 'admin';
  const isTeacher = role === 'teacher';
  const isHeadMaster = role === 'head_master';

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(toISODate());

  // Attendance Taking State (Teacher / Headmaster)
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<{ [studentId: string]: 'present' | 'absent' }>({});
  const [isAttendanceSaved, setIsAttendanceSaved] = useState<boolean>(false);
  const [hasEditPermission, setHasEditPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Review & Confirmation Modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  // Admin Class Details View Modal
  const [adminViewClass, setAdminViewClass] = useState<ClassRoom | null>(null);
  const [adminClassRecords, setAdminClassRecords] = useState<Attendance[]>([]);
  const [isLoadingAdminView, setIsLoadingAdminView] = useState<boolean>(false);

  // Admin Teacher-to-Class Mapping Modal
  const [isMapTeacherModalOpen, setIsMapTeacherModalOpen] = useState<boolean>(false);
  const [mapForm, setMapForm] = useState<{ classId: string; classNumber: number; teacherId: string }>({
    classId: '',
    classNumber: 1,
    teacherId: ''
  });
  const [isSubmittingMap, setIsSubmittingMap] = useState<boolean>(false);

  // Load Classes and Teachers on mount
  const loadClassesAndTeachers = async () => {
    setIsLoading(true);
    try {
      const [clsList, tchrList] = await Promise.all([
        classService.getClasses(),
        teacherService.getTeachers()
      ]);
      setClasses(clsList);
      setTeachers(tchrList);

      if (isTeacher) {
        // Find class mapped to this logged-in teacher
        const currentTeacherObj = tchrList.find(t => t.email === user?.email || t.full_name === user?.full_name);
        const mappedClass = clsList.find(
          c => c.id === currentTeacherObj?.assigned_class_id || `Class ${c.class_number}` === currentTeacherObj?.assigned_class || `Class ${c.class_number}` === user?.assigned_class
        );
        if (mappedClass) {
          setSelectedClassId(mappedClass.id);
        } else {
          setSelectedClassId('');
        }
      } else if (!selectedClassId && clsList.length > 0) {
        setSelectedClassId(clsList[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClassesAndTeachers();
  }, [isTeacher, user]);

  // Load Attendance data for selected class & date
  const loadClassAttendanceData = async () => {
    if (!selectedClassId) return;
    setIsLoading(true);
    try {
      const [studentList, existingAttendance] = await Promise.all([
        studentService.getStudents({ class_id: selectedClassId }),
        attendanceService.getClassAttendance(selectedClassId, selectedDate)
      ]);

      setStudents(studentList);

      const isLocked = existingAttendance.length > 0;
      const canEdit = attendanceService.hasEditPermission(selectedClassId, selectedDate);
      setIsAttendanceSaved(isLocked);
      setHasEditPermission(canEdit);

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

  useEffect(() => {
    if (!isAdmin && selectedClassId) {
      loadClassAttendanceData();
    }
  }, [selectedClassId, selectedDate, isAdmin]);

  // Toggle student absent checkbox
  const handleToggleAbsent = (studentId: string) => {
    if (isAttendanceSaved && !hasEditPermission) return;
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'absent' ? 'present' : 'absent'
    }));
  };

  const handleMarkAllPresent = () => {
    if (isAttendanceSaved && !hasEditPermission) return;
    const map: { [id: string]: 'present' | 'absent' } = {};
    students.forEach(s => { map[s.id] = 'present'; });
    setAttendanceMap(map);
  };

  // Absent students list
  const absentStudents = students.filter(s => attendanceMap[s.id] === 'absent');
  const presentCount = students.length - absentStudents.length;

  // Open review modal before saving
  const handleOpenReview = () => {
    setIsReviewModalOpen(true);
  };

  // Confirm and Save attendance
  const handleConfirmSave = async () => {
    setIsSaving(true);
    try {
      const payload = students.map(s => ({
        student_id: s.id,
        status: attendanceMap[s.id] || 'present'
      }));

      await attendanceService.saveClassAttendance(selectedClassId, selectedDate, payload);
      toast.success(`Attendance successfully saved and locked for ${selectedDate}.`);
      setIsReviewModalOpen(false);
      setIsAttendanceSaved(true);
      setHasEditPermission(false);
      loadClassAttendanceData();
      loadClassesAndTeachers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  // Admin: Toggle Edit Permission for a class
  const handleAdminTogglePermission = (classId: string, isCurrentlyUnlocked: boolean) => {
    if (isCurrentlyUnlocked) {
      attendanceService.revokeEditPermission(classId, selectedDate);
      toast.info('Edit permission revoked. Class attendance is now locked.');
    } else {
      attendanceService.grantEditPermission(classId, selectedDate);
      toast.success('Edit permission granted. Teachers & Headmaster can now modify this class attendance.');
    }
    loadClassesAndTeachers();
  };

  // Admin: View Class Attendance Roster Modal
  const handleAdminViewRoster = async (cls: ClassRoom) => {
    setAdminViewClass(cls);
    setIsLoadingAdminView(true);
    try {
      const records = await attendanceService.getClassAttendance(cls.id, selectedDate);
      setAdminClassRecords(records);
    } finally {
      setIsLoadingAdminView(false);
    }
  };

  // Admin: Open Map Teacher Modal for a Class
  const handleOpenMapTeacher = (cls: ClassRoom) => {
    const currentTeacher = teachers.find(
      t => t.assigned_class_id === cls.id || t.assigned_class === `Class ${cls.class_number}`
    );
    setMapForm({
      classId: cls.id,
      classNumber: cls.class_number,
      teacherId: currentTeacher?.id || ''
    });
    setIsMapTeacherModalOpen(true);
  };

  // Admin: Save Teacher Mapping
  const handleSaveTeacherMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingMap(true);
    try {
      await teacherService.mapTeacherToClass(mapForm.classId, mapForm.classNumber, mapForm.teacherId);
      toast.success(`Teacher attendance authority mapped to Class ${mapForm.classNumber} successfully.`);
      setIsMapTeacherModalOpen(false);
      loadClassesAndTeachers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to map teacher to class');
    } finally {
      setIsSubmittingMap(false);
    }
  };

  const activeSelectedClassObj = classes.find(c => c.id === selectedClassId);

  return (
    <div className="space-y-6">
      
      {/* ================================================================= */}
      {/* 🛡️ 1. ADMIN ATTENDANCE VIEW (Percentages, Teacher Mapping, Edit Locks) */}
      {/* ================================================================= */}
      {isAdmin ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Executive Attendance Governance</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Attendance & Teacher Authority</h1>
              <p className="text-sm text-slate-500 mt-1">
                Map teachers to class attendance cohorts, monitor live percentages, and unlock edit permissions
              </p>
            </div>

            {/* Date Selector & Excel Export */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
                <Calendar className="w-4 h-4 text-blue-600" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="text-xs font-bold text-slate-800 outline-none bg-transparent"
                />
              </div>

              <button
                type="button"
                onClick={() => excelService.exportAttendanceDaily(selectedDate)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Export Daily Excel</span>
              </button>
            </div>
          </div>

          {/* Institutional Class Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 bg-slate-100 rounded-2xl animate-pulse" />
              ))
            ) : (
              classes.map(cls => {
                const isUnlocked = attendanceService.hasEditPermission(cls.id, selectedDate);
                const hasRecorded = (cls.present_today || 0) + (cls.absent_today || 0) > 0;
                const percentage = cls.attendance_percentage || 0;

                return (
                  <div
                    key={cls.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between hover:shadow-elevated transition-all"
                  >
                    <div>
                      {/* Top Row: Class Info & Attendance % */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100 shadow-sm">
                            <School className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">Class {cls.class_number}</h3>
                            <span className="text-xs font-semibold text-slate-400">Section {cls.section}</span>
                          </div>
                        </div>

                        {/* Large Attendance Percentage Display */}
                        <div className="text-right">
                          <span
                            className={`text-xl font-black block ${
                              percentage >= 75
                                ? 'text-emerald-600'
                                : percentage > 0
                                ? 'text-amber-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {hasRecorded ? `${percentage}%` : 'Pending'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Attendance Rate
                          </span>
                        </div>
                      </div>

                      {/* Mapped Teacher Authority with 1-Click Reassign */}
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-4 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Mapped Teacher</span>
                            <span className="font-bold text-slate-900">{cls.assigned_teacher_name}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenMapTeacher(cls)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] border border-blue-200 transition-colors cursor-pointer"
                          title="Assign or change teacher for this class"
                        >
                          Map Teacher
                        </button>
                      </div>

                      {/* Presence Metrics */}
                      <div className="grid grid-cols-3 gap-2 text-center py-2.5 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Enrolled</span>
                          <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">{cls.student_count || 0}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-emerald-600 block">Present</span>
                          <span className="text-sm font-extrabold text-emerald-600 mt-0.5 block">{cls.present_today || 0}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-rose-500 block">Absent</span>
                          <span className="text-sm font-extrabold text-rose-600 mt-0.5 block">{cls.absent_today || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Grant Edit Permission & View Roster */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleAdminViewRoster(cls)}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>View Records</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAdminTogglePermission(cls.id, isUnlocked)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                          isUnlocked
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {isUnlocked ? (
                          <>
                            <Unlock className="w-3.5 h-3.5 text-amber-700" />
                            <span>Revoke Edit</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5 text-blue-700" />
                            <span>Allow Edit</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (

        /* ================================================================= */
        /* 👨‍🏫 2. TEACHER & HEAD MASTER ATTENDANCE PORTAL */
        /* ================================================================= */
        <div className="space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daily Attendance Roll Call</h1>
              <p className="text-sm text-slate-500 mt-1">
                {isTeacher
                  ? `Mark roll call for your assigned cohort (${activeSelectedClassObj ? `Class ${activeSelectedClassObj.class_number}-${activeSelectedClassObj.section}` : 'Class'})`
                  : 'Head Master: Supervise and mark attendance for ALL class cohorts'}
              </p>
            </div>

            {/* Date Selector */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
                <Calendar className="w-4 h-4 text-blue-600" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="text-xs font-bold text-slate-800 outline-none bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* 👔 Head Master Cohort Selector (Headmaster can give/take attendance for ALL classes) */}
          {isHeadMaster && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Head Master Class Cohort Access:</span>
                  <span className="text-xs text-slate-500">You have full authority to mark roll calls across all classes</span>
                </div>
              </div>

              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="py-2 px-3 text-sm rounded-xl border border-slate-200 focus:border-emerald-600 outline-none font-bold text-slate-800 bg-white shadow-sm"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    Class {c.class_number} (Section {c.section}) - Teacher: {c.assigned_teacher_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 👨‍🏫 If Teacher is not mapped to any class */}
          {isTeacher && !selectedClassId ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-card space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Class Cohort Mapped</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                You are currently not mapped to take attendance for a specific class cohort. Please contact the <strong>Master Administrator</strong> to map your class authority.
              </p>
            </div>
          ) : (

            <>
              {/* Status Lock Banner */}
              {isAttendanceSaved && !hasEditPermission ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900 text-xs font-semibold">
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-amber-700 flex-shrink-0" />
                    <span>
                      Attendance for <strong>{activeSelectedClassObj ? `Class ${activeSelectedClassObj.class_number}-${activeSelectedClassObj.section}` : 'this class'}</strong> on <strong>{selectedDate}</strong> is <strong>Submitted & Locked</strong>.
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-lg">
                    Contact Admin to grant edit permission
                  </span>
                </div>
              ) : hasEditPermission ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-900 text-xs font-semibold">
                  <Unlock className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span>Admin has granted edit permission. You can now modify and save the roll call.</span>
                </div>
              ) : null}

              {/* 2-Column: Mapped Class Summary Card (Left) + Student Roll Call Table (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column: Assigned Class Card */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100 shadow-sm">
                        <School className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Class {activeSelectedClassObj?.class_number || ''}
                        </h3>
                        <span className="text-xs font-semibold text-slate-400">
                          Section {activeSelectedClassObj?.section || 'A'} • {activeSelectedClassObj?.academic_year || '2026-2027'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4 text-xs space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Teacher</span>
                      <span className="font-bold text-slate-800">{activeSelectedClassObj?.assigned_teacher_name || 'Not Assigned'}</span>
                    </div>

                    {/* Live Counter */}
                    <div className="grid grid-cols-3 gap-2 text-center py-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Enrolled</span>
                        <span className="text-base font-extrabold text-slate-900">{students.length}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-600 block">Present</span>
                        <span className="text-base font-extrabold text-emerald-600">{presentCount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-rose-500 block">Absent</span>
                        <span className="text-base font-extrabold text-rose-600">{absentStudents.length}</span>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    {(!isAttendanceSaved || hasEditPermission) && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={handleMarkAllPresent}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer w-full text-center"
                        >
                          Mark All Present
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Student Attendance Table with Absent Checkboxes */}
                <div className="lg:col-span-8">
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
                    
                    {/* Table Header */}
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Student Roll Call List</h3>
                        <p className="text-xs text-slate-500">Uncheck = Present • Check box = Absent</p>
                      </div>

                      <span className="text-xs font-bold text-slate-500">
                        {students.length} Students Total
                      </span>
                    </div>

                    {/* Students List */}
                    <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
                      {isLoading ? (
                        <div className="py-12 text-center text-slate-400">Loading student list...</div>
                      ) : students.length === 0 ? (
                        <div className="py-12 text-center text-slate-400">No students enrolled in this class.</div>
                      ) : (
                        students.map(st => {
                          const isAbsent = attendanceMap[st.id] === 'absent';

                          return (
                            <div
                              key={st.id}
                              onClick={() => handleToggleAbsent(st.id)}
                              className={`p-4 flex items-center justify-between transition-colors cursor-pointer ${
                                isAbsent
                                  ? 'bg-rose-50/70 hover:bg-rose-100/70'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-3.5">
                                <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-mono font-bold text-xs text-slate-700">
                                  #{st.roll_number}
                                </span>
                                <div>
                                  <span className="font-bold text-slate-900 text-sm block">{st.student_name}</span>
                                  <span className="text-slate-400 text-xs font-mono">Adm: {st.admission_number}</span>
                                </div>
                              </div>

                              {/* Absent Checkbox */}
                              <div className="flex items-center gap-3">
                                <span
                                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                    isAbsent
                                      ? 'bg-rose-100 text-rose-700'
                                      : 'bg-emerald-50 text-emerald-700'
                                  }`}
                                >
                                  {isAbsent ? 'ABSENT' : 'PRESENT'}
                                </span>

                                <input
                                  type="checkbox"
                                  checked={isAbsent}
                                  onChange={() => {}} // Handled by row click
                                  disabled={isAttendanceSaved && !hasEditPermission}
                                  className="w-5 h-5 rounded-lg text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Save Attendance Button */}
                    <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <div className="text-xs font-medium text-slate-600">
                        <span>Summary: </span>
                        <strong className="text-emerald-600">{presentCount} Present</strong>,{' '}
                        <strong className="text-rose-600">{absentStudents.length} Absent</strong>
                      </div>

                      <button
                        type="button"
                        onClick={handleOpenReview}
                        disabled={students.length === 0 || (isAttendanceSaved && !hasEditPermission)}
                        className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all disabled:opacity-40 disabled:shadow-none cursor-pointer flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Review & Save Attendance</span>
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            </>
          )}

        </div>
      )}

      {/* ================================================================= */}
      {/* 🔗 ADMIN MAP TEACHER MODAL */}
      {/* ================================================================= */}
      <Modal
        isOpen={isMapTeacherModalOpen}
        onClose={() => setIsMapTeacherModalOpen(false)}
        title={`Map Faculty Authority to Class ${mapForm.classNumber}`}
      >
        <form onSubmit={handleSaveTeacherMapping} className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900">
            Select the designated faculty member who will be authorized to record daily attendance roll calls for <strong>Class {mapForm.classNumber}</strong>.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Assigned Teacher *
            </label>
            <select
              value={mapForm.teacherId}
              onChange={e => setMapForm({ ...mapForm, teacherId: e.target.value })}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none bg-white font-bold text-slate-800"
            >
              <option value="">-- Unassigned (No Teacher) --</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.full_name} ({t.employee_id}) - Current: {t.assigned_class || 'None'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsMapTeacherModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingMap}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isSubmittingMap ? 'Saving Mapping...' : 'Save Mapping'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ================================================================= */}
      {/* 📋 REVIEW & SAVE CONFIRMATION MODAL (Shows Absent List) */}
      {/* ================================================================= */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Confirm & Save Daily Attendance"
      >
        <div className="space-y-5">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Date:</span>
              <span className="font-bold text-slate-900">{formatDate(selectedDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Enrolled:</span>
              <span className="font-bold text-slate-900">{students.length} Students</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Present Count:</span>
              <span className="font-bold text-emerald-600">{presentCount} Students</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Absent Count:</span>
              <span className="font-bold text-rose-600">{absentStudents.length} Students</span>
            </div>
          </div>

          {/* Absent Students Review List */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Absent Students List ({absentStudents.length})
            </h4>

            {absentStudents.length === 0 ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>All {students.length} students are present today!</span>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 bg-rose-50/50 rounded-2xl border border-rose-100 p-2">
                {absentStudents.map(st => (
                  <div key={st.id} className="py-2 px-2 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{st.student_name}</span>
                    <span className="font-mono text-rose-700 text-[11px] font-bold">
                      Roll #{st.roll_number} • Adm: {st.admission_number}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Once saved, attendance is locked. Further changes will require Administrator approval.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmSave}
              disabled={isSaving}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isSaving ? 'Saving...' : 'Confirm & Save Attendance'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ================================================================= */}
      {/* 🔍 ADMIN CLASS ATTENDANCE ROSTER DETAILS MODAL */}
      {/* ================================================================= */}
      <Modal
        isOpen={Boolean(adminViewClass)}
        onClose={() => setAdminViewClass(null)}
        title={adminViewClass ? `Class ${adminViewClass.class_number} (${adminViewClass.section}) Attendance Details` : ''}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
            <span>Date: <strong className="text-slate-900">{formatDate(selectedDate)}</strong></span>
            <span>Recorded: <strong className="text-blue-600">{adminClassRecords.length} Records</strong></span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {isLoadingAdminView ? (
              <div className="py-8 text-center text-slate-400">Loading attendance records...</div>
            ) : adminClassRecords.length === 0 ? (
              <div className="py-8 text-center text-slate-400">No attendance recorded for this class on this date.</div>
            ) : (
              adminClassRecords.map(rec => (
                <div key={rec.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{rec.student_name}</span>
                    <span className="text-slate-400 font-mono text-[10px]">Adm: {rec.admission_number} • Roll #{rec.roll_number}</span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      rec.status === 'present'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {rec.status.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

    </div>
  );
};
