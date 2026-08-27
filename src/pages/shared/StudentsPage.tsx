import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  UserPlus,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  Eye,
  School,
  Calendar,
  Phone,
  MapPin,
  User
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import { excelService } from '../../services/excelService';
import { ClassRoom, Student } from '../../types';
import { formatDate } from '../../lib/utils';

export const StudentsPage: React.FC = () => {
  const { role, user } = useAuth();
  const toast = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    student_name: '',
    admission_number: '',
    date_of_birth: '2018-01-15',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    father_name: '',
    mother_name: '',
    parent_phone: '',
    address: '',
    class_id: '',
    section: 'A',
    roll_number: 1,
    admission_date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canManageStudents = role === 'admin' || role === 'head_master';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const clsList = await classService.getClasses();
      setClasses(clsList);

      // If teacher, default to their assigned class
      let filterClassId = selectedClassId;
      if (role === 'teacher' && user?.assigned_class) {
        const matched = clsList.find(c => `Class ${c.class_number}` === user.assigned_class || c.id === user.assigned_class_id);
        if (matched) {
          filterClassId = matched.id;
          setSelectedClassId(matched.id);
        }
      }

      const stList = await studentService.getStudents({
        class_id: filterClassId || undefined,
        search: searchQuery || undefined,
        section: selectedSection || undefined
      });
      setStudents(stList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClassId, selectedSection, searchQuery]);

  const handleOpenAddModal = () => {
    const nextAdm = studentService.getNextAdmissionNumber();
    const defaultClass = classes[0]?.id || '';
    setFormData({
      student_name: '',
      admission_number: nextAdm,
      date_of_birth: '2018-05-10',
      gender: 'Male',
      father_name: '',
      mother_name: '',
      parent_phone: '+1 (555) 123-45',
      address: 'Hyderabad, Telangana',
      class_id: defaultClass,
      section: 'A',
      roll_number: students.filter(s => s.class_id === defaultClass).length + 1,
      admission_date: new Date().toISOString().split('T')[0]
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await studentService.addStudent(formData);
      toast.success(`Student ${formData.student_name} added successfully.`);
      setIsAddModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setIsSubmitting(true);
    try {
      await studentService.updateStudent(selectedStudent.id, formData);
      toast.success('Student details updated.');
      setIsEditModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedStudent) return;
    setIsSubmitting(true);
    try {
      await studentService.deleteStudent(selectedStudent.id);
      toast.success('Student record removed.');
      setIsDeleteDialogOpen(false);
      setSelectedStudent(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete student');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Enrollment Registry</h1>
          <p className="text-sm text-slate-500 mt-1">
            {role === 'teacher'
              ? `Viewing students enrolled in your assigned class (${user?.assigned_class})`
              : 'Central student database with admissions, class assignments, and parental records'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => excelService.exportStudentRegistry(selectedClassId || undefined)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          {canManageStudents && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by student name, admission number, roll no, father name..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {role !== 'teacher' && (
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="py-2 px-3 text-sm rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none bg-white text-slate-700"
              >
                <option value="">All Classes (1 to 6)</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    Class {c.class_number} (Sec {c.section})
                  </option>
                ))}
              </select>
            </div>
          )}

          <select
            value={selectedSection}
            onChange={e => setSelectedSection(e.target.value)}
            className="py-2 px-3 text-sm rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none bg-white text-slate-700"
          >
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>
        </div>
      </div>

      {/* Student Registry Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Adm No</th>
                <th className="py-3.5 px-4">Roll</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Class & Section</th>
                <th className="py-3.5 px-4">Parent Details</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No student records found matching your filters.
                  </td>
                </tr>
              ) : (
                students.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 text-xs">
                      {student.admission_number}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700 text-xs">
                      #{student.roll_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          student.gender === 'Female' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {student.student_name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block leading-snug">{student.student_name}</span>
                          <span className="text-[11px] text-slate-400 font-medium">DOB: {formatDate(student.date_of_birth)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        <School className="w-3 h-3 text-blue-600" />
                        {student.class_name || 'Class'} - {student.section}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-slate-700 font-medium">
                        {student.father_name || student.mother_name || 'Guardian'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-slate-500 font-mono">{student.parent_phone || '—'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="View Profile"
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsViewModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {canManageStudents && (
                          <>
                            <button
                              title="Edit Student"
                              onClick={() => {
                                setSelectedStudent(student);
                                setFormData({
                                  student_name: student.student_name,
                                  admission_number: student.admission_number,
                                  date_of_birth: student.date_of_birth,
                                  gender: student.gender,
                                  father_name: student.father_name || '',
                                  mother_name: student.mother_name || '',
                                  parent_phone: student.parent_phone || '',
                                  address: student.address || '',
                                  class_id: student.class_id,
                                  section: student.section,
                                  roll_number: student.roll_number,
                                  admission_date: student.admission_date
                                });
                                setIsEditModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              title="Delete Student"
                              onClick={() => {
                                setSelectedStudent(student);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Student Admission Entry" maxWidth="2xl">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                value={formData.student_name}
                onChange={e => setFormData({ ...formData, student_name: e.target.value })}
                placeholder="e.g. Aarav Patel"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Admission Number *</label>
              <input
                type="text"
                required
                value={formData.admission_number}
                onChange={e => setFormData({ ...formData, admission_number: e.target.value })}
                placeholder="ADM-2026-001"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Class *</label>
              <select
                value={formData.class_id}
                onChange={e => setFormData({ ...formData, class_id: e.target.value })}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 bg-white"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>Class {c.class_number}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Section</label>
              <select
                value={formData.section}
                onChange={e => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 bg-white"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Roll Number</label>
              <input
                type="number"
                min={1}
                value={formData.roll_number}
                onChange={e => setFormData({ ...formData, roll_number: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Date of Birth *</label>
              <input
                type="date"
                required
                value={formData.date_of_birth}
                onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Father Name</label>
              <input
                type="text"
                value={formData.father_name}
                onChange={e => setFormData({ ...formData, father_name: e.target.value })}
                placeholder="Father's Full Name"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Mother Name</label>
              <input
                type="text"
                value={formData.mother_name}
                onChange={e => setFormData({ ...formData, mother_name: e.target.value })}
                placeholder="Mother's Full Name"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Parent Phone Number</label>
              <input
                type="text"
                value={formData.parent_phone}
                onChange={e => setFormData({ ...formData, parent_phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Admission Date</label>
              <input
                type="date"
                value={formData.admission_date}
                onChange={e => setFormData({ ...formData, admission_date: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Residential Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full home address..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Student Record" maxWidth="2xl">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                value={formData.student_name}
                onChange={e => setFormData({ ...formData, student_name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Admission Number</label>
              <input
                type="text"
                disabled
                value={formData.admission_number}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono text-sm bg-slate-100 text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Class *</label>
              <select
                value={formData.class_id}
                onChange={e => setFormData({ ...formData, class_id: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 bg-white"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>Class {c.class_number}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Section</label>
              <select
                value={formData.section}
                onChange={e => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 bg-white"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Roll Number</label>
              <input
                type="number"
                value={formData.roll_number}
                onChange={e => setFormData({ ...formData, roll_number: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Father Name</label>
              <input
                type="text"
                value={formData.father_name}
                onChange={e => setFormData({ ...formData, father_name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Parent Phone</label>
              <input
                type="text"
                value={formData.parent_phone}
                onChange={e => setFormData({ ...formData, parent_phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Update Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Student Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Student Profile Details">
        {selectedStudent && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20">
                {selectedStudent.student_name.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedStudent.student_name}</h3>
                <p className="text-xs text-blue-600 font-mono font-bold mt-0.5">{selectedStudent.admission_number}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border">
                    {selectedStudent.class_name || 'Class'} - {selectedStudent.section}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border">
                    Roll #{selectedStudent.roll_number}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-slate-400 font-semibold block">Date of Birth</span>
                <span className="font-bold text-slate-800 mt-1 block">{formatDate(selectedStudent.date_of_birth)}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-slate-400 font-semibold block">Gender</span>
                <span className="font-bold text-slate-800 mt-1 block">{selectedStudent.gender}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-slate-400 font-semibold block">Father's Name</span>
                <span className="font-bold text-slate-800 mt-1 block">{selectedStudent.father_name || '—'}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-slate-400 font-semibold block">Mother's Name</span>
                <span className="font-bold text-slate-800 mt-1 block">{selectedStudent.mother_name || '—'}</span>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs">
              <span className="text-slate-400 font-semibold block">Parent Contact Phone</span>
              <span className="font-mono font-bold text-slate-800 mt-1 block">{selectedStudent.parent_phone || '—'}</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs">
              <span className="text-slate-400 font-semibold block">Residential Address</span>
              <span className="font-medium text-slate-700 mt-1 block leading-relaxed">{selectedStudent.address || '—'}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteSubmit}
        title="Delete Student Record"
        message={`Are you sure you want to permanently remove ${selectedStudent?.student_name} (${selectedStudent?.admission_number})? All associated marks and attendance history will be deleted.`}
        confirmText="Delete Student"
        isLoading={isSubmitting}
      />
    </div>
  );
};
