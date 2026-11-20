import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2, Sparkles } from 'lucide-react';

interface Props {
  onRegisterClick: () => void;
  onForgotPasswordClick: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<Props> = ({
  onRegisterClick,
  onForgotPasswordClick,
  onLoginSuccess,
}) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide both your email and password.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        onLoginSuccess();
      } else {
        setError(result.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick autofill buttons for testing
  const autofill = (type: 'student' | 'admin' | 'unpaid') => {
    if (type === 'admin') {
      setEmail('divineinyang636@gmail.com');
      setPassword('admin123');
    } else if (type === 'student') {
      setEmail('emeka@unical.edu.ng');
      setPassword('student123');
    } else {
      setEmail('fresh@unical.edu.ng');
      setPassword('student123');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-navy-900 to-royal-600 flex items-center justify-center text-white mx-auto shadow-card border border-royal-400/30">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
          UNICAL CS HUB
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Department of Computer Science • 100 Level Student Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-2xl border border-slate-200">
          {/* Quick Demo Picker */}
          <div className="mb-6 p-3 bg-royal-50/70 border border-royal-200/60 rounded-xl text-xs">
            <div className="flex items-center gap-1.5 font-bold text-royal-900 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-royal-600" />
              <span>One-Click Instant Login (Testing Shortcuts):</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => autofill('admin')}
                className="bg-white hover:bg-royal-100/50 text-slate-800 border border-slate-200 font-medium px-2 py-1.5 rounded-lg text-[11px] transition text-left"
              >
                👑 <span className="font-bold">Course Rep / Admin</span>
                <span className="block text-[10px] text-slate-500">Divine Inyang</span>
              </button>
              <button
                type="button"
                onClick={() => autofill('student')}
                className="bg-white hover:bg-royal-100/50 text-slate-800 border border-slate-200 font-medium px-2 py-1.5 rounded-lg text-[11px] transition text-left"
              >
                🎓 <span className="font-bold">Student (Paid)</span>
                <span className="block text-[10px] text-slate-500">Emeka Okon</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@unical.edu.ng"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={onForgotPasswordClick}
                  className="text-xs text-royal-600 hover:text-royal-500 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-royal-600 hover:bg-royal-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center pt-4 border-t border-slate-100 text-xs text-slate-600">
            <span>New 100 level student? </span>
            <button
              onClick={onRegisterClick}
              className="text-royal-600 hover:text-royal-500 font-bold"
            >
              Register Account with Email OTP
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-royal-500" />
          <span>Persistent session storage • Normal login requires no OTP</span>
        </div>
      </div>
    </div>
  );
};
