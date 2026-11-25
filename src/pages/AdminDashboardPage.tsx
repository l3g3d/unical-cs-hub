import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { CourseRepCard } from '../components/common/CourseRepCard';
import { PaymentStatusBadge } from '../components/common/PaymentStatusBadge';
import { EmailService, EmailLogEntry } from '../lib/emailService';
import { getGeminiApiKey, saveGeminiApiKey } from '../lib/gemini';
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
  Mail,
  Send,
  KeyRound,
  Eye,
  Image as ImageIcon,
  Camera,
  CheckCircle2,
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
    payments,
    approvePayment,
    rejectPayment,
    setUserCourseAccess,
    complaints,
    replyComplaint,
    updateComplaintStatus,
    auditLogs,
  } = useData();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'payments' | 'notes' | 'timetable' | 'assignments' | 'students' | 'complaints' | 'rep' | 'audit' | 'email'
  >('overview');

  // Viewing full-size transfer proof receipt modal
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);

  // Gemini API Key state
  const [geminiKeyInput, setGeminiKeyInput] = useState(getGeminiApiKey());
  const [geminiKeySaved, setGeminiKeySaved] = useState(false);

  // Course Rep Photo upload error
  const [repPhotoFileError, setRepPhotoFileError] = useState<string | null>(null);

  // Email & OTP Dispatcher state
  const [emailConfig, setEmailConfig] = useState(EmailService.getConfig());
  const [apiKeyInput, setApiKeyInput] = useState(emailConfig.apiKey || '');
  const [emailLogs, setEmailLogs] = useState<EmailLogEntry[]>(EmailService.getLogs());
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);

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

  // Assignment creation form state
  const [assignCourse, setAssignCourse] = useState('COS101');
  const [assignTitle, setAssignTitle] = useState('');
  const [assignInstructions, setAssignInstructions] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assignMaxScore, setAssignMaxScore] = useState(10);
  const [assignSuccess, setAssignSuccess] = useState(false);

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

  const handleCreateAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim() || !assignInstructions.trim()) return;

    createAssignment({
      courseCode: assignCourse,
      title: assignTitle.trim(),
      instructions: assignInstructions.trim(),
      dueDate: assignDueDate.trim() || 'Next Lecture Session',
      maxScore: Number(assignMaxScore) || 10,
      createdBy: courseRep.fullName || 'Course Representative',
    });

    setAssignSuccess(true);
    setAssignTitle('');
    setAssignInstructions('');
    setAssignDueDate('');
    setTimeout(() => setAssignSuccess(false), 3000);
  };

  const handleRepPhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setRepPhotoFileError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setRepPhotoFileError('Image file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRepPhoto(reader.result as string);
      setRepPhotoFileError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveGeminiKey = (e: React.FormEvent) => {
    e.preventDefault();
    saveGeminiApiKey(geminiKeyInput.trim());
    setGeminiKeySaved(true);
    setTimeout(() => setGeminiKeySaved(false), 3000);
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

  const handleSendTestEmail = async () => {
    setTestEmailLoading(true);
    setTestEmailStatus(null);
    try {
      const testCode = Math.floor(100000 + Math.random() * 900000).toString();
      const res = await EmailService.dispatchOtpEmail({
        to: 'divineinyang636@gmail.com',
        fullName: 'Divine Christopher Inyang',
        type: 'TEST_EMAIL',
        code: testCode,
      });
      setEmailLogs(EmailService.getLogs());
      if (res.success) {
        setTestEmailStatus(`✅ Live test verification email dispatched to divineinyang636@gmail.com! (OTP: ${testCode})`);
      } else {
        setTestEmailStatus(`❌ Dispatch error: ${res.error}`);
      }
    } catch (e: any) {
      setTestEmailStatus(`❌ Error sending test email: ${e.message}`);
    } finally {
      setTestEmailLoading(false);
    }
  };

  const handleSaveEmailConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const newCfg = { ...emailConfig, apiKey: apiKeyInput.trim() };
    EmailService.saveConfig(newCfg);
    setEmailConfig(newCfg);
    setTestEmailStatus('✅ Email service settings saved successfully!');
    setTimeout(() => setTestEmailStatus(null), 4000);
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
          <span>Course Assignments ({assignments.length})</span>
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

        <button
          onClick={() => setActiveAdminTab('email')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeAdminTab === 'email' ? 'bg-royal-600 text-white' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email & OTP Dispatcher</span>
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
                    <th className="py-3 px-4">Proof Receipt</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
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
                        <td className="py-3 px-4">
                          {p.proofImageUrl ? (
                            <button
                              type="button"
                              onClick={() => setViewingReceiptUrl(p.proofImageUrl!)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-royal-50 hover:bg-royal-100 text-royal-700 font-semibold text-xs border border-royal-200 transition shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5 text-royal-600" />
                              <span>View Receipt</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">No image</span>
                          )}
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

      {/* TAB 5: COURSE ASSIGNMENTS */}
      {activeAdminTab === 'assignments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Assignment Form */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card h-fit">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <FileCheck2 className="w-5 h-5 text-royal-600" />
                <h3 className="text-base font-bold text-navy-950">Post New Course Assignment</h3>
              </div>

              {assignSuccess && (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Assignment published successfully! It is now visible to all students.</span>
                </div>
              )}

              <form onSubmit={handleCreateAssignmentSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Course</label>
                  <select
                    value={assignCourse}
                    onChange={(e) => setAssignCourse(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium"
                  >
                    {courses.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} - {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assignment Title / Topic</label>
                  <input
                    type="text"
                    value={assignTitle}
                    onChange={(e) => setAssignTitle(e.target.value)}
                    placeholder="e.g. Assignment 1: Logic Gates & Truth Tables"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Due Date / Time</label>
                    <input
                      type="text"
                      value={assignDueDate}
                      onChange={(e) => setAssignDueDate(e.target.value)}
                      placeholder="e.g. Monday, 10:00 AM"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Total Marks</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={assignMaxScore}
                      onChange={(e) => setAssignMaxScore(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Questions, Instructions & Physical Submission Details
                  </label>
                  <textarea
                    rows={4}
                    value={assignInstructions}
                    onChange={(e) => setAssignInstructions(e.target.value)}
                    placeholder="Enter assignment questions or instructions (e.g. 'Answer Questions 1 to 4 on foolscap paper. Submit physical hardcopy scripts to Course Rep Divine before Monday 10:00 AM lecture at Science Lecture Theatre.')..."
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-royal-600 hover:bg-royal-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Assignment to Students</span>
                </button>
              </form>
            </div>

            {/* Active Assignments List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-navy-950">Active Departmental Assignments ({assignments.length})</h3>
                  <p className="text-xs text-slate-500">Students view these tasks and submit physical scripts in class.</p>
                </div>
              </div>

              <div className="space-y-3">
                {assignments.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-400">
                    <FileCheck2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-medium">No course assignments posted yet.</p>
                  </div>
                ) : (
                  assignments.map((assign) => (
                    <div
                      key={assign.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="font-extrabold text-royal-800 bg-royal-50 border border-royal-200 px-2.5 py-0.5 rounded text-xs">
                              {assign.courseCode}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              Due: {assign.dueDate}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              {assign.maxScore} Marks
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-navy-950">{assign.title}</h4>
                        </div>

                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete assignment "${assign.title}"?`)) {
                              deleteAssignment(assign.id);
                            }
                          }}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition flex-shrink-0"
                          title="Delete Assignment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                        {assign.instructions}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Posted by: <strong className="text-slate-600">{assign.createdBy}</strong></span>
                        <span>Date: {new Date(assign.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
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
                  <th className="py-3 px-3 text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50 transition">
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
                    <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                      {st.role === 'admin' ? (
                        <span className="text-[10px] font-bold text-royal-700 bg-royal-50 px-2.5 py-1 rounded-full border border-royal-200">
                          Super Administrator
                        </span>
                      ) : (
                        <>
                          {st.paymentStatus !== 'APPROVED' ? (
                            <button
                              type="button"
                              onClick={() => setUserCourseAccess(st.id, 'APPROVED')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition"
                              title="Unlock all course notes for this student"
                            >
                              <Check className="w-3 h-3" />
                              <span>Grant Access</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setUserCourseAccess(st.id, 'UNPAID')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 font-semibold text-[11px] transition"
                              title="Lock course notes for this student"
                            >
                              <X className="w-3 h-3" />
                              <span>Revoke Access</span>
                            </button>
                          )}
                        </>
                      )}
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
                <label className="block font-semibold text-slate-700 mb-1">Course Representative Photograph</label>
                {repPhotoFileError && (
                  <div className="mb-2 p-2 rounded-lg bg-rose-50 text-rose-700 text-[11px] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{repPhotoFileError}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-14 h-14 rounded-xl bg-royal-600 overflow-hidden border border-slate-300 flex-shrink-0 shadow-xs">
                    {repPhoto ? (
                      <img src={repPhoto} alt="Rep Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <Camera className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-royal-600 hover:bg-royal-500 text-white font-semibold text-xs shadow-xs transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Official Photo from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleRepPhotoFileChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">Upload from your phone camera or computer storage (JPG, PNG, WEBP)</p>
                  </div>
                </div>
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

      {/* TAB 10: EMAIL & OTP DISPATCHER */}
      {activeAdminTab === 'email' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Email Configuration & Testing */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card space-y-5 h-fit">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-5 h-5 text-royal-600" />
                  <h3 className="text-base font-bold text-navy-950">Email Service Dispatcher</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Sends real 6-digit OTP verification codes to students during registration & password recovery.
                </p>
              </div>

              {testEmailStatus && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  testEmailStatus.startsWith('✅')
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}>
                  <span>{testEmailStatus}</span>
                </div>
              )}

              <div className="p-3.5 bg-royal-50 border border-royal-200 rounded-xl text-xs text-royal-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Netlify Serverless Dispatcher Active</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Endpoint: <code className="bg-white px-1.5 py-0.5 rounded border border-royal-200 font-mono text-[10px]">/.netlify/functions/send-email</code>
                </p>
              </div>

              {/* Quick Setup Guide to make emails drop immediately with Brevo */}
              <div className="p-3.5 bg-blue-50/90 border border-blue-200 rounded-xl text-xs space-y-2 text-blue-950">
                <div className="font-bold flex items-center gap-1.5 text-blue-950">
                  <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Activate Brevo for Instant OTP Delivery (300 free emails/day):</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-blue-900 leading-relaxed">
                  <li>
                    Open your Brevo API keys page:{' '}
                    <a
                      href="https://app.brevo.com/settings/keys/api"
                      target="_blank"
                      rel="noreferrer"
                      className="text-royal-600 underline font-bold"
                    >
                      app.brevo.com/settings/keys/api ↗
                    </a>
                  </li>
                  <li>
                    Click <strong>Generate a new API key</strong>, name it <strong>UNICAL CS HUB</strong>, and copy the key (starts with <code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono text-[10px]">xkeysib-...</code>).
                  </li>
                  <li>
                    Open your Netlify site settings:{' '}
                    <a
                      href="https://app.netlify.com/sites/unicalcshub/configuration/env"
                      target="_blank"
                      rel="noreferrer"
                      className="text-royal-600 underline font-bold"
                    >
                      Netlify Environment Variables ↗
                    </a>
                  </li>
                  <li>
                    Click <strong>Add a variable</strong> and enter:
                    <div className="font-mono text-[10px] bg-white p-2 rounded-lg border border-blue-200 mt-1 text-slate-900">
                      <strong>BREVO_API_KEY</strong> = xkeysib-...
                    </div>
                  </li>
                </ol>
                <p className="text-[10px] text-slate-600 italic">
                  💡 You can also paste your Brevo key in the form below and click "Save Email Settings".
                </p>
              </div>

              <form onSubmit={handleSaveEmailConfig} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Delivery Provider</label>
                  <select
                    value={emailConfig.provider}
                    onChange={(e: any) => setEmailConfig({ ...emailConfig, provider: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium"
                  >
                    <option value="serverless">Netlify Serverless Function (Primary)</option>
                    <option value="resend">Resend API (Official Resend SDK/REST)</option>
                    <option value="brevo">Brevo / Sendinblue (Transactional REST)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    API Key (Optional for Custom Provider)
                  </label>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="re_123... (Leave blank to use Netlify env vars)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Tip: You can set <code className="text-slate-600 font-bold">RESEND_API_KEY</code> in Netlify Environment Variables.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-3 rounded-xl text-xs transition"
                >
                  Save Email Settings
                </button>
              </form>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="font-bold text-slate-800 text-xs">Live Dispatch Verification Test</div>
                <p className="text-[11px] text-slate-500">
                  Send a live test verification email right now to your administrator address (<strong className="text-slate-700">divineinyang636@gmail.com</strong>):
                </p>
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={testEmailLoading}
                  className="w-full bg-royal-600 hover:bg-royal-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {testEmailLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Live Test Email to Divine</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Dispatched Logs Table */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-navy-950">Real-Time OTP Dispatch Logs</h3>
                    <p className="text-xs text-slate-500">All student verification codes dispatched from the portal.</p>
                  </div>
                  <span className="text-xs font-bold text-royal-700 bg-royal-50 border border-royal-200 px-2.5 py-1 rounded-xl">
                    {emailLogs.length} Events Logged
                  </span>
                </div>

                {emailLogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <Mail className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p>No student OTP emails have been dispatched yet.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      When students register or reset passwords, their dispatch logs will appear here live.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Recipient Email</th>
                          <th className="py-2.5 px-3">Event Type</th>
                          <th className="py-2.5 px-3">Verification OTP</th>
                          <th className="py-2.5 px-3">Provider</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {emailLogs.map((log) => (
                          <tr key={log.id}>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{log.to}</td>
                            <td className="py-2.5 px-3">
                              <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                                {log.type}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              {log.code ? (
                                <span className="font-mono text-xs font-bold text-royal-700 bg-royal-50 border border-royal-200 px-2 py-0.5 rounded tracking-wider">
                                  {log.code}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-mono text-[11px]">—</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 font-medium">{log.provider}</td>
                            <td className="py-2.5 px-3">
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px]">
                                <Check className="w-3 h-3" />
                                {log.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-400 font-mono text-[11px]">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gemini AI Assistant Configuration */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-royal-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
                    <span>Google Gemini AI Assistant Engine</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Connected
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Powers conversational uploads, timetable creation, and intelligent site configuration for the Admin.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenAi}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-royal-600 to-indigo-600 hover:from-royal-500 hover:to-indigo-500 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition"
              >
                <Bot className="w-4 h-4" />
                <span>Launch Assistant Window</span>
              </button>
            </div>

            {geminiKeySaved && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Gemini API Key saved and active for your admin session!</span>
              </div>
            )}

            <form onSubmit={handleSaveGeminiKey} className="space-y-3 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-xs">
                  Active Gemini API Key
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="password"
                    value={geminiKeyInput}
                    onChange={(e) => setGeminiKeyInput(e.target.value)}
                    placeholder="Enter or paste your Google Gemini API key..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-royal-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs shadow-xs transition whitespace-nowrap"
                  >
                    Save API Key
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Connected to Google Generative AI (Gemini 1.5 Flash). Enables hands-free note uploads, schedule changes, and portal controls.
                </p>
              </div>
            </form>
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

      {/* Admin Transfer Proof Lightbox Modal */}
      {viewingReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-fade-in border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-royal-600" />
                <h3 className="text-xs font-bold text-navy-950 uppercase tracking-wider">
                  Student Transfer Receipt Screenshot
                </h3>
              </div>
              <button
                onClick={() => setViewingReceiptUrl(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-900 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={viewingReceiptUrl}
                alt="Student Transfer Proof"
                className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-md"
              />
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[11px] text-slate-500">
                Confirm amount (₦500) and reference match OPay credit alert.
              </span>
              <button
                onClick={() => setViewingReceiptUrl(null)}
                className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs rounded-xl transition"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
