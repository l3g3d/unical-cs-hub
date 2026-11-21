import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Assignment } from '../types';
import {
  FileCheck2,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Award,
  Search,
  BookOpen,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const AssignmentsPage: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const { assignments, createAssignment, deleteAssignment, courses } = useData();

  const [selectedCourseFilter, setSelectedCourseFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(
    assignments.length > 0 ? assignments[0] : null
  );

  // Admin create assignment modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState('COS101');
  const [newTitle, setNewTitle] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newMaxScore, setNewMaxScore] = useState(20);

  const filteredAssignments = assignments
    .filter((a) => (selectedCourseFilter === 'ALL' ? true : a.courseCode === selectedCourseFilter))
    .filter(
      (a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.instructions.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newInstructions.trim() || !newDueDate) return;

    const created = createAssignment({
      courseCode: newCourse,
      title: newTitle.trim(),
      instructions: newInstructions.trim(),
      dueDate: newDueDate,
      maxScore: Number(newMaxScore),
      createdBy: user?.fullName || 'Course Rep'
    });

    setShowCreateModal(false);
    setSelectedAssignment(created);
    setNewTitle('');
    setNewInstructions('');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteAssignment(id);
    if (selectedAssignment?.id === id) {
      setSelectedAssignment(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-royal-950 text-white rounded-2xl p-6 sm:p-8 shadow-card border border-navy-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-royal-500/20 text-royal-300 text-xs font-semibold mb-2 border border-royal-400/30">
              <FileCheck2 className="w-3.5 h-3.5" />
              Departmental Coursework
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Course Assignments & Tasks
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              View official continuous assessment tasks, test topics, and submission deadlines across all seven 100L courses.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-royal-600 hover:bg-royal-500 text-white font-bold text-xs shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Give New Assignment</span>
            </button>
          )}
        </div>
      </div>

      {/* Course Filter Bar & Search */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCourseFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCourseFilter === 'ALL'
                ? 'bg-royal-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            All Courses ({assignments.length})
          </button>
          {courses.map((c) => {
            const count = assignments.filter((a) => a.courseCode === c.code).length;
            const isSelected = selectedCourseFilter === c.code;
            return (
              <button
                key={c.code}
                onClick={() => setSelectedCourseFilter(c.code)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-royal-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{c.code}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-royal-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="w-full md:w-64 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assignments..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
          />
        </div>
      </div>

      {/* Main Grid: Left List + Right Detailed Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Assignments List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredAssignments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
              <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No active assignments for this selection</h3>
              <p className="text-xs text-slate-500 mt-1">
                New continuous assessment assignments will appear here once published by the Course Rep or Lecturers.
              </p>
            </div>
          ) : (
            filteredAssignments.map((assign) => {
              const isSelected = selectedAssignment?.id === assign.id;
              const isDueSoon = new Date(assign.dueDate).getTime() - Date.now() < 3 * 86400000;

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
                        <span
                          className={`text-xs font-semibold flex items-center gap-1 ${
                            isDueSoon ? 'text-rose-600 font-bold' : 'text-slate-600'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Due: {new Date(assign.dueDate).toLocaleDateString()} at{' '}
                          {new Date(assign.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={(e) => handleDelete(assign.id, e)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                            title="Delete Assignment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-navy-950 mb-2">{assign.title}</h3>
                    <p className="text-xs text-slate-600 whitespace-pre-line line-clamp-3 mb-3 leading-relaxed">
                      {assign.instructions}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-royal-700">
                      <Award className="w-3.5 h-3.5 text-royal-600" />
                      Score: {assign.maxScore} Marks
                    </span>
                    <span className="text-royal-600 font-semibold">
                      {isSelected ? 'Viewing Details' : 'Click to view full instructions →'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Col: Selected Assignment Detailed Card */}
        <div>
          {selectedAssignment ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card space-y-4 sticky top-24">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs bg-royal-100 text-royal-800 px-2.5 py-0.5 rounded">
                  {selectedAssignment.courseCode}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {selectedAssignment.maxScore} Marks
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-navy-950 mb-1">{selectedAssignment.title}</h3>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Posted: {new Date(selectedAssignment.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>By: {selectedAssignment.createdBy}</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Questions / Instructions:
                </div>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                  {selectedAssignment.instructions}
                </p>
              </div>

              {/* Deadline alert banner */}
              <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Submission Deadline:</div>
                  <div className="font-semibold">
                    {new Date(selectedAssignment.dueDate).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Student Notice */}
              <div className="bg-royal-50/70 rounded-xl p-3.5 border border-royal-100 text-xs text-royal-950 flex items-start gap-2">
                <Info className="w-4 h-4 text-royal-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Please write or type your solutions neatly and submit your assignment script in class to the Course Rep or directly to your lecturer.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center text-xs text-slate-500">
              Select an assignment from the list to view its complete questions, instructions, and deadline details.
            </div>
          )}
        </div>
      </div>

      {/* Admin Create Assignment Modal */}
      {showCreateModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-navy-950 mb-1">Give New Assignment to Students</h3>
            <p className="text-xs text-slate-500 mb-4">
              Post instructions and deadline. Students will see it instantly on their dashboard and assignment portal.
            </p>

            <form onSubmit={handleCreateAssignment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Course</label>
                <select
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
                >
                  {courses.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assignment Title / Topic</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Assignment 1: Measures of Dispersion & Variance"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Questions / Instructions</label>
                <textarea
                  rows={5}
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="Type the full assignment questions, instructions, guidelines, and reference pages..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Submission Deadline</label>
                  <input
                    type="datetime-local"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Maximum Marks</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={newMaxScore}
                    onChange={(e) => setNewMaxScore(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-royal-600 hover:bg-royal-500 text-white font-semibold shadow-sm"
                >
                  Publish to Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
