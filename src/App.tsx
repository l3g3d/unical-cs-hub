import React, { useState } from 'react';
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

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedCourseParam, setSelectedCourseParam] = useState<string | undefined>(undefined);

  // Unauthenticated flow view
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register' | 'verify_otp' | 'forgot_password'>('landing');

  // OTP flow state
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingPassword, setPendingPassword] = useState('');
  const [pendingOtp, setPendingOtp] = useState<string | undefined>(undefined);

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
          onRegisterClick={() => setAuthView('register')}
          onForgotPasswordClick={() => setAuthView('forgot_password')}
          onLoginSuccess={() => setActiveTab('dashboard')}
        />
      );
    }

    if (authView === 'register') {
      return (
        <RegisterPage
          onLoginClick={() => setAuthView('login')}
          onOtpSent={(email, password, otp) => {
            setPendingEmail(email);
            setPendingPassword(password);
            setPendingOtp(otp);
            setAuthView('verify_otp');
          }}
        />
      );
    }

    if (authView === 'verify_otp') {
      return (
        <VerifyOtpPage
          email={pendingEmail}
          password={pendingPassword}
          initialOtp={pendingOtp}
          onVerificationSuccess={() => {
            setAuthView('landing');
            setActiveTab('dashboard');
          }}
          onBack={() => setAuthView('register')}
        />
      );
    }

    if (authView === 'forgot_password') {
      return (
        <ForgotPasswordPage
          onBackToLogin={() => setAuthView('login')}
        />
      );
    }

    return (
      <LandingPage
        onGetStarted={() => setAuthView('register')}
        onLogin={() => setAuthView('login')}
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
            <AdminDashboardPage
              onOpenAi={() => setIsAiModalOpen(true)}
            />
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

      {/* CS HUB AI Assistant Dialog */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
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
