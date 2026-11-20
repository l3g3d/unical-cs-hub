import React from 'react';
import { CourseRepresentative } from '../../types';
import { Phone, Mail, Award, MessageSquare } from 'lucide-react';

interface Props {
  rep: CourseRepresentative;
  onContactClick?: () => void;
}

export const CourseRepCard: React.FC<Props> = ({ rep, onContactClick }) => {
  return (
    <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white rounded-2xl p-6 shadow-card relative overflow-hidden border border-navy-700">
      {/* Background decorative circles */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-royal-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-royal-600/15 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Photo with golden/royal badge */}
        <div className="relative flex-shrink-0">
          <img
            src={rep.photoUrl}
            alt={rep.fullName}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-royal-400/40 shadow-md"
            onError={(e) => {
              // fallback image if remote url fails
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
            }}
          />
          <div className="absolute -bottom-2 -right-2 bg-royal-600 text-white p-1.5 rounded-xl shadow-lg border border-royal-400">
            <Award className="w-4 h-4" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-royal-500/20 text-royal-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-royal-400/30">
            {rep.level} • Department Leadership
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
            {rep.fullName}
          </h3>
          <p className="text-sm text-royal-200 font-medium mb-1">{rep.position}</p>
          <p className="text-xs text-slate-300 mb-4">{rep.department}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300 pt-2 border-t border-navy-700/80">
            <a
              href={`tel:${rep.phone}`}
              className="inline-flex items-center gap-1.5 hover:text-royal-300 transition-colors bg-navy-950/60 px-3 py-1.5 rounded-lg border border-navy-700"
            >
              <Phone className="w-3.5 h-3.5 text-royal-400" />
              <span>{rep.phone}</span>
            </a>
            <a
              href={`mailto:${rep.email}`}
              className="inline-flex items-center gap-1.5 hover:text-royal-300 transition-colors bg-navy-950/60 px-3 py-1.5 rounded-lg border border-navy-700"
            >
              <Mail className="w-3.5 h-3.5 text-royal-400" />
              <span>{rep.email}</span>
            </a>
            {onContactClick && (
              <button
                onClick={onContactClick}
                className="inline-flex items-center gap-1.5 bg-royal-600 hover:bg-royal-500 text-white font-medium px-3 py-1.5 rounded-lg transition shadow-sm ml-auto"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message Rep</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
