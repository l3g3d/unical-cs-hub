import React, { useState } from 'react';
import { AiProposedAction } from '../../types';
import { Check, X, Calendar, MapPin, FileEdit, Bell, Loader2 } from 'lucide-react';

interface Props {
  action: AiProposedAction;
  onConfirm: (action: AiProposedAction) => Promise<void>;
  onCancel: (action: AiProposedAction) => void;
}

export const ActionPreviewCard: React.FC<Props> = ({ action, onConfirm, onCancel }) => {
  const [isExecuting, setIsExecuting] = useState(false);

  const getActionIcon = () => {
    switch (action.type) {
      case 'ADD_TIMETABLE_CLASS':
      case 'EDIT_TIMETABLE_CLASS':
      case 'DELETE_TIMETABLE_CLASS':
        return <Calendar className="w-4 h-4 text-royal-600" />;
      case 'CHANGE_VENUE':
        return <MapPin className="w-4 h-4 text-emerald-600" />;
      case 'CREATE_ASSIGNMENT':
        return <FileEdit className="w-4 h-4 text-purple-600" />;
      case 'PUBLISH_ANNOUNCEMENT':
      case 'CREATE_EVENT':
      default:
        return <Bell className="w-4 h-4 text-amber-600" />;
    }
  };

  const handleConfirm = async () => {
    setIsExecuting(true);
    try {
      await onConfirm(action);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-royal-200 rounded-xl p-4 my-2 text-left shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-xs">
            {getActionIcon()}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-navy-900">
            {action.type.replace(/_/g, ' ')}
          </span>
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            action.status === 'EXECUTED'
              ? 'bg-emerald-100 text-emerald-800'
              : action.status === 'CANCELLED'
              ? 'bg-rose-100 text-rose-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {action.status}
        </span>
      </div>

      <p className="text-xs sm:text-sm font-semibold text-slate-800 mb-3">
        {action.summary}
      </p>

      {/* Structured details display */}
      <div className="bg-white rounded-lg p-2.5 mb-3 border border-slate-200 text-xs space-y-1">
        {Object.entries(action.details).map(([key, val]) => (
          <div key={key} className="flex justify-between items-center py-0.5">
            <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
            <span className="font-medium text-slate-900 truncate max-w-[200px]">
              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
            </span>
          </div>
        ))}
      </div>

      {action.status === 'PENDING' && (
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleConfirm}
            disabled={isExecuting}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-royal-600 hover:bg-royal-500 text-white font-medium py-1.5 px-3 rounded-lg text-xs transition shadow-xs disabled:opacity-50"
          >
            {isExecuting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>Confirm & Execute</span>
          </button>
          <button
            onClick={() => onCancel(action)}
            disabled={isExecuting}
            className="inline-flex items-center justify-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-1.5 px-3 rounded-lg text-xs transition disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        </div>
      )}

      {action.status === 'EXECUTED' && (
        <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
          <Check className="w-3.5 h-3.5" />
          <span>Executed successfully and updated in departmental database.</span>
        </div>
      )}

      {action.status === 'CANCELLED' && (
        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-1">
          <X className="w-3.5 h-3.5" />
          <span>Proposed change was discarded.</span>
        </div>
      )}
    </div>
  );
};
