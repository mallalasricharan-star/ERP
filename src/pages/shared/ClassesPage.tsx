import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  School,
  Users,
  UserCheck,
  Download,
  CalendarCheck,
  Award,
  ArrowRight,
  User,
  PlusCircle,
  Trash2
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { classService } from '../../services/classService';
import { teacherService } from '../../services/teacherService';
import { studentService } from '../../services/studentService';
import { excelService } from '../../services/excelService';
import { ClassRoom, Student, Teacher } from '../../types';

export const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Add Class Modal state
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isDeleteClassOpen, setIsDeleteClassOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<ClassRoom | null>(null);
  const [addClassForm, setAddClassForm] = useState({
    class_number: 1,
    section: 'A',
    academic_year: '2026-2027',
    teacher_id: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { role } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const isAdmin = role === 'admin';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [clsData, tchrData] = await Promise.all([
        classService.getClasses(),
        teacherService.getTeachers()
      ]);
      setClasses(clsData);
      setTeachers(tchrData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await classService.addClass(addClassForm);
      toast.success(`Class ${addClassForm.class_number}-${addClassForm.section.toUpperCase()} created successfully.`);
      setIsAddClassOpen(false);
      setAddClassForm({
        class_number: 1,
        section: 'A',
        academic_year: '2026-2027',
        teacher_id: ''
      });
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create class');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClassConfirm = async () => {
    if (!classToDelete) return;
    setIsSubmitting(true);
    try {
      await classService.deleteClass(classToDelete.id);
      toast.success(`Class ${classToDelete.class_number}-${classToDelete.section} deleted.`);
      setIsDeleteClassOpen(false);
      setClassToDelete(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete class');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Classes Management</h1>
          <p className="text-sm text-slate-500 mt-1">Class grade cohorts, faculty allocations, and live attendance metrics</p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsAddClassOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Class</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => excelService.exportMarksReport()}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export Classes Excel</span>
          </button>
        </div>
      </div>

      {/* Class Cards Grid */}
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

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        (cls.attendance_percentage || 0) >= 75
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {cls.attendance_percentage || 0}% Att.
                    </span>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setClassToDelete(cls);
                          setIsDeleteClassOpen(true);
                        }}
                        className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete Class"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
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
                <span>View Students & Scores</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add New Class Modal (Admin Only) */}
      <Modal
        isOpen={isAddClassOpen}
        onClose={() => setIsAddClassOpen(false)}
        title="Add New Academic Class"
      >
        <form onSubmit={handleCreateClass} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Class Grade Number *
            </label>
            <input
              type="number"
              required
              min="1"
              max="12"
              placeholder="e.g. 1, 2, 7, 10"
              value={addClassForm.class_number}
              onChange={e => setAddClassForm({ ...addClassForm, class_number: Number(e.target.value) })}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Section *
            </label>
            <input
              type="text"
              required
              maxLength={2}
              placeholder="e.g. A, B, C"
              value={addClassForm.section}
              onChange={e => setAddClassForm({ ...addClassForm, section: e.target.value.toUpperCase() })}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Academic Year
            </label>
            <input
              type="text"
              value={addClassForm.academic_year}
              onChange={e => setAddClassForm({ ...addClassForm, academic_year: e.target.value })}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Assign Class Teacher (Optional)
            </label>
            <select
              value={addClassForm.teacher_id}
              onChange={e => setAddClassForm({ ...addClassForm, teacher_id: e.target.value })}
              className="w-full py-2.5 px-3.5 text-sm rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none bg-white font-medium"
            >
              <option value="">-- No Teacher Assigned --</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.full_name} ({t.employee_id})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddClassOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Class Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteClassOpen}
        onClose={() => setIsDeleteClassOpen(false)}
        onConfirm={handleDeleteClassConfirm}
        title="Delete Academic Class"
        message={`Are you sure you want to delete Class ${classToDelete?.class_number}-${classToDelete?.section}? This will also remove the class cohort allocation.`}
        confirmText="Delete Class"
        isDanger={true}
        isLoading={isSubmitting}
      />

      {/* View Class Students Modal */}
      <Modal
        isOpen={Boolean(selectedClass)}
        onClose={() => setSelectedClass(null)}
        title={selectedClass ? `Class ${selectedClass.class_number} (${selectedClass.section}) Cohort Roster` : ''}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs font-medium text-slate-600">
            <span>Class Teacher: <strong className="text-slate-900">{selectedClass?.assigned_teacher_name}</strong></span>
            <span>Total Enrolled: <strong className="text-blue-600">{classStudents.length} Students</strong></span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {isLoadingStudents ? (
              <div className="py-8 text-center text-slate-400">Loading student roster...</div>
            ) : classStudents.length === 0 ? (
              <div className="py-8 text-center text-slate-400">No students enrolled in this class.</div>
            ) : (
              classStudents.map(st => (
                <div key={st.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{st.student_name}</span>
                    <span className="text-slate-400 font-mono text-[10px]">Adm: {st.admission_number}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 font-mono text-slate-700 font-bold">
                    Roll #{st.roll_number}
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
