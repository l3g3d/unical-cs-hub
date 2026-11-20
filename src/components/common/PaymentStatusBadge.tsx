import React from 'react';
import { PaymentStatus } from '../../types';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

interface Props {
  status: PaymentStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const PaymentStatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  switch (status) {
    case 'APPROVED':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Access Approved</span>
        </span>
      );
    case 'PENDING':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span>Pending Verification</span>
        </span>
      );
    case 'REJECTED':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>Payment Rejected</span>
        </span>
      );
    case 'UNPAID':
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>₦500 Unpaid (Locked)</span>
        </span>
      );
  }
};
