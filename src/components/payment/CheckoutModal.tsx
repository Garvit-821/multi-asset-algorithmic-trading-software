import React, { useState } from 'react';
import { CreditCard, Lock, Sparkles, X, Check, ShieldCheck, ArrowRight, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import {
  PlanId,
  BillingInterval,
  PLANS,
  PaymentReceipt,
  subscriptionService,
} from '../../services/subscriptionService';

interface CheckoutModalProps {
  isOpen: boolean;
  selectedPlanId: PlanId;
  initialInterval?: BillingInterval;
  onClose: () => void;
  onSuccess: (receipt: PaymentReceipt) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  selectedPlanId,
  initialInterval = 'annual',
  onClose,
  onSuccess,
}) => {
  const [interval, setInterval] = useState<BillingInterval>(initialInterval);
  const [cardHolder, setCardHolder] = useState('Alex Vance');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [zipCode, setZipCode] = useState('10001');

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const plan = PLANS[selectedPlanId] || PLANS.pro;
  const isAnnual = interval === 'annual';
  const monthlyRate = isAnnual ? plan.annualPrice : plan.monthlyPrice;
  const totalAmount = isAnnual ? monthlyRate * 12 : monthlyRate;

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
    setErrorMsg(null);
  };

  // Format Expiry Date MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setExpiryDate(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setExpiryDate(raw);
    }
    setErrorMsg(null);
  };

  // Quick Demo Auto-Fill
  const handleFillDemoCard = () => {
    setCardHolder('Alex Vance');
    setCardNumber('4242 4242 4242 4242');
    setExpiryDate('12/28');
    setCvv('888');
    setZipCode('10001');
    setErrorMsg(null);
  };

  const detectedBrand = subscriptionService.detectCardBrand(cardNumber);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardNumber || cardNumber.replace(/\D/g, '').length < 13) {
      setErrorMsg('Please enter a valid card number (or click Fill Demo Card).');
      return;
    }
    if (!expiryDate || expiryDate.length < 5) {
      setErrorMsg('Please enter a valid expiry date (MM/YY).');
      return;
    }
    if (!cvv || cvv.length < 3) {
      setErrorMsg('Please enter CVV / CVC security code.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    setProcessingStep('Encrypting demo payment payload...');
    await new Promise((res) => setTimeout(res, 400));

    setProcessingStep('Connecting to mock payment gateway...');
    await new Promise((res) => setTimeout(res, 500));

    setProcessingStep('Confirming quantitative plan activation...');

    const receipt = await subscriptionService.processMockPayment({
      planId: selectedPlanId,
      billingInterval: interval,
      cardHolder,
      cardNumber,
      expiryDate,
      cvv,
      zipCode,
    });

    setIsProcessing(false);

    if (receipt.success) {
      onSuccess(receipt);
    } else {
      setErrorMsg(receipt.error || 'Payment failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white border border-[#dee1e6] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">

        {/* Top Title Bar */}
        <div className="bg-[#0a0b0d] text-white px-6 py-5 flex items-center justify-between border-b border-[#26282c]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#0052ff] rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold text-white">Stratrade Checkout</h2>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                  Demo Payment
                </span>
              </div>
              <p className="text-xs text-[#a8acb3]">Mock card workflow • Immediate feature unlocking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-full hover:bg-white/10 text-[#a8acb3] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12">

          {/* Left Column: Order Summary & Plan Features */}
          <div className="md:col-span-5 bg-[#f7f7f7] p-6 border-b md:border-b-0 md:border-r border-[#dee1e6] space-y-6">

            {/* Selected Plan Badge */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0052ff]">Selected Quantitative Plan</span>
              <div className="bg-white border border-[#dee1e6] rounded-2xl p-4 space-y-2 shadow-2xs">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-[#0a0b0d] text-base">{plan.name}</h3>
                  <span className="text-[10px] font-mono font-bold bg-blue-50 text-[#0052ff] px-2.5 py-0.5 rounded-full border border-blue-200">
                    {plan.badge}
                  </span>
                </div>
                <p className="text-xs text-[#5b616e] leading-snug">{plan.tagline}</p>
              </div>
            </div>

            {/* Billing Interval Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0a0b0d]">Billing Interval</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-white border border-[#dee1e6] rounded-xl font-semibold text-xs">
                <button
                  type="button"
                  onClick={() => setInterval('monthly')}
                  className={`py-2 px-3 rounded-lg transition-all text-center ${interval === 'monthly' ? 'bg-[#0a0b0d] text-white font-bold shadow-xs' : 'text-[#5b616e] hover:text-[#0a0b0d]'
                    }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setInterval('annual')}
                  className={`py-2 px-3 rounded-lg transition-all text-center flex items-center justify-center space-x-1 ${interval === 'annual' ? 'bg-[#0052ff] text-white font-bold shadow-xs' : 'text-[#5b616e] hover:text-[#0a0b0d]'
                    }`}
                >
                  <span>Annual</span>
                  <span className="text-[9px] bg-emerald-400 text-[#0a0b0d] font-extrabold px-1 rounded">20% OFF</span>
                </button>
              </div>
            </div>

            {/* Pricing Calculation Breakdown */}
            <div className="bg-white border border-[#dee1e6] rounded-2xl p-4 space-y-2 font-mono text-xs shadow-2xs">
              <div className="flex justify-between text-[#5b616e]">
                <span>Base Plan ({interval}):</span>
                <span>${monthlyRate}/mo</span>
              </div>
              {isAnnual && (
                <div className="flex justify-between text-[#05b169]">
                  <span>Annual Discount (20%):</span>
                  <span>-${(plan.monthlyPrice - plan.annualPrice) * 12}/yr</span>
                </div>
              )}
              <div className="flex justify-between text-[#5b616e]">
                <span>Demo Tax & Fees:</span>
                <span className="text-[#05b169]">$0.00</span>
              </div>
              <hr className="border-[#dee1e6] my-1" />
              <div className="flex justify-between text-[#0a0b0d] font-extrabold text-sm pt-1">
                <span>Total Billed Today:</span>
                <span className="text-[#0052ff]">${totalAmount}.00</span>
              </div>
            </div>

            {/* Quick Unlocked Feature Preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#0a0b0d] flex items-center">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1" /> Unlocked Features Included:
              </span>
              <ul className="space-y-1.5 text-[11px] text-[#5b616e]">
                {plan.features.slice(0, 4).map((feat, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#05b169] shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Right Column: Card Input & Payment Execution */}
          <div className="md:col-span-7 p-6 space-y-5 flex flex-col justify-between">

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Demo Auto-Fill Action Header */}
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-[#0a0b0d]">Payment Details</h4>
                <button
                  type="button"
                  onClick={handleFillDemoCard}
                  className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-[#0052ff] border border-blue-200 rounded-full font-bold text-xs transition-all flex items-center space-x-1 shadow-2xs"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Fill Demo Card</span>
                </button>
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Cardholder Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0a0b0d]">Cardholder Name</label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#dee1e6] rounded-xl text-xs text-[#0a0b0d] font-medium focus:border-[#0052ff] focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>

              {/* Card Number & Detected Brand */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-[#0a0b0d]">Card Number</label>
                  {cardNumber && (
                    <span className="text-[10px] font-mono font-bold text-[#0052ff] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {detectedBrand}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#dee1e6] rounded-xl text-xs font-mono text-[#0a0b0d] tracking-wider focus:border-[#0052ff] focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all pr-10"
                  />
                  <CreditCard className="w-4 h-4 text-[#7c828a] absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Expiry, CVV & Zip Code */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#0a0b0d]">Expires</label>
                  <input
                    type="text"
                    required
                    value={expiryDate}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-3 py-2.5 bg-white border border-[#dee1e6] rounded-xl text-xs font-mono text-center text-[#0a0b0d] focus:border-[#0052ff] focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#0a0b0d]">CVV / CVC</label>
                  <input
                    type="password"
                    required
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="888"
                    maxLength={4}
                    className="w-full px-3 py-2.5 bg-white border border-[#dee1e6] rounded-xl text-xs font-mono text-center text-[#0a0b0d] focus:border-[#0052ff] focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#0a0b0d]">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.slice(0, 10))}
                    placeholder="10001"
                    className="w-full px-3 py-2.5 bg-white border border-[#dee1e6] rounded-xl text-xs font-mono text-center text-[#0a0b0d] focus:border-[#0052ff] focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Security Banner */}
              <div className="pt-1 flex items-center justify-between text-[11px] text-[#7c828a] font-sans">
                <span className="flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5 text-[#05b169]" />
                  <span>256-bit Encrypted SSL</span>
                </span>
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0052ff]" />
                  <span>Instant Sandbox Unlock</span>
                </span>
              </div>

              {/* Submit CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#0052ff] hover:bg-[#003ecc] disabled:bg-blue-400 text-white rounded-2xl font-extrabold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>{processingStep || 'Processing Payment...'}</span>
                    </div>
                  ) : (
                    <>
                      <span>Pay ${totalAmount}.00 & Unlock {plan.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>

            <p className="text-[10px] text-center text-[#7c828a] pt-1">
              By completing this mock transaction, your current account subscription will immediately elevate to {plan.name}. Cancel or reset anytime from Settings.
            </p>

          </div>

        </div>

      </div>
    </div>
  );
};
