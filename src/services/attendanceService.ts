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
  records: Attendance[];
}

export const attendanceService = {
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

  // Save daily attendance for a class (direct upsert to Supabase)
  async saveClassAttendance(
    classId: string,
    dateStr: string,
    attendanceList: { student_id: string; status: 'present' | 'absent' }[]
  ): Promise<{ total: number; present: number; absent: number }> {
    const session = authService.getCurrentSession();
    if (!session) throw new Error('You must be logged in to mark attendance.');

    const todayStr = toISODate();
    const isPastDate = dateStr < todayStr;

    // Rule: Teacher cannot modify past attendance
    if (session.user.role === 'teacher' && isPastDate) {
      throw new Error('Permission Denied: Teachers cannot modify old attendance records. Please contact Administrator.');
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

    // Get class info for audit log
    const { data: cls } = await supabase.from('classes').select('class_number').eq('id', classId).single();

    // Record audit log
    if (isPastDate || session.user.role === 'admin') {
      await supabase.from('audit_logs').insert({
        user_id: session.user.id,
        user_email: session.user.email,
        user_role: session.user.role,
        action: isPastDate ? 'CORRECT_PAST_ATTENDANCE' : 'SAVE_ATTENDANCE',
        table_name: 'attendance',
        description: `${session.user.role.toUpperCase()} recorded Class ${cls?.class_number || ''} attendance for ${dateStr} (Present: ${presentCount}, Absent: ${absentCount})`
      });
    }

    return {
      total: attendanceList.length,
      present: presentCount,
      absent: absentCount
    };
  },

  // Get historical attendance grouped by Date and Class from online Supabase
  async getAttendanceHistory(filters?: {
    class_id?: string;
    date_from?: string;
    date_to?: string;
    student_id?: string;
  }): Promise<AttendanceSummary[]> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    let query = supabase
      .from('attendance')
      .select('*, students(student_name, admission_number, roll_number), classes(class_number, section)');

    if (filters?.class_id) query = query.eq('class_id', filters.class_id);
    if (filters?.date_from) query = query.gte('attendance_date', filters.date_from);
    if (filters?.date_to) query = query.lte('attendance_date', filters.date_to);
    if (filters?.student_id) query = query.eq('student_id', filters.student_id);

    const { data, error } = await query.order('attendance_date', { ascending: false });
    if (error) throw error;

    const records = data || [];
    const groups: { [key: string]: any[] } = {};

    records.forEach((att: any) => {
      const key = `${att.attendance_date}_${att.class_id}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(att);
    });

    const summaries: AttendanceSummary[] = [];

    Object.keys(groups).forEach(key => {
      const groupRecords = groups[key];
      const first = groupRecords[0];
      const [date, classId] = key.split('_');

      const presentCount = groupRecords.filter(r => r.status === 'present').length;
      const absentCount = groupRecords.filter(r => r.status === 'absent').length;
      const total = groupRecords.length;
      const pct = total > 0 ? Math.round((presentCount / total) * 100) : 0;

      summaries.push({
        date,
        class_id: classId,
        class_number: first.classes?.class_number || 0,
        section: first.classes?.section || 'A',
        total_students: total,
        present_count: presentCount,
        absent_count: absentCount,
        percentage: pct,
        records: groupRecords.map(r => ({
          ...r,
          student_name: r.students?.student_name,
          admission_number: r.students?.admission_number,
          roll_number: r.students?.roll_number || 0
        })).sort((a, b) => a.roll_number - b.roll_number)
      });
    });

    return summaries.sort((a, b) => b.date.localeCompare(a.date) || a.class_number - b.class_number);
  }
};
