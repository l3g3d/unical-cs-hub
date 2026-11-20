import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { CourseNote } from '../types';
import { PdfViewerModal } from '../components/common/PdfViewerModal';
import {
  BookOpen,
  Lock,
  Download,
  Eye,
  FileText,
  Calendar,
  CreditCard,
  Search,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  initialCourseCode?: string;
  onNavigateToPayment: () => void;
}

export const CourseNotesPage: React.FC<Props> = ({
  initialCourseCode,
  onNavigateToPayment,
}) => {
  const { user } = useAuth();
  const { courses, notes } = useData();

  const [selectedCourse, setSelectedCourse] = useState<string>(
    initialCourseCode || 'COS101'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activePdfNote, setActivePdfNote] = useState<CourseNote | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Security check: Only approved students or admins can access lecture files
  const canAccess = user?.role === 'admin' || user?.paymentStatus === 'APPROVED';

  const currentCourse = courses.find((c) => c.code === selectedCourse) || courses[0];

  const courseNotes = notes
    .filter((n) => n.courseCode === selectedCourse)
    .filter(
      (n) =>
        n.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.lectureNumber - b.lectureNumber);

  const handleOpenPdf = (note: CourseNote) => {
    setActivePdfNote(note);
    setIsPdfModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-royal-950 text-white rounded-2xl p-6 sm:p-8 shadow-card border border-navy-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-royal-500/20 text-royal-300 text-xs font-semibold mb-2 border border-royal-400/30">
              <BookOpen className="w-3.5 h-3.5" />
              Departmental Course Repository
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              100 Level Lecture Notes & Materials
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Curated lecture documents, practical manuals and supplementary materials for the 7 courses
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canAccess ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Full Access Unlocked</span>
              </span>
            ) : (
              <button
                onClick={onNavigateToPayment}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs transition shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Unlock for ₦500</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Course Selector Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm overflow-x-auto scrollbar-none flex gap-1.5">
        {courses.map((c) => {
          const isSelected = c.code === selectedCourse;
          const count = notes.filter((n) => n.courseCode === c.code).length;
          return (
            <button
              key={c.code}
              onClick={() => setSelectedCourse(c.code)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                isSelected
                  ? 'bg-royal-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{c.code}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-royal-700 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Course Overview Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-royal-600 bg-royal-50 px-2 py-0.5 rounded border border-royal-200">
              {currentCourse.code}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">{currentCourse.creditUnits} Credit Units</span>
          </div>
          <h2 className="text-xl font-bold text-navy-950">{currentCourse.title}</h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">{currentCourse.description}</p>
          <div className="text-xs text-slate-500 mt-2">
            Lecturer in Charge: <strong className="text-slate-800">{currentCourse.lecturer}</strong>
          </div>
        </div>

        {/* Search Notes Filter */}
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${currentCourse.code} notes...`}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500 transition"
          />
        </div>
      </div>

      {/* Payment Lock Alert if Not Approved */}
      {!canAccess && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-6 text-amber-950 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-amber-950">
                Notes Download & Reading Protected
              </h3>
              <p className="text-xs text-amber-900 mt-1 max-w-xl leading-relaxed">
                Lecture notes are locked until your ₦500 departmental dues payment is verified by the Course Rep. 
                Transfer ₦500 to OPay (Divine Christopher Inyang: 08139651907) and submit your transaction reference.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToPayment}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-royal-600 hover:bg-royal-500 text-white font-bold text-xs shadow-sm transition whitespace-nowrap flex items-center justify-center gap-1.5"
          >
            <CreditCard className="w-4 h-4" />
            <span>Submit Payment (₦500)</span>
          </button>
        </div>
      )}

      {/* Lecture Notes List */}
      <div className="space-y-4">
        {courseNotes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No lecture notes uploaded yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              The course representative will upload lectures as classes proceed throughout the semester.
            </p>
          </div>
        ) : (
          courseNotes.map((note) => (
            <div
              key={note.id}
              className={`bg-white rounded-2xl p-5 border transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
                canAccess ? 'border-slate-200 hover:border-royal-300' : 'border-slate-200 opacity-90'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-royal-50 border border-royal-100 flex flex-col items-center justify-center text-royal-700 flex-shrink-0">
                  <span className="text-[10px] uppercase font-bold text-royal-500">Lec</span>
                  <span className="text-lg font-black leading-none">{note.lectureNumber}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-royal-700">{note.courseCode}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(note.uploadDate).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-[11px] font-mono text-slate-500">{note.fileSize}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-navy-950 mb-1">
                    {note.topic}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl leading-relaxed">
                    {note.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0 pt-2 md:pt-0">
                {canAccess ? (
                  <>
                    <button
                      onClick={() => handleOpenPdf(note)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-royal-50 hover:text-royal-600 text-slate-700 font-semibold text-xs transition"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Read Online</span>
                    </button>
                    <a
                      href={note.fileUrl}
                      download={note.fileName}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-royal-600 hover:bg-royal-500 text-white font-semibold text-xs transition shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </a>
                  </>
                ) : (
                  <button
                    onClick={() => handleOpenPdf(note)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-amber-800 font-semibold text-xs transition"
                  >
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span>Locked (₦500)</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* In-browser PDF Reader Dialog */}
      <PdfViewerModal
        note={activePdfNote}
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        canAccess={canAccess}
        onTriggerPayment={onNavigateToPayment}
      />
    </div>
  );
};
