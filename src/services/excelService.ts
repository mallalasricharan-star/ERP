import * as XLSX from 'xlsx';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { calculateGrade } from '../lib/utils';

export const excelService = {
  // 1. Export Class-wise Attendance in Required Grid Format
  async exportClassAttendance(classNumber: number): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    const { data: cls } = await supabase
      .from('classes')
      .select('id, class_number')
      .eq('class_number', classNumber)
      .single();

    if (!cls) throw new Error(`Class ${classNumber} not found.`);

    const [studentsRes, attendanceRes] = await Promise.all([
      supabase.from('students').select('*').eq('class_id', cls.id).order('roll_number', { ascending: true }),
      supabase.from('attendance').select('*').eq('class_id', cls.id)
    ]);

    const students = studentsRes.data || [];
    const attendance = attendanceRes.data || [];

    const uniqueDates = Array.from(new Set(attendance.map((a: any) => a.attendance_date))).sort();
    const dateHeaders = uniqueDates.length > 0 ? uniqueDates : ['2026-08-24', '2026-08-25', '2026-08-26'];

    const rows = students.map((student: any) => {
      let presentCount = 0;
      let absentCount = 0;
      const dateRecordMap: { [key: string]: string } = {};

      dateHeaders.forEach(date => {
        const att = attendance.find((a: any) => a.student_id === student.id && a.attendance_date === date);
        if (att) {
          if (att.status === 'present') {
            presentCount++;
            dateRecordMap[formatHeaderDate(date)] = 'P';
          } else {
            absentCount++;
            dateRecordMap[formatHeaderDate(date)] = 'A';
          }
        } else {
          dateRecordMap[formatHeaderDate(date)] = '-';
        }
      });

      const total = presentCount + absentCount;
      const pct = total > 0 ? `${Math.round((presentCount / total) * 100)}%` : '0%';

      return {
        'Admission No': student.admission_number,
        'Roll No': student.roll_number,
        'Student Name': student.student_name,
        ...dateRecordMap,
        'Present': presentCount,
        'Absent': absentCount,
        'Attendance %': pct
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Class ${classNumber} Attendance`);

    XLSX.writeFile(workbook, `Class_${classNumber}_Attendance_${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  // 2. Export Marks Report for all students or specific class
  async exportMarksReport(classId?: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    let stQuery = supabase.from('students').select('*, classes(class_number)');
    if (classId) stQuery = stQuery.eq('class_id', classId);

    const [stRes, subRes, marksRes] = await Promise.all([
      stQuery,
      supabase.from('subjects').select('*'),
      supabase.from('marks').select('*')
    ]);

    const students = stRes.data || [];
    const subjects = subRes.data || [];
    const marks = marksRes.data || [];

    const rows = students.map((student: any) => {
      const studentSubjects = subjects.filter((sub: any) => sub.class_id === student.class_id);
      const studentMarks = marks.filter((m: any) => m.student_id === student.id);

      let totalObtained = 0;
      let totalMax = 0;
      const subjectCols: { [key: string]: string | number } = {};

      studentSubjects.forEach((sub: any) => {
        const mark = studentMarks.find((m: any) => m.subject_id === sub.id);
        const score = mark ? mark.marks : 0;
        subjectCols[`${sub.subject_name} (Max: ${sub.maximum_marks})`] = score;
        totalObtained += score;
        totalMax += sub.maximum_marks;
      });

      const overallPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
      const { grade } = calculateGrade(overallPct);

      return {
        'Admission No': student.admission_number,
        'Student Name': student.student_name,
        'Class': `Class ${student.classes?.class_number || ''}`,
        'Section': student.section,
        'Roll No': student.roll_number,
        ...subjectCols,
        'Total Obtained': totalObtained,
        'Maximum Marks': totalMax,
        'Percentage': `${overallPct}%`,
        'Grade': grade
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Academic Marks');

    XLSX.writeFile(workbook, `Student_Marks_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  // 3. Export Student Master List
  async exportStudentRegistry(classId?: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    let query = supabase.from('students').select('*, classes(class_number)');
    if (classId) query = query.eq('class_id', classId);

    const { data: students, error } = await query;
    if (error) throw error;

    const rows = (students || []).map((s: any) => ({
      'Admission Number': s.admission_number,
      'Student Name': s.student_name,
      'Class': `Class ${s.classes?.class_number || ''}`,
      'Section': s.section,
      'Roll Number': s.roll_number,
      'Date of Birth': s.date_of_birth,
      'Gender': s.gender,
      'Father Name': s.father_name || '',
      'Mother Name': s.mother_name || '',
      'Parent Phone': s.parent_phone || '',
      'Address': s.address || '',
      'Admission Date': s.admission_date
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students Registry');

    XLSX.writeFile(workbook, `Student_Registry_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
};

function formatHeaderDate(isoDate: string): string {
  try {
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = parts[2];
      const monthIdx = parseInt(parts[1], 10) - 1;
      return `${day}-${months[monthIdx] || parts[1]}`;
    }
  } catch {}
  return isoDate;
}
