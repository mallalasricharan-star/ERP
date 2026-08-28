import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, KeyRound, ArrowRight, ArrowLeft, Info, Mail, Send, CheckCircle2 } from 'lucide-react';
import { PinInput } from '../../components/common/PinInput';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [adminPin, setAdminPin] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Forgot PIN Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState<boolean>(false);
  const [recoveryEmail, setRecoveryEmail] = useState<string>('admin@school.edu');
  const [isSendingReset, setIsSendingReset] = useState<boolean>(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string>('');

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

  const handleSendRecoveryEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingReset(true);
    setResetSuccessMessage('');
    try {
      const res = await authService.sendAdminPinResetEmail();
      setResetSuccessMessage(`PIN reset link and instructions have been dispatched to ${recoveryEmail || res.email}.`);
      toast.success('Reset link dispatched to admin email.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch reset email.');
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-lime-400 selection:text-black">
      
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

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setResetSuccessMessage('');
                  setIsForgotModalOpen(true);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Forgot PIN? Send Reset Link to Email</span>
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* FORGOT PIN EMAIL MODAL */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Admin PIN Email Recovery"
        subtitle="Send PIN reset link to verified administrator email"
      >
        <form onSubmit={handleSendRecoveryEmail} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={recoveryEmail}
                onChange={e => setRecoveryEmail(e.target.value)}
                placeholder="admin@school.edu"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-600 font-mono text-slate-800"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Instructions and recovery verification will be sent to this email address.
            </p>
          </div>

          {resetSuccessMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{resetSuccessMessage}</span>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSendingReset || !recoveryEmail}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50"
            >
              {isSendingReset ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
