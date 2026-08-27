import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Info
} from 'lucide-react';
import { PinInput } from '../../components/common/PinInput';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import { auditService } from '../../services/auditService';
import { AuditLog } from '../../types';
import { formatDate } from '../../lib/utils';

export const AdminSettings: React.FC = () => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [isChangingPin, setIsChangingPin] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');

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

    if (oldPin.length !== 6) {
      setPinError('Previous PIN must be exactly 6 digits.');
      return;
    }
    if (newPin.length !== 6) {
      setPinError('New PIN must be exactly 6 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('New PIN and Confirm PIN do not match.');
      return;
    }
    if (oldPin === newPin) {
      setPinError('New PIN must be different from previous PIN.');
      return;
    }

    setIsChangingPin(true);
    try {
      await authService.changeAdminPin(oldPin, newPin, confirmPin);
      setPinSuccess('Admin Master PIN changed successfully!');
      toast.success('Admin PIN updated.');
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      loadLogs();
    } catch (err: any) {
      setPinError(err.message || 'Failed to change Admin PIN. Verify previous PIN.');
      toast.error(err.message || 'PIN update failed');
    } finally {
      setIsChangingPin(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security Settings & Audit Trail</h1>
        <p className="text-sm text-slate-500 mt-1">Admin Master PIN authentication configuration and system-wide audit telemetry</p>
      </div>

      {/* SECTION 1: CHANGE ADMIN PIN */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 max-w-2xl">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Change Admin 6-Digit PIN</h2>
            <p className="text-xs text-slate-500 mt-0.5">The previous PIN must be verified before a new PIN can be set</p>
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
          {/* Step 1: Previous PIN */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Enter Previous Admin PIN *
            </label>
            <div className="flex justify-start">
              <PinInput
                value={oldPin}
                onChange={setOldPin}
                mask={true}
                autoFocus={false}
              />
            </div>
          </div>

          {/* Step 2: New PIN */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. Enter New 6-Digit PIN *
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

          {/* Step 3: Confirm New PIN */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              3. Confirm New 6-Digit PIN *
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

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              Only ONE active Admin exists in the system.
            </span>

            <button
              type="submit"
              disabled={isChangingPin || oldPin.length !== 6 || newPin.length !== 6 || confirmPin.length !== 6}
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              {isChangingPin ? 'Verifying & Updating...' : 'Update Admin PIN'}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: SYSTEM AUDIT LOGS (Requirement #28) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">System Security & Audit Logs</h2>
              <p className="text-xs text-slate-500 mt-0.5">Chronological record of sensitive actions, permissions, and modifications</p>
            </div>
          </div>

          {/* Search and Role Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchLog}
                onChange={e => setSearchLog(e.target.value)}
                placeholder="Search audit trail..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-600"
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
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Initiator / Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Table</th>
                <th className="py-3 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No audit log records found matching your filters.
                  </td>
                </tr>
              ) : (
                auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-semibold text-slate-900 block">{log.user_email || 'System'}</span>
                        <span className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                          log.user_role === 'admin'
                            ? 'bg-purple-50 text-purple-700'
                            : log.user_role === 'head_master'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {log.user_role || 'System'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{log.table_name || '—'}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{log.description}</td>
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
