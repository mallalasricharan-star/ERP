import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  MessageSquare
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { leaveService } from '../../services/leaveService';
import { LeaveRequest, LeaveType } from '../../types';

export const LeaveManagementPage: React.FC = () => {
  const { user, role } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'my_leaves' | 'approvals'>('my_leaves');
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<LeaveRequest[]>([]);
  const [allLeaves, setAllLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Apply Leave Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('Casual Leave');
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  // Review Modal
  const [reviewingLeave, setReviewingLeave] = useState<LeaveRequest | null>(null);
  const [reviewComment, setReviewComment] = useState('');

  const loadLeaves = async () => {
    setIsLoading(true);
    try {
      const data = await leaveService.getLeavesForCurrentUser();
      setMyLeaves(data.myLeaves);
      setPendingApprovals(data.pendingApprovals);
      setAllLeaves(data.allLeaves);

      // Default to approvals tab for Admin/Headmaster if they have pending requests
      if ((role === 'head_master' || role === 'admin') && data.pendingApprovals.length > 0) {
        setActiveTab('approvals');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load leaves');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [user]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await leaveService.applyLeave({
        leave_type: leaveType,
        from_date: fromDate,
        to_date: toDate,
        reason
      });
      toast.success('Leave application submitted successfully.');
      setIsApplyModalOpen(false);
      setReason('');
      loadLeaves();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit leave');
    }
  };

  const handleReviewSubmit = async (status: 'approved' | 'rejected') => {
    if (!reviewingLeave) return;
    try {
      await leaveService.reviewLeave(reviewingLeave.id, status, reviewComment);
      toast.success(`Leave request ${status} successfully.`);
      setReviewingLeave(null);
      setReviewComment('');
      loadLeaves();
    } catch (err: any) {
      toast.error(err.message || 'Review failed');
    }
  };

  const isReviewerRole = role === 'admin' || role === 'head_master';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-2">
            <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Institutional Hierarchy Approval System</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Leave Management & Approvals</h1>
          <p className="text-sm text-slate-500 mt-1">
            {role === 'teacher' && 'Submit leave requests for Head Master review and track approval status'}
            {role === 'head_master' && 'Review faculty leaves and submit executive leaves for Admin approval'}
            {role === 'admin' && 'Master review and approval authority for Head Master & institutional staff leaves'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsApplyModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* Tabs for Reviewers */}
      {isReviewerRole && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('approvals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'approvals'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Pending Approvals</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
              activeTab === 'approvals' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {pendingApprovals.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my_leaves')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'my_leaves'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>My Leave Applications</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
              activeTab === 'my_leaves' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {myLeaves.length}
            </span>
          </button>
        </div>
      )}

      {/* VIEW 1: PENDING APPROVALS LIST (HEAD MASTER & ADMIN) */}
      {activeTab === 'approvals' && isReviewerRole && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800">
            {role === 'head_master' ? 'Faculty Leave Requests Pending Your Review' : 'All Staff Leave Requests Pending Review'}
          </h2>

          {pendingApprovals.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
              No pending leave applications requiring your review.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingApprovals.map(leave => (
                <div key={leave.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {leave.applicant_role === 'head_master' ? <UserCheck className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{leave.applicant_name}</h3>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {leave.applicant_role.replace('_', ' ')} {leave.assigned_class ? `• ${leave.assigned_class}` : ''}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                        Pending
                      </span>
                    </div>

                    <div className="mt-4 p-3 rounded-2xl bg-slate-50 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-semibold">{leave.leave_type}</span>
                        <span className="font-bold text-blue-600">{leave.days_count} Day(s)</span>
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        Period: {leave.from_date} to {leave.to_date}
                      </p>
                      <p className="text-slate-800 font-medium pt-1 border-t border-slate-200/60">
                        "{leave.reason}"
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewingLeave(leave)}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    >
                      Review & Decide
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: MY LEAVE APPLICATIONS TABLE */}
      {(!isReviewerRole || activeTab === 'my_leaves') && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Your Leave History & Tracking</h3>
            <span className="text-xs text-slate-500">{myLeaves.length} applications recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Days</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Approval Status</th>
                  <th className="py-3 px-4">Reviewed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      You haven't applied for any leaves yet.
                    </td>
                  </tr>
                ) : (
                  myLeaves.map(leave => (
                    <tr key={leave.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{leave.leave_type}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {leave.from_date} <span className="text-slate-400">to</span> {leave.to_date}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{leave.days_count}</td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">{leave.reason}</td>
                      <td className="py-3.5 px-4">
                        {leave.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        )}
                        {leave.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        )}
                        {leave.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" /> Pending Review
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {leave.reviewer_name || 'Pending Reviewer'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APPLY FOR LEAVE MODAL */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Submit Leave Application"
        subtitle={role === 'teacher' ? 'Sent directly to Head Master for approval' : 'Sent to Administrator for approval'}
      >
        <form onSubmit={handleApplySubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Leave Category *
            </label>
            <select
              value={leaveType}
              onChange={e => setLeaveType(e.target.value as LeaveType)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
            >
              <option value="Casual Leave">Casual Leave (CL)</option>
              <option value="Medical Leave">Medical Leave (ML)</option>
              <option value="Personal Leave">Personal Leave (PL)</option>
              <option value="Emergency Leave">Emergency Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                From Date *
              </label>
              <input
                type="date"
                required
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                To Date *
              </label>
              <input
                type="date"
                required
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason for Leave *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="State the detailed reason for your leave application..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-600"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>

      {/* REVIEW & DECIDE MODAL */}
      <Modal
        isOpen={Boolean(reviewingLeave)}
        onClose={() => setReviewingLeave(null)}
        title="Review Staff Leave Application"
        subtitle={`Applicant: ${reviewingLeave?.applicant_name}`}
      >
        {reviewingLeave && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-bold text-slate-900">{reviewingLeave.applicant_name} ({reviewingLeave.applicant_role.toUpperCase()})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-bold text-blue-600">{reviewingLeave.leave_type} ({reviewingLeave.days_count} Days)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration:</span>
                <span className="font-mono">{reviewingLeave.from_date} to {reviewingLeave.to_date}</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block mb-1">Reason:</span>
                <p className="font-medium text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200">
                  {reviewingLeave.reason}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Reviewer Remark (Optional)
              </label>
              <input
                type="text"
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder="e.g. Approved. Substitute teacher assigned."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-600"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleReviewSubmit('rejected')}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
              >
                Reject Leave
              </button>
              <button
                type="button"
                onClick={() => handleReviewSubmit('approved')}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                Approve Leave
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
