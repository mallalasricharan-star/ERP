import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Subject } from '../types';
import { authService } from './authService';

export const subjectService = {
  async getSubjects(classId?: string): Promise<Subject[]> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    let query = supabase.from('subjects').select('*, classes(class_number)');
    if (classId) query = query.eq('class_id', classId);

    const { data, error } = await query.order('subject_name', { ascending: true });
    if (error) throw error;

    const list: Subject[] = (data || []).map((d: any) => ({
      ...d,
      class_number: d.classes?.class_number
    }));

    return list.sort((a, b) => (a.class_number || 0) - (b.class_number || 0) || a.subject_name.localeCompare(b.subject_name));
  },

  async addSubject(data: { subject_name: string; class_id: string; maximum_marks: number }): Promise<Subject> {
    const session = authService.getCurrentSession();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Permission Denied: Only Admin can add subjects.');
    }

    if (!data.subject_name?.trim()) throw new Error('Subject Name is required.');
    if (!data.class_id) throw new Error('Class selection is required.');
    if (!data.maximum_marks || data.maximum_marks <= 0) throw new Error('Maximum marks must be greater than 0.');

    const { data: newSubject, error } = await supabase
      .from('subjects')
      .insert({
        subject_name: data.subject_name.trim(),
        class_id: data.class_id,
        maximum_marks: Number(data.maximum_marks),
        created_by: session.user.id
      })
      .select('*, classes(class_number)')
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(`Subject "${data.subject_name}" already exists for this class.`);
      }
      throw error;
    }

    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      user_email: session.user.email,
      user_role: 'admin',
      action: 'ADD_SUBJECT',
      table_name: 'subjects',
      record_id: newSubject.id,
      description: `Admin created subject "${newSubject.subject_name}" for Class ${newSubject.classes?.class_number || ''} (Max Marks: ${newSubject.maximum_marks})`
    });

    return {
      ...newSubject,
      class_number: newSubject.classes?.class_number
    };
  },

  async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject> {
    const session = authService.getCurrentSession();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Permission Denied: Only Admin can edit subjects.');
    }

    const { data: updated, error } = await supabase
      .from('subjects')
      .update({
        subject_name: updates.subject_name,
        maximum_marks: updates.maximum_marks,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*, classes(class_number)')
      .single();

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      user_email: session.user.email,
      user_role: 'admin',
      action: 'UPDATE_SUBJECT',
      table_name: 'subjects',
      record_id: id,
      description: `Admin updated subject: ${updated.subject_name} (Max Marks: ${updated.maximum_marks})`
    });

    return {
      ...updated,
      class_number: updated.classes?.class_number
    };
  },

  async deleteSubject(id: string): Promise<boolean> {
    const session = authService.getCurrentSession();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Permission Denied: Only Admin can delete subjects.');
    }

    const { data: target } = await supabase.from('subjects').select('subject_name').eq('id', id).single();

    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      user_email: session.user.email,
      user_role: 'admin',
      action: 'DELETE_SUBJECT',
      table_name: 'subjects',
      record_id: id,
      description: `Admin deleted subject "${target?.subject_name || id}"`
    });

    return true;
  },

  async deleteAllSubjects(classId?: string): Promise<number> {
    const session = authService.getCurrentSession();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Permission Denied: Only Admin can delete subjects.');
    }

    let query = supabase.from('subjects').delete();
    if (classId) {
      query = query.eq('class_id', classId);
    } else {
      query = query.neq('id', '00000000-0000-0000-0000-000000000000');
    }

    const { error } = await query;
    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      user_email: session.user.email,
      user_role: 'admin',
      action: 'DELETE_ALL_SUBJECTS',
      table_name: 'subjects',
      description: classId ? `Admin deleted all subjects for class ${classId}` : 'Admin deleted all institutional subjects'
    });

    return 1;
  }
};
