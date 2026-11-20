import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { MapPin, AlertTriangle, Edit3, CheckCircle2, Building2, Clock, Users } from 'lucide-react';

export const VenuesPage: React.FC = () => {
  const { user } = useAuth();
  const { venues, updateVenue } = useData();

  const [editingVenue, setEditingVenue] = useState<string | null>(null);
  const [newVenueName, setNewVenueName] = useState('');
  const [changeNotice, setChangeNotice] = useState('');

  const handleStartEdit = (courseCode: string, currentVenue: string) => {
    setEditingVenue(courseCode);
    setNewVenueName(currentVenue);
    setChangeNotice('Notice: Venue relocated for upcoming lecture sessions. Please be seated 10 mins early.');
  };

  const handleSaveVenue = (courseCode: string) => {
    if (!newVenueName.trim()) return;
    updateVenue(courseCode, newVenueName.trim(), changeNotice.trim());
    setEditingVenue(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-royal-950 text-white rounded-2xl p-6 sm:p-8 shadow-card border border-navy-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-royal-500/20 text-royal-300 text-xs font-semibold mb-2 border border-royal-400/30">
          <Building2 className="w-3.5 h-3.5" />
          Departmental Lecture Locations
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Lecture Venues & Relocation Notices
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Know where each lecture holds across the University of Calabar campus with live relocation highlights.
        </p>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {venues.map((venue) => {
          const isBeingEdited = editingVenue === venue.courseCode;

          return (
            <div
              key={venue.id}
              className={`bg-white rounded-2xl p-6 border shadow-card transition relative overflow-hidden flex flex-col justify-between ${
                venue.isChanged ? 'border-amber-300 ring-2 ring-amber-200/50' : 'border-slate-200'
              }`}
            >
              {venue.isChanged && (
                <div className="bg-amber-500 text-navy-950 font-bold text-[10px] uppercase tracking-wider px-3 py-1 absolute top-0 right-0 rounded-bl-xl flex items-center gap-1 shadow-xs">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Venue Relocated</span>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-xs bg-royal-100 text-royal-800 px-2.5 py-0.5 rounded">
                    {venue.courseCode}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{venue.courseName}</span>
                </div>

                {isBeingEdited ? (
                  <div className="space-y-3 my-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">New Venue</label>
                      <input
                        type="text"
                        value={newVenueName}
                        onChange={(e) => setNewVenueName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Relocation Notice Note</label>
                      <input
                        type="text"
                        value={changeNotice}
                        onChange={(e) => setChangeNotice(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingVenue(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveVenue(venue.courseCode)}
                        className="px-3 py-1.5 rounded-lg bg-royal-600 text-white font-semibold text-xs shadow-xs"
                      >
                        Update Venue
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="my-3">
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Assigned Hall:</div>
                    <div className="text-base sm:text-lg font-extrabold text-navy-950 flex items-center gap-2 mt-0.5">
                      <MapPin className="w-4 h-4 text-royal-600 flex-shrink-0" />
                      <span>{venue.venueName}</span>
                    </div>

                    {venue.changeNotice && (
                      <div className="mt-2.5 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>{venue.changeNotice}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{venue.dayTime}</span>
                  </div>

                  {venue.capacity && (
                    <div className="flex items-center gap-1 text-[11px]">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>Capacity: ~{venue.capacity} seats</span>
                    </div>
                  )}
                </div>
              </div>

              {user?.role === 'admin' && !isBeingEdited && (
                <div className="pt-3 mt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleStartEdit(venue.courseCode, venue.venueName)}
                    className="inline-flex items-center gap-1.5 text-xs text-royal-600 hover:text-royal-500 font-semibold"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Relocate / Change Venue</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
