import React, { useState, useEffect } from 'react';
import { UserCheck, KeyRound, Edit2, Mail, Phone, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { headmasterService } from '../../services/headmasterService';
import { authService } from '../../services/authService';
import { Profile } from '../../types';

export const AdminHeadmaster: React.FC = () => {
  const [headmaster, setHeadmaster] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();

  const loadHeadMaster = async () => {
    setIsLoading(true);
    try {
      const hm = await headmasterService.getHeadMaster();
      setHeadmaster(hm);
      if (hm) {
        setFormData({
          full_name: hm.full_name,
          email: hm.email,
          phone: hm.phone || ''
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHeadMaster();
  }, []);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await headmasterService.updateHeadMaster(formData);
      toast.success('Head Master profile updated.');
      setIsEditModalOpen(false);
      loadHeadMaster();
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headmaster) return;
    setIsSubmitting(true);
    try {
      await authService.adminResetPassword(headmaster.id, newPassword);
      toast.success(`Password reset successfully for Head Master.`);
      setIsResetPasswordModalOpen(false);
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Password reset failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!headmaster) return;
    try {
      const newStatus = !headmaster.is_active;
      await headmasterService.updateHeadMaster({ is_active: newStatus });
      toast.success(`Head Master account marked as ${newStatus ? 'Active' : 'Deactivated'}.`);
      loadHeadMaster();
    } catch (err: any) {
      toast.error(err.message || 'Status toggle failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Head Master Administration</h1>
        <p className="text-sm text-slate-500 mt-1">Manage executive head master account and password security</p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : headmaster ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8 max-w-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-2xl shadow-sm">
                <UserCheck className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{headmaster.full_name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Head Master
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
                    headmaster.is_active !== false ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                  }`}>
                    {headmaster.is_active !== false ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-600" />}
                    {headmaster.is_active !== false ? 'Active Account' : 'Deactivated'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Info</span>
              </button>
              <button
                onClick={() => {
                  setNewPassword('');
                  setIsResetPasswordModalOpen(true);
                }}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Reset Password</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Institutional Email</span>
              <div className="flex items-center gap-2 mt-1.5 text-sm font-semibold text-slate-800">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{headmaster.email}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Contact Number</span>
              <div className="flex items-center gap-2 mt-1.5 text-sm font-semibold text-slate-800">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{headmaster.phone || 'Not Provided'}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Head Master credentials are under exclusive Admin custody.
            </span>
            <button
              onClick={handleToggleStatus}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                headmaster.is_active !== false
                  ? 'text-rose-600 hover:bg-rose-50 border-rose-200'
                  : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
              }`}
            >
              {headmaster.is_active !== false ? 'Deactivate Head Master' : 'Reactivate Head Master'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border text-center text-slate-500">
          No Head Master record configured.
        </div>
      )}

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Head Master Profile">
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
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Phone Number</label>
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
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={isResetPasswordModalOpen} onClose={() => setIsResetPasswordModalOpen(false)} title="Reset Head Master Password">
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Set a new secure password for Head Master account (<span className="font-bold text-slate-900">{headmaster?.email}</span>).
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
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
