import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  onBackToLogin: () => void;
}

export const ForgotPasswordPage: React.FC<Props> = ({ onBackToLogin }) => {
  const { sendForgotPasswordOtp, resetPasswordWithOtp } = useAuth();

  const [step, setStep] = useState<'REQUEST_OTP' | 'VERIFY_AND_RESET'>('REQUEST_OTP');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your registered student email address.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await sendForgotPasswordOtp(email);
      if (res.success) {
        setGeneratedOtp(res.otp || null);
        setStep('VERIFY_AND_RESET');
      } else {
        setError(res.error || 'Failed to send recovery OTP.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim() || !newPassword.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await resetPasswordWithOtp(email, otp, newPassword);
      if (res.success) {
        setSuccessMsg('Your password has been successfully reset! You can now log in.');
      } else {
        setError(res.error || 'Invalid or expired OTP code.');
      }
    } catch (err: any) {
      setError(err.message || 'Reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-royal-600 flex items-center justify-center text-white mx-auto shadow-card">
          <KeyRound className="w-8 h-8" />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-navy-950 tracking-tight">
          Reset Portal Password
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Recover your UNICAL CS HUB student account using a 6-digit email OTP
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-2xl border border-slate-200">
          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Password Changed</h3>
              <p className="text-xs text-slate-600 mb-6">{successMsg}</p>
              <button
                onClick={onBackToLogin}
                className="w-full bg-royal-600 hover:bg-royal-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-sm transition"
              >
                Return to Login
              </button>
            </div>
          ) : step === 'REQUEST_OTP' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@unical.edu.ng"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-royal-600 hover:bg-royal-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Send Password Recovery OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              {generatedOtp && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                  <span>Recovery OTP: <strong>{generatedOtp}</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtp(generatedOtp)}
                    className="text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-300 font-bold"
                  >
                    Auto-fill
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Six-Digit Recovery Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  required
                  className="w-full tracking-widest text-center font-mono text-xl font-bold bg-slate-50 border border-slate-200 rounded-xl py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-royal-600 hover:bg-royal-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 pt-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Set New Password</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center pt-4 border-t border-slate-100 text-xs">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-royal-600 hover:text-royal-500 font-bold"
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
