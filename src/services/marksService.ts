import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { calculateGrade } from '../lib/utils';
import { Mark, StudentReport, SubjectMarkSummary } from '../types';
import { authService } from './authService';

export const marksService = {
  async getMarks(filters?: { class_id?: string; subject_id?: string; student_id?: string }): Promise<Mark[]> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    let query = supabase
      .from('marks')
      .select('*, students(student_name, admission_number), subjects(subject_name, maximum_marks)');

    if (filters?.class_id) query = query.eq('class_id', filters.class_id);
    if (filters?.subject_id) query = query.eq('subject_id', filters.subject_id);
    if (filters?.student_id) query = query.eq('student_id', filters.student_id);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((d: any) => ({
      ...d,
      student_name: d.students?.student_name,
      admission_number: d.students?.admission_number,
      subject_name: d.subjects?.subject_name,
      maximum_marks: d.subjects?.maximum_marks
    }));
  },

  async saveBatchMarks(
    classId: string,
    subjectId: string,
    entries: { student_id: string; marks: number }[]
  ): Promise<{ updatedCount: number }> {
    const session = authService.getCurrentSession();
    if (!session) throw new Error('You must be logged in to enter marks.');

    // Fetch subject for max marks validation
    const { data: subject, error: subError } = await supabase
      .from('subjects')
      .select('subject_name, maximum_marks')
      .eq('id', subjectId)
      .single();

    if (subError || !subject) throw new Error('Subject not found in database.');

    const maxMarks = subject.maximum_marks;

    for (const entry of entries) {
      if (entry.marks < 0) {
        throw new Error(`Marks cannot be negative. Entered: ${entry.marks}`);
      }
      if (entry.marks > maxMarks) {
        throw new Error(`Marks cannot exceed maximum marks (${maxMarks}) for ${subject.subject_name}. Entered: ${entry.marks}`);
      }
    }

    const upsertRows = entries.map(entry => ({
      student_id: entry.student_id,
      class_id: classId,
      subject_id: subjectId,
      marks: Number(entry.marks),
      entered_by: session.user.id,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('marks')
      .upsert(upsertRows, { onConflict: 'student_id,subject_id' });

    if (error) throw error;

    const { data: cls } = await supabase.from('classes').select('class_number').eq('id', classId).single();

    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      user_email: session.user.email,
      user_role: session.user.role,
      action: 'SAVE_MARKS',
      table_name: 'marks',
      description: `${session.user.role.toUpperCase()} saved marks for Class ${cls?.class_number || ''} in ${subject.subject_name} (${entries.length} students)`
    });

    return { updatedCount: entries.length };
  },

  async getStudentReport(studentId: string): Promise<StudentReport | null> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    // 1. Get Student
    const { data: student, error: stError } = await supabase
      .from('students')
      .select('*, classes(class_number, section)')
      .eq('id', studentId)
      .single();

    if (stError || !student) return null;

    const classNum = student.classes?.class_number || 1;

    // 2. Get Class Subjects
    const { data: subjects } = await supabase
      .from('subjects')
      .select('*')
      .eq('class_id', student.class_id);

    // 3. Get Student Marks
    const { data: marks } = await supabase
      .from('marks')
      .select('*')
      .eq('student_id', studentId);

    // 4. Get Student Attendance
    const { data: attendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId);

    let totalMax = 0;
    let totalObtained = 0;

    const subjectSummaries: SubjectMarkSummary[] = (subjects || []).map(sub => {
      const markObj = (marks || []).find(m => m.subject_id === sub.id);
      const obtained = markObj ? Number(markObj.marks) : 0;
      const pct = sub.maximum_marks > 0 ? Math.round((obtained / sub.maximum_marks) * 100) : 0;
      const { grade } = calculateGrade(pct);

      totalMax += sub.maximum_marks;
      totalObtained += obtained;

      return {
        subject_id: sub.id,
        subject_name: sub.subject_name,
        maximum_marks: sub.maximum_marks,
        obtained_marks: obtained,
        percentage: pct,
        grade
      };
    });

    const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    const { grade: overallGrade } = calculateGrade(overallPct);

    const attList = attendance || [];
    const presentDays = attList.filter(a => a.status === 'present').length;
    const absentDays = attList.filter(a => a.status === 'absent').length;
    const totalDays = presentDays + absentDays;
    const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    return {
      student: {
        ...student,
        class_number: classNum,
        class_name: `Class ${classNum}`
      },
      class_number: classNum,
      marks: subjectSummaries,
      total_maximum: totalMax,
      total_obtained: totalObtained,
      overall_percentage: overallPct,
      overall_grade: overallGrade,
      attendance_summary: {
        total_days: totalDays,
        present_days: presentDays,
        absent_days: absentDays,
        percentage: attendancePct
      }
    };
  }
};
