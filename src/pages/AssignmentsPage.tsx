import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Assignment, AssignmentSubmission } from '../types';
import {
  FileCheck2,
  Calendar,
  Clock,
  Upload,
  CheckCircle2,
  FileText,
  AlertCircle,
  Plus,
  Trash2,
  Download,
  Award,
} from 'lucide-react';

export const AssignmentsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    assignments,
    submissions,
    submitAssignment,
    createAssignment,
    deleteAssignment,
    gradeSubmission,
    courses,
  } = useData();

  const [activeTab, setActiveTab] = useState<'available' | 'submissions'>('available');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // Student submission form state
  const [remarks, setRemarks] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Admin create assignment modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState('COS101');
  const [newTitle, setNewTitle] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newMaxScore, setNewMaxScore] = useState(20);

  // Admin grading
  const [gradingSubId, setGradingSubId] = useState<string | null>(null);
  const [gradeScore, setGradeScore] = useState(18);
  const [gradeFeedback, setGradeFeedback] = useState('Well presented calculations.');

  // Student submissions list (only own submissions if student, all submissions if admin)
  const relevantSubmissions =
    user?.role === 'admin'
      ? submissions
      : submissions.filter((s) => s.studentId === user?.id);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !user) return;

    setIsSubmitting(true);
    setTimeout(() => {
      submitAssignment({
        assignmentId: selectedAssignment.id,
        studentId: user.id,
        studentName: user.fullName,
        matricNumber: user.matricNumber,
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: selectedFile ? selectedFile.name : `${user.matricNumber}_${selectedAssignment.courseCode}_Assignment.pdf`,
        fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.2 MB',
        remarks: remarks.trim()
      });

      setIsSubmitting(false);
      setSubmitSuccess(true);
      setSelectedFile(null);
      setRemarks('');
      setTimeout(() => setSubmitSuccess(false), 4000);
    }, 600);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newInstructions.trim() || !newDueDate) return;

    createAssignment({
      courseCode: newCourse,
      title: newTitle.trim(),
      instructions: newInstructions.trim(),
      dueDate: newDueDate,
      maxScore: Number(newMaxScore),
      createdBy: user?.fullName || 'Course Rep'
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewInstructions('');
  };

  const handleSaveGrade = (submissionId: string) => {
    gradeSubmission(submissionId, Number(gradeScore), gradeFeedback.trim());
    setGradingSubId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-royal-950 text-white rounded-2xl p-6 sm:p-8 shadow-card border border-navy-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-royal-500/20 text-royal-300 text-xs font-semibold mb-2 border border-royal-400/30">
              <FileCheck2 className="w-3.5 h-3.5" />
              Continuous Assessment
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Assignment Submission Centre
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Submit assignments in PDF / DOCX format and track grading feedback.
            </p>
          </div>

          {user?.role === 'admin' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-royal-600 hover:bg-royal-500 text-white font-bold text-xs shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Assignment</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'available'
              ? 'bg-royal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Available Assignments ({assignments.length})
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'submissions'
              ? 'bg-royal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {user?.role === 'admin'
            ? `All Student Submissions (${submissions.length})`
            : `My Submissions (${relevantSubmissions.length})`}
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'available' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assignment list */}
          <div className="lg:col-span-2 space-y-4">
            {assignments.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800">No active assignments</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Check back later as continuous assessments are assigned by course lecturers.
                </p>
              </div>
            ) : (
              assignments.map((assign) => {
                const isSelected = selectedAssignment?.id === assign.id;
                const hasSubmitted = submissions.some(
                  (s) => s.assignmentId === assign.id && s.studentId === user?.id
                );

                return (
                  <div
                    key={assign.id}
                    onClick={() => setSelectedAssignment(assign)}
                    className={`bg-white rounded-2xl p-5 border cursor-pointer transition shadow-card flex flex-col justify-between ${
                      isSelected
                        ? 'border-royal-500 ring-2 ring-royal-200/60'
                        : 'border-slate-200 hover:border-royal-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs bg-royal-100 text-royal-800 px-2.5 py-0.5 rounded">
                          {assign.courseCode}
                        </span>
                        <div className="flex items-center gap-2">
                          {hasSubmitted && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Submitted
                            </span>
                          )}
                          <span className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Due {new Date(assign.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-navy-950 mb-2">{assign.title}</h3>
                      <p className="text-xs text-slate-600 whitespace-pre-line line-clamp-3 mb-3 leading-relaxed">
                        {assign.instructions}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Max Score: <strong>{assign.maxScore} marks</strong></span>
                      <span className="text-royal-600 font-semibold">
                        {isSelected ? 'Selected' : 'Click to submit solution →'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Submission Panel on the right */}
          <div className="space-y-4">
            {selectedAssignment ? (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
                <h3 className="text-sm font-bold text-navy-950 mb-1">
                  Submit for {selectedAssignment.courseCode}
                </h3>
                <p className="text-xs text-slate-500 mb-4 truncate">{selectedAssignment.title}</p>

                {submitSuccess && (
                  <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Assignment submitted successfully!</span>
                  </div>
                )}

                <form onSubmit={handleStudentSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Upload Document (PDF or DOCX)
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition cursor-pointer relative">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <div className="font-semibold text-slate-800">
                        {selectedFile ? selectedFile.name : 'Tap to select assignment file'}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">PDF or Word files accepted</p>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Student Remarks / Comments (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Add any specific notes for the course lecturer or rep..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-royal-600 hover:bg-royal-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'Uploading...' : 'Confirm & Submit Assignment'}</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center text-xs text-slate-500">
                Select an assignment from the list to view full instructions and submit your work.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Submissions View */
        <div className="space-y-3">
          {relevantSubmissions.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No submissions recorded</h3>
              <p className="text-xs text-slate-500 mt-1">
                Completed submissions will be listed here with timestamps and grading marks.
              </p>
            </div>
          ) : (
            relevantSubmissions.map((sub) => {
              const assign = assignments.find((a) => a.id === sub.assignmentId);
              const isGrading = gradingSubId === sub.id;

              return (
                <div
                  key={sub.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs bg-royal-100 text-royal-800 px-2.5 py-0.5 rounded">
                        {assign?.courseCode || 'Course'}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">{sub.studentName}</span>
                      <span className="text-xs text-slate-400">({sub.matricNumber})</span>
                    </div>

                    <h4 className="text-sm font-bold text-navy-950">{assign?.title || 'Assignment'}</h4>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>File: <strong>{sub.fileName}</strong> ({sub.fileSize})</span>
                      <span>•</span>
                      <span>Submitted: {new Date(sub.submittedAt).toLocaleString()}</span>
                    </div>

                    {sub.remarks && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mt-2 max-w-lg italic">
                        "{sub.remarks}"
                      </p>
                    )}

                    {sub.grade !== undefined && (
                      <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 border border-emerald-200">
                        <Award className="w-3.5 h-3.5" />
                        <span>Score: {sub.grade} / {assign?.maxScore || 20}</span>
                        {sub.feedback && <span className="font-normal text-slate-600 ml-2">({sub.feedback})</span>}
                      </div>
                    )}
                  </div>

                  {/* Right Actions: Download & Admin Grading */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <a
                      href={sub.fileUrl}
                      download={sub.fileName}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>

                    {user?.role === 'admin' && (
                      <button
                        onClick={() => setGradingSubId(isGrading ? null : sub.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-royal-600 text-white text-xs font-semibold shadow-xs"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{isGrading ? 'Close' : 'Grade'}</span>
                      </button>
                    )}
                  </div>

                  {/* Grading panel for admin */}
                  {isGrading && user?.role === 'admin' && (
                    <div className="w-full mt-3 pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-xl flex flex-col sm:flex-row items-center gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <label className="font-semibold text-slate-700">Score:</label>
                        <input
                          type="number"
                          value={gradeScore}
                          onChange={(e) => setGradeScore(Number(e.target.value))}
                          className="w-20 bg-white border border-slate-300 rounded-lg p-1.5 text-center font-bold"
                        />
                      </div>
                      <div className="flex-1 w-full">
                        <input
                          type="text"
                          value={gradeFeedback}
                          onChange={(e) => setGradeFeedback(e.target.value)}
                          placeholder="Lecturer feedback..."
                          className="w-full bg-white border border-slate-300 rounded-lg p-1.5"
                        />
                      </div>
                      <button
                        onClick={() => handleSaveGrade(sub.id)}
                        className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-lg"
                      >
                        Save Score
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Admin Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-navy-950 mb-3">Create New Course Assignment</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Code</label>
                <select
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
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
                <label className="block font-semibold text-slate-700 mb-1">Assignment Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Continuous Assessment 1: Measures of Dispersion"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instructions</label>
                <textarea
                  rows={4}
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="Detailed instructions for students..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="datetime-local"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Maximum Score</label>
                  <input
                    type="number"
                    value={newMaxScore}
                    onChange={(e) => setNewMaxScore(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-royal-600 text-white font-semibold"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
