import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';

import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Footer } from './components/layout/Footer';
import { AiAssistantModal } from './components/ai/AiAssistantModal';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyOtpPage } from './pages/VerifyOtpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { CourseNotesPage } from './pages/CourseNotesPage';
import { TimetablePage } from './pages/TimetablePage';
import { VenuesPage } from './pages/VenuesPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { PaymentPage } from './pages/PaymentPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ShieldAlert } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, isAdmin, isLoading } = useAuth();

  // Helper to extract tab and optional param from URL hash
  const getRouteFromHash = (): { tab: string; param?: string } => {
    try {
      const raw = window.location.hash.replace(/^#\/?/, '').trim();
      if (!raw) return { tab: '' };
      const parts = raw.split('/');
      const tab = parts[0];
      const param = parts[1];
      const validTabs = ['dashboard', 'notes', 'timetable', 'venues', 'assignments', 'payment', 'complaints', 'profile', 'admin'];
      if (validTabs.includes(tab)) {
        return { tab, param };
      }
    } catch {}
    return { tab: '' };
  };

  // Navigation tab state with localStorage persistence across browser refreshes & URL hash routing
  const [activeTab, setActiveTab] = useState<string>(() => {
    const fromHash = getRouteFromHash().tab;
    if (fromHash) return fromHash;
    try {
      const saved = localStorage.getItem('unical_hub_active_tab');
      const validTabs = ['dashboard', 'notes', 'timetable', 'venues', 'assignments', 'payment', 'complaints', 'profile', 'admin'];
      if (saved && validTabs.includes(saved)) {
        return saved;
      }
    } catch {}
    return 'dashboard';
  });

  const [selectedCourseParam, setSelectedCourseParam] = useState<string | undefined>(() => {
    const fromHashParam = getRouteFromHash().param;
    if (fromHashParam) return fromHashParam;
    try {
      return localStorage.getItem('unical_hub_selected_course') || undefined;
    } catch {}
    return undefined;
  });

  // Micro-loading state simulating page transition to separate sub-page/sub-domain
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigatingSection, setNavigatingSection] = useState<string>('');

  const triggerNavigation = (targetTab: string, extraParam?: string) => {
    if (targetTab === activeTab && (!extraParam || extraParam === selectedCourseParam)) {
      return;
    }
    setNavigatingSection(targetTab);
    setIsNavigating(true);

    if (extraParam) {
      setSelectedCourseParam(extraParam);
    } else if (targetTab !== 'notes') {
      setSelectedCourseParam(undefined);
    }

    setActiveTab(targetTab);
    try {
      window.location.hash = `#/${targetTab}${extraParam ? `/${extraParam}` : ''}`;
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      setIsNavigating(false);
    }, 220);
  };

  // Sync back/forward button clicks from browser history
  useEffect(() => {
    const handleHashChange = () => {
      const route = getRouteFromHash();
      if (route.tab && route.tab !== activeTab) {
        setNavigatingSection(route.tab);
        setIsNavigating(true);
        setActiveTab(route.tab);
        if (route.param) setSelectedCourseParam(route.param);
        setTimeout(() => setIsNavigating(false), 220);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

  // Keep active tab persisted in localStorage and in URL hash
  useEffect(() => {
    try {
      if (activeTab) {
        localStorage.setItem('unical_hub_active_tab', activeTab);
        const expected = `#/${activeTab}${selectedCourseParam ? `/${selectedCourseParam}` : ''}`;
        if (window.location.hash !== expected) {
          window.location.hash = expected;
        }
      }
    } catch {}
  }, [activeTab, selectedCourseParam]);

  // Keep selected course persisted
  useEffect(() => {
    try {
      if (selectedCourseParam) {
        localStorage.setItem('unical_hub_selected_course', selectedCourseParam);
      } else {
        localStorage.removeItem('unical_hub_selected_course');
      }
    } catch {}
  }, [selectedCourseParam]);

  // Unauthenticated flow view with sessionStorage persistence
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register' | 'verify_otp' | 'forgot_password'>(() => {
    try {
      const saved = sessionStorage.getItem('unical_hub_auth_view');
      if (saved && ['landing', 'login', 'register', 'verify_otp', 'forgot_password'].includes(saved)) {
        return saved as any;
      }
    } catch {}
    return 'landing';
  });

  // OTP flow state with sessionStorage persistence
  const [pendingEmail, setPendingEmail] = useState(() => {
    try {
      return sessionStorage.getItem('unical_hub_pending_email') || '';
    } catch {}
    return '';
  });

  const [pendingPassword, setPendingPassword] = useState(() => {
    try {
      return sessionStorage.getItem('unical_hub_pending_password') || '';
    } catch {}
    return '';
  });

  const updateAuthView = (view: 'landing' | 'login' | 'register' | 'verify_otp' | 'forgot_password') => {
    setAuthView(view);
    try {
      sessionStorage.setItem('unical_hub_auth_view', view);
    } catch {}
  };

  const handleOtpSent = (email: string, pass: string) => {
    setPendingEmail(email);
    setPendingPassword(pass);
    try {
      sessionStorage.setItem('unical_hub_pending_email', email);
      sessionStorage.setItem('unical_hub_pending_password', pass);
      sessionStorage.setItem('unical_hub_auth_view', 'verify_otp');
    } catch {}
    setAuthView('verify_otp');
  };

  const clearPendingAuth = () => {
    setPendingEmail('');
    setPendingPassword('');
    try {
      sessionStorage.removeItem('unical_hub_pending_email');
      sessionStorage.removeItem('unical_hub_pending_password');
      sessionStorage.removeItem('unical_hub_auth_view');
    } catch {}
  };

  // AI Assistant Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-royal-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-royal-200 tracking-wider uppercase">Loading UNICAL CS HUB...</p>
      </div>
    );
  }

  // Not logged in: Show auth flows
  if (!user) {
    if (authView === 'login') {
      return (
        <LoginPage
          onRegisterClick={() => updateAuthView('register')}
          onForgotPasswordClick={() => updateAuthView('forgot_password')}
          onLoginSuccess={() => {
            clearPendingAuth();
            setActiveTab('dashboard');
          }}
        />
      );
    }

    if (authView === 'register') {
      return (
        <RegisterPage
          onLoginClick={() => updateAuthView('login')}
          onOtpSent={handleOtpSent}
        />
      );
    }

    if (authView === 'verify_otp') {
      return (
        <VerifyOtpPage
          email={pendingEmail}
          password={pendingPassword}
          onVerificationSuccess={() => {
            clearPendingAuth();
            updateAuthView('landing');
            setActiveTab('dashboard');
          }}
          onBack={() => updateAuthView('register')}
        />
      );
    }

    if (authView === 'forgot_password') {
      return (
        <ForgotPasswordPage
          onBackToLogin={() => updateAuthView('login')}
        />
      );
    }

    return (
      <LandingPage
        onGetStarted={() => updateAuthView('register')}
        onLogin={() => updateAuthView('login')}
      />
    );
  }

  // Helper to navigate with parameters and simulated micro-loading transition
  const handleNavigate = (tab: string, extraParam?: string) => {
    triggerNavigation(tab, extraParam);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Page Transition Progress Bar */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-royal-500 via-indigo-500 to-emerald-400 animate-pulse shadow-glow" />
      )}

      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        onOpenAi={() => setIsAiModalOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleNavigate}
          onOpenAi={() => setIsAiModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {isNavigating ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 animate-fade-in py-16">
              <div className="relative">
                <div className="w-12 h-12 border-3 border-royal-600/30 border-t-royal-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-royal-600 animate-ping" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-200">
                  Loading {navigatingSection || activeTab}...
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Connecting to departmental node • Secure student session
                </div>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <StudentDashboard
                  onNavigate={handleNavigate}
                  onOpenAi={() => setIsAiModalOpen(true)}
                />
              )}

              {activeTab === 'notes' && (
                <CourseNotesPage
                  initialCourseCode={selectedCourseParam}
                  onNavigateToPayment={() => handleNavigate('payment')}
                />
              )}

              {activeTab === 'timetable' && <TimetablePage />}

              {activeTab === 'venues' && <VenuesPage />}

              {activeTab === 'assignments' && <AssignmentsPage />}

              {activeTab === 'payment' && (
                <PaymentPage
                  onNavigateToNotes={() => handleNavigate('notes')}
                />
              )}

              {activeTab === 'complaints' && <ComplaintsPage />}

              {activeTab === 'profile' && <ProfilePage />}

              {activeTab === 'admin' && (
                isAdmin ? (
                  <AdminDashboardPage
                    onOpenAi={() => setIsAiModalOpen(true)}
                  />
                ) : (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-card text-center max-w-lg mx-auto my-12">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-900">
                      <ShieldAlert className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-navy-950 dark:text-white mb-2">Access Restricted</h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                      The departmental administrator area is exclusively reserved for the 100 Level Course Representative (Divine Christopher Inyang). Your student account does not have permission to view this section.
                    </p>
                    <button
                      onClick={() => handleNavigate('dashboard')}
                      className="px-5 py-2.5 rounded-xl bg-royal-600 text-white font-semibold text-xs shadow-sm hover:bg-royal-500 transition"
                    >
                      Return to Student Dashboard
                    </button>
                  </div>
                )
              )}
            </>
          )}
        </main>
      </div>

      <Footer />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        onOpenAi={() => setIsAiModalOpen(true)}
      />

      {/* CS HUB AI Assistant Dialog (Admin Only) */}
      {isAdmin && (
        <AiAssistantModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
        />
      )}
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
