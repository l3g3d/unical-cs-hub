import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { DayOfWeek, TimetableEntry } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  CheckCircle2,
  Filter,
} from 'lucide-react';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const TimetablePage: React.FC = () => {
  const { user } = useAuth();
  const { timetable, deleteTimetableClass, addTimetableClass, courses } = useData();

  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // New class form state (for admin quick add)
  const [formCourse, setFormCourse] = useState('COS101');
  const [formDay, setFormDay] = useState<DayOfWeek>('Monday');
  const [formStartTime, setFormStartTime] = useState('08:00');
  const [formEndTime, setFormEndTime] = useState('10:00');
  const [formVenue, setFormVenue] = useState('Science Lecture Theatre (SLT)');
  const [formLecturer, setFormLecturer] = useState('Dr. A. E. Effiong');

  const filteredTimetable = timetable
    .filter((t) => (selectedDay === 'All' ? true : t.dayOfWeek === selectedDay))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const courseObj = courses.find((c) => c.code === formCourse);
    addTimetableClass({
      dayOfWeek: formDay,
      startTime: formStartTime,
      endTime: formEndTime,
      courseCode: formCourse,
      courseTitle: courseObj?.title || formCourse,
      lecturer: formLecturer,
      venue: formVenue,
      semester: 'First Semester',
      academicYear: '2026/2027'
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-royal-950 text-white rounded-2xl p-6 sm:p-8 shadow-card border border-navy-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-royal-500/20 text-royal-300 text-xs font-semibold mb-2 border border-royal-400/30">
              <Calendar className="w-3.5 h-3.5" />
              Official Weekly Lecture Schedule
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              100 Level Departmental Timetable
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Academic Session 2026/2027 • First Semester • Monday to Friday Lectures
            </p>
          </div>

          {user?.role === 'admin' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-royal-600 hover:bg-royal-500 text-white font-bold text-xs shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Class to Timetable</span>
            </button>
          )}
        </div>
      </div>

      {/* Day Selector Switcher */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex items-center justify-between overflow-x-auto scrollbar-none">
        <div className="flex gap-1.5">
          <button
            onClick={() => setSelectedDay('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedDay === 'All'
                ? 'bg-royal-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            All Week (Mon-Fri)
          </button>
          {DAYS.map((day) => {
            const count = timetable.filter((t) => t.dayOfWeek === day).length;
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-royal-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{day}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-royal-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Classes Schedule List */}
      <div className="space-y-3">
        {filteredTimetable.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No classes scheduled for this day</h3>
            <p className="text-xs text-slate-500 mt-1">
              Enjoy your study break or check course notes for upcoming topics.
            </p>
          </div>
        ) : (
          filteredTimetable.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-royal-300 shadow-sm transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                {/* Time Badge */}
                <div className="w-20 rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-center flex-shrink-0">
                  <span className="text-[10px] font-bold uppercase text-royal-600 block">
                    {item.dayOfWeek.slice(0, 3)}
                  </span>
                  <span className="font-mono text-sm font-black text-navy-950 block">
                    {item.startTime}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    to {item.endTime}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs bg-royal-100 text-royal-800 px-2.5 py-0.5 rounded">
                      {item.courseCode}
                    </span>
                    <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                      {item.semester}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-navy-950">
                    {item.courseTitle}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-royal-600" />
                      {item.venue}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="inline-flex items-center gap-1.5 text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {item.lecturer}
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin controls */}
              {user?.role === 'admin' && (
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => deleteTimetableClass(item.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Delete Class"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Class Modal (for Admin) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-navy-950 mb-4">Add Timetable Class</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course</label>
                <select
                  value={formCourse}
                  onChange={(e) => {
                    setFormCourse(e.target.value);
                    const found = courses.find((c) => c.code === e.target.value);
                    if (found) setFormLecturer(found.lecturer);
                  }}
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
                <label className="block font-semibold text-slate-700 mb-1">Day of Week</label>
                <select
                  value={formDay}
                  onChange={(e) => setFormDay(e.target.value as DayOfWeek)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lecture Venue</label>
                <input
                  type="text"
                  value={formVenue}
                  onChange={(e) => setFormVenue(e.target.value)}
                  placeholder="e.g. Science Lecture Theatre (SLT)"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lecturer</label>
                <input
                  type="text"
                  value={formLecturer}
                  onChange={(e) => setFormLecturer(e.target.value)}
                  placeholder="e.g. Dr. A. E. Effiong"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-royal-600 hover:bg-royal-500 text-white font-semibold shadow-sm"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
