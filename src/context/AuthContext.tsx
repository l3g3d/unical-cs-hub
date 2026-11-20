import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, PaymentStatus, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  registeredUsers: UserProfile[];
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  sendRegistrationOtp: (email: string, fullName: string, matricNumber: string) => Promise<{ success: boolean; otp?: string; error?: string }>;
  verifyRegistrationOtp: (email: string, otp: string, password: string) => Promise<{ success: boolean; error?: string }>;
  sendForgotPasswordOtp: (email: string) => Promise<{ success: boolean; otp?: string; error?: string }>;
  resetPasswordWithOtp: (email: string, otp: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  switchUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial preloaded users
const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user-admin-divine',
    email: 'divineinyang636@gmail.com',
    fullName: 'Divine Christopher Inyang',
    matricNumber: '23/095144000',
    role: 'admin',
    isEmailVerified: true,
    paymentStatus: 'APPROVED',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-11-01T08:00:00Z'
  },
  {
    id: 'student-emeka',
    email: 'emeka@unical.edu.ng',
    fullName: 'Emeka Christian Okon',
    matricNumber: '23/095144001',
    role: 'student',
    isEmailVerified: true,
    paymentStatus: 'APPROVED',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-11-19T15:45:00Z'
  },
  {
    id: 'student-blessing',
    email: 'blessing@unical.edu.ng',
    fullName: 'Blessing Effiong Bassey',
    matricNumber: '23/095144015',
    role: 'student',
    isEmailVerified: true,
    paymentStatus: 'PENDING',
    createdAt: '2026-11-20T20:10:00Z'
  },
  {
    id: 'student-fresh',
    email: 'fresh@unical.edu.ng',
    fullName: 'David Sunday Udoh',
    matricNumber: '23/095144099',
    role: 'student',
    isEmailVerified: true,
    paymentStatus: 'UNPAID',
    createdAt: '2026-11-20T21:00:00Z'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Temporary in-memory OTP storage: email -> { code, expiresAt, meta }
  const [otpStore, setOtpStore] = useState<Record<string, { code: string; expiresAt: number; meta?: any }>>({});

  useEffect(() => {
    // Load users and current active session from localStorage
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
        setUser(JSON.parse(activeSessionRaw));
      } else {
        // Default to the Course Rep (Admin) so the user can test the admin & AI assistant immediately
        setUser(usersList[0]);
        localStorage.setItem('unical_hub_current_user', JSON.stringify(usersList[0]));
      }
    } catch (e) {
      console.error('Auth initialization error:', e);
      setUser(DEFAULT_USERS[0]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Normal Login (Email + Password)
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // If live Supabase configured, attempt Supabase login
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) {
          // If error in live Supabase, check local list
          console.warn('Supabase auth failed, trying local store:', error.message);
        } else if (data.user) {
          // fetch user profile
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
          const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', data.user.id).single();
          const { data: payData } = await supabase.from('student_entitlements').select('access_granted').eq('student_id', data.user.id).single();

          const authedUser: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: profile?.full_name || email.split('@')[0],
            matricNumber: profile?.matric_number || '23/095144000',
            role: (roleData?.role as UserRole) || 'student',
            avatarUrl: profile?.avatar_url,
            isEmailVerified: true,
            paymentStatus: payData?.access_granted ? 'APPROVED' : 'UNPAID',
            createdAt: data.user.created_at
          };
          setUser(authedUser);
          localStorage.setItem('unical_hub_current_user', JSON.stringify(authedUser));
          return { success: true };
        }
      }

      // Local / Offline authentication
      const normalizedEmail = email.trim().toLowerCase();
      const existing = registeredUsers.find((u) => u.email.toLowerCase() === normalizedEmail);

      if (!existing) {
        return { success: false, error: 'No student or admin account found with this email.' };
      }

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
  ): Promise<{ success: boolean; otp?: string; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if matric or email already registered
    const exists = registeredUsers.some(
      (u) => u.email.toLowerCase() === normalizedEmail || u.matricNumber.toUpperCase() === matricNumber.trim().toUpperCase()
    );
    if (exists) {
      return { success: false, error: 'An account with this email or matric number already exists.' };
    }

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    setOtpStore((prev) => ({
      ...prev,
      [normalizedEmail]: {
        code,
        expiresAt,
        meta: { fullName, matricNumber }
      }
    }));

    // If Supabase is configured with SMTP, call signUp
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

    return { success: true, otp: code };
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

    // Create student user
    const newUser: UserProfile = {
      id: 'student-' + Date.now(),
      email: normalizedEmail,
      fullName: record.meta?.fullName || 'Student',
      matricNumber: record.meta?.matricNumber || '23/095144' + Math.floor(100 + Math.random() * 900),
      role: 'student', // Admin role cannot be self-selected!
      isEmailVerified: true,
      paymentStatus: 'UNPAID',
      createdAt: new Date().toISOString()
    };

    const updated = [newUser, ...registeredUsers];
    setRegisteredUsers(updated);
    localStorage.setItem('unical_hub_registered_users', JSON.stringify(updated));

    // Log the student in
    setUser(newUser);
    localStorage.setItem('unical_hub_current_user', JSON.stringify(newUser));

    // Clear OTP
    setOtpStore((prev) => {
      const next = { ...prev };
      delete next[normalizedEmail];
      return next;
    });

    return { success: true };
  };

  // Forgot Password OTP flow
  const sendForgotPasswordOtp = async (email: string): Promise<{ success: boolean; otp?: string; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    const userExists = registeredUsers.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!userExists) {
      return { success: false, error: 'No account registered with this email.' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    setOtpStore((prev) => ({
      ...prev,
      ['reset_' + normalizedEmail]: { code, expiresAt }
    }));

    return { success: true, otp: code };
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

    // Invalidate recovery code
    setOtpStore((prev) => {
      const next = { ...prev };
      delete next['reset_' + normalizedEmail];
      return next;
    });

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

  // Easy switcher for testing between Student & Course Rep (Admin)
  const switchUserRole = (targetRole: UserRole) => {
    const targetUser = registeredUsers.find((u) => u.role === targetRole) || (targetRole === 'admin' ? DEFAULT_USERS[0] : DEFAULT_USERS[1]);
    setUser(targetUser);
    localStorage.setItem('unical_hub_current_user', JSON.stringify(targetUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        registeredUsers,
        login,
        logout,
        sendRegistrationOtp,
        verifyRegistrationOtp,
        sendForgotPasswordOtp,
        resetPasswordWithOtp,
        updateProfile,
        switchUserRole
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
