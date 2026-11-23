import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, PaymentStatus, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { EmailService } from '../lib/emailService';

export const ADMIN_EMAIL = 'divineinyang636@gmail.com';

export const isAdminUser = (user: UserProfile | null): boolean => {
  if (!user) return false;
  return user.role === 'admin' && user.email.trim().toLowerCase() === ADMIN_EMAIL;
};

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  registeredUsers: UserProfile[];
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  sendRegistrationOtp: (email: string, fullName: string, matricNumber: string) => Promise<{ success: boolean; error?: string }>;
  verifyRegistrationOtp: (email: string, otp: string, password: string) => Promise<{ success: boolean; error?: string }>;
  sendForgotPasswordOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPasswordWithOtp: (email: string, otp: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial registered admin account
const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user-admin-divine',
    email: ADMIN_EMAIL,
    fullName: 'Divine Christopher Inyang',
    matricNumber: '23/095144000',
    role: 'admin',
    isEmailVerified: true,
    paymentStatus: 'APPROVED',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-11-01T08:00:00Z'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Temporary OTP storage with sessionStorage fallback: email -> { code, expiresAt, meta }
  const [otpStore, setOtpStore] = useState<Record<string, { code: string; expiresAt: number; meta?: any }>>(() => {
    try {
      const saved = sessionStorage.getItem('unical_hub_otp_store');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const saveOtpStore = (newStore: Record<string, { code: string; expiresAt: number; meta?: any }>) => {
    setOtpStore(newStore);
    try {
      sessionStorage.setItem('unical_hub_otp_store', JSON.stringify(newStore));
    } catch {}
  };

  useEffect(() => {
    try {
      const storedUsersRaw = localStorage.getItem('unical_hub_registered_users');
      let usersList: UserProfile[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      if (usersList.length === 0) {
        usersList = DEFAULT_USERS;
        localStorage.setItem('unical_hub_registered_users', JSON.stringify(DEFAULT_USERS));
      }
      setRegisteredUsers(usersList);

      const activeSessionRaw = localStorage.getItem('unical_hub_current_user');
      if (activeSessionRaw) {
        const parsed = JSON.parse(activeSessionRaw);
        // STRICT ROLE ENFORCEMENT: Only divineinyang636@gmail.com can be admin
        if (parsed.email && parsed.email.trim().toLowerCase() === ADMIN_EMAIL) {
          parsed.role = 'admin';
        } else {
          parsed.role = 'student';
        }
        setUser(parsed);
      } else {
        // Visitors start logged out! Never auto-login as admin
        setUser(null);
      }
    } catch (e) {
      console.error('Auth initialization error:', e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login (Email + Password)
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // Check if trying to log in as admin
      const isTryingAdmin = normalizedEmail === ADMIN_EMAIL;

      // If live Supabase configured, attempt Supabase login
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password: pass });
        if (!error && data.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
          const { data: payData } = await supabase.from('student_entitlements').select('access_granted').eq('student_id', data.user.id).single();

          const authedUser: UserProfile = {
            id: data.user.id,
            email: data.user.email || normalizedEmail,
            fullName: profile?.full_name || normalizedEmail.split('@')[0],
            matricNumber: profile?.matric_number || '23/095144000',
            role: isTryingAdmin ? 'admin' : 'student',
            avatarUrl: profile?.avatar_url,
            isEmailVerified: true,
            paymentStatus: isTryingAdmin ? 'APPROVED' : payData?.access_granted ? 'APPROVED' : 'UNPAID',
            createdAt: data.user.created_at
          };
          setUser(authedUser);
          localStorage.setItem('unical_hub_current_user', JSON.stringify(authedUser));
          return { success: true };
        }
      }

      // Local authentication check
      let existing = registeredUsers.find((u) => u.email.toLowerCase() === normalizedEmail);

      // If admin logging in for first time locally
      if (!existing && isTryingAdmin) {
        existing = DEFAULT_USERS[0];
      }

      if (!existing) {
        return { success: false, error: 'No student account found with this email. Please click "Register Account".' };
      }

      // Enforce role strictly
      existing.role = isTryingAdmin ? 'admin' : 'student';

      setUser(existing);
      localStorage.setItem('unical_hub_current_user', JSON.stringify(existing));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(console.error);
    }
    setUser(null);
    localStorage.removeItem('unical_hub_current_user');
  };

  // 6-digit OTP Registration Flow
  const sendRegistrationOtp = async (
    email: string,
    fullName: string,
    matricNumber: string
  ): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if matric or email already registered
    const exists = registeredUsers.some(
      (u) => u.email.toLowerCase() === normalizedEmail || u.matricNumber.toUpperCase() === matricNumber.trim().toUpperCase()
    );
    if (exists) {
      return { success: false, error: 'An account with this email or matric number already exists.' };
    }

    // Preserve full name and matric if resending
    const finalFullName = (fullName && fullName !== 'Student') ? fullName : (otpStore[normalizedEmail]?.meta?.fullName || fullName);
    const finalMatricNumber = (matricNumber && !matricNumber.startsWith('23/095144')) ? matricNumber : (otpStore[normalizedEmail]?.meta?.matricNumber || matricNumber);

    // Generate cryptographically secure random 6-digit OTP
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const code = (100000 + (array[0] % 900000)).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    saveOtpStore({
      ...otpStore,
      [normalizedEmail]: {
        code,
        expiresAt,
        meta: { fullName: finalFullName, matricNumber: finalMatricNumber }
      }
    });

    // Dispatch real email via serverless Netlify function / API
    await EmailService.dispatchOtpEmail({
      to: normalizedEmail,
      fullName: finalFullName.trim(),
      type: 'REGISTRATION_OTP',
      code,
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signUp({
          email: normalizedEmail,
          password: 'TemporarySecretPassword123!',
          options: {
            data: { full_name: fullName, matric_number: matricNumber }
          }
        });
      } catch (e) {
        console.warn('Supabase signUp OTP notice:', e);
      }
    }

    return { success: true };
  };

  const verifyRegistrationOtp = async (
    email: string,
    otp: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    const record = otpStore[normalizedEmail];

    if (!record) {
      return { success: false, error: 'No active OTP verification code found. Please request a new one.' };
    }

    if (Date.now() > record.expiresAt) {
      return { success: false, error: 'The 6-digit verification code has expired (valid for 5 mins). Please request a new one.' };
    }

    if (record.code !== otp.trim()) {
      return { success: false, error: 'Invalid verification code. Please check and try again.' };
    }

    // Students are ALWAYS registered as 'student' role. NEVER admin!
    const newUser: UserProfile = {
      id: 'student-' + Date.now(),
      email: normalizedEmail,
      fullName: record.meta?.fullName || 'Student',
      matricNumber: record.meta?.matricNumber || '23/095144' + Math.floor(100 + Math.random() * 900),
      role: 'student', // Admin role cannot be created via registration
      isEmailVerified: true,
      paymentStatus: 'UNPAID',
      createdAt: new Date().toISOString()
    };

    const updated = [newUser, ...registeredUsers];
    setRegisteredUsers(updated);
    localStorage.setItem('unical_hub_registered_users', JSON.stringify(updated));

    setUser(newUser);
    localStorage.setItem('unical_hub_current_user', JSON.stringify(newUser));

    const nextOtpStore = { ...otpStore };
    delete nextOtpStore[normalizedEmail];
    saveOtpStore(nextOtpStore);

    return { success: true };
  };

  const sendForgotPasswordOtp = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    const userExists = registeredUsers.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!userExists) {
      return { success: false, error: 'No account registered with this email.' };
    }

    // Generate cryptographically secure random 6-digit recovery OTP
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const code = (100000 + (array[0] % 900000)).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    saveOtpStore({
      ...otpStore,
      ['reset_' + normalizedEmail]: { code, expiresAt }
    });

    // Dispatch real password recovery email
    await EmailService.dispatchOtpEmail({
      to: normalizedEmail,
      fullName: userExists.fullName,
      type: 'PASSWORD_RESET_OTP',
      code,
    });

    return { success: true };
  };

  const resetPasswordWithOtp = async (
    email: string,
    otp: string,
    newPass: string
  ): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    const record = otpStore['reset_' + normalizedEmail];

    if (!record) {
      return { success: false, error: 'No password recovery session found.' };
    }

    if (Date.now() > record.expiresAt) {
      return { success: false, error: 'The 6-digit recovery code has expired. Please request a new one.' };
    }

    if (record.code !== otp.trim()) {
      return { success: false, error: 'Incorrect 6-digit OTP code.' };
    }

    const nextOtpStore = { ...otpStore };
    delete nextOtpStore['reset_' + normalizedEmail];
    saveOtpStore(nextOtpStore);

    return { success: true };
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('unical_hub_current_user', JSON.stringify(updated));

    const all = registeredUsers.map((u) => (u.id === user.id ? updated : u));
    setRegisteredUsers(all);
    localStorage.setItem('unical_hub_registered_users', JSON.stringify(all));
  };

  const isAdmin = isAdminUser(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        registeredUsers,
        login,
        logout,
        sendRegistrationOtp,
        verifyRegistrationOtp,
        sendForgotPasswordOtp,
        resetPasswordWithOtp,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
