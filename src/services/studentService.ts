import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Student } from '../types';
import { authService } from './authService';

export const studentService = {
  async getStudents(filters?: { class_id?: string; search?: string; section?: string }): Promise<Student[]> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
    }

    let query = supabase.from('students').select('*, classes(class_number, section)');

    if (filters?.class_id) {
      query = query.eq('class_id', filters.class_id);
    }
    if (filters?.section) {
      query = query.eq('section', filters.section);
    }

    const { data, error } = await query.order('roll_number', { ascending: true });
    if (error) throw error;

    let list: Student[] = (data || []).map((d: any) => ({
      ...d,
      class_number: d.classes?.class_number,
      class_name: `Class ${d.classes?.class_number || ''}`
    }));

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(s =>
        s.student_name.toLowerCase().includes(q) ||
        s.admission_number.toLowerCase().includes(q) ||
        String(s.roll_number).includes(q) ||
        (s.parent_phone && s.parent_phone.includes(q)) ||
        (s.father_name && s.father_name.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => (a.class_number || 0) - (b.class_number || 0) || a.roll_number - b.roll_number);
  },

  async getStudentById(id: string): Promise<Student | null> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('students')
      .select('*, classes(class_number, section)')
      .eq('id', id)
      .single();

    if (error) return null;
    return {
      ...data,
      class_number: data.classes?.class_number,
      class_name: `Class ${data.classes?.class_number || ''}`
    };
  },

  async addStudent(data: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> {
    const session = authService.getCurrentSession();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'head_master')) {
      throw new Error('Permission Denied: Only Admin and Head Master can add students.');
    }

    if (!data.student_name?.trim()) throw new Error('Student Name is required.');
    if (!data.admission_number?.trim()) throw new Error('Admission Number is required.');
    if (!data.date_of_birth) throw new Error('Date of Birth is required.');
    if (!data.gender) throw new Error('Gender is required.');
    if (!data.class_id) throw new Error('Class assignment is required.');

    const newStudent = {
      admission_number: data.admission_number.trim().toUpperCase(),
      student_name: data.student_name.trim(),
      date_of_birth: data.date_of_birth,
      gender: data.gender,
      father_name: data.father_name || null,
      mother_name: data.mother_name || null,
      parent_phone: data.parent_phone || null,
      address: data.address || null,
      class_id: data.class_id,
      section: data.section || 'A',
      roll_number: Number(data.roll_number) || 1,
      admission_date: data.admission_date || new Date().toISOString().split('T')[0]
    };

    const { data: inserted, error } = await supabase
      .from('students')
      .insert(newStudent)
      .select('*, classes(class_number, section)')
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(`Admission Number "${data.admission_number}" already exists in the database.`);
      }
      throw error;
    }

    // Log to online audit_logs
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      user_email: session.user.email,
      user_role: session.user.role,
      action: 'ADD_STUDENT',
      table_name: 'students',
      record_id: inserted.id,
      description: `${session.user.role.toUpperCase()} added new student: ${inserted.student_name} (${inserted.admission_number})`
    });

    return {
      ...inserted,
      class_number: inserted.classes?.class_number,
      class_name: `Class ${inserted.classes?.class_number || ''}`
    };
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    const session = authService.getCurrentSession();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'head_master')) {
      throw new Error('Permission Denied: Only Admin and Head Master can edit students.');
    }

    const { data: updated, error } = await supabase
      .from('students')
      .update({
        student_name: updates.student_name,
        date_of_birth: updates.date_of_birth,
        gender: updates.gender,
        father_name: updates.father_name,
        mother_name: updates.mother_name,
        parent_phone: updates.parent_phone,
        address: updates.address,
        class_id: updates.class_id,
        section: updates.section,
        roll_number: updates.roll_number,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*, classes(class_number, section)')
      .single();

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      user_email: session.user.email,
      user_role: session.user.role,
      action: 'UPDATE_STUDENT',
      table_name: 'students',
      record_id: id,
      description: `${session.user.role.toUpperCase()} updated student: ${updated.student_name}`
    });

    return {
      ...updated,
      class_number: updated.classes?.class_number,
      class_name: `Class ${updated.classes?.class_number || ''}`
    };
  },

  async deleteStudent(id: string): Promise<boolean> {
    const session = authService.getCurrentSession();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'head_master')) {
      throw new Error('Permission Denied: Only Admin and Head Master can delete students.');
    }

    const { data: target } = await supabase.from('students').select('student_name, admission_number').eq('id', id).single();

    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      user_email: session.user.email,
      user_role: session.user.role,
      action: 'DELETE_STUDENT',
      table_name: 'students',
      record_id: id,
      description: `${session.user.role.toUpperCase()} deleted student: ${target?.student_name || id}`
    });

    return true;
  },

  getNextAdmissionNumber(): string {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `ADM-2026-${randomSuffix}`;
  }
};
