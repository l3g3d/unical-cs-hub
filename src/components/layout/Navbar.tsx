import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Bell,
  Search,
  Bot,
  LogOut,
  User,
  Shield,
  GraduationCap,
  Sparkles,
  ChevronDown,
  CheckCheck,
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAi: () => void;
  onSearchSelect?: (type: string, id: string) => void;
}

export const Navbar: React.FC<Props> = ({ activeTab, setActiveTab, onOpenAi, onSearchSelect }) => {
  const { user, logout, switchUserRole } = useAuth();
  const { notifications, unreadNotifsCount, markNotificationRead, markAllNotificationsRead, courses, notes, assignments } = useData();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Global search filtering
  const filteredCourses = searchQuery.trim()
    ? courses.filter(
        (c) =>
          c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredNotes = searchQuery.trim()
    ? notes.filter(
        (n) =>
          n.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.topic.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredAssignments = searchQuery.trim()
    ? assignments.filter(
        (a) =>
          a.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const hasResults = filteredCourses.length > 0 || filteredNotes.length > 0 || filteredAssignments.length > 0;

  return (
    <header className="sticky top-0 z-40 bg-navy-900 border-b border-navy-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-royal-500 to-navy-950 p-1.5 flex items-center justify-center border border-royal-400/30 shadow-glow group-hover:scale-105 transition">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">
                UNICAL CS HUB
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-royal-600/50 text-royal-200 border border-royal-500/30 uppercase">
                100L
              </span>
            </div>
            <p className="text-[11px] text-slate-300 hidden sm:block">
              Department of Computer Science
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Search courses, lecture notes, assignments..."
              className="w-full bg-navy-950/70 border border-navy-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-royal-500 transition"
            />
          </div>

          {/* Search Dropdown */}
          {showSearchResults && searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 p-2 z-50 max-h-80 overflow-y-auto">
              {!hasResults ? (
                <div className="p-3 text-xs text-slate-500 text-center">
                  No matching courses, notes, or assignments found.
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  {filteredCourses.length > 0 && (
                    <div>
                      <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400 px-2 py-1">
                        Courses
                      </div>
                      {filteredCourses.map((c) => (
                        <div
                          key={c.code}
                          onClick={() => {
                            setActiveTab('notes');
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="px-2.5 py-1.5 hover:bg-slate-100 rounded-lg cursor-pointer flex items-center justify-between"
                        >
                          <span className="font-semibold text-navy-900">{c.code}</span>
                          <span className="text-slate-500 truncate ml-2">{c.title}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredNotes.length > 0 && (
                    <div>
                      <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400 px-2 py-1">
                        Lecture Notes
                      </div>
                      {filteredNotes.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setActiveTab('notes');
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="px-2.5 py-1.5 hover:bg-slate-100 rounded-lg cursor-pointer flex items-center justify-between"
                        >
                          <span className="font-medium text-slate-900 truncate">
                            {n.courseCode}: {n.topic}
                          </span>
                          <span className="text-[10px] text-royal-600 font-semibold ml-2">Lecture {n.lectureNumber}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredAssignments.length > 0 && (
                    <div>
                      <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400 px-2 py-1">
                        Assignments
                      </div>
                      {filteredAssignments.map((a) => (
                        <div
                          key={a.id}
                          onClick={() => {
                            setActiveTab('assignments');
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="px-2.5 py-1.5 hover:bg-slate-100 rounded-lg cursor-pointer flex items-center justify-between"
                        >
                          <span className="font-medium text-slate-900 truncate">
                            {a.courseCode}: {a.title}
                          </span>
                          <span className="text-[10px] text-amber-600 font-semibold ml-2">Task</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Assistant Quick Pill (Visible to Admin or for testing) */}
          {user?.role === 'admin' && (
            <button
              onClick={onOpenAi}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-royal-600 to-indigo-600 hover:from-royal-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-sm transition group"
            >
              <Bot className="w-4 h-4 text-royal-200 group-hover:rotate-12 transition" />
              <span className="hidden sm:inline">AI Assistant</span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </button>
          )}

          {/* Quick Role Tester Switcher (Helpful toggle) */}
          <div className="hidden lg:flex items-center bg-navy-950 p-1 rounded-xl border border-navy-800 text-[11px]">
            <button
              onClick={() => switchUserRole('student')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                user?.role === 'student'
                  ? 'bg-royal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Student View
            </button>
            <button
              onClick={() => switchUserRole('admin')}
              className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                user?.role === 'admin'
                  ? 'bg-royal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3 h-3 text-royal-300" />
              Admin View
            </button>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-navy-800 transition relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-navy-900">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Notifications Menu */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 z-50 overflow-hidden animate-fade-in">
                <div className="bg-navy-900 text-white p-3.5 flex items-center justify-between border-b border-navy-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-royal-400" />
                    <span className="font-semibold text-xs sm:text-sm">Notifications</span>
                    <span className="text-[10px] bg-royal-700 px-2 py-0.5 rounded-full font-bold">
                      {unreadNotifsCount} new
                    </span>
                  </div>
                  {unreadNotifsCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-royal-300 hover:text-white flex items-center gap-1 transition"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications at this time.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.link) {
                            setActiveTab(n.link.replace('/', ''));
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition ${
                          !n.isRead ? 'bg-royal-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-semibold text-slate-900">{n.title}</span>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-navy-800 transition"
            >
              <div className="w-8 h-8 rounded-lg bg-royal-600 flex items-center justify-center text-white font-bold text-xs uppercase overflow-hidden border border-royal-400/40">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  user?.fullName?.charAt(0) || 'U'
                )}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 z-50 overflow-hidden py-2 animate-fade-in">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-navy-950 truncate">{user?.fullName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-navy-100 text-navy-800">
                      {user?.matricNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        user?.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-royal-100 text-royal-800'
                      }`}
                    >
                      {user?.role}
                    </span>
                  </div>
                </div>

                <div className="py-1 text-xs">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </button>

                  {user?.role === 'admin' && (
                    <button
                      onClick={() => {
                        setActiveTab('admin');
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-royal-700 font-semibold"
                    >
                      <Shield className="w-4 h-4 text-royal-600" />
                      <span>Admin Management Dashboard</span>
                    </button>
                  )}

                  <div className="border-t border-slate-100 my-1 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
