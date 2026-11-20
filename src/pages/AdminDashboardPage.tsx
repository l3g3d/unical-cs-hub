import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { CourseRepCard } from '../components/common/CourseRepCard';
import { PaymentStatusBadge } from '../components/common/PaymentStatusBadge';
import {
  Shield,
  CreditCard,
  BookOpen,
  Calendar,
  FileCheck2,
  Users,
  HelpCircle,
  Award,
  Activity,
  Bot,
  Plus,
  Trash2,
  Check,
  X,
  Search,
  Upload,
  Download,
  AlertTriangle,
  Sparkles,
  Database,
  RefreshCw,
} from 'lucide-react';

interface Props {
  onOpenAi: () => void;
}

export const AdminDashboardPage: React.FC<Props> = ({ onOpenAi }) => {
  const { user, registeredUsers } = useAuth();
  const {
    courses,
    courseRep,
    updateCourseRep,
    notes,
    uploadNote,
    deleteNote,
    timetable,
    addTimetableClass,
    deleteTimetableClass,
    venues,
    updateVenue,
    assignments,
    createAssignment,
    deleteAssignment,
    submissions,
    gradeSubmission,
    payments,
    approvePayment,
    rejectPayment,
    complaints,
    replyComplaint,
    updateComplaintStatus,
    auditLogs,
  } = useData();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'payments' | 'notes' | 'timetable' | 'assignments' | 'students' | 'complaints' | 'rep' | 'audit'
  >('overview');

  // Payments filter
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [rejectionModalId, setRejectionModalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Transaction reference not found in OPay statement.');

  // Student search
  const [studentSearch, setStudentSearch] = useState('');

  // Upload note form state
  const [noteCourse, setNoteCourse] = useState('COS101');
  const [noteLectureNum, setNoteLectureNum] = useState(3);
  const [noteTopic, setNoteTopic] = useState('');
  const [noteDesc, setNoteDesc] = useState('');
  const [noteFile, setNoteFile] = useState<File | null>(null);
  const [noteUploadedSuccess, setNoteUploadedSuccess] = useState(false);

  // Edit course rep form
  const [repName, setRepName] = useState(courseRep.fullName);
  const [repPhone, setRepPhone] = useState(courseRep.phone);
  const [repEmail, setRepEmail] = useState(courseRep.email);
  const [repPhoto, setRepPhoto] = useState(courseRep.photoUrl);
  const [repSaved, setRepSaved] = useState(false);

  // Stats calculation
  const totalStudents = registeredUsers.filter((u) => u.role === 'student').length;
  const approvedPayments = payments.filter((p) => p.status === 'APPROVED').length;
  const pendingPayments = payments.filter((p) => p.status === 'PENDING').length;
  const totalRevenue = approvedPayments * 500;
  const openComplaintsCount = complaints.filter((c) => c.status === 'OPEN').length;

  const filteredPayments = payments.filter((p) => {
    if (paymentFilter === 'ALL') return true;
    return p.status === paymentFilter;
  });

  const filteredStudents = registeredUsers.filter(
    (u) =>
      u.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      u.matricNumber.toLowerCase().includes(studentSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleUploadNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTopic.trim()) return;

    uploadNote({
      courseCode: noteCourse,
      lectureNumber: Number(noteLectureNum),
      topic: noteTopic.trim(),
      description: noteDesc.trim() || `Lecture ${noteLectureNum} notes for ${noteCourse}.`,
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileName: noteFile ? noteFile.name : `${noteCourse}_Lecture${noteLectureNum}_${noteTopic.replace(/\s+/g, '_')}.pdf`,
      fileSize: noteFile ? `${(noteFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.5 MB',
    });

    setNoteUploadedSuccess(true);
    setNoteTopic('');
    setNoteDesc('');
    setNoteFile(null);
    setTimeout(() => setNoteUploadedSuccess(false), 3000);
  };

  const handleSaveCourseRep = (e: React.FormEvent) => {
    e.preventDefault();
    updateCourseRep({
      fullName: repName.trim(),
      phone: repPhone.trim(),
      email: repEmail.trim(),
      photoUrl: repPhoto.trim(),
    });
    setRepSaved(true);
    setTimeout(() => setRepSaved(false), 3000);
  };

  const handleConfirmReject = (id: string) => {
    rejectPayment(id, rejectionReason);
    setRejectionModalId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-card border border-navy-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-royal-500/20 text-royal-300 text-xs font-semibold mb-2 border border-royal-400/30">
              <Shield className="w-3.5 h-3.5 text-royal-400" />
              Administrative Control Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Departmental Administrator Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Manage student approvals, course materials, weekly timetable, and continuous assessments on mobile or desktop.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAi}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-royal-600 to-indigo-600 hover:from-royal-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow transition group"
            >
              <Bot className="w-4 h-4 text-royal-200 group-hover:scale-110 transition" />
              <span>Launch AI Assistant</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm overflow-x-auto scrollbar-none flex gap-1">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeAdminTab === 'overview' ? 'bg-navy-900 text-white' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('payments')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition relative ${
            activeAdminTab === 'payments' ? 'bg-royal-600 text-white' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Verify Payments</span>
          {pendingPayments > 0 && (
            <span className="text-[10px] bg-amber-500 text-navy-950 px-1.5 py-0.2 rounded-full font-black">
              {pendingPayments}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('notes')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeAdminTab === 'notes' ? 'bg-navy-900 text-white' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Course Notes ({notes.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('timetable')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeAdminTab === 'timetable' ? 'bg-navy-900 text-white' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Timetable & Venues</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('assignments')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeAdminTab === 'assignments' ? 'bg-navy-900 text-white' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Submissions ({submissions.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('students')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeAdminTab === 'students' ? 'bg-navy-900 text-white' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Students ({totalStudents})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('complaints')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeAdminTab === 'complaints' ? 'bg-navy-900 text-white' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Complaints ({openComplaintsCount})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('rep')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeAdminTab === 'rep' ? 'bg-navy-900 text-white' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Course Rep Card</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('audit')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeAdminTab === 'audit' ? 'bg-navy-900 text-white' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Logs & Backup</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Total Students
              </div>
              <div className="text-2xl font-black text-navy-950">{totalStudents}</div>
              <div className="text-[11px] text-slate-500 mt-1">100 Level Computer Science</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Approved Access
              </div>
              <div className="text-2xl font-black text-emerald-600">{approvedPayments}</div>
              <div className="text-[11px] text-emerald-700 mt-1">₦{totalRevenue.toLocaleString()} Revenue</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Pending Verification
              </div>
              <div className="text-2xl font-black text-amber-600">{pendingPayments}</div>
              <div className="text-[11px] text-amber-700 mt-1">Awaiting OPay check</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Open Support Tickets
              </div>
              <div className="text-2xl font-black text-royal-600">{openComplaintsCount}</div>
              <div className="text-[11px] text-slate-500 mt-1">Customer complaints</div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-royal-50/70 border border-royal-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-navy-950 text-sm">Need to add a class or assignment quickly?</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Use your phone microphone or natural typing in the CS Hub AI Assistant.
              </p>
            </div>
            <button
              onClick={onOpenAi}
              className="px-4 py-2 bg-royal-600 hover:bg-royal-500 text-white font-semibold rounded-xl text-xs shadow-sm flex items-center gap-2 whitespace-nowrap"
            >
              <Bot className="w-4 h-4" />
              <span>Talk to AI Assistant</span>
            </button>
          </div>

          {/* Recent Audit Logs */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
            <h3 className="text-sm font-bold text-navy-950 mb-3">Recent Administrative Activity Logs</h3>
            <div className="space-y-2 text-xs">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-bold text-royal-700">{log.action.replace(/_/g, ' ')}</span>
                    <p className="text-slate-600 mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VERIFY PAYMENTS */}
      {activeAdminTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-navy-950">₦500 OPay Transfer Verification Hub</h2>
              <p className="text-xs text-slate-500">
                Check your OPay mobile app statement, verify the credit alert, then click APPROVE.
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex gap-1.5 text-xs">
              {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setPaymentFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition ${
                    paymentFilter === filter
                      ? 'bg-royal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Matric No</th>
                    <th className="py-3 px-4">Sender Name</th>
                    <th className="py-3 px-4">Bank</th>
                    <th className="py-3 px-4">OPay Ref / Session ID</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No payments found for filter "{paymentFilter}".
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-bold text-slate-900">{p.studentName}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{p.matricNumber}</td>
                        <td className="py-3 px-4 text-slate-700">{p.senderName}</td>
                        <td className="py-3 px-4 font-medium text-slate-800">{p.bankName}</td>
                        <td className="py-3 px-4 font-mono font-bold text-royal-700 select-all">
                          {p.transactionReference}
                        </td>
                        <td className="py-3 px-4 font-black text-navy-950">₦{p.amount}</td>
                        <td className="py-3 px-4">
                          <PaymentStatusBadge status={p.status} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {p.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => approvePayment(p.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                                title="Confirm credit and approve notes access"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => setRejectionModalId(p.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 font-semibold text-xs"
                                title="Reject payment"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          ) : p.status === 'REJECTED' ? (
                            <button
                              onClick={() => approvePayment(p.id)}
                              className="px-2.5 py-1 text-xs text-royal-600 font-semibold hover:underline"
                            >
                              Re-Approve
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Approved by {p.approvedBy || 'Admin'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE COURSE NOTES */}
      {activeAdminTab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Form */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
            <h3 className="text-base font-bold text-navy-950 mb-1">Upload Lecture Note PDF</h3>
            <p className="text-xs text-slate-500 mb-4">
              Add lecture materials directly from your mobile phone or laptop.
            </p>

            {noteUploadedSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Note uploaded successfully!</span>
              </div>
            )}

            <form onSubmit={handleUploadNoteSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Course</label>
                <select
                  value={noteCourse}
                  onChange={(e) => setNoteCourse(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
                >
                  {courses.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lecture Number</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={noteLectureNum}
                  onChange={(e) => setNoteLectureNum(Number(e.target.value))}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Topic / Title</label>
                <input
                  type="text"
                  value={noteTopic}
                  onChange={(e) => setNoteTopic(e.target.value)}
                  placeholder="e.g. Logic Gates and Truth Tables"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brief Description</label>
                <textarea
                  rows={3}
                  value={noteDesc}
                  onChange={(e) => setNoteDesc(e.target.value)}
                  placeholder="Summary of topics covered in this lecture..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select PDF File</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 text-center cursor-pointer relative hover:bg-slate-50">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNoteFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <span className="text-slate-800 font-medium block">
                    {noteFile ? noteFile.name : 'Choose PDF document'}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-royal-600 hover:bg-royal-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Course Material</span>
              </button>
            </form>
          </div>

          {/* Notes List */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-base font-bold text-navy-950">Existing Course Notes ({notes.length})</h3>
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
              {notes.map((n) => (
                <div
                  key={n.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-royal-700 bg-royal-50 px-2 py-0.5 rounded border border-royal-200">
                        {n.courseCode}
                      </span>
                      <span className="font-semibold text-slate-800">Lecture {n.lectureNumber}</span>
                      <span className="text-slate-400 font-mono text-[10px]">({n.fileSize})</span>
                    </div>
                    <div className="font-bold text-slate-900">{n.topic}</div>
                    <p className="text-slate-500 line-clamp-1">{n.description}</p>
                  </div>

                  <button
                    onClick={() => deleteNote(n.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition flex-shrink-0"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TIMETABLE & VENUES */}
      {activeAdminTab === 'timetable' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
            <h3 className="text-base font-bold text-navy-950 mb-3">Weekly Timetable Classes</h3>
            <div className="space-y-2 text-xs">
              {timetable.map((tt) => (
                <div
                  key={tt.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-royal-800 w-20">{tt.dayOfWeek}</span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                      {tt.startTime} - {tt.endTime}
                    </span>
                    <span className="font-bold text-slate-900">{tt.courseCode}</span>
                    <span className="text-slate-600 hidden sm:inline">Venue: {tt.venue}</span>
                  </div>
                  <button
                    onClick={() => deleteTimetableClass(tt.id)}
                    className="text-rose-600 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
            <h3 className="text-base font-bold text-navy-950 mb-3">Lecture Venues & Notices</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {venues.map((v) => (
                <div key={v.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-royal-700">{v.courseCode}</span>
                    {v.isChanged && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                        Relocated
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-slate-900">{v.venueName}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{v.dayTime}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ASSIGNMENTS & SUBMISSIONS */}
      {activeAdminTab === 'assignments' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card space-y-4">
          <h3 className="text-base font-bold text-navy-950">Student Assignment Submissions ({submissions.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Matric No</th>
                  <th className="py-2.5 px-3">Assignment ID</th>
                  <th className="py-2.5 px-3">File</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">
                      No student submissions yet.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.id}>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{sub.studentName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{sub.matricNumber}</td>
                      <td className="py-2.5 px-3 text-slate-700">{sub.assignmentId}</td>
                      <td className="py-2.5 px-3 text-royal-700 font-medium">{sub.fileName}</td>
                      <td className="py-2.5 px-3 text-slate-500">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-700">
                        {sub.grade !== undefined ? `${sub.grade} marks` : 'Ungraded'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <a
                          href={sub.fileUrl}
                          download={sub.fileName}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-royal-600 font-bold hover:underline"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Get File</span>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: STUDENTS */}
      {activeAdminTab === 'students' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-navy-950">Registered Student Accounts ({totalStudents})</h3>
              <p className="text-xs text-slate-500">Permanently saved accounts with their ₦500 payment status.</p>
            </div>

            <div className="w-full sm:w-64 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search students..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Full Name</th>
                  <th className="py-3 px-3">Matric Number</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Payment Status</th>
                  <th className="py-3 px-3">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st) => (
                  <tr key={st.id}>
                    <td className="py-3 px-3 font-bold text-slate-900">{st.fullName}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{st.matricNumber}</td>
                    <td className="py-3 px-3 text-slate-700">{st.email}</td>
                    <td className="py-3 px-3 uppercase text-[10px] font-bold text-slate-500">{st.role}</td>
                    <td className="py-3 px-3">
                      <PaymentStatusBadge status={st.paymentStatus} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(st.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: COMPLAINTS */}
      {activeAdminTab === 'complaints' && (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-navy-950">Student Complaints & Customer Support</h3>
          {complaints.map((c) => (
            <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-royal-700">{c.category}</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">{c.subject}</h4>
                  <div className="text-[11px] text-slate-500">
                    From: <strong>{c.studentName}</strong> ({c.matricNumber})
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <p className="bg-slate-50 p-3 rounded-xl text-slate-700">{c.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 8: COURSE REPRESENTATIVE SETTINGS */}
      {activeAdminTab === 'rep' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
            <h3 className="text-base font-bold text-navy-950 mb-1">Update Course Representative Details</h3>
            <p className="text-xs text-slate-500 mb-4">
              Changes made here immediately update the Course Rep card across all student dashboards.
            </p>

            {repSaved && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Course Representative details saved!</span>
              </div>
            )}

            <form onSubmit={handleSaveCourseRep} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={repName}
                  onChange={(e) => setRepName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={repPhone}
                  onChange={(e) => setRepPhone(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={repEmail}
                  onChange={(e) => setRepEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Photograph Image URL</label>
                <input
                  type="url"
                  value={repPhoto}
                  onChange={(e) => setRepPhoto(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-royal-600 hover:bg-royal-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-sm transition"
              >
                Save Representative Info
              </button>
            </form>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Live Preview</div>
            <CourseRepCard rep={courseRep} />
          </div>
        </div>
      )}

      {/* TAB 9: LOGS & BACKUP */}
      {activeAdminTab === 'audit' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-navy-950">Administrative Audit Logs & Backups</h3>
            <button
              onClick={() => {
                const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(localStorage));
                const dlAnchor = document.createElement('a');
                dlAnchor.setAttribute('href', dataStr);
                dlAnchor.setAttribute('download', 'unical_cs_hub_backup.json');
                dlAnchor.click();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          <div className="space-y-2 text-xs max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3">
                <div>
                  <span className="font-bold text-royal-700">{log.adminName}</span>
                  <span className="text-slate-400 mx-1.5">•</span>
                  <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold">
                    {log.action}
                  </span>
                  <p className="text-slate-600 mt-1">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 text-xs">
            <h3 className="text-base font-bold text-navy-950 mb-1">Reject Payment Submission</h3>
            <p className="text-slate-500 mb-3">Provide a clear reason so the student can rectify their transfer.</p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectionModalId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmReject(rejectionModalId)}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
