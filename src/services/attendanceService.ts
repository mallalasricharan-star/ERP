import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { toISODate } from '../lib/utils';
import { Attendance } from '../types';
import { authService } from './authService';

export interface AttendanceSummary {
  date: string;
  class_id: string;
  class_number: number;
  section: string;
  total_students: number;
  present_count: number;
  absent_count: number;
  percentage: number;
  is_locked: boolean;
  records: Attendance[];
}

const UNLOCKED_PERMISSIONS_KEY = 'eduprime_attendance_unlocked_permissions';

export const attendanceService = {
  // Check if Admin granted edit permission for a class on a date
  hasEditPermission(classId: string, dateStr: string): boolean {
    try {
      const stored = localStorage.getItem(UNLOCKED_PERMISSIONS_KEY);
      if (!stored) return false;
      const map: Record<string, boolean> = JSON.parse(stored);
      return map[`${classId}_${dateStr}`] === true;
    } catch {
      return false;
    }
  },

  // Admin grants edit permission to a class for a specific date
  grantEditPermission(classId: string, dateStr: string): void {
    try {
      const stored = localStorage.getItem(UNLOCKED_PERMISSIONS_KEY);
      const map: Record<string, boolean> = stored ? JSON.parse(stored) : {};
      map[`${classId}_${dateStr}`] = true;
      localStorage.setItem(UNLOCKED_PERMISSIONS_KEY, JSON.stringify(map));
      window.dispatchEvent(new Event('attendance-permission-changed'));
    } catch {}
  },

  // Admin revokes edit permission
  revokeEditPermission(classId: string, dateStr: string): void {
    try {
      const stored = localStorage.getItem(UNLOCKED_PERMISSIONS_KEY);
      if (!stored) return;
      const map: Record<string, boolean> = JSON.parse(stored);
      delete map[`${classId}_${dateStr}`];
      localStorage.setItem(UNLOCKED_PERMISSIONS_KEY, JSON.stringify(map));
      window.dispatchEvent(new Event('attendance-permission-changed'));
    } catch {}
  },

  // Get attendance for a specific class and date
  async getClassAttendance(classId: string, dateStr: string): Promise<Attendance[]> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('attendance')
      .select('*, students(student_name, admission_number, roll_number)')
      .eq('class_id', classId)
      .eq('attendance_date', dateStr);

    if (error) throw error;

    return (data || []).map((d: any) => ({
      ...d,
      student_name: d.students?.student_name,
      admission_number: d.students?.admission_number,
      roll_number: d.students?.roll_number || 0
    }));
  },

  // Save daily attendance for a class
  async saveClassAttendance(
    classId: string,
    dateStr: string,
    attendanceList: { student_id: string; status: 'present' | 'absent' }[]
  ): Promise<{ total: number; present: number; absent: number }> {
    const session = authService.getCurrentSession();
    if (!session) throw new Error('You must be logged in to mark attendance.');

    // Rule: Admin cannot take attendance (only views percentage & manages permissions)
    if (session.user.role === 'admin') {
      throw new Error('Permission Denied: Admin cannot take roll calls directly. Attendance must be recorded by Faculty or Head Master.');
    }

    // Check if already saved and locked
    const existing = await this.getClassAttendance(classId, dateStr);
    const hasPermission = this.hasEditPermission(classId, dateStr);

    if (existing.length > 0 && !hasPermission) {
      throw new Error('Attendance is Locked: This class attendance has already been submitted. Please request edit permission from the Administrator to make changes.');
    }

    let presentCount = 0;
    let absentCount = 0;

    const upsertRows = attendanceList.map(item => {
      if (item.status === 'present') presentCount++;
      else absentCount++;

      return {
        student_id: item.student_id,
        class_id: classId,
        attendance_date: dateStr,
        status: item.status,
        taken_by: session.user.id,
        updated_at: new Date().toISOString()
      };
    });

    const { error } = await supabase
      .from('attendance')
      .upsert(upsertRows, { onConflict: 'student_id,attendance_date' });

    if (error) throw error;

    // If edit permission was granted, revoke it once re-saved
    if (hasPermission) {
      this.revokeEditPermission(classId, dateStr);
    }

    // Get class info for audit log
    const { data: cls } = await supabase.from('classes').select('class_number, section').eq('id', classId).single();

    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      user_email: session.user.email,
      user_role: session.user.role,
      action: 'SAVE_ATTENDANCE',
      table_name: 'attendance',
      description: `${session.user.role.toUpperCase()} submitted Class ${cls?.class_number || ''}-${cls?.section || ''} attendance for ${dateStr} (Present: ${presentCount}, Absent: ${absentCount})`
    });

    return {
      total: attendanceList.length,
      present: presentCount,
      absent: absentCount
    };
  },

  // Get historical attendance summaries for date range
  async getAttendanceHistory(classId?: string, fromDate?: string, toDate?: string): Promise<AttendanceSummary[]> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    const todayStr = toISODate();
    const start = fromDate || '2026-08-01';
    const end = toDate || todayStr;

    let query = supabase
      .from('attendance')
      .select('*, classes(class_number, section), students(student_name, roll_number, admission_number)')
      .gte('attendance_date', start)
      .lte('attendance_date', end)
      .order('attendance_date', { ascending: false });

    if (classId) query = query.eq('class_id', classId);

    const { data, error } = await query;
    if (error) throw error;

    const grouped: { [key: string]: any[] } = {};
    (data || []).forEach((row: any) => {
      const key = `${row.attendance_date}_${row.class_id}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    });

    const summaries: AttendanceSummary[] = [];

    Object.keys(grouped).forEach(key => {
      const records = grouped[key];
      const first = records[0];
      const presentCount = records.filter(r => r.status === 'present').length;
      const absentCount = records.filter(r => r.status === 'absent').length;
      const total = records.length;
      const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;

      summaries.push({
        date: first.attendance_date,
        class_id: first.class_id,
        class_number: first.classes?.class_number || 0,
        section: first.classes?.section || 'A',
        total_students: total,
        present_count: presentCount,
        absent_count: absentCount,
        percentage,
        is_locked: true,
        records: records.map(r => ({
          ...r,
          student_name: r.students?.student_name,
          admission_number: r.students?.admission_number,
          roll_number: r.students?.roll_number
        }))
      });
    });

    return summaries.sort((a, b) => b.date.localeCompare(a.date) || a.class_number - b.class_number);
  }
};
