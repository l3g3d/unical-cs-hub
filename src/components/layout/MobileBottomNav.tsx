import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  FileCheck2,
  Shield,
  Bot,
  User,
  CreditCard,
  Lock,
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAi: () => void;
}

export const MobileBottomNav: React.FC<Props> = ({ activeTab, setActiveTab, onOpenAi }) => {
  const { user, isAdmin } = useAuth();
  const isNotesLocked = user?.role === 'student' && user?.paymentStatus !== 'APPROVED';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-navy-950/95 backdrop-blur-md border-t border-navy-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {/* Home / Dashboard */}
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
          activeTab === 'dashboard' ? 'text-royal-400 font-bold' : 'text-slate-400'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px]">Home</span>
      </button>

      {/* Notes */}
      <button
        onClick={() => setActiveTab('notes')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition relative ${
          activeTab === 'notes' ? 'text-royal-400 font-bold' : 'text-slate-400'
        }`}
      >
        <div className="relative">
          <BookOpen className="w-5 h-5" />
          {isNotesLocked && (
            <Lock className="w-2.5 h-2.5 text-amber-400 absolute -top-1 -right-1" />
          )}
        </div>
        <span className="text-[10px]">Notes</span>
      </button>

      {/* Timetable */}
      <button
        onClick={() => setActiveTab('timetable')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
          activeTab === 'timetable' ? 'text-royal-400 font-bold' : 'text-slate-400'
        }`}
      >
        <Calendar className="w-5 h-5" />
        <span className="text-[10px]">Timetable</span>
      </button>

      {/* Tasks / Assignments */}
      <button
        onClick={() => setActiveTab('assignments')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
          activeTab === 'assignments' ? 'text-royal-400 font-bold' : 'text-slate-400'
        }`}
      >
        <FileCheck2 className="w-5 h-5" />
        <span className="text-[10px]">Tasks</span>
      </button>

      {/* Admin / Payment Button */}
      {isAdmin ? (
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
            activeTab === 'admin' ? 'text-royal-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Shield className="w-5 h-5 text-royal-400" />
          <span className="text-[10px]">Admin</span>
        </button>
      ) : (
        <button
          onClick={() => setActiveTab('payment')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
            activeTab === 'payment' ? 'text-royal-400 font-bold' : 'text-slate-400'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[10px]">₦500 Pay</span>
        </button>
      )}

      {/* AI Floating Button for Admin on Mobile */}
      {isAdmin && (
        <button
          onClick={onOpenAi}
          className="fixed bottom-16 right-4 w-12 h-12 rounded-full bg-gradient-to-tr from-royal-600 to-indigo-600 text-white shadow-xl flex items-center justify-center border-2 border-white animate-bounce"
          aria-label="Open AI Assistant"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
