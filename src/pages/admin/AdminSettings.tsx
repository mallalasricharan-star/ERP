import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Send,
  Lock,
  ArrowRight
} from 'lucide-react';
import { PinInput } from '../../components/common/PinInput';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import { auditService } from '../../services/auditService';
import { AuditLog } from '../../types';
import { formatDate } from '../../lib/utils';

export const AdminSettings: React.FC = () => {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [isChangingPin, setIsChangingPin] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');

  // Email Reset State
  const [recipientEmail, setRecipientEmail] = useState('admin@school.edu');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ success?: string; error?: string }>({});

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchLog, setSearchLog] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const toast = useToast();

  const loadLogs = async () => {
    try {
      const logs = await auditService.getLogs({
        search: searchLog || undefined,
        role: roleFilter || undefined
      });
      setAuditLogs(logs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [searchLog, roleFilter]);

  const handleChangePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');

    if (newPin.length !== 6) {
      setPinError('New PIN must be exactly 6 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('New PIN and Confirm PIN do not match.');
      return;
    }

    setIsChangingPin(true);
    try {
      await authService.updateAdminPinDirect(newPin, confirmPin);
      setPinSuccess('Admin Master PIN has been updated successfully!');
      toast.success('Admin PIN updated successfully.');
      setNewPin('');
      setConfirmPin('');
      loadLogs();
    } catch (err: any) {
      setPinError(err.message || 'Failed to change Admin PIN.');
      toast.error(err.message || 'PIN update failed');
    } finally {
      setIsChangingPin(false);
    }
  };

  const handleSendResetEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setEmailStatus({});
    setIsSendingEmail(true);
    try {
      const result = await authService.sendAdminPinResetEmail();
      setEmailStatus({ success: `Security PIN reset link and instructions sent to ${recipientEmail || 'admin@school.edu'}.` });
      toast.success('Reset link dispatched to admin email.');
      loadLogs();
    } catch (err: any) {
      setEmailStatus({ error: err.message || 'Failed to dispatch reset email.' });
      toast.error(err.message || 'Email dispatch failed.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security Settings & Audit Trail</h1>
        <p className="text-sm text-slate-500 mt-1">Admin Master PIN authentication configuration, email reset links, and system-wide audit telemetry</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SECTION 1: SET NEW ADMIN PIN DIRECTLY (NO PREVIOUS CODE REQUIRED) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Change Admin Master PIN</h2>
              <p className="text-xs text-slate-500 mt-0.5">Set a new 6-digit Master PIN directly without requiring previous code</p>
            </div>
          </div>

          {pinError && (
            <div className="my-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{pinError}</span>
            </div>
          )}

          {pinSuccess && (
            <div className="my-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{pinSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePinSubmit} className="space-y-6 pt-6">
            {/* Step 1: New PIN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Enter New 6-Digit PIN *
              </label>
              <div className="flex justify-start">
                <PinInput
                  value={newPin}
                  onChange={setNewPin}
                  mask={true}
                  autoFocus={false}
                />
              </div>
            </div>

            {/* Step 2: Confirm New PIN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Confirm New 6-Digit PIN *
              </label>
              <div className="flex justify-start">
                <PinInput
                  value={confirmPin}
                  onChange={setConfirmPin}
                  mask={true}
                  autoFocus={false}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isChangingPin || newPin.length !== 6 || confirmPin.length !== 6}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isChangingPin ? 'Updating PIN...' : 'Save New Master PIN'}
              </button>
            </div>
          </form>
        </div>

        {/* SECTION 2: SEND PIN RESET LINK TO EMAIL */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Email Recovery</h2>
                <p className="text-xs text-slate-500 mt-0.5">Send PIN reset link to administrator email</p>
              </div>
            </div>

            <form onSubmit={handleSendResetEmail} className="py-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={recipientEmail}
                    onChange={e => setRecipientEmail(e.target.value)}
                    placeholder="admin@school.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-purple-600 font-mono text-slate-800"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">A secure PIN reset authorization link will be sent to this inbox.</p>
              </div>

              {emailStatus.success && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{emailStatus.success}</span>
                </div>
              )}

              {emailStatus.error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{emailStatus.error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSendingEmail || !recipientEmail}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-md shadow-purple-600/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSendingEmail ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reset Link to Email</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* SECTION 3: SYSTEM AUDIT LOGS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">System Security Audit Logs</h2>
            <p className="text-xs text-slate-500 mt-0.5">Chronological record of sensitive actions, logins, and permission changes</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchLog}
                onChange={e => setSearchLog(e.target.value)}
                placeholder="Search audit trail..."
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-600"
              />
            </div>

            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="py-1.5 px-3 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="head_master">Head Master</option>
              <option value="teacher">Teacher</option>
            </select>

            <button
              onClick={loadLogs}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              title="Refresh Logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-6">User / Actor</th>
                <th className="py-3 px-6">Role</th>
                <th className="py-3 px-6">Action</th>
                <th className="py-3 px-6">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No security audit logs recorded matching your filter.
                  </td>
                </tr>
              ) : (
                auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-slate-500 whitespace-nowrap">
                      {formatDate(log.created_at)} {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                      {log.user_email || 'System'}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                        log.user_role === 'admin'
                          ? 'bg-purple-50 text-purple-700'
                          : log.user_role === 'head_master'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {log.user_role || 'System'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-900">{log.action}</td>
                    <td className="py-3.5 px-6 text-slate-600 max-w-md">{log.description}</td>
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
