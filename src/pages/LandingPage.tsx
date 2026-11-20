import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { CourseRepCard } from '../components/common/CourseRepCard';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  MapPin,
  FileCheck2,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<Props> = ({ onGetStarted, onLogin }) => {
  const { courseRep, courses } = useData();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Banner */}
      <div className="bg-navy-950 text-royal-200 py-2 px-4 text-center text-xs font-medium border-b border-navy-800 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Official 100 Level Academic Hub • Department of Computer Science • University of Calabar</span>
      </div>

      {/* Hero Navigation */}
      <nav className="bg-navy-900 border-b border-navy-800 text-white px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-royal-600 flex items-center justify-center text-white shadow-glow">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-tight">UNICAL CS HUB</h1>
            <p className="text-[11px] text-slate-300">100 Level Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white transition"
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-royal-600 hover:bg-royal-500 text-white transition shadow-sm"
          >
            Create Account
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-navy-900 via-navy-850 to-navy-900 text-white py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-royal-500/20 text-royal-300 text-xs font-semibold mb-6 border border-royal-400/30">
            <ShieldCheck className="w-3.5 h-3.5 text-royal-400" />
            2026/2027 First Semester Academic Portal
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Academic Excellence for <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-royal-400 to-blue-200">
              UNICAL Computer Science Freshers
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Access your 7 initial departmental course notes, weekly class schedules, lecture venue updates, and assignment submissions all in one unified, mobile-first academic platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-royal-600 hover:bg-royal-500 text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onLogin}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 font-semibold text-sm border border-navy-700 transition"
            >
              Sign In to Your Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h3 className="text-2xl font-bold text-navy-950 mb-2">Designed Strictly for 100L Needs</h3>
          <p className="text-xs sm:text-sm text-slate-600">
            No distractions, no ads, no marketplaces. Built for maximum speed and zero friction on mobile data.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card hover:-translate-y-1 transition">
            <div className="w-10 h-10 rounded-xl bg-royal-50 text-royal-600 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-navy-950 mb-1">7 Dedicated Courses</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Curated lecture notes, syllabus, and PDF downloads for COS101, CSC181, GST111, MTH101, PHY101, PHY107, and STA111.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card hover:-translate-y-1 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-navy-950 mb-1">Weekly Timetable</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time synchronized class schedule from Monday to Friday with exact lecture periods and lecturers.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card hover:-translate-y-1 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-navy-950 mb-1">Lecture Venues</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Never miss a lecture hall again. Immediate alert highlights when classes move between SLT, Labs, or Science complexes.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card hover:-translate-y-1 transition">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-navy-950 mb-1">Assignment Hub</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Directly submit your assignments (PDF/DOCX) before deadlines and review grades and lecturer feedback.
            </p>
          </div>
        </div>

        {/* The 7 Courses Overview */}
        <div className="bg-navy-950 rounded-2xl p-6 sm:p-8 text-white mb-12 border border-navy-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold text-royal-400 uppercase tracking-wider">Departmental Curriculum</span>
              <h4 className="text-xl sm:text-2xl font-bold text-white">Your Seven First Semester Courses</h4>
            </div>
            <div className="text-xs text-slate-400">
              Total 16 Credit Units
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {courses.map((course) => (
              <div
                key={course.code}
                className="bg-navy-900/80 p-3.5 rounded-xl border border-navy-800 flex items-start gap-3"
              >
                <span className="px-2 py-1 rounded bg-royal-600/30 text-royal-300 font-bold text-xs border border-royal-500/30">
                  {course.code}
                </span>
                <div className="overflow-hidden">
                  <div className="font-semibold text-xs text-white truncate">{course.title}</div>
                  <div className="text-[11px] text-slate-400">{course.lecturer} • {course.creditUnits} Units</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course Representative Section */}
        <div className="max-w-3xl mx-auto mb-14">
          <div className="text-center mb-4">
            <span className="text-xs font-bold text-royal-600 uppercase tracking-wider">Department Leadership</span>
            <h4 className="text-xl font-bold text-navy-950">Meet Your Course Representative</h4>
          </div>
          <CourseRepCard rep={courseRep} />
        </div>

        {/* ₦500 Access Fee Notice */}
        <div className="bg-royal-50 border border-royal-200 rounded-2xl p-6 sm:p-8 text-center max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-royal-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <CreditCard className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-navy-950 mb-1">One-Time Departmental Access Fee</h4>
          <div className="text-2xl font-black text-royal-700 mb-2">₦500</div>
          <p className="text-xs text-slate-600 mb-4 max-w-md mx-auto leading-relaxed">
            Bank Transfer to OPay (Divine Christopher Inyang). Access to all 7 course notes and downloadable lecture materials unlocks permanently upon manual admin verification.
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Server-side protected access</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 text-slate-400 py-6 px-4 text-center text-xs border-t border-navy-800">
        <p className="font-semibold text-white">UNICAL CS HUB — Department of Computer Science</p>
        <p className="text-[11px] text-slate-500 mt-1">University of Calabar, Nigeria • 100 Level Academic Platform</p>
      </footer>
    </div>
  );
};
