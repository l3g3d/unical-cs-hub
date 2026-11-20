import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { CourseRepCard } from '../components/common/CourseRepCard';
import { PaymentStatusBadge } from '../components/common/PaymentStatusBadge';
import {
  BookOpen,
  Calendar,
  FileCheck2,
  Clock,
  ArrowRight,
  MapPin,
  Megaphone,
  CreditCard,
  Lock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  onNavigate: (tab: string, extraParam?: string) => void;
  onOpenAi?: () => void;
}

export const StudentDashboard: React.FC<Props> = ({ onNavigate, onOpenAi }) => {
  const { user } = useAuth();
  const { courses, courseRep, timetable, assignments, announcements, notes } = useData();

  const isApproved = user?.paymentStatus === 'APPROVED';

  // Find next upcoming classes from today's timetable
  const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
    new Date().getDay()
  ];
  const upcomingClasses = timetable.filter((t) => t.dayOfWeek === todayName).slice(0, 3);
  const displayClasses = upcomingClasses.length > 0 ? upcomingClasses : timetable.slice(0, 3);

  // Active assignments
  const pendingAssignments = assignments.slice(0, 2);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Personalized Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-royal-950 text-white rounded-2xl p-6 sm:p-8 shadow-card border border-navy-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-royal-500/20 text-royal-300 text-xs font-semibold mb-2 border border-royal-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              100 Level Computer Science • 2026/2027 Session
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Welcome back, {user?.fullName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Matric No: <span className="font-mono font-bold text-white">{user?.matricNumber}</span> • Department of Computer Science
            </p>
          </div>

          {/* Payment Status Quick Action Card */}
          <div className="bg-navy-950/80 rounded-xl p-4 border border-navy-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-[280px]">
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                Departmental Notes Access
              </div>
              <PaymentStatusBadge status={user?.paymentStatus || 'UNPAID'} size="md" />
            </div>

            {!isApproved && (
              <button
                onClick={() => onNavigate('payment')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-royal-600 hover:bg-royal-500 text-white text-xs font-bold transition shadow-sm"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay / Verify ₦500</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Payment Reminder Alert if Unpaid */}
      {!isApproved && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm">Course Notes Access Required</div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Your account is currently {user?.paymentStatus === 'PENDING' ? 'pending verification' : 'unpaid'}. 
                {user?.paymentStatus === 'PENDING'
                  ? ' The Course Rep is verifying your OPay transaction reference. Notes will unlock once approved.'
                  : ' Complete your one-time ₦500 departmental transfer to unlock all seven course notes.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('payment')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl transition shadow-xs flex-shrink-0"
          >
            {user?.paymentStatus === 'PENDING' ? 'Check Status' : 'Pay ₦500 Now'}
          </button>
        </div>
      )}

      {/* Main Grid: Courses + Leadership & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 7 Courses Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Access to the 7 Courses */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-royal-600" />
                <h2 className="text-base font-bold text-navy-950">Your Seven 100L Courses</h2>
              </div>
              <button
                onClick={() => onNavigate('notes')}
                className="text-xs font-semibold text-royal-600 hover:text-royal-500 inline-flex items-center gap-1"
              >
                <span>View all notes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {courses.map((course) => {
                const courseNotesCount = notes.filter((n) => n.courseCode === course.code).length;
                return (
                  <div
                    key={course.code}
                    onClick={() => onNavigate('notes', course.code)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-royal-300 hover:bg-royal-50/30 cursor-pointer transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs px-2 py-0.5 rounded bg-royal-100 text-royal-800">
                          {course.code}
                        </span>
                        {!isApproved && (
                          <span title="Locked until ₦500 approved">
                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-navy-950 group-hover:text-royal-600 transition line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {course.lecturer}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{courseNotesCount} Note{courseNotesCount === 1 ? '' : 's'} available</span>
                      <span className="text-royal-600 font-semibold group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                        Read <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timetable / Upcoming Classes */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-navy-950">
                  {upcomingClasses.length > 0 ? "Today's Class Schedule" : 'Upcoming Lectures'}
                </h2>
              </div>
              <button
                onClick={() => onNavigate('timetable')}
                className="text-xs font-semibold text-royal-600 hover:text-royal-500 inline-flex items-center gap-1"
              >
                <span>Full timetable</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {displayClasses.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/60 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold text-center">
                      <div>{item.dayOfWeek.slice(0, 3)}</div>
                      <div className="text-[10px] font-normal">{item.startTime}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-navy-950">{item.courseCode}</span>
                        <span className="text-xs text-slate-700 font-medium truncate max-w-xs">{item.courseTitle}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-royal-500" />
                        <span>{item.venue}</span>
                        <span>•</span>
                        <span>{item.lecturer}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono bg-white px-2 py-1 rounded border border-slate-200 self-start sm:self-center">
                    {item.startTime} - {item.endTime}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Course Rep Card + Announcements + Tasks */}
        <div className="space-y-6">
          {/* Official Course Rep Card */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Course Leadership
            </div>
            <CourseRepCard
              rep={courseRep}
              onContactClick={() => onNavigate('complaints')}
            />
          </div>

          {/* Recent Announcements */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-royal-600" />
                <h3 className="font-bold text-xs text-navy-950">Departmental Notices</h3>
              </div>
            </div>

            <div className="space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-slate-900">{ann.title}</span>
                    {ann.priority === 'URGENT' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                        URGENT
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 line-clamp-3 leading-relaxed">{ann.content}</p>
                  <div className="mt-2 text-[10px] text-slate-400">
                    {ann.authorName} • {new Date(ann.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Assignments */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-xs text-navy-950">Continuous Assessment</h3>
              </div>
              <button
                onClick={() => onNavigate('assignments')}
                className="text-[11px] font-semibold text-royal-600 hover:text-royal-500"
              >
                All tasks
              </button>
            </div>

            <div className="space-y-2.5">
              {pendingAssignments.map((a) => (
                <div
                  key={a.id}
                  onClick={() => onNavigate('assignments')}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs cursor-pointer hover:bg-slate-100/60 transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-royal-700">{a.courseCode}</span>
                    <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Due {new Date(a.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="font-medium text-slate-900 line-clamp-1">{a.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
