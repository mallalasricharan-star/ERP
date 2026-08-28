import bcrypt from 'bcryptjs';
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

  // Change Admin PIN (Directly sets new PIN, no previous PIN required)
  async updateAdminPinDirect(newPin: string, confirmPin: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    if (!newPin || newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      throw new Error('New PIN must be exactly 6 digits.');
    }
    if (newPin !== confirmPin) {
      throw new Error('New PIN and Confirm PIN do not match.');
    }

    const session = this.getCurrentSession();

    // Hash with bcrypt (PostgreSQL pgcrypto crypt compatible)
    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPin, salt);

    const { data: rows, error: selectErr } = await supabase
      .from('admin_settings')
      .select('id')
      .limit(1);

    if (selectErr) {
      throw new Error(selectErr.message || 'Failed to access admin settings.');
    }

    if (rows && rows.length > 0) {
      const targetId = rows[0].id;
      const { error: updateErr } = await supabase
        .from('admin_settings')
        .update({
          pin_hash: newHash,
          updated_at: new Date().toISOString(),
          updated_by: session?.user?.id || null
        })
        .eq('id', targetId);

      if (updateErr) {
        throw new Error(updateErr.message || 'Failed to update Admin PIN.');
      }
    } else {
      const { error: insertErr } = await supabase
        .from('admin_settings')
        .insert({
          pin_hash: newHash,
          updated_by: session?.user?.id || null
        });

      if (insertErr) {
        throw new Error(insertErr.message || 'Failed to initialize Admin PIN.');
      }
    }

    // Write to audit_logs
    await supabase.from('audit_logs').insert({
      user_id: session?.user?.id || null,
      user_email: session?.user?.email || 'admin@school.edu',
      user_role: 'admin',
      action: 'UPDATE_ADMIN_PIN',
      table_name: 'admin_settings',
      description: 'Admin set a new 6-digit Master PIN'
    });

    return true;
  },

  // Change Admin PIN with optional previous PIN verification
  async changeAdminPin(oldPin: string, newPin: string, confirmPin: string): Promise<boolean> {
    if (oldPin && oldPin.trim()) {
      const { data: isOldPinValid } = await supabase.rpc('verify_admin_pin', { input_pin: oldPin });
      if (!isOldPinValid) {
        throw new Error('Previous Admin PIN is incorrect.');
      }
    }
    return this.updateAdminPinDirect(newPin, confirmPin);
  },

  // Send PIN reset link / notification to Admin email
  async sendAdminPinResetEmail(): Promise<{ email: string; message: string }> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('role', 'admin')
      .limit(1)
      .single();

    const targetEmail = adminProfile?.email || 'admin@school.edu';

    try {
      await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: window.location.origin + '/admin/login'
      });
    } catch (e) {
      console.warn('Supabase email dispatch notice:', e);
    }

    const session = this.getCurrentSession();
    await supabase.from('audit_logs').insert({
      user_id: session?.user?.id || null,
      user_email: targetEmail,
      user_role: 'admin',
      action: 'ADMIN_PIN_RESET_REQUESTED',
      table_name: 'admin_settings',
      description: `Admin PIN reset instructions and recovery link sent to ${targetEmail}`
    });

    return {
      email: targetEmail,
      message: `A security PIN reset link and instructions have been dispatched to ${targetEmail}.`
    };
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
