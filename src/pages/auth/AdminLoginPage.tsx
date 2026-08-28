import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, KeyRound, ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { PinInput } from '../../components/common/PinInput';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [adminPin, setAdminPin] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { loginAdminWithPin } = useAuth();
  const toast = useToast();

  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (adminPin.length !== 6) {
      setErrorMessage('Please enter your complete 6-digit Master PIN.');
      return;
    }

    setIsLoading(true);
    try {
      await loginAdminWithPin(adminPin);
      toast.success('Admin authenticated successfully.');
      navigate('/admin/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid Admin PIN. Please try again.');
      toast.error(err.message || 'Invalid Admin PIN');
      setAdminPin('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-lime-400 selection:text-black">
      
      {/* Top Back Navigation */}
      <div className="absolute top-6 left-6 z-20">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white backdrop-blur-md border border-white/10 text-xs font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Paths</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-lime-500 to-emerald-600 shadow-xl shadow-lime-500/20 text-slate-950 mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Master Admin Portal</h2>
        <p className="mt-2 text-sm text-slate-400">Institutional System Control & Security</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-white/20">
          
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-lime-50 text-lime-700 rounded-2xl mb-3 border border-lime-200/60">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">AUTHENTICATE WITH MASTER PIN</h3>
            <p className="text-xs text-slate-500 mt-1">Enter your 6-digit cryptographic PIN to unlock</p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div className="py-2">
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
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-slate-950 font-bold bg-lime-400 hover:bg-lime-300 active:bg-lime-500 shadow-lg shadow-lime-400/25 transition-all disabled:opacity-50 disabled:shadow-none cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Unlock Admin Control</span>
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
