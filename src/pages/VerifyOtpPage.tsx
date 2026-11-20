import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MailCheck, CheckCircle2, AlertCircle, Loader2, RefreshCw, KeyRound } from 'lucide-react';

interface Props {
  email: string;
  password: string;
  initialOtp?: string;
  onVerificationSuccess: () => void;
  onBack: () => void;
}

export const VerifyOtpPage: React.FC<Props> = ({
  email,
  password,
  initialOtp,
  onVerificationSuccess,
  onBack,
}) => {
  const { verifyRegistrationOtp, sendRegistrationOtp } = useAuth();

  const [otp, setOtp] = useState('');
  const [currentOtp, setCurrentOtp] = useState<string | undefined>(initialOtp);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // 5-minute countdown timer
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTimer = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (attempts >= 5) {
      setError('Too many incorrect attempts. Please request a new verification code.');
      return;
    }

    if (timeLeft <= 0) {
      setError('This verification code has expired (5-minute limit). Please request a new one.');
      return;
    }

    if (otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit code sent to your email.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await verifyRegistrationOtp(email, otp.trim(), password);
      if (res.success) {
        onVerificationSuccess();
      } else {
        setAttempts((a) => a + 1);
        setError(res.error || 'Verification failed. Incorrect code.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      const res = await sendRegistrationOtp(email, 'Student', '23/095144...');
      if (res.success && res.otp) {
        setCurrentOtp(res.otp);
        setTimeLeft(300); // Reset to 5 mins
        setAttempts(0);
      }
    } catch {
      setError('Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-royal-600 flex items-center justify-center text-white mx-auto shadow-card">
          <MailCheck className="w-8 h-8" />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-navy-950 tracking-tight">
          Verify Your Email Address
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          A six-digit verification OTP was sent to <span className="font-semibold text-slate-800">{email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-2xl border border-slate-200">
          {/* Real-time OTP helper pill (for local testing convenience) */}
          {currentOtp && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>
                  Demo OTP Code: <strong className="font-mono text-sm tracking-wider">{currentOtp}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOtp(currentOtp)}
                className="text-[11px] font-bold text-royal-600 bg-white px-2 py-0.5 rounded border border-emerald-300 hover:bg-emerald-100"
              >
                Auto-fill
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Six-Digit Verification Code
                </label>
                <span className={`text-xs font-mono font-bold ${timeLeft < 60 ? 'text-rose-600 animate-pulse' : 'text-slate-500'}`}>
                  Expires in {formatTimer()}
                </span>
              </div>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                required
                className="w-full tracking-widest text-center font-mono text-2xl font-bold bg-slate-50 border border-slate-200 rounded-xl py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || timeLeft <= 0 || otp.length !== 6}
              className="w-full bg-royal-600 hover:bg-royal-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Code & Activate Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <button
              type="button"
              onClick={onBack}
              className="text-slate-500 hover:text-slate-700"
            >
              ← Back to registration
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || timeLeft > 240}
              className="text-royal-600 hover:text-royal-500 font-bold disabled:text-slate-400 flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
              <span>Resend Code</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
