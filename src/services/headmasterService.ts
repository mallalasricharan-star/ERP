import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile } from '../types';
import { authService } from './authService';

export const headmasterService = {
  async getHeadMaster(): Promise<Profile | null> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'head_master')
      .single();

    if (error) return null;
    return data;
  },

  async updateHeadMaster(updates: { full_name?: string; email?: string; phone?: string; is_active?: boolean }): Promise<Profile> {
    const session = authService.getCurrentSession();
    if (!session || session.user.role !== 'admin') {
      throw new Error('Permission Denied: Only Admin can update Head Master details.');
    }

    const { data: updated, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('role', 'head_master')
      .select()
      .single();

    if (error) throw error;

    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      user_email: session.user.email,
      user_role: 'admin',
      action: 'UPDATE_HEADMASTER',
      table_name: 'profiles',
      record_id: updated.id,
      description: `Admin updated Head Master profile: ${updated.full_name} (${updated.email})`
    });

    return updated;
  }
};
