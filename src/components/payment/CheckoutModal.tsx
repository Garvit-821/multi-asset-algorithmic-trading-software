import React, { useState } from 'react';
import { CreditCard, Lock, Sparkles, X, ShieldCheck, ArrowRight, Zap, RefreshCw, AlertCircle, Wifi, CheckCircle2, ChevronDown } from 'lucide-react';
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
  selectedPlanId: initialPlanId,
  initialInterval = 'annual',
  onClose,
  onSuccess,
}) => {
  const [activePlanId, setActivePlanId] = useState<PlanId>(initialPlanId === 'free' ? 'pro' : initialPlanId);
  const [interval, setInterval] = useState<BillingInterval>(initialInterval);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [cardHolder, setCardHolder] = useState('Alex Vance');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [zipCode, setZipCode] = useState('10001');

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const plan = PLANS[activePlanId] || PLANS.pro;
  const isAnnual = interval === 'annual';
  const monthlyRate = isAnnual ? plan.annualPrice : plan.monthlyPrice;
  const totalAmount = isAnnual ? monthlyRate * 12 : monthlyRate;
  const annualSavings = (plan.monthlyPrice - plan.annualPrice) * 12;

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
    await new Promise((res) => setTimeout(res, 350));

    setProcessingStep('Connecting to mock payment gateway...');
    await new Promise((res) => setTimeout(res, 450));

    setProcessingStep('Confirming quantitative plan activation...');

    const receipt = await subscriptionService.processMockPayment({
      planId: activePlanId,
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 overflow-hidden">
      <div className="bg-white border border-[#dee1e6] rounded-2xl sm:rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[88vh] my-auto text-[#0a0b0d] animate-in zoom-in-95 duration-200">

        {/* Fixed Top Header Bar */}
        <div className="shrink-0 bg-[#0a0b0d] text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between border-b border-[#26282c]">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#0052ff] to-blue-700 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/20 shrink-0">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-lg font-extrabold text-white tracking-tight truncate">Stratrade Secure Checkout</h2>
                <span className="bg-emerald-500/15 text-emerald-400 text-[9px] sm:text-[10px] font-extrabold font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wide shrink-0">
                  DEMO
                </span>
              </div>
              <p className="text-[11px] text-[#a8acb3] hidden sm:block">Instant Sandbox Access • Zero Real Financial Risk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-[#a8acb3] hover:text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Accordion Toggle Bar (Visible on mobile screens < md) */}
        <div className="md:hidden bg-[#f7f7f7] border-b border-[#dee1e6] px-4 py-2.5 flex items-center justify-between text-xs shrink-0">
          <button
            type="button"
            onClick={() => setShowMobileSummary(!showMobileSummary)}
            className="flex items-center space-x-1.5 font-extrabold text-[#0052ff] hover:underline"
          >
            <span>Order Summary ({plan.name})</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMobileSummary ? 'rotate-180' : ''}`} />
          </button>
          <div className="font-extrabold text-[#0a0b0d]">
            ${totalAmount}.00 USD
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-full">

            {/* Left Column: Order Summary & Plan Features (Mobile collapsible or Desktop permanent) */}
            <div className={`md:col-span-5 bg-[#f7f7f7] p-4 sm:p-6 border-b md:border-b-0 md:border-r border-[#dee1e6] space-y-4 sm:space-y-5 flex-col justify-between ${
              showMobileSummary ? 'flex' : 'hidden md:flex'
            }`}>

              <div className="space-y-4">
                {/* Plan Switcher Tabs */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0052ff] block">
                    Select Subscription Plan
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-white border border-[#dee1e6] rounded-xl text-xs font-bold shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setActivePlanId('pro')}
                      className={`py-1.5 sm:py-2 px-2 rounded-lg transition-all text-center ${activePlanId === 'pro'
                        ? 'bg-[#0052ff] text-white shadow-xs'
                        : 'text-[#5b616e] hover:text-[#0a0b0d] hover:bg-[#f7f7f7]'
                      }`}
                    >
                      Pro Quant
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePlanId('institutional')}
                      className={`py-1.5 sm:py-2 px-2 rounded-lg transition-all text-center ${activePlanId === 'institutional'
                        ? 'bg-[#0a0b0d] text-white shadow-xs'
                        : 'text-[#5b616e] hover:text-[#0a0b0d] hover:bg-[#f7f7f7]'
                      }`}
                    >
                      Institutional
                    </button>
                  </div>
                </div>

                {/* Selected Plan Summary Card */}
                <div className="bg-white border border-[#dee1e6] rounded-2xl p-3.5 sm:p-4 space-y-2 shadow-xs relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-[#0a0b0d] text-sm sm:text-base">{plan.name}</h3>
                      <p className="text-[11px] text-[#5b616e] mt-0.5">{plan.tagline}</p>
                    </div>
                    <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${activePlanId === 'institutional'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-blue-50 text-[#0052ff] border-blue-200'
                    }`}>
                      {plan.badge}
                    </span>
                  </div>
                </div>

                {/* Billing Interval Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#0a0b0d]">Billing Cycle</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-white border border-[#dee1e6] rounded-xl font-bold text-xs">
                    <button
                      type="button"
                      onClick={() => setInterval('monthly')}
                      className={`py-1.5 sm:py-2 px-2.5 rounded-lg transition-all text-center ${interval === 'monthly'
                        ? 'bg-[#0a0b0d] text-white shadow-xs'
                        : 'text-[#5b616e] hover:text-[#0a0b0d]'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setInterval('annual')}
                      className={`py-1.5 sm:py-2 px-2.5 rounded-lg transition-all text-center flex items-center justify-center space-x-1 ${interval === 'annual'
                        ? 'bg-[#0052ff] text-white shadow-xs'
                        : 'text-[#5b616e] hover:text-[#0a0b0d]'
                      }`}
                    >
                      <span>Annual</span>
                      <span className="text-[9px] bg-emerald-400 text-[#0a0b0d] font-extrabold px-1.5 py-0.5 rounded-full">
                        SAVE 20%
                      </span>
                    </button>
                  </div>
                </div>

                {/* Dynamic Price Breakdown */}
                <div className="bg-white border border-[#dee1e6] rounded-2xl p-3.5 sm:p-4 space-y-2 font-mono text-xs shadow-xs">
                  <div className="flex justify-between text-[#5b616e]">
                    <span>Base Rate ({interval}):</span>
                    <span className="text-[#0a0b0d] font-semibold">${monthlyRate}/mo</span>
                  </div>
                  {isAnnual && (
                    <div className="flex justify-between text-[#05b169] font-bold">
                      <span>Annual Savings (20%):</span>
                      <span>-${annualSavings}/yr</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#5b616e]">
                    <span>Platform Fees & Tax:</span>
                    <span className="text-[#05b169] font-bold">$0.00 (Demo)</span>
                  </div>
                  <div className="border-t border-[#dee1e6] pt-2 flex justify-between items-center text-[#0a0b0d]">
                    <span className="font-sans font-extrabold text-xs">Total Amount:</span>
                    <span className="text-sm sm:text-base font-extrabold text-[#0052ff]">${totalAmount}.00 USD</span>
                  </div>
                </div>

                {/* Included Features Checklist */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-extrabold text-[#0a0b0d] flex items-center">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1.5" /> Features Unlocked Today:
                  </span>
                  <div className="space-y-1.5 text-[11px] text-[#0a0b0d]">
                    {plan.features.slice(0, 4).map((feat, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#05b169] shrink-0 mt-0.5" />
                        <span className="font-medium text-[#5b616e] leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#dee1e6] text-[10px] text-[#7c828a] font-mono text-center">
                SECURE CLIENT-SIDE SIMULATION
              </div>
            </div>

            {/* Right Column: Interactive Visual Credit Card & Input Form */}
            <div className="md:col-span-7 p-4 sm:p-6 space-y-4 sm:space-y-5 flex flex-col justify-between">

              <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">

                {/* Demo Auto-Fill Action Banner */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#0a0b0d]">Payment Details</h4>
                    <p className="text-[10px] sm:text-[11px] text-[#7c828a]">Enter card info or click auto-fill demo card.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillDemoCard}
                    className="px-3 sm:px-3.5 py-1 sm:py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0052ff] border border-blue-200 rounded-full font-extrabold text-xs transition-all flex items-center space-x-1.5 shadow-2xs hover:scale-105 active:scale-95 shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Fill Demo Card</span>
                  </button>
                </div>

                {/* Ultra-Slick Interactive Visual Credit Card Graphic */}
                <div className="bg-gradient-to-tr from-[#0a0b0d] via-[#111827] to-[#0052ff] text-white rounded-2xl p-3.5 sm:p-4 shadow-xl border border-white/10 space-y-3 sm:space-y-4 relative overflow-hidden group select-none">
                  {/* Decorative Background Pattern */}
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -left-10 -top-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center space-x-2">
                      {/* Simulated EMV Chip */}
                      <div className="w-8 h-5 sm:w-9 sm:h-6 bg-gradient-to-br from-amber-200 to-amber-400 rounded-md border border-amber-500/40 shadow-xs flex items-center justify-center">
                        <div className="w-6 h-3 sm:w-7 sm:h-4 border-t border-b border-amber-600/40" />
                      </div>
                      <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/60 rotate-90" />
                    </div>
                    <span className="font-mono font-extrabold text-[11px] sm:text-xs tracking-wider text-white/90 bg-white/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-white/15">
                      {detectedBrand}
                    </span>
                  </div>

                  {/* Live Card Number Preview */}
                  <div className="font-mono text-sm sm:text-lg font-bold tracking-widest text-white/95 text-shadow-sm py-0.5">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  {/* Live Cardholder Name & Expiry Preview */}
                  <div className="flex justify-between items-end text-[11px] sm:text-xs font-mono uppercase text-white/80 relative z-10 pt-0.5">
                    <div className="min-w-0 pr-2">
                      <div className="text-[8px] sm:text-[9px] text-white/50 tracking-wider">CARDHOLDER</div>
                      <div className="font-bold truncate max-w-[130px] sm:max-w-[180px]">{cardHolder || 'VALUED TRADER'}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[8px] sm:text-[9px] text-white/50 tracking-wider">EXPIRES</div>
                      <div className="font-bold">{expiryDate || 'MM/YY'}</div>
                    </div>
                  </div>
                </div>

                {/* Error Alert */}
                {errorMsg && (
                  <div className="p-2.5 sm:p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center space-x-2 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Form Input Fields */}
                <div className="space-y-2.5 sm:space-y-3">
                  {/* Cardholder Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-extrabold text-[#0a0b0d]">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="e.g. Alex Vance"
                      className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-white border border-[#dee1e6] rounded-xl text-sm sm:text-xs text-[#0a0b0d] font-semibold focus:border-[#0052ff] focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Card Number */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-extrabold text-[#0a0b0d]">Card Number</label>
                      <span className="text-[10px] font-mono text-[#5b616e]">Mock 16-Digit Card</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                        className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-white border border-[#dee1e6] rounded-xl text-sm sm:text-xs font-mono text-[#0a0b0d] tracking-wider focus:border-[#0052ff] focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all pr-10"
                      />
                      <CreditCard className="w-4 h-4 text-[#7c828a] absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Expiry, CVV & Postal Code Grid */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
                    <div className="space-y-1">
                      <label className="block text-[10px] sm:text-[11px] font-extrabold text-[#0a0b0d]">Expires</label>
                      <input
                        type="text"
                        required
                        value={expiryDate}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-2 sm:px-2.5 py-2 sm:py-2.5 bg-white border border-[#dee1e6] rounded-xl text-sm sm:text-xs font-mono text-center text-[#0a0b0d] focus:border-[#0052ff] focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] sm:text-[11px] font-extrabold text-[#0a0b0d]">CVV / CVC</label>
                      <input
                        type="password"
                        required
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="888"
                        maxLength={4}
                        className="w-full px-2 sm:px-2.5 py-2 sm:py-2.5 bg-white border border-[#dee1e6] rounded-xl text-sm sm:text-xs font-mono text-center text-[#0a0b0d] focus:border-[#0052ff] focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] sm:text-[11px] font-extrabold text-[#0a0b0d]">Postal Code</label>
                      <input
                        type="text"
                        required
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value.slice(0, 10))}
                        placeholder="10001"
                        className="w-full px-2 sm:px-2.5 py-2 sm:py-2.5 bg-white border border-[#dee1e6] rounded-xl text-sm sm:text-xs font-mono text-center text-[#0a0b0d] focus:border-[#0052ff] focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Security Badges */}
                <div className="pt-0.5 flex items-center justify-between text-[10px] sm:text-[11px] text-[#7c828a] font-medium">
                  <span className="flex items-center space-x-1">
                    <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#05b169]" />
                    <span>256-bit Encrypted SSL</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#0052ff]" />
                    <span>Instant Sandbox Unlock</span>
                  </span>
                </div>

                {/* Submit CTA Button */}
                <div className="pt-1 sm:pt-2">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 sm:py-4 bg-[#0052ff] hover:bg-[#003ecc] disabled:bg-blue-400 text-white rounded-2xl font-extrabold text-xs sm:text-sm transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center space-x-2 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>{processingStep || 'Processing Payment...'}</span>
                      </div>
                    ) : (
                      <>
                        <span className="truncate">Pay ${totalAmount}.00 & Unlock {plan.name}</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </>
                    )}
                  </button>
                </div>

              </form>

              <p className="text-[9px] sm:text-[10px] text-center text-[#7c828a] pt-1 leading-snug">
                By completing this mock transaction, your current account subscription will immediately elevate to {plan.name}. Cancel or reset anytime from Settings.
              </p>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
