import React, { useState } from 'react';
import { CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Copy, Check, Receipt } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  if (!isOpen || !receipt) return null;

  const handleCopyTxn = () => {
    navigator.clipboard.writeText(receipt.transactionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white border border-[#dee1e6] rounded-3xl max-w-lg w-full shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-300 text-[#0a0b0d] relative my-8 overflow-hidden">

        {/* Top Decorative Success Badge Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-[#05b169] text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/25 ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#0052ff] text-white p-1 rounded-full shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-extrabold font-mono text-[#05b169] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
              PAYMENT SUCCESSFUL • DEMO ORDER CONFIRMED
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a0b0d] tracking-tight mt-2">
              Subscription Activated!
            </h2>
            <p className="text-xs text-[#5b616e] mt-1 max-w-xs mx-auto">
              Your account has been upgraded to <strong className="text-[#0052ff]">{receipt.planName}</strong>. Quantitative workstation features are unlocked.
            </p>
          </div>
        </div>

        {/* High-Tech Payment Receipt Voucher Card */}
        <div className="bg-[#f7f7f7] border border-[#dee1e6] rounded-2xl p-5 space-y-3 font-mono text-xs shadow-2xs relative">
          <div className="flex justify-between items-center border-b border-[#dee1e6] pb-2 text-[11px]">
            <span className="text-[#7c828a] uppercase font-extrabold flex items-center">
              <Receipt className="w-3.5 h-3.5 text-[#0052ff] mr-1" /> RECEIPT VOUCHER
            </span>
            <button
              onClick={handleCopyTxn}
              className="text-[#0052ff] hover:text-blue-700 font-extrabold flex items-center space-x-1 bg-white px-2.5 py-1 rounded-md border border-blue-200 shadow-2xs transition-all active:scale-95"
            >
              <span>{receipt.transactionId}</span>
              {copied ? <Check className="w-3 h-3 text-[#05b169]" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-[#5b616e]">
              <span>Activated Plan:</span>
              <span className="text-[#0a0b0d] font-extrabold">{receipt.planName}</span>
            </div>
            <div className="flex justify-between text-[#5b616e]">
              <span>Billing Cycle:</span>
              <span className="text-[#0a0b0d] capitalize font-bold">{receipt.billingInterval}</span>
            </div>
            <div className="flex justify-between text-[#5b616e]">
              <span>Total Amount Billed:</span>
              <span className="text-[#05b169] font-extrabold text-sm">${receipt.amountPaid}.00 USD</span>
            </div>
            <div className="flex justify-between text-[#5b616e]">
              <span>Payment Instrument:</span>
              <span className="text-[#0a0b0d] font-bold">{receipt.cardBrand} •••• {receipt.cardLast4}</span>
            </div>
            <div className="flex justify-between text-[#5b616e]">
              <span>Next Renewal Date:</span>
              <span className="text-[#0a0b0d] font-bold">{receipt.nextBillingDate}</span>
            </div>
          </div>

          {/* Barcode Visual Element */}
          <div className="pt-2 border-t border-dashed border-[#dee1e6] flex flex-col items-center justify-center space-y-1">
            <div className="font-mono text-[14px] text-gray-400 tracking-[0.2em] font-extrabold select-none opacity-60">
              ||| | |||| | |||||| || | || |||
            </div>
            <span className="text-[9px] text-[#7c828a]">STRATRADE-VERIFIED-PAYMENT-HASH</span>
          </div>
        </div>

        {/* Unlocked Features List */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-extrabold text-[#0a0b0d] uppercase tracking-wider flex items-center">
            <Sparkles className="w-4 h-4 text-amber-500 mr-1.5" />
            Features Unlocked for Your Account:
          </h4>
          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 space-y-2">
            {receipt.unlockedFeatures.slice(0, 5).map((feat, idx) => (
              <div key={idx} className="flex items-start space-x-2.5 text-xs text-[#0a0b0d]">
                <CheckCircle2 className="w-4 h-4 text-[#05b169] shrink-0 mt-0.5" />
                <span className="font-semibold text-[#0a0b0d]">{feat}</span>
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
            className="w-full py-4 bg-[#0052ff] hover:bg-[#003ecc] text-white rounded-2xl font-extrabold text-sm transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center space-x-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>Launch Unlocked Workstation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-center space-x-2 text-[10px] text-[#7c828a] font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-[#05b169]" />
          <span>STATUS: PERSISTED TO LOCAL STORAGE</span>
        </div>

      </div>
    </div>
  );
};
