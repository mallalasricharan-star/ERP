import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Teacher } from '../types';
import { authService } from './authService';

export const teacherService = {
  async getTeachers(): Promise<Teacher[]> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async addTeacher(data: {
    full_name: string;
    employee_id: string;
    email: string;
    phone: string;
    assigned_class: string;
    assigned_class_id?: string;
    initial_password?: string;
  }): Promise<Teacher> {
    const session = authService.getCurrentSession();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Permission Denied: Only Admin can add teachers.');
    }

    if (!data.full_name?.trim()) throw new Error('Teacher Name is required.');
    if (!data.employee_id?.trim()) throw new Error('Employee ID is required.');
    if (!data.email?.trim()) throw new Error('Email is required.');
    if (!data.assigned_class) throw new Error('Class Assignment is required.');

    // 1. Create profile
    const { data: profile, error: pError } = await supabase
      .from('profiles')
      .insert({
        email: data.email.trim().toLowerCase(),
        full_name: data.full_name.trim(),
        role: 'teacher',
        phone: data.phone || null,
        is_active: true
      })
      .select()
      .single();

    if (pError) throw pError;

    // 2. Create teacher entry
    const { data: teacher, error: tError } = await supabase
      .from('teachers')
      .insert({
        profile_id: profile.id,
        employee_id: data.employee_id.trim().toUpperCase(),
        full_name: data.full_name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone || null,
        assigned_class: data.assigned_class,
        assigned_class_id: data.assigned_class_id || null,
        is_active: true
      })
      .select()
      .single();

    if (tError) throw tError;

    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      user_email: session.user.email,
      user_role: 'admin',
      action: 'ADD_TEACHER',
      table_name: 'teachers',
      record_id: teacher.id,
      description: `Admin registered teacher: ${teacher.full_name} (${teacher.employee_id}, Assigned: ${teacher.assigned_class})`
    });

    return teacher;
  },

  async updateTeacher(id: string, updates: Partial<Teacher>): Promise<Teacher> {
    const session = authService.getCurrentSession();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Permission Denied: Only Admin can edit teacher details.');
    }

    const { data: updated, error } = await supabase
      .from('teachers')
      .update({
        full_name: updates.full_name,
        email: updates.email,
        phone: updates.phone,
        assigned_class: updates.assigned_class,
        is_active: updates.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (updated.profile_id) {
      await supabase
        .from('profiles')
        .update({
          full_name: updated.full_name,
          email: updated.email,
          phone: updated.phone,
          is_active: updated.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', updated.profile_id);
    }

    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      user_email: session.user.email,
      user_role: 'admin',
      action: 'UPDATE_TEACHER',
      table_name: 'teachers',
      record_id: id,
      description: `Admin updated teacher profile: ${updated.full_name}`
    });

    return updated;
  },

  async toggleTeacherStatus(id: string): Promise<boolean> {
    const session = authService.getCurrentSession();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Permission Denied: Only Admin can change teacher status.');
    }

    const { data: teacher } = await supabase.from('teachers').select('is_active, full_name').eq('id', id).single();
    if (!teacher) throw new Error('Teacher record not found.');

    const newStatus = !teacher.is_active;
    await this.updateTeacher(id, { is_active: newStatus });
    return newStatus;
  },

  async deleteTeacher(id: string): Promise<boolean> {
    const session = authService.getCurrentSession();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Permission Denied: Only Admin can delete teachers.');
    }

    const { data: target } = await supabase.from('teachers').select('full_name, employee_id, profile_id').eq('id', id).single();

    const { error } = await supabase.from('teachers').delete().eq('id', id);
    if (error) throw error;

    if (target?.profile_id) {
      await supabase.from('profiles').delete().eq('id', target.profile_id);
    }

    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      user_email: session.user.email,
      user_role: 'admin',
      action: 'DELETE_TEACHER',
      table_name: 'teachers',
      record_id: id,
      description: `Admin removed teacher record: ${target?.full_name || id}`
    });

    return true;
  }
};
