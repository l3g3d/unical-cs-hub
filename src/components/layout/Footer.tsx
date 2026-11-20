import React from 'react';
import { GraduationCap, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-400 border-t border-navy-800 py-8 px-4 sm:px-6 lg:px-8 mt-12 mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-royal-600/30 flex items-center justify-center text-royal-400 border border-royal-500/30">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">UNICAL CS HUB</div>
            <p className="text-[11px] text-slate-400">
              Department of Computer Science • University of Calabar, Nigeria
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 text-center sm:text-right">
          <ShieldCheck className="w-4 h-4 text-royal-400 inline" />
          <span>
            100 Level Academic Student Platform • Managed by Course Representative
          </span>
        </div>
      </div>
    </footer>
  );
};
