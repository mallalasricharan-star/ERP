import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService } from './authService';

export interface TableSummary {
  name: string;
  label: string;
  count: number;
  description: string;
}

export const databaseService = {
  async getAvailableTables(): Promise<TableSummary[]> {
    const session = authService.getCurrentSession();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Permission Denied: Database management is restricted to Admin only.');
    }

    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    const [pRes, tRes, sRes, cRes, subRes, attRes, mRes, aRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('teachers').select('*', { count: 'exact', head: true }),
      supabase.from('students').select('*', { count: 'exact', head: true }),
      supabase.from('classes').select('*', { count: 'exact', head: true }),
      supabase.from('subjects').select('*', { count: 'exact', head: true }),
      supabase.from('attendance').select('*', { count: 'exact', head: true }),
      supabase.from('marks').select('*', { count: 'exact', head: true }),
      supabase.from('audit_logs').select('*', { count: 'exact', head: true }),
    ]);

    return [
      { name: 'profiles', label: 'User Profiles', count: pRes.count || 0, description: 'Authentication accounts and role assignments' },
      { name: 'teachers', label: 'Teachers Registry', count: tRes.count || 0, description: 'Faculty staff, employee identifiers, and assigned classes' },
      { name: 'students', label: 'Students Master', count: sRes.count || 0, description: 'Student records, admission numbers, demographics, and parent contacts' },
      { name: 'classes', label: 'Classes (1-6)', count: cRes.count || 0, description: 'Academic grade tiers (Class 1 to Class 6) and section divisions' },
      { name: 'subjects', label: 'Subjects Curriculum', count: subRes.count || 0, description: 'Class-specific subjects with maximum marks thresholds' },
      { name: 'attendance', label: 'Attendance Logs', count: attRes.count || 0, description: 'Daily class-wise attendance entries with present/absent statuses' },
      { name: 'marks', label: 'Marks & Academic Grades', count: mRes.count || 0, description: 'Subject-wise student exam and assessment scores' },
      { name: 'admin_settings', label: 'Security & PIN Settings', count: 1, description: 'Encrypted 6-digit Admin PIN hash and system parameters' },
      { name: 'audit_logs', label: 'System Audit Logs', count: aRes.count || 0, description: 'Immutable chronological trace of administrative and faculty activities' },
    ];
  },

  async getTableData(tableName: string, search?: string): Promise<any[]> {
    const session = authService.getCurrentSession();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Permission Denied: Database management is restricted to Admin only.');
    }

    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    if (tableName === 'admin_settings') {
      const { data } = await supabase.from('admin_settings').select('id, updated_at, created_at');
      return (data || []).map(r => ({
        ...r,
        pin_status: 'Active (6-Digit PIN Configured)',
        pin_hash: '•••••••••••••••••••••••••••••••• (Encrypted Blowfish Hash)'
      }));
    }

    let query = supabase.from(tableName).select('*').limit(100);
    const { data, error } = await query;
    if (error) throw error;

    let records = data || [];

    if (search) {
      const q = search.toLowerCase();
      records = records.filter(item =>
        JSON.stringify(item).toLowerCase().includes(q)
      );
    }

    return records;
  }
};
