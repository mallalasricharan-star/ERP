import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const TeacherLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { loginWithEmail } = useAuth();
  const toast = useToast();

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both faculty email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithEmail(email, password, 'teacher');
      toast.success('Welcome to Faculty / Teacher Portal!');
      navigate('/teacher/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify faculty credentials.');
      toast.error(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-cyan-500 selection:text-black">
      
      {/* Top Back Navigation */}
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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/20 text-white mb-4">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Faculty Portal</h2>
        <p className="mt-2 text-sm text-slate-400">Class Roll Call, Attendance & Academic Grading</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-white/20">
          
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">FACULTY SIGN-IN</h3>
            <p className="text-xs text-slate-500 mt-1">Sign in with your assigned institutional email</p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleTeacherLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Faculty Email
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
                  placeholder="teacher4@school.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/15 text-sm text-slate-900 outline-none transition-all"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/15 text-sm text-slate-900 outline-none transition-all"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <span>
                Passwords are administrative only. If you need a password reset, contact the System Administrator.
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-semibold bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 shadow-lg shadow-cyan-600/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In as Faculty</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
