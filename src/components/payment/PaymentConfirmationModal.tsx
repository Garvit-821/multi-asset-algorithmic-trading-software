import React from 'react';
import { CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Copy } from 'lucide-react';
import { PaymentReceipt } from '../../services/subscriptionService';

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  receipt: PaymentReceipt | null;
  onClose: () => void;
  onLaunchWorkstation: () => void;
}

export const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
  isOpen,
  receipt,
  onClose,
  onLaunchWorkstation,
}) => {
  if (!isOpen || !receipt) return null;

  const handleCopyTxn = () => {
    navigator.clipboard.writeText(receipt.transactionId);
    alert(`Copied Transaction ID: ${receipt.transactionId}`);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white border border-[#dee1e6] rounded-3xl max-w-lg w-full shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-300 text-[#0a0b0d] relative my-8">

        {/* Top Decorative Success Icon */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-50 text-[#05b169] rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 ring-8 ring-emerald-50">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold font-mono text-[#05b169] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Payment Successful • Demo Order Confirmed
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a0b0d] tracking-tight mt-2">
              Subscription Unlocked!
            </h2>
            <p className="text-xs text-[#5b616e] mt-1">
              Your account has been upgraded to <strong className="text-[#0052ff]">{receipt.planName}</strong>. All associated quantitative modules are active.
            </p>
          </div>
        </div>

        {/* Payment Receipt Voucher Card */}
        <div className="bg-[#f7f7f7] border border-[#dee1e6] rounded-2xl p-5 space-y-3 font-mono text-xs shadow-2xs">
          <div className="flex justify-between items-center border-b border-[#dee1e6] pb-2 text-[11px]">
            <span className="text-[#7c828a] uppercase font-bold">TRANSACTION RECEIPT</span>
            <button
              onClick={handleCopyTxn}
              className="text-[#0052ff] hover:underline font-bold flex items-center space-x-1"
            >
              <span>{receipt.transactionId}</span>
              <Copy className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-[#5b616e]">
              <span>Purchased Plan:</span>
              <span className="text-[#0a0b0d] font-bold">{receipt.planName}</span>
            </div>
            <div className="flex justify-between text-[#5b616e]">
              <span>Billing Interval:</span>
              <span className="text-[#0a0b0d] capitalize font-bold">{receipt.billingInterval}</span>
            </div>
            <div className="flex justify-between text-[#5b616e]">
              <span>Amount Paid:</span>
              <span className="text-[#05b169] font-extrabold text-sm">${receipt.amountPaid}.00 USD</span>
            </div>
            <div className="flex justify-between text-[#5b616e]">
              <span>Payment Method:</span>
              <span className="text-[#0a0b0d] font-bold">{receipt.cardBrand} •••• {receipt.cardLast4}</span>
            </div>
            <div className="flex justify-between text-[#5b616e]">
              <span>Next Renewal Date:</span>
              <span className="text-[#0a0b0d] font-bold">{receipt.nextBillingDate}</span>
            </div>
          </div>
        </div>

        {/* Unlocked Features Summary */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-extrabold text-[#0a0b0d] uppercase tracking-wider flex items-center">
            <Sparkles className="w-4 h-4 text-amber-500 mr-1.5" />
            Features Unlocked for Your Account:
          </h4>
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 space-y-2">
            {receipt.unlockedFeatures.slice(0, 5).map((feat, idx) => (
              <div key={idx} className="flex items-start space-x-2.5 text-xs text-[#0a0b0d]">
                <CheckCircle2 className="w-4 h-4 text-[#05b169] shrink-0 mt-0.5" />
                <span className="font-medium">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              onClose();
              onLaunchWorkstation();
            }}
            className="w-full py-4 bg-[#0052ff] hover:bg-[#003ecc] text-white rounded-2xl font-extrabold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2"
          >
            <span>Launch Unlocked Workstation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-center space-x-2 text-[10px] text-[#7c828a] font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-[#05b169]" />
          <span>RECEIPT LOGGED TO LOCAL STORAGE • STATUS: VERIFIED</span>
        </div>

      </div>
    </div>
  );
};
