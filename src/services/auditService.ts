import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuditLog } from '../types';
import { authService } from './authService';

export const auditService = {
  async getLogs(filters?: { search?: string; action?: string; role?: string }): Promise<AuditLog[]> {
    const session = authService.getCurrentSession();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Permission Denied: Only Admin can view audit logs.');
    }

    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(150);

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }
    if (filters?.role) {
      query = query.eq('user_role', filters.role);
    }

    const { data, error } = await query;
    if (error) throw error;

    let logs: AuditLog[] = data || [];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      logs = logs.filter(l =>
        l.description.toLowerCase().includes(q) ||
        (l.user_email && l.user_email.toLowerCase().includes(q)) ||
        l.action.toLowerCase().includes(q) ||
        (l.table_name && l.table_name.toLowerCase().includes(q))
      );
    }

    return logs;
  }
};
