import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { LeaveRequest, LeaveType, LeaveStatus } from '../types';
import { authService } from './authService';

const LOCAL_LEAVES_KEY = 'eduprime_local_leaves';

function getLocalLeaves(): LeaveRequest[] {
  try {
    const raw = localStorage.getItem(LOCAL_LEAVES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: 'leave-101',
      applicant_id: '30000000-0000-0000-0000-000000000004',
      applicant_name: 'Mr. James Wilson',
      applicant_role: 'teacher',
      assigned_class: 'Class 4',
      leave_type: 'Medical Leave',
      from_date: '2026-09-01',
      to_date: '2026-09-02',
      days_count: 2,
      reason: 'Undergoing routine medical checkup and treatment.',
      status: 'pending',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: 'leave-102',
      applicant_id: '30000000-0000-0000-0000-000000000001',
      applicant_name: 'Mrs. Sarah Jenkins',
      applicant_role: 'teacher',
      assigned_class: 'Class 1',
      leave_type: 'Casual Leave',
      from_date: '2026-08-28',
      to_date: '2026-08-28',
      days_count: 1,
      reason: 'Attending family personal ceremony.',
      status: 'approved',
      reviewer_id: '20000000-0000-0000-0000-000000000001',
      reviewer_name: 'Dr. Robert Vance (Head Master)',
      reviewer_comment: 'Approved. Syllabus proxy arranged.',
      reviewed_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'leave-103',
      applicant_id: '20000000-0000-0000-0000-000000000001',
      applicant_name: 'Dr. Robert Vance',
      applicant_role: 'head_master',
      leave_type: 'Personal Leave',
      from_date: '2026-09-05',
      to_date: '2026-09-06',
      days_count: 2,
      reason: 'Attending State Educational Board Conference.',
      status: 'pending',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ];
}

function saveLocalLeaves(list: LeaveRequest[]) {
  try {
    localStorage.setItem(LOCAL_LEAVES_KEY, JSON.stringify(list));
  } catch {}
}

export const leaveService = {
  async getLeavesForCurrentUser(): Promise<{ myLeaves: LeaveRequest[]; pendingApprovals: LeaveRequest[]; allLeaves: LeaveRequest[] }> {
    const session = authService.getCurrentSession();
    if (!session) throw new Error('You must be logged in.');

    let all: LeaveRequest[] = [];

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('leave_requests').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        all = data;
      } else {
        all = getLocalLeaves();
      }
    } else {
      all = getLocalLeaves();
    }

    const currentUserId = session.user.id;
    const currentRole = session.user.role;

    // 1. My personal applied leaves
    const myLeaves = all.filter(l => l.applicant_id === currentUserId || l.applicant_name === session.user.full_name);

    // 2. Pending Approvals based on hierarchy:
    // - Head Master approves leaves submitted by Teachers
    // - Admin approves leaves submitted by Head Master (and has override)
    let pendingApprovals: LeaveRequest[] = [];
    if (currentRole === 'head_master') {
      pendingApprovals = all.filter(l => l.applicant_role === 'teacher' && l.status === 'pending');
    } else if (currentRole === 'admin') {
      pendingApprovals = all.filter(l => l.status === 'pending');
    }

    return {
      myLeaves,
      pendingApprovals,
      allLeaves: all
    };
  },

  async applyLeave(data: {
    leave_type: LeaveType;
    from_date: string;
    to_date: string;
    reason: string;
  }): Promise<LeaveRequest> {
    const session = authService.getCurrentSession();
    if (!session) throw new Error('You must be logged in to apply for leave.');

    if (!data.from_date || !data.to_date) throw new Error('From and To dates are required.');
    if (!data.reason?.trim()) throw new Error('Reason for leave is required.');

    const d1 = new Date(data.from_date);
    const d2 = new Date(data.to_date);
    if (d2 < d1) throw new Error('To Date cannot be earlier than From Date.');

    const diffDays = Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const newRequest: LeaveRequest = {
      id: 'leave-' + Date.now(),
      applicant_id: session.user.id,
      applicant_name: session.user.full_name,
      applicant_role: session.user.role === 'head_master' ? 'head_master' : 'teacher',
      assigned_class: session.user.assigned_class,
      leave_type: data.leave_type,
      from_date: data.from_date,
      to_date: data.to_date,
      days_count: diffDays,
      reason: data.reason.trim(),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('leave_requests').insert(newRequest);
      } catch {}
    }

    const localList = getLocalLeaves();
    localList.unshift(newRequest);
    saveLocalLeaves(localList);

    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      user_email: session.user.email,
      user_role: session.user.role,
      action: 'APPLY_LEAVE',
      table_name: 'leave_requests',
      record_id: newRequest.id,
      description: `${session.user.full_name} (${session.user.role.toUpperCase()}) applied for ${newRequest.leave_type} (${newRequest.days_count} days)`
    });

    return newRequest;
  },

  async reviewLeave(leaveId: string, status: 'approved' | 'rejected', comment?: string): Promise<void> {
    const session = authService.getCurrentSession();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'head_master')) {
      throw new Error('Permission Denied: Only Head Master or Admin can approve/reject leaves.');
    }

    const reviewerName = session.user.role === 'admin' ? 'Master Admin' : `${session.user.full_name} (Head Master)`;

    const updates = {
      status,
      reviewer_id: session.user.id,
      reviewer_name: reviewerName,
      reviewer_comment: comment || (status === 'approved' ? 'Approved by authority.' : 'Application rejected.'),
      reviewed_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('leave_requests').update(updates).eq('id', leaveId);
      } catch {}
    }

    const localList = getLocalLeaves();
    const idx = localList.findIndex(l => l.id === leaveId);
    if (idx !== -1) {
      localList[idx] = { ...localList[idx], ...updates };
      saveLocalLeaves(localList);
    }

    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      user_email: session.user.email,
      user_role: session.user.role,
      action: status === 'approved' ? 'APPROVE_LEAVE' : 'REJECT_LEAVE',
      table_name: 'leave_requests',
      record_id: leaveId,
      description: `${reviewerName} ${status.toUpperCase()} leave request (${leaveId})`
    });
  }
};
