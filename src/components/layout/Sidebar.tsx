import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  MapPin,
  FileCheck2,
  CreditCard,
  HelpCircle,
  Shield,
  Bot,
  User,
  Lock,
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAi: () => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab, onOpenAi }) => {
  const { user } = useAuth();
  const isNotesLocked = user?.role === 'student' && user?.paymentStatus !== 'APPROVED';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'notes',
      label: 'Course Notes',
      icon: BookOpen,
      badge: isNotesLocked ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : null
    },
    { id: 'timetable', label: 'Weekly Timetable', icon: Calendar },
    { id: 'venues', label: 'Lecture Venues', icon: MapPin },
    { id: 'assignments', label: 'Assignment Centre', icon: FileCheck2 },
    { id: 'payment', label: '₦500 Access Payment', icon: CreditCard },
    { id: 'complaints', label: 'Customer Service', icon: HelpCircle },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-navy-950 text-slate-300 border-r border-navy-800 h-[calc(100vh-4rem)] sticky top-16 select-none">
      {/* Session Header / Info */}
      <div className="p-4 border-b border-navy-800">
        <div className="text-[10px] uppercase tracking-wider font-bold text-royal-400 mb-1">
          Academic Session 2026/2027
        </div>
        <div className="text-xs text-white font-semibold">
          100 Level • First Semester
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-royal-600 text-white shadow-glow'
                  : 'text-slate-300 hover:text-white hover:bg-navy-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge}
            </button>
          );
        })}

        {/* Admin Navigation Section */}
        {user?.role === 'admin' && (
          <div className="pt-4 mt-4 border-t border-navy-800 space-y-1">
            <div className="px-3.5 pb-2 text-[10px] uppercase font-bold tracking-wider text-royal-400">
              Administration Area
            </div>
            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-royal-600 to-indigo-600 text-white shadow-glow'
                  : 'text-royal-300 hover:text-white hover:bg-navy-900'
              }`}
            >
              <Shield className="w-4 h-4 text-royal-400" />
              <span>Admin Management Hub</span>
            </button>

            <button
              onClick={onOpenAi}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-royal-950/60 hover:bg-royal-900 text-royal-200 border border-royal-800/60 transition group mt-1"
            >
              <div className="flex items-center gap-2.5">
                <Bot className="w-4 h-4 text-royal-400 group-hover:scale-110 transition" />
                <span>CS Hub AI Assistant</span>
              </div>
              <span className="text-[9px] bg-royal-700/80 text-white px-1.5 py-0.5 rounded font-bold">
                Voice/Text
              </span>
            </button>
          </div>
        )}
      </nav>

      {/* Rep Footnote */}
      <div className="p-4 border-t border-navy-800/80 bg-navy-950/90 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-slate-400">Portal Server: Online</span>
        </div>
      </div>
    </aside>
  );
};
