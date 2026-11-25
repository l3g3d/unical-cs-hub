import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, PaymentStatus, UserRole } from '../types';
import { EmailService } from '../lib/emailService';
import { ApiSync } from '../lib/apiSync';

// ============================================================
// IMPORTANT: We deliberately do NOT import or use Supabase Auth
// for registration or OTP verification. Supabase Auth always
// sends its own confirmation LINK email which breaks our
// custom 6-digit OTP flow. All auth is handled by our own
// system (custom OTP → localStorage accounts).
// ============================================================

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
  sendRegistrationOtp: (email: string, fullName: string, matricNumber: string) => Promise<{ success: boolean; delivered?: boolean; error?: string }>;
  verifyRegistrationOtp: (email: string, otp: string, password: string) => Promise<{ success: boolean; error?: string }>;
  sendForgotPasswordOtp: (email: string) => Promise<{ success: boolean; delivered?: boolean; error?: string }>;
  resetPasswordWithOtp: (email: string, otp: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  getOtpInfo: (email: string) => { code?: string; expiresAt?: number; delivered?: boolean } | null;
  updateProfile: (updates: Partial<UserProfile>) => void;
  banUser: (studentId: string, reason?: string) => Promise<void>;
  unbanUser: (studentId: string) => Promise<void>;
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

  // OTP store persisted in sessionStorage so it survives mobile browser switches
  const [otpStore, setOtpStore] = useState<Record<string, { code: string; expiresAt: number; delivered?: boolean; meta?: any }>>(() => {
    try {
      const saved = sessionStorage.getItem('unical_hub_otp_store');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const saveOtpStore = (newStore: Record<string, { code: string; expiresAt: number; delivered?: boolean; meta?: any }>) => {
    setOtpStore(newStore);
    try {
      sessionStorage.setItem('unical_hub_otp_store', JSON.stringify(newStore));
    } catch {}
  };

  // Password store for registered accounts (hashed-ish via localStorage)
  const getPasswordStore = (): Record<string, string> => {
    try {
      const raw = localStorage.getItem('unical_hub_passwords');
      if (raw) return JSON.parse(raw);
    } catch {}
    return {};
  };

  const savePassword = (email: string, password: string) => {
    const store = getPasswordStore();
    store[email.toLowerCase()] = password;
    localStorage.setItem('unical_hub_passwords', JSON.stringify(store));
  };

  const sanitizeUsers = (list: UserProfile[]): UserProfile[] => {
    if (!Array.isArray(list)) return DEFAULT_USERS;
    return list.filter((u) => {
      if (!u || !u.email) return false;
      const em = u.email.trim().toLowerCase();
      if (
        em === 'emeka@example.com' ||
        em === 'blessing@example.com' ||
        u.id === 'student-emeka' ||
        u.id === 'student-blessing'
      ) {
        return false;
      }
      return true;
    });
  };

  const syncRemoteUsers = async () => {
    try {
      const hub = await ApiSync.fetchHubState();
      const localRaw = localStorage.getItem('unical_hub_registered_users');
      let localUsers: UserProfile[] = [];
      try {
        if (localRaw) localUsers = JSON.parse(localRaw);
      } catch {}

      const remoteUsers: UserProfile[] = (hub && Array.isArray(hub.users)) ? hub.users : [];

      // Combine both sources by unique email so no registered student is EVER lost
      const userMap = new Map<string, UserProfile>();
      userMap.set(ADMIN_EMAIL, DEFAULT_USERS[0]);

      for (const u of localUsers) {
        if (u && u.email) {
          userMap.set(u.email.trim().toLowerCase(), u);
        }
      }

      for (const u of remoteUsers) {
        if (u && u.email) {
          const em = u.email.trim().toLowerCase();
          const existing = userMap.get(em);
          userMap.set(em, { ...existing, ...u });
        }
      }

      const combined = sanitizeUsers(Array.from(userMap.values()));
      setRegisteredUsers(combined);
      localStorage.setItem('unical_hub_registered_users', JSON.stringify(combined));

      // Push merged list to central cloud if local had more users
      if (combined.length > remoteUsers.length) {
        ApiSync.syncKeyRemotely('users', combined);
      }

      // Update active session if payment status changed or user was banned remotely
      const activeSessionRaw = localStorage.getItem('unical_hub_current_user');
      if (activeSessionRaw) {
        const cur = JSON.parse(activeSessionRaw);
        const match = combined.find((u) => u.id === cur.id || u.email.toLowerCase() === cur.email?.toLowerCase());
        if (match) {
          if (match.isBanned && cur.role !== 'admin') {
            setUser(null);
            localStorage.removeItem('unical_hub_current_user');
          } else if (match.paymentStatus !== cur.paymentStatus || match.isBanned !== cur.isBanned) {
            const updatedCur = { ...cur, paymentStatus: match.paymentStatus, isBanned: match.isBanned };
            if (updatedCur.email.toLowerCase() === ADMIN_EMAIL) updatedCur.role = 'admin';
            setUser(updatedCur);
            localStorage.setItem('unical_hub_current_user', JSON.stringify(updatedCur));
          }
        }
      }
    } catch (err) {
      console.warn('Sync remote users notice:', err);
    }
  };

  useEffect(() => {
    try {
      const storedUsersRaw = localStorage.getItem('unical_hub_registered_users');
      let usersList: UserProfile[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      usersList = sanitizeUsers(usersList);
      if (usersList.length === 0) {
        usersList = DEFAULT_USERS;
        localStorage.setItem('unical_hub_registered_users', JSON.stringify(DEFAULT_USERS));
      }
      setRegisteredUsers(usersList);

      const activeSessionRaw = localStorage.getItem('unical_hub_current_user');
      if (activeSessionRaw) {
        const parsed = JSON.parse(activeSessionRaw);
        // STRICT ROLE ENFORCEMENT: Only divineinyang636@gmail.com can ever be admin
        if (parsed.email && parsed.email.trim().toLowerCase() === ADMIN_EMAIL) {
          parsed.role = 'admin';
        } else {
          parsed.role = 'student';
        }
        setUser(parsed);
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error('Auth initialization error:', e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }

    // Trigger cloud user sync
    syncRemoteUsers();

    // Background user synchronization every 25 seconds
    const interval = setInterval(syncRemoteUsers, 25000);
    return () => clearInterval(interval);
  }, []);

  // ── LOGIN (email + password, fully custom — no Supabase Auth) ──────────────
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const isTryingAdmin = normalizedEmail === ADMIN_EMAIL;

      // Find registered account
      let existing = registeredUsers.find((u) => u.email.toLowerCase() === normalizedEmail);

      // Admin fallback if not in list yet
      if (!existing && isTryingAdmin) {
        existing = { ...DEFAULT_USERS[0] };
      }

      if (!existing) {
        return { success: false, error: 'No student account found with this email. Please register first.' };
      }

      // Check if student account is banned / suspended
      if (existing.isBanned && !isTryingAdmin) {
        return {
          success: false,
          error: `Your student account has been suspended by the Course Representative${existing.banReason ? ` (${existing.banReason})` : ''}. Please contact administrator divineinyang636@gmail.com.`
        };
      }

      // Password check for non-admin students
      if (!isTryingAdmin) {
        const passwords = getPasswordStore();
        const stored = passwords[normalizedEmail];
        if (stored && stored !== pass) {
          return { success: false, error: 'Incorrect password. Please try again.' };
        }
      }

      // Record login activity
      const loginTime = new Date().toISOString();
      const authedUser: UserProfile = {
        ...existing,
        role: isTryingAdmin ? 'admin' : 'student',
        lastLoginAt: loginTime,
        loginCount: (existing.loginCount || 0) + 1,
      };

      setUser(authedUser);
      localStorage.setItem('unical_hub_current_user', JSON.stringify(authedUser));

      // Update in registered users list
      const updatedList = registeredUsers.map((u) => u.email.toLowerCase() === normalizedEmail ? authedUser : u);
      setRegisteredUsers(updatedList);
      localStorage.setItem('unical_hub_registered_users', JSON.stringify(updatedList));

      // Record login in central cloud database
      ApiSync.recordUserLogin(normalizedEmail);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('unical_hub_current_user');
  };

  const banUser = async (studentId: string, reason?: string) => {
    const updated = registeredUsers.map((u) => {
      if (u.id === studentId && u.role !== 'admin') {
        return {
          ...u,
          isBanned: true,
          bannedAt: new Date().toISOString(),
          banReason: reason || 'Suspended by Super Administrator',
        };
      }
      return u;
    });
    setRegisteredUsers(updated);
    localStorage.setItem('unical_hub_registered_users', JSON.stringify(updated));

    // If current session is this student, log them out
    if (user && user.id === studentId && user.role !== 'admin') {
      logout();
    }

    const target = registeredUsers.find((u) => u.id === studentId);
    await ApiSync.updateUserBanStatus(studentId, true, reason, target?.email);
  };

  const unbanUser = async (studentId: string) => {
    const updated = registeredUsers.map((u) => {
      if (u.id === studentId) {
        return {
          ...u,
          isBanned: false,
          bannedAt: undefined,
          banReason: undefined,
        };
      }
      return u;
    });
    setRegisteredUsers(updated);
    localStorage.setItem('unical_hub_registered_users', JSON.stringify(updated));

    const target = registeredUsers.find((u) => u.id === studentId);
    await ApiSync.updateUserBanStatus(studentId, false, undefined, target?.email);
  };

  // ── STEP 1: Send 6-digit registration OTP ─────────────────────────────────
  // We NEVER call supabase.auth.signUp() here or anywhere during OTP flows.
  // Supabase Auth always fires its own link-based confirmation email which
  // blocks our custom code flow. All registration is fully self-contained.
  const sendRegistrationOtp = async (
    email: string,
    fullName: string,
    matricNumber: string
  ): Promise<{ success: boolean; delivered?: boolean; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();

    // Block duplicate registrations
    const exists = registeredUsers.some(
      (u) =>
        u.email.toLowerCase() === normalizedEmail ||
        u.matricNumber.toUpperCase() === matricNumber.trim().toUpperCase()
    );
    if (exists) {
      return { success: false, error: 'An account with this email or matriculation number already exists. Please log in.' };
    }

    // Preserve name/matric from prior attempt if resending
    const finalFullName =
      fullName && fullName !== 'Student'
        ? fullName
        : otpStore[normalizedEmail]?.meta?.fullName || fullName;
    const finalMatricNumber =
      matricNumber && !matricNumber.startsWith('23/095144')
        ? matricNumber
        : otpStore[normalizedEmail]?.meta?.matricNumber || matricNumber;

    // Cryptographically secure 6-digit code
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const code = (100000 + (array[0] % 900000)).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5-minute window

    // Dispatch real email via serverless Netlify function
    const dispatchResult = await EmailService.dispatchOtpEmail({
      to: normalizedEmail,
      fullName: finalFullName.trim(),
      type: 'REGISTRATION_OTP',
      code,
    });

    saveOtpStore({
      ...otpStore,
      [normalizedEmail]: {
        code,
        expiresAt,
        delivered: dispatchResult.delivered,
        meta: { fullName: finalFullName, matricNumber: finalMatricNumber },
      },
    });

    return { success: true, delivered: dispatchResult.delivered };
  };

  // ── STEP 2: Verify 6-digit code and complete registration ──────────────────
  const verifyRegistrationOtp = async (
    email: string,
    otp: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    const record = otpStore[normalizedEmail];

    if (!record) {
      return { success: false, error: 'No active verification code found. Please request a new one.' };
    }

    if (Date.now() > record.expiresAt) {
      return { success: false, error: 'The 6-digit verification code has expired (5-minute limit). Please request a new one.' };
    }

    if (record.code !== otp.trim()) {
      return { success: false, error: 'Invalid verification code. Please check your email and try again.' };
    }

    // Create the student account — role is ALWAYS 'student', never 'admin'
    const newUser: UserProfile = {
      id: 'student-' + Date.now(),
      email: normalizedEmail,
      fullName: record.meta?.fullName || 'Student',
      matricNumber: record.meta?.matricNumber || '23/095144' + Math.floor(100 + Math.random() * 900),
      role: 'student',
      isEmailVerified: true,
      paymentStatus: 'UNPAID',
      createdAt: new Date().toISOString(),
    };

    // Save account and password
    const updated = [newUser, ...registeredUsers];
    setRegisteredUsers(updated);
    localStorage.setItem('unical_hub_registered_users', JSON.stringify(updated));
    savePassword(normalizedEmail, password);

    // Sync newly registered student to central database immediately
    ApiSync.registerUserRemotely(newUser);

    // Log the student in immediately
    setUser(newUser);
    localStorage.setItem('unical_hub_current_user', JSON.stringify(newUser));

    // Clear used OTP
    const nextOtpStore = { ...otpStore };
    delete nextOtpStore[normalizedEmail];
    saveOtpStore(nextOtpStore);

    return { success: true };
  };

  // ── Forgot password: Send 6-digit recovery code ───────────────────────────
  const sendForgotPasswordOtp = async (email: string): Promise<{ success: boolean; delivered?: boolean; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    const userExists = registeredUsers.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!userExists) {
      return { success: false, error: 'No account is registered with this email address.' };
    }

    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const code = (100000 + (array[0] % 900000)).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    const dispatchResult = await EmailService.dispatchOtpEmail({
      to: normalizedEmail,
      fullName: userExists.fullName,
      type: 'PASSWORD_RESET_OTP',
      code,
    });

    saveOtpStore({
      ...otpStore,
      ['reset_' + normalizedEmail]: {
        code,
        expiresAt,
        delivered: dispatchResult.delivered,
      },
    });

    return { success: true, delivered: dispatchResult.delivered };
  };

  // Helper to read OTP status for verification screens
  const getOtpInfo = (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    return otpStore[normalizedEmail] || otpStore['reset_' + normalizedEmail] || null;
  };

  // ── Verify recovery code and update password ──────────────────────────────
  const resetPasswordWithOtp = async (
    email: string,
    otp: string,
    newPass: string
  ): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    const record = otpStore['reset_' + normalizedEmail];

    if (!record) {
      return { success: false, error: 'No password recovery session found. Please request a new code.' };
    }

    if (Date.now() > record.expiresAt) {
      return { success: false, error: 'The 6-digit recovery code has expired. Please request a new one.' };
    }

    if (record.code !== otp.trim()) {
      return { success: false, error: 'Incorrect recovery code. Please check your email and try again.' };
    }

    // Update the stored password
    savePassword(normalizedEmail, newPass);

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

    // Sync profile updates (such as uploaded avatar) to cloud
    ApiSync.registerUserRemotely(updated);
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
        getOtpInfo,
        updateProfile,
        banUser,
        unbanUser,
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
