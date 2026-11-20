import React from 'react';
import { CourseNote } from '../../types';
import { X, Download, FileText, ExternalLink, BookOpen } from 'lucide-react';

interface Props {
  note: CourseNote | null;
  isOpen: boolean;
  onClose: () => void;
  canAccess: boolean;
  onTriggerPayment?: () => void;
}

export const PdfViewerModal: React.FC<Props> = ({
  note,
  isOpen,
  onClose,
  canAccess,
  onTriggerPayment,
}) => {
  if (!isOpen || !note) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-navy-900 text-white px-5 py-4 flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-royal-600/30 border border-royal-500/40 flex items-center justify-center text-royal-300 flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-royal-400 bg-royal-950 px-2 py-0.5 rounded border border-royal-800">
                  {note.courseCode}
                </span>
                <span className="text-xs text-slate-300">Lecture {note.lectureNumber}</span>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-white truncate max-w-md">
                {note.topic}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {canAccess && (
              <a
                href={note.fileUrl}
                download={note.fileName}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-royal-600 hover:bg-royal-500 text-white text-xs font-medium transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
              aria-label="Close PDF Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 bg-slate-100 relative overflow-hidden flex flex-col">
          {canAccess ? (
            <div className="w-full h-full flex flex-col">
              {/* PDF Preview Notice & Fallback */}
              <div className="bg-royal-50 border-b border-royal-100 px-4 py-2 flex items-center justify-between text-xs text-royal-900">
                <span className="font-medium">
                  Document: {note.fileName} ({note.fileSize})
                </span>
                <a
                  href={note.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-royal-700 hover:text-royal-900 underline font-semibold"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open in New Tab
                </a>
              </div>

              {/* In-Browser PDF Object / Iframe */}
              <div className="flex-1 w-full bg-slate-200">
                <iframe
                  src={`${note.fileUrl}#toolbar=1&navpanes=0`}
                  title={note.topic}
                  className="w-full h-full border-0"
                />
              </div>

              {/* Mobile Download Bar */}
              <div className="p-3 bg-white border-t border-slate-200 sm:hidden flex items-center justify-between">
                <span className="text-xs text-slate-500">{note.fileSize}</span>
                <a
                  href={note.fileUrl}
                  download={note.fileName}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-royal-600 text-white text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Note
                </a>
              </div>
            </div>
          ) : (
            /* Locked View for Unpaid Students */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 mb-4 shadow-sm">
                <BookOpen className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-navy-950 mb-2">Lecture Notes Locked</h4>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Complete access to all 7 course lecture notes, past questions, and laboratory manuals requires an approved one-time ₦500 departmental dues payment.
              </p>
              <div className="bg-white p-4 rounded-xl border border-slate-200 w-full mb-6 text-left shadow-sm">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">Payment Details</div>
                <div className="text-sm font-semibold text-slate-900">OPay Bank: 08139651907</div>
                <div className="text-xs text-slate-600">Account: Divine Christopher Inyang</div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                {onTriggerPayment && (
                  <button
                    onClick={() => {
                      onClose();
                      onTriggerPayment();
                    }}
                    className="flex-1 bg-royal-600 hover:bg-royal-500 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition shadow-sm"
                  >
                    Pay / Submit Reference (₦500)
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2.5 px-4 rounded-xl text-sm transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
