import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { PaymentStatusBadge } from '../components/common/PaymentStatusBadge';
import {
  CreditCard,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Lock,
} from 'lucide-react';

interface Props {
  onNavigateToNotes: () => void;
}

export const PaymentPage: React.FC<Props> = ({ onNavigateToNotes }) => {
  const { user } = useAuth();
  const { payments, submitPayment } = useData();

  const [senderName, setSenderName] = useState(user?.fullName || '');
  const [bankName, setBankName] = useState('OPay');
  const [transactionRef, setTransactionRef] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Student's existing payment record if any
  const myPayments = payments.filter((p) => p.studentId === user?.id);
  const latestPayment = myPayments[0];

  const currentStatus = user?.paymentStatus || 'UNPAID';

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('08139651907');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!senderName.trim() || !bankName.trim() || !transactionRef.trim()) {
      setErrorBanner('Please fill in all payment submission details.');
      return;
    }

    // Check duplicate reference in payments
    const duplicate = payments.some(
      (p) => p.transactionReference.trim().toUpperCase() === transactionRef.trim().toUpperCase()
    );
    if (duplicate) {
      setErrorBanner('This transaction reference has already been submitted.');
      return;
    }

    setErrorBanner(null);
    setIsSubmitting(true);

    setTimeout(() => {
      submitPayment({
        studentId: user.id,
        studentName: user.fullName,
        matricNumber: user.matricNumber,
        amount: 500,
        senderName: senderName.trim(),
        bankName: bankName.trim(),
        transactionReference: transactionRef.trim(),
      });

      // Update current user state to PENDING
      user.paymentStatus = 'PENDING';

      setIsSubmitting(false);
      setSuccessBanner(true);
      setTransactionRef('');
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-royal-950 text-white rounded-2xl p-6 sm:p-8 shadow-card border border-navy-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-royal-500/20 text-royal-300 text-xs font-semibold mb-2 border border-royal-400/30">
              <CreditCard className="w-3.5 h-3.5" />
              One-Time Access Fee
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              ₦500 Departmental Access Dues
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Direct OPay bank transfer to the 100L Course Representative for lecture notes access.
            </p>
          </div>

          <div>
            <PaymentStatusBadge status={currentStatus} size="lg" />
          </div>
        </div>
      </div>

      {/* Status Banners */}
      {currentStatus === 'APPROVED' ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-emerald-950 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-emerald-950">Payment Verified & Approved</h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                Approved by <strong>{latestPayment?.approvedBy || 'Course Rep Divine Inyang'}</strong>. You now have full permanent access to download and view all 7 course notes.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToNotes}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition whitespace-nowrap flex items-center justify-center gap-2"
          >
            <span>Open Course Notes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : currentStatus === 'PENDING' ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-950 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base text-amber-950">Payment Verification in Progress</h3>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              Your ₦500 payment submission (Ref: <strong className="font-mono">{latestPayment?.transactionReference}</strong>) is currently pending admin review. The Course Rep is checking their OPay account history. Notes unlock immediately upon approval.
            </p>
          </div>
        </div>
      ) : currentStatus === 'REJECTED' ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-950 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-rose-950">Payment Could Not Be Verified</h3>
            <p className="text-xs text-rose-800 mt-1 leading-relaxed">
              Reason: <strong>{latestPayment?.rejectionReason || 'Transaction could not be confirmed in OPay history.'}</strong>. Please check your bank receipt and resubmit with the correct transaction reference below.
            </p>
          </div>
        </div>
      ) : null}

      {/* Bank Account Details Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-card">
        <h2 className="text-sm font-bold uppercase tracking-wider text-royal-600 mb-1">
          Official Bank Transfer Details
        </h2>
        <h3 className="text-xl font-extrabold text-navy-950 mb-6">
          Transfer Exactly ₦500 to the Departmental Representative
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Bank */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Bank
            </div>
            <div className="text-base font-bold text-navy-950 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-royal-600" />
              <span>OPay</span>
            </div>
          </div>

          {/* Account Number */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Account Number
              </div>
              <div className="font-mono text-lg font-black text-navy-950 tracking-wider">
                08139651907
              </div>
            </div>
            <button
              onClick={handleCopyAccount}
              className={`p-2 rounded-xl transition flex items-center gap-1 text-xs font-semibold ${
                copied
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
              }`}
              title="Copy account number"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[10px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-royal-600" />
                  <span className="text-[10px]">Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Account Name */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Account Name
            </div>
            <div className="text-sm font-bold text-navy-950">
              Divine Christopher Inyang
            </div>
            <div className="text-[10px] text-slate-500">Course Representative</div>
          </div>
        </div>

        {/* How it works steps */}
        <div className="bg-royal-50/60 rounded-xl p-4 border border-royal-100 text-xs text-slate-700 space-y-1.5">
          <div className="font-bold text-royal-950 mb-1">Payment Process Instructions:</div>
          <p>1. Open your OPay, Kuda, PalmPay, or commercial bank app and transfer <strong>₦500</strong> to <strong>08139651907 (OPay - Divine Christopher Inyang)</strong>.</p>
          <p>2. Copy the <strong>Transaction Reference / Session ID</strong> from your transaction receipt.</p>
          <p>3. Fill and submit the verification form below.</p>
          <p>4. The administrator will confirm the credit alert on OPay and approve your departmental access.</p>
        </div>
      </div>

      {/* Submission Form (Allowed if Unpaid, Rejected, or Submitting another reference) */}
      {currentStatus !== 'APPROVED' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-card">
          <h3 className="text-lg font-bold text-navy-950 mb-1">Submit Transaction Details</h3>
          <p className="text-xs text-slate-500 mb-6">
            Enter the details from your transfer so the Course Rep can locate your payment in the OPay transaction history.
          </p>

          {successBanner && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Your payment reference has been submitted. Status is now PENDING verification.</span>
            </div>
          )}

          {errorBanner && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorBanner}</span>
            </div>
          )}

          <form onSubmit={handleSubmitPayment} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Sender Account Name (Name on your Bank App)
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Okon, Emeka Christian"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bank Transferred From
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. OPay, Kuda, Access Bank, PalmPay"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Transaction Reference / Session ID
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. OPAY_TX_10928374 or 24112009384729"
                required
                className="w-full font-mono bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Found in your bank receipt or SMS debit alert.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-royal-600 hover:bg-royal-500 text-white font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting Reference...' : 'Submit ₦500 Payment for Verification'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment History Table */}
      {myPayments.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
          <h3 className="text-sm font-bold text-navy-950 mb-3">Your Payment Submissions History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Bank</th>
                  <th className="py-2.5 px-3">Sender</th>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myPayments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 px-3 text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{p.bankName}</td>
                    <td className="py-2.5 px-3 text-slate-700">{p.senderName}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{p.transactionReference}</td>
                    <td className="py-2.5 px-3 font-bold text-navy-950">₦{p.amount}</td>
                    <td className="py-2.5 px-3">
                      <PaymentStatusBadge status={p.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
