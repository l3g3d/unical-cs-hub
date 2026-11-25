import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PaymentStatusBadge } from '../components/common/PaymentStatusBadge';
import {
  User,
  Mail,
  Hash,
  Lock,
  Camera,
  ShieldCheck,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Save,
  Upload,
  Trash2,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [avatarError, setAvatarError] = useState<string | null>(null);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
      setAvatarError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName: fullName.trim(),
      avatarUrl: avatarUrl.trim() || undefined,
    });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) {
      setPasswordError('Please fill in both current and new password.');
      return;
    }
    if (newPass.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordError(null);
    setPasswordSuccess(true);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-royal-950 text-white rounded-2xl p-6 sm:p-8 shadow-card border border-navy-800">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-royal-600 flex items-center justify-center text-white text-2xl font-black border-2 border-royal-400 shadow-md overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                user?.fullName.charAt(0) || 'U'
              )}
            </div>
          </div>

          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-extrabold text-white">{user?.fullName}</h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Matriculation Number: <span className="font-mono font-bold text-white">{user?.matricNumber}</span>
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-royal-500/20 text-royal-300 border border-royal-400/30 uppercase">
                {user?.role} Account
              </span>
              <PaymentStatusBadge status={user?.paymentStatus || 'UNPAID'} size="sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
          <h2 className="text-base font-bold text-navy-950 mb-1">Personal Details</h2>
          <p className="text-xs text-slate-500 mb-4">Update your profile name and avatar picture.</p>

          {profileSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile details updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Matriculation Number</label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={user?.matricNumber}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-500 cursor-not-allowed font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Matric number cannot be changed.</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Upload Profile Picture</label>
              {avatarError && (
                <div className="mb-2 p-2 rounded-lg bg-rose-50 text-rose-700 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{avatarError}</span>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="w-14 h-14 rounded-xl bg-royal-600 flex items-center justify-center text-white font-bold overflow-hidden border border-slate-300 flex-shrink-0 shadow-xs">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6 text-royal-200" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-royal-600 hover:bg-royal-500 text-white font-semibold text-xs shadow-xs transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose Photo from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                  </label>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="ml-2 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">Select from your phone gallery or computer (JPG, PNG, WEBP)</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-royal-600 hover:bg-royal-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
          <h2 className="text-base font-bold text-navy-950 mb-1">Change Password</h2>
          <p className="text-xs text-slate-500 mb-4">Ensure your student account stays secure.</p>

          {passwordSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Password updated successfully.</span>
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Update Password</span>
            </button>
          </form>
        </div>
      </div>

      {/* Logged-in Devices Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
        <h3 className="text-sm font-bold text-navy-950 mb-1">Active Logged-in Devices</h3>
        <p className="text-xs text-slate-500 mb-4">Manage your authenticated devices across phones and computers.</p>

        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-royal-100 text-royal-700">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span>Android Mobile Browser</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                    Current Device
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">Calabar, Cross River • Active Now</div>
              </div>
            </div>
            <span className="text-emerald-600 font-semibold text-[11px]">Online</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-200 text-slate-700">
                <Laptop className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Chrome on Windows</div>
                <div className="text-[11px] text-slate-500">Calabar, Nigeria • Last active 2 hours ago</div>
              </div>
            </div>
            <button className="text-xs text-rose-600 hover:text-rose-700 font-semibold">
              Revoke Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
