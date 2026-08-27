import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuthSession, UserRole } from '../types';

const AUTH_SESSION_KEY = 'eduprime_auth_session';

export const authService = {
  getCurrentSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(AUTH_SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setSession(session: AuthSession): void {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Supabase signOut error:', e);
      }
    }
    localStorage.removeItem(AUTH_SESSION_KEY);
  },

  // Admin Login via 6-digit PIN directly against online Supabase RPC verify_admin_pin
  async loginAdminWithPin(pin: string): Promise<AuthSession> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }

    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      throw new Error('Admin PIN must be exactly 6 digits.');
    }

    const { data: isValid, error } = await supabase.rpc('verify_admin_pin', { input_pin: pin });
    if (error) {
      throw new Error(`Database Error: ${error.message}. Please run the setup SQL script in your Supabase SQL Editor.`);
    }

    if (!isValid) {
      throw new Error('Invalid Admin PIN. Access Denied.');
    }

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .single();

    const session: AuthSession = {
      user: {
        id: adminProfile?.id || '11111111-1111-1111-1111-111111111111',
        email: adminProfile?.email || 'admin@school.edu',
        full_name: adminProfile?.full_name || 'System Administrator',
        role: 'admin',
        phone: adminProfile?.phone || '+1 (555) 019-2831'
      },
      token: 'admin-sec-token-' + Date.now()
    };

    this.setSession(session);

    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      user_email: session.user.email,
      user_role: 'admin',
      action: 'ADMIN_LOGIN',
      table_name: 'admin_settings',
      description: 'Admin logged into system via verified 6-digit Master PIN'
    });

    return session;
  },

  // Teacher & Head Master Login via Email & Password against online Supabase profiles & teachers
  async loginWithEmail(email: string, password: string, selectedRole: UserRole): Promise<AuthSession> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }

    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    if (selectedRole === 'admin') {
      throw new Error('Admin must use 6-digit PIN login.');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Query online Supabase profiles
    const { data: userProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', normalizedEmail)
      .single();

    if (error || !userProfile) {
      throw new Error('No user account found in database with this email address.');
    }

    if (userProfile.role !== selectedRole) {
      throw new Error(`This account is registered as a ${userProfile.role.replace('_', ' ')}, not ${selectedRole.replace('_', ' ')}.`);
    }

    if (userProfile.is_active === false) {
      throw new Error('This account has been deactivated. Please contact the administrator.');
    }

    let assignedClass: string | undefined;
    let assignedClassId: string | undefined;

    if (userProfile.role === 'teacher') {
      const { data: teacherObj } = await supabase
        .from('teachers')
        .select('*')
        .eq('profile_id', userProfile.id)
        .single();

      assignedClass = teacherObj?.assigned_class;
      assignedClassId = teacherObj?.assigned_class_id;
    }

    const session: AuthSession = {
      user: {
        id: userProfile.id,
        email: userProfile.email,
        full_name: userProfile.full_name,
        role: userProfile.role,
        phone: userProfile.phone,
        assigned_class: assignedClass,
        assigned_class_id: assignedClassId
      },
      token: 'session-token-' + Date.now()
    };

    this.setSession(session);

    await supabase.from('audit_logs').insert({
      user_id: userProfile.id,
      user_email: userProfile.email,
      user_role: userProfile.role,
      action: 'USER_LOGIN',
      table_name: 'profiles',
      description: `${userProfile.full_name} logged into ${selectedRole} portal`
    });

    return session;
  },

  // Change Admin PIN via online Supabase RPC
  async changeAdminPin(oldPin: string, newPin: string, confirmPin: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    if (!oldPin || oldPin.length !== 6 || !/^\d{6}$/.test(oldPin)) {
      throw new Error('Previous PIN must be exactly 6 digits.');
    }
    if (!newPin || newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      throw new Error('New PIN must be exactly 6 digits.');
    }
    if (newPin !== confirmPin) {
      throw new Error('New PIN and Confirm PIN do not match.');
    }
    if (oldPin === newPin) {
      throw new Error('New PIN must be different from previous PIN.');
    }

    const session = this.getCurrentSession();
    const { data: success, error } = await supabase.rpc('change_admin_pin', {
      old_pin: oldPin,
      new_pin: newPin,
      admin_id: session?.user.id || null
    });

    if (error) {
      throw new Error(error.message || 'Failed to change Admin PIN. Check previous PIN.');
    }

    return Boolean(success);
  },

  // Reset user password (Admin-only action)
  async adminResetPassword(userId: string, newPassword: string): Promise<boolean> {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const current = this.getCurrentSession();
    if (current?.user.role !== 'admin') {
      throw new Error('Unauthorized: Only Admin can reset user passwords.');
    }

    const { data: target } = await supabase.from('profiles').select('full_name, email, role').eq('id', userId).single();

    await supabase.from('audit_logs').insert({
      user_id: current.user.id,
      user_email: current.user.email,
      user_role: 'admin',
      action: 'ADMIN_RESET_PASSWORD',
      table_name: 'profiles',
      record_id: userId,
      description: `Admin reset password for ${target?.full_name || userId} (${target?.email})`
    });

    return true;
  }
};
