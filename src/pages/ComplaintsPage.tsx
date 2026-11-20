import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { ComplaintCategory } from '../types';
import {
  HelpCircle,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

const CATEGORIES: ComplaintCategory[] = [
  'Payment problems',
  'Missing notes',
  'Timetable errors',
  'Assignment problems',
  'Account problems',
  'Other academic issues',
];

export const ComplaintsPage: React.FC = () => {
  const { user } = useAuth();
  const { complaints, submitComplaint, replyComplaint, updateComplaintStatus } = useData();

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Payment problems');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Admin reply state
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  // Relevant complaints: own complaints for student, all for admin
  const relevantComplaints =
    user?.role === 'admin'
      ? complaints
      : complaints.filter((c) => c.studentId === user?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim() || !user) return;

    setIsSubmitting(true);
    setTimeout(() => {
      submitComplaint({
        studentId: user.id,
        studentName: user.fullName,
        matricNumber: user.matricNumber,
        subject: subject.trim(),
        category,
        message: message.trim(),
      });

      setIsSubmitting(false);
      setSuccess(true);
      setSubject('');
      setMessage('');
      setTimeout(() => setSuccess(false), 4000);
    }, 400);
  };

  const handleAdminReply = (complaintId: string) => {
    const text = replyTextMap[complaintId]?.trim();
    if (!text) return;
    replyComplaint(complaintId, text);
    setReplyTextMap((prev) => ({ ...prev, [complaintId]: '' }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-royal-950 text-white rounded-2xl p-6 sm:p-8 shadow-card border border-navy-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-royal-500/20 text-royal-300 text-xs font-semibold mb-2 border border-royal-400/30">
          <HelpCircle className="w-3.5 h-3.5" />
          Academic Support & Resolution Desk
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Helpdesk & Departmental Customer Service
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Have an issue with your ₦500 payment verification, lecture notes, or timetable? Message the Course Rep directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Submit Form (Visible to Students) */}
        {user?.role === 'student' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
            <h2 className="text-base font-bold text-navy-950 mb-1">Submit Academic Complaint</h2>
            <p className="text-xs text-slate-500 mb-4">
              Your inquiry will be logged directly into the Course Representative's admin dashboard.
            </p>

            {success && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Ticket submitted! The Course Rep will review and respond.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Paid ₦500 via OPay but notes still locked"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Message</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide full details including bank transferred from or course affected..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-royal-600 hover:bg-royal-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Sending Ticket...' : 'Submit to Course Rep'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Right 2 Cols: Complaint History & Responses */}
        <div className={user?.role === 'student' ? 'lg:col-span-2 space-y-4' : 'lg:col-span-3 space-y-4'}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-950">
              {user?.role === 'admin'
                ? `All Departmental Tickets (${complaints.length})`
                : 'My Ticket History'}
            </h2>
          </div>

          {relevantComplaints.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No support tickets found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Any academic or payment inquiries you submit will appear here with direct replies.
              </p>
            </div>
          ) : (
            relevantComplaints.map((comp) => (
              <div
                key={comp.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs bg-royal-100 text-royal-800 px-2 py-0.5 rounded">
                        {comp.category}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">
                        {new Date(comp.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-navy-950">{comp.subject}</h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Submitted by: <strong className="text-slate-800">{comp.studentName}</strong> ({comp.matricNumber})
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        comp.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : comp.status === 'IN_PROGRESS'
                          ? 'bg-royal-100 text-royal-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {comp.status === 'RESOLVED'
                        ? 'Resolved'
                        : comp.status === 'IN_PROGRESS'
                        ? 'In Progress'
                        : 'Open Ticket'}
                    </span>

                    {user?.role === 'admin' && (
                      <select
                        value={comp.status}
                        onChange={(e) =>
                          updateComplaintStatus(
                            comp.id,
                            e.target.value as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
                          )
                        }
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1"
                      >
                        <option value="OPEN">Mark Open</option>
                        <option value="IN_PROGRESS">Mark In Progress</option>
                        <option value="RESOLVED">Mark Resolved</option>
                      </select>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {comp.message}
                </p>

                {/* Responses Thread */}
                {comp.responses && comp.responses.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Official Responses ({comp.responses.length})
                    </div>
                    {comp.responses.map((resp) => (
                      <div
                        key={resp.id}
                        className="p-3 rounded-xl bg-royal-50/70 border border-royal-100 text-xs"
                      >
                        <div className="flex items-center justify-between text-[11px] font-semibold text-royal-900 mb-1">
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-royal-600" />
                            {resp.responderName} ({resp.responderRole})
                          </span>
                          <span className="text-slate-400 font-normal">
                            {new Date(resp.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{resp.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Admin Reply Box */}
                {user?.role === 'admin' && (
                  <div className="pt-3 border-t border-slate-100 flex gap-2">
                    <input
                      type="text"
                      value={replyTextMap[comp.id] || ''}
                      onChange={(e) =>
                        setReplyTextMap((prev) => ({ ...prev, [comp.id]: e.target.value }))
                      }
                      placeholder="Type official reply to student..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAdminReply(comp.id);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAdminReply(comp.id)}
                      className="px-4 py-2 bg-royal-600 hover:bg-royal-500 text-white rounded-xl text-xs font-semibold shadow-xs"
                    >
                      Reply
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
