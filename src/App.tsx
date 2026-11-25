import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

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

  // Navigation tab state with localStorage persistence across browser refreshes
  const [activeTab, setActiveTab] = useState<string>(() => {
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
    try {
      return localStorage.getItem('unical_hub_selected_course') || undefined;
    } catch {}
    return undefined;
  });

  // Keep active tab persisted so refreshing never loses the current page
  useEffect(() => {
    try {
      if (activeTab) {
        localStorage.setItem('unical_hub_active_tab', activeTab);
      }
    } catch {}
  }, [activeTab]);

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

  // Helper to navigate with parameters
  const handleNavigate = (tab: string, extraParam?: string) => {
    if (extraParam) {
      setSelectedCourseParam(extraParam);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAi={() => setIsAiModalOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAi={() => setIsAiModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
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
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-card text-center max-w-lg mx-auto my-12">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-navy-950 mb-2">Access Restricted</h2>
                <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                  The departmental administrator area is exclusively reserved for the 100 Level Course Representative (Divine Christopher Inyang). Your student account does not have permission to view this section.
                </p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-5 py-2.5 rounded-xl bg-royal-600 text-white font-semibold text-xs shadow-sm hover:bg-royal-500 transition"
                >
                  Return to Student Dashboard
                </button>
              </div>
            )
          )}
        </main>
      </div>

      <Footer />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
