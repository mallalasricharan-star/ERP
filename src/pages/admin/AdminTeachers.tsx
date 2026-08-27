import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  KeyRound,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  School,
  Mail,
  Phone,
  Filter
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { teacherService } from '../../services/teacherService';
import { authService } from '../../services/authService';
import { Teacher } from '../../types';

export const AdminTeachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    full_name: '',
    employee_id: '',
    email: '',
    phone: '',
    assigned_class: 'Class 1',
    initial_password: 'Teacher@123'
  });
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();

  const loadTeachers = async () => {
    setIsLoading(true);
    try {
      const data = await teacherService.getTeachers();
      setTeachers(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await teacherService.addTeacher(formData);
      toast.success(`Teacher ${formData.full_name} registered successfully.`);
      setIsAddModalOpen(false);
      setFormData({
        full_name: '',
        employee_id: '',
        email: '',
        phone: '',
        assigned_class: 'Class 1',
        initial_password: 'Teacher@123'
      });
      loadTeachers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add teacher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    setIsSubmitting(true);
    try {
      await teacherService.updateTeacher(selectedTeacher.id, {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        assigned_class: formData.assigned_class
      });
      toast.success('Teacher record updated.');
      setIsEditModalOpen(false);
      loadTeachers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update teacher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    setIsSubmitting(true);
    try {
      await authService.adminResetPassword(selectedTeacher.profile_id || selectedTeacher.id, newPassword);
      toast.success(`Password reset for ${selectedTeacher.full_name}.`);
      setIsResetPasswordModalOpen(false);
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeacher = async () => {
    if (!selectedTeacher) return;
    setIsSubmitting(true);
    try {
      await teacherService.deleteTeacher(selectedTeacher.id);
      toast.success('Teacher deleted.');
      setIsDeleteDialogOpen(false);
      setSelectedTeacher(null);
      loadTeachers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete teacher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (teacher: Teacher) => {
    try {
      const updatedStatus = await teacherService.toggleTeacherStatus(teacher.id);
      toast.success(`Teacher marked as ${updatedStatus ? 'Active' : 'Deactivated'}.`);
      loadTeachers();
    } catch (err: any) {
      toast.error(err.message || 'Status toggle failed');
    }
  };

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch =
      t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assigned_class.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass = !selectedClassFilter || t.assigned_class === selectedClassFilter;

    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Faculty & Teachers Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage teaching staff, class assignments, and secure password administration</p>
        </div>

        <button
          onClick={() => {
            setFormData({
              full_name: '',
              employee_id: `EMP-T0${teachers.length + 1}`,
              email: '',
              phone: '',
              assigned_class: 'Class 1',
              initial_password: 'Teacher@123'
            });
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Teacher</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search teacher by name, employee ID, email..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedClassFilter}
            onChange={e => setSelectedClassFilter(e.target.value)}
            className="py-2 px-3 text-sm rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none bg-white text-slate-700"
          >
            <option value="">All Assigned Classes</option>
            {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Teacher Name</th>
                <th className="py-3.5 px-4">Assigned Class</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No teacher records found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map(teacher => (
                  <tr key={teacher.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 text-xs">
                      {teacher.employee_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                          {teacher.full_name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-900">{teacher.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <School className="w-3.5 h-3.5" />
                        {teacher.assigned_class}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{teacher.email}</span>
                        </div>
                        {teacher.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{teacher.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(teacher)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${
                          teacher.is_active !== false
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {teacher.is_active !== false ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Deactivated</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="Reset Password"
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setNewPassword('');
                            setIsResetPasswordModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          title="Edit Teacher"
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setFormData({
                              full_name: teacher.full_name,
                              employee_id: teacher.employee_id,
                              email: teacher.email,
                              phone: teacher.phone || '',
                              assigned_class: teacher.assigned_class,
                              initial_password: ''
                            });
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete Teacher"
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Teacher Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Teacher">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="e.g. Mrs. Sarah Jenkins"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Employee ID *</label>
              <input
                type="text"
                required
                value={formData.employee_id}
                onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
                placeholder="EMP-T01"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Assigned Class *</label>
              <select
                value={formData.assigned_class}
                onChange={e => setFormData({ ...formData, assigned_class: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 bg-white"
              >
                {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="teacher@school.edu"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 019-2833"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Initial Password *</label>
            <input
              type="text"
              required
              value={formData.initial_password}
              onChange={e => setFormData({ ...formData, initial_password: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
            />
            <p className="text-[11px] text-slate-400 mt-1">Admin sets initial password. Teachers cannot change it.</p>
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
              {isSubmitting ? 'Saving...' : 'Register Teacher'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Teacher Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Teacher Details">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Employee ID</label>
              <input
                type="text"
                disabled
                value={formData.employee_id}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-slate-100 text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Assigned Class *</label>
              <select
                value={formData.assigned_class}
                onChange={e => setFormData({ ...formData, assigned_class: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 bg-white"
              >
                {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
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
              {isSubmitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal (Admin-only privilege as per requirement #5) */}
      <Modal isOpen={isResetPasswordModalOpen} onClose={() => setIsResetPasswordModalOpen(false)} title="Reset Teacher Password">
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Enter a new password for <span className="font-bold text-slate-900">{selectedTeacher?.full_name}</span>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">New Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsResetPasswordModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || newPassword.length < 6}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Resetting...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteTeacher}
        title="Delete Teacher Record"
        message={`Are you sure you want to permanently remove ${selectedTeacher?.full_name} (${selectedTeacher?.employee_id})? This action cannot be undone.`}
        confirmText="Delete Teacher"
        isLoading={isSubmitting}
      />
    </div>
  );
};
