import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, GraduationCap, School, KeyRound, Mail, Lock, ArrowRight, Info, ArrowLeft } from 'lucide-react';
import { PinInput } from '../../components/common/PinInput';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const roleParam = searchParams.get('role') as UserRole | null;
  const [selectedRole, setSelectedRole] = useState<UserRole>(roleParam || 'admin');

  const [adminPin, setAdminPin] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { loginAdminWithPin, loginWithEmail } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (roleParam && ['admin', 'head_master', 'teacher'].includes(roleParam)) {
      setSelectedRole(roleParam);
    }
  }, [roleParam]);

  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (adminPin.length !== 6) {
      setErrorMessage('Please enter a complete 6-digit PIN.');
      return;
    }

    setIsLoading(true);
    try {
      await loginAdminWithPin(adminPin);
      toast.success('Admin authenticated successfully.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid Admin PIN. Please try again.');
      toast.error(err.message || 'Invalid Admin PIN');
      setAdminPin('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithEmail(email, password, selectedRole);
      toast.success(`Welcome to ${selectedRole === 'head_master' ? 'Head Master' : 'Teacher'} Portal!`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Check your credentials.');
      toast.error(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      
      {/* Back to Choose Path Navigation */}
      <div className="absolute top-6 left-6 z-20">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white backdrop-blur-md border border-white/10 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Paths</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-xl shadow-blue-500/30 text-white mb-4">
          <School className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">EduPrime School ERP</h2>
        <p className="mt-2 text-sm text-slate-400">Production-Grade School Management Portal</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-white/20">
          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100/80 rounded-2xl mb-8 border border-slate-200/60">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                setErrorMessage('');
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                selectedRole === 'admin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('head_master');
                setErrorMessage('');
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                selectedRole === 'head_master'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Head Master</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('teacher');
                setErrorMessage('');
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                selectedRole === 'teacher'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Teacher</span>
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ADMIN LOGIN FORM: 6-Digit PIN Only */}
          {selectedRole === 'admin' && (
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex p-2.5 bg-blue-50 text-blue-600 rounded-xl mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">ADMIN SECURE LOGIN</h3>
                <p className="text-xs text-slate-500 mt-1">Enter your unique 6-digit Master PIN</p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div className="py-3">
                  <PinInput
                    value={adminPin}
                    onChange={setAdminPin}
                    error={Boolean(errorMessage)}
                    mask={true}
                    autoFocus={true}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || adminPin.length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 disabled:shadow-none cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Authenticate Admin</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* HEAD MASTER & TEACHER LOGIN FORM: Email & Password */}
          {(selectedRole === 'head_master' || selectedRole === 'teacher') && (
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-slate-900 uppercase">
                  {selectedRole === 'head_master' ? 'Head Master Portal' : 'Faculty / Teacher Portal'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Sign in with your assigned institutional email</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={selectedRole === 'head_master' ? 'headmaster@school.edu' : 'teacher@school.edu'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 text-sm text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 text-sm text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Administrative Password Notice */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>
                  Passwords are administrative only. If you forgot your password, please contact the Admin to issue a reset.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Log In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
