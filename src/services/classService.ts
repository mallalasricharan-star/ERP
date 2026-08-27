import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { toISODate } from '../lib/utils';
import { ClassRoom, DashboardStats } from '../types';

export const classService = {
  async getClasses(): Promise<ClassRoom[]> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    const todayStr = toISODate();

    const [classesRes, studentsRes, attendanceRes, teachersRes] = await Promise.all([
      supabase.from('classes').select('*').order('class_number', { ascending: true }),
      supabase.from('students').select('id, class_id'),
      supabase.from('attendance').select('class_id, status').eq('attendance_date', todayStr),
      supabase.from('teachers').select('full_name, assigned_class, assigned_class_id').eq('is_active', true)
    ]);

    if (classesRes.error) throw classesRes.error;

    const classes = classesRes.data || [];
    const students = studentsRes.data || [];
    const attendance = attendanceRes.data || [];
    const teachers = teachersRes.data || [];

    return classes.map(cls => {
      const classStudents = students.filter(s => s.class_id === cls.id);
      const studentCount = classStudents.length;

      const todayRecords = attendance.filter(a => a.class_id === cls.id);
      const presentCount = todayRecords.filter(a => a.status === 'present').length;
      const absentCount = todayRecords.filter(a => a.status === 'absent').length;

      const teacher = teachers.find(
        t => t.assigned_class_id === cls.id || t.assigned_class === `Class ${cls.class_number}`
      );

      const attendancePercentage = studentCount > 0 && todayRecords.length > 0
        ? Math.round((presentCount / (presentCount + absentCount || 1)) * 100)
        : 0;

      return {
        ...cls,
        student_count: studentCount,
        present_today: presentCount,
        absent_today: absentCount,
        attendance_percentage: attendancePercentage,
        assigned_teacher_name: teacher?.full_name || 'Not Assigned'
      };
    });
  },

  async getClassById(id: string): Promise<ClassRoom | null> {
    const classes = await this.getClasses();
    return classes.find(c => c.id === id) || null;
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const classes = await this.getClasses();
    const todayStr = toISODate();

    const [studentsCount, teachersCount, subjectsCount, todayAttRes, logsRes] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }),
      supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('subjects').select('*', { count: 'exact', head: true }),
      supabase.from('attendance').select('status').eq('attendance_date', todayStr),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(5)
    ]);

    const totalStudents = studentsCount.count || 0;
    const totalTeachers = teachersCount.count || 0;
    const totalSubjects = subjectsCount.count || 0;

    const todayRecords = todayAttRes.data || [];
    const presentToday = todayRecords.filter(a => a.status === 'present').length;
    const absentToday = todayRecords.filter(a => a.status === 'absent').length;
    const totalMarked = presentToday + absentToday;

    const overallPct = totalMarked > 0 ? Math.round((presentToday / totalMarked) * 100) : 0;

    return {
      total_students: totalStudents,
      total_teachers: totalTeachers,
      total_classes: classes.length,
      total_subjects: totalSubjects,
      today_present: presentToday,
      today_absent: absentToday,
      today_attendance_percentage: overallPct,
      class_stats: classes.map(c => ({
        class_id: c.id,
        class_number: c.class_number,
        section: c.section,
        student_count: c.student_count || 0,
        present_today: c.present_today || 0,
        absent_today: c.absent_today || 0,
        attendance_percentage: c.attendance_percentage || 0,
      })),
      recent_logs: logsRes.data || []
    };
  }
};
