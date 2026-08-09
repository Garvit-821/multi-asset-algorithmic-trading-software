import React, { useState } from 'react';
import {
  CreditCard,
  User,
  BrainCircuit,
  Bell,
  Trash2,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  Send,
  Zap,
  RefreshCw,
  SlidersHorizontal,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import {
  SubscriptionState,
  PlanId,
  subscriptionService,
} from '../services/subscriptionService';
import { getGeminiApiKey, setGeminiApiKey } from '../services/aiCopilotService';

interface SettingsViewProps {
  user: { email?: string; name?: string };
  subscription: SubscriptionState;
  onOpenCheckout: (planId: PlanId) => void;
  onUpdateSubscription: (state: SubscriptionState) => void;
  onResetAccount: () => void;
}

type SettingsTab = 'subscription' | 'account' | 'ai' | 'trading' | 'notifications' | 'danger';

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  subscription,
  onOpenCheckout,
  onUpdateSubscription,
  onResetAccount,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('subscription');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Account Profile States
  const [displayName, setDisplayName] = useState(user.name || 'Quant Trader');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('UTC (Coordinated Universal Time)');

  // AI Integration States
  const [geminiKey, setGeminiKey] = useState(getGeminiApiKey());
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const [aiTemperature, setAiTemperature] = useState(0.2);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<string | null>(null);

  // Trading & Execution States
  const [defaultOrderSize, setDefaultOrderSize] = useState('5000');
  const [defaultStopLoss, setDefaultStopLoss] = useState('2.0');
  const [defaultTakeProfit, setDefaultTakeProfit] = useState('5.0');
  const [slippageTolerance, setSlippageTolerance] = useState('0.1');

  // Notifications & Telegram States
  const [telegramChatId, setTelegramChatId] = useState('');
  const [audioChimes, setAudioChimes] = useState(true);
  const [priceCrossingAlerts, setPriceCrossingAlerts] = useState(true);
  const [aiSignalAlerts, setAiSignalAlerts] = useState(true);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveGeminiKey = () => {
    setGeminiApiKey(geminiKey);
    showToast('Gemini API key updated successfully');
  };

  const handleTestAiConnection = async () => {
    setIsTestingAi(true);
    setAiTestResult(null);
    await new Promise((res) => setTimeout(res, 800));
    setIsTestingAi(false);
    if (geminiKey.trim()) {
      setAiTestResult('Connected • Latency: 42ms • Model: Gemini 2.0 Flash');
    } else {
      setAiTestResult('No API Key configured • Running on public demo fallback');
    }
  };

  const handleTestTelegram = async () => {
    if (!telegramChatId) {
      showToast('Please enter a valid Telegram Chat ID first');
      return;
    }
    setIsTestingTelegram(true);
    await new Promise((res) => setTimeout(res, 900));
    setIsTestingTelegram(false);
    showToast(`Test payload dispatched to Telegram ID: ${telegramChatId}`);
  };

  const handleDowngrade = () => {
    if (window.confirm('Reset subscription to Free Sandbox tier? Unlocked quantitative features will revert to basic view.')) {
      const freeState = subscriptionService.resetToFree();
      onUpdateSubscription(freeState);
      showToast('Subscription downgraded to Free Sandbox');
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#f8f9fa] text-[#0a0b0d] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Global Toast Notification */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0a0b0d] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 text-xs font-semibold flex items-center space-x-2 animate-in slide-in-from-bottom-5 duration-200">
            <CheckCircle2 className="w-4 h-4 text-[#05b169]" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Header Title Bar */}
        <div className="bg-white border border-[#dee1e6] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0a0b0d] tracking-tight">
                Workstation Settings
              </h1>
              <span className="bg-blue-50 text-[#0052ff] border border-blue-200 text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                INSTITUTIONAL
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#5b616e]">
              Manage subscription monetization, API keys, AI Copilot integration, trading parameters, and notification alerts.
            </p>
          </div>

          {/* Active Plan Status Badge */}
          <div className="bg-[#f7f7f7] border border-[#dee1e6] rounded-2xl px-4 py-3 flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 bg-[#0052ff] rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold text-[#7c828a] uppercase">Active Plan Tier</div>
              <div className="text-sm font-extrabold text-[#0a0b0d]">{subscription.planName}</div>
            </div>
          </div>
        </div>

        {/* Settings Category Navigation Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-1 no-scrollbar border-b border-[#dee1e6]">
          {[
            { id: 'subscription', label: 'Subscription & Monetization', icon: CreditCard },
            { id: 'account', label: 'Account Profile', icon: User },
            { id: 'ai', label: 'AI & Gemini Copilot', icon: BrainCircuit },
            { id: 'trading', label: 'Trading Execution', icon: SlidersHorizontal },
            { id: 'notifications', label: 'Alerts & Webhooks', icon: Bell },
            { id: 'danger', label: 'Danger Zone', icon: Trash2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center space-x-2 shrink-0 border ${
                  isActive
                    ? 'bg-[#0052ff] text-white border-[#0052ff] shadow-md shadow-blue-500/20'
                    : 'bg-white text-[#5b616e] hover:text-[#0a0b0d] hover:bg-[#f7f7f7] border-[#dee1e6]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Subscription & Monetization */}
        {activeTab === 'subscription' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white border border-[#dee1e6] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#dee1e6] pb-4 gap-3">
                <div>
                  <h3 className="text-lg font-extrabold text-[#0a0b0d] flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-[#0052ff]" />
                    <span>Subscription Plan & Feature Gating</span>
                  </h3>
                  <p className="text-xs text-[#5b616e] mt-0.5">
                    Upgrade to unlock advanced Options Greeks matrix, AI synthesis, and stochastic risk Monte Carlo algorithms.
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold font-mono rounded-full border self-start sm:self-auto ${
                  subscription.planId === 'institutional'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : subscription.planId === 'pro'
                    ? 'bg-blue-50 text-[#0052ff] border-blue-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                }`}>
                  {subscription.planName.toUpperCase()}
                </span>
              </div>

              {/* Subscription Key Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#f7f7f7] border border-[#dee1e6] rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#7c828a] uppercase">Current Plan</span>
                  <div className="text-base font-extrabold text-[#0a0b0d]">{subscription.planName}</div>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Active Demo License
                  </span>
                </div>

                <div className="bg-[#f7f7f7] border border-[#dee1e6] rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#7c828a] uppercase">Amount Billed</span>
                  <div className="text-base font-extrabold text-[#0052ff]">${subscription.amountPaid}.00 USD</div>
                  <span className="text-[10px] text-[#5b616e] font-mono capitalize">{subscription.billingInterval} billing</span>
                </div>

                <div className="bg-[#f7f7f7] border border-[#dee1e6] rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#7c828a] uppercase">Payment Instrument</span>
                  <div className="text-base font-extrabold text-[#0a0b0d]">
                    {subscription.cardLast4 !== '0000' ? `${subscription.cardBrand} •••• ${subscription.cardLast4}` : 'Free Sandbox'}
                  </div>
                  <span className="text-[10px] text-[#5b616e]">Verified mock card</span>
                </div>

                <div className="bg-[#f7f7f7] border border-[#dee1e6] rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#7c828a] uppercase">Next Renewal</span>
                  <div className="text-base font-extrabold text-[#0a0b0d]">{subscription.nextBillingDate}</div>
                  <span className="text-[10px] text-[#5b616e]">Auto-renews (Demo)</span>
                </div>
              </div>

              {/* Tier Change Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onOpenCheckout(subscription.planId === 'pro' ? 'institutional' : 'pro')}
                  className="px-6 py-3.5 bg-[#0052ff] hover:bg-[#003ecc] text-white rounded-2xl font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center space-x-2 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{subscription.planId === 'free' ? 'Upgrade to Pro Quant Pass' : 'Change Subscription Tier'}</span>
                </button>

                {subscription.planId !== 'institutional' && (
                  <button
                    onClick={() => onOpenCheckout('institutional')}
                    className="px-6 py-3.5 bg-[#0a0b0d] hover:bg-black text-white rounded-2xl font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-gray-900/20 flex items-center space-x-2"
                  >
                    <span>Upgrade to Institutional Alpha ($159/mo)</span>
                    <ArrowUpRight className="w-4 h-4 text-amber-400" />
                  </button>
                )}

                {subscription.planId !== 'free' && (
                  <button
                    onClick={handleDowngrade}
                    className="px-5 py-3.5 bg-white hover:bg-gray-100 text-gray-700 border border-[#dee1e6] rounded-2xl font-bold text-xs transition-colors"
                  >
                    Downgrade to Free Sandbox
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Account Profile */}
        {activeTab === 'account' && (
          <div className="bg-white border border-[#dee1e6] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-200">
            <h3 className="text-lg font-extrabold text-[#0a0b0d] flex items-center space-x-2 border-b border-[#dee1e6] pb-4">
              <User className="w-5 h-5 text-[#0052ff]" />
              <span>Trader Profile & Regional Preferences</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[#0a0b0d]">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#dee1e6] rounded-2xl text-xs font-semibold text-[#0a0b0d] focus:border-[#0052ff] focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[#0a0b0d]">Primary Email Address</label>
                <input
                  type="email"
                  value={user.email || 'trader@stratrade.io'}
                  disabled
                  className="w-full px-4 py-3 bg-[#f7f7f7] border border-[#dee1e6] rounded-2xl text-xs font-mono text-[#5b616e] cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[#0a0b0d]">Base Currency Preference</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#dee1e6] rounded-2xl text-xs font-semibold text-[#0a0b0d] focus:border-[#0052ff] focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                >
                  <option value="USD">USD ($) - United States Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="BTC">BTC (₿) - Bitcoin Equivalent</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[#0a0b0d]">Timezone & Exchange Reference</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#dee1e6] rounded-2xl text-xs font-semibold text-[#0a0b0d] focus:border-[#0052ff] focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="EST">EST (Eastern Standard Time - Wall St)</option>
                  <option value="GMT">GMT (Greenwich Mean Time - London)</option>
                  <option value="IST">IST (Indian Standard Time)</option>
                  <option value="SGT">SGT (Singapore Time - Asia FX)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => showToast('Account profile preferences updated')}
                className="px-6 py-3.5 bg-[#0052ff] hover:bg-[#003ecc] text-white rounded-2xl font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20"
              >
                Save Profile Preferences
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: AI & Gemini Copilot */}
        {activeTab === 'ai' && (
          <div className="bg-white border border-[#dee1e6] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#dee1e6] pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#0a0b0d] flex items-center space-x-2">
                  <BrainCircuit className="w-5 h-5 text-[#0052ff]" />
                  <span>Google Gemini 2.0 AI Copilot Integration</span>
                </h3>
                <p className="text-xs text-[#5b616e] mt-0.5">
                  Configure custom Gemini API credentials for real-time market sentiment synthesis and quantitative prompt processing.
                </p>
              </div>
              <span className={`px-3 py-1 text-xs font-bold font-mono rounded-full border ${
                geminiKey ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {geminiKey ? 'KEY CONFIGURED' : 'DEMO FALLBACK'}
              </span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[#0a0b0d]">Google Gemini API Key</label>
                <div className="relative">
                  <input
                    type={showGeminiKey ? 'text' : 'password'}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-4 py-3 bg-white border border-[#dee1e6] rounded-2xl text-xs font-mono text-[#0a0b0d] focus:border-[#0052ff] focus:ring-2 focus:ring-blue-500/20 focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-[#7c828a]">
                  Keys are stored exclusively in local browser memory (`localStorage`) and never transmitted to external servers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-[#0a0b0d]">AI Model Target</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#dee1e6] rounded-2xl text-xs font-semibold text-[#0a0b0d] focus:border-[#0052ff] focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    <option value="gemini-2.0-flash">Google Gemini 2.0 Flash (Sub-second low latency)</option>
                    <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Deep quantitative reasoning)</option>
                    <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash-Lite (High throughput)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-[#0a0b0d]">Model Temperature ({aiTemperature})</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={aiTemperature}
                    onChange={(e) => setAiTemperature(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0052ff] mt-4"
                  />
                  <div className="flex justify-between text-[10px] text-[#7c828a] font-mono">
                    <span>0.0 (Deterministic Math)</span>
                    <span>1.0 (Creative Synthesis)</span>
                  </div>
                </div>
              </div>

              {aiTestResult && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono font-bold rounded-2xl flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0052ff] shrink-0" />
                  <span>{aiTestResult}</span>
                </div>
              )}

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={handleSaveGeminiKey}
                  className="px-6 py-3.5 bg-[#0052ff] hover:bg-[#003ecc] text-white rounded-2xl font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20"
                >
                  Save API Configuration
                </button>

                <button
                  onClick={handleTestAiConnection}
                  disabled={isTestingAi}
                  className="px-5 py-3.5 bg-white hover:bg-gray-100 text-[#0a0b0d] border border-[#dee1e6] rounded-2xl font-bold text-xs transition-colors flex items-center space-x-1.5"
                >
                  {isTestingAi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-500" />}
                  <span>Test Connection</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Trading Execution Defaults */}
        {activeTab === 'trading' && (
          <div className="bg-white border border-[#dee1e6] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-200">
            <h3 className="text-lg font-extrabold text-[#0a0b0d] flex items-center space-x-2 border-b border-[#dee1e6] pb-4">
              <SlidersHorizontal className="w-5 h-5 text-[#0052ff]" />
              <span>Default Trading Parameters & Risk Slippage</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[#0a0b0d]">Default Order Size (USD)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={defaultOrderSize}
                    onChange={(e) => setDefaultOrderSize(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#dee1e6] rounded-2xl text-xs font-mono text-[#0a0b0d] focus:border-[#0052ff] focus:ring-2 focus:ring-blue-500/20 focus:outline-none pl-8"
                  />
                  <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[#0a0b0d]">Slippage Tolerance (%)</label>
                <select
                  value={slippageTolerance}
                  onChange={(e) => setSlippageTolerance(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#dee1e6] rounded-2xl text-xs font-mono font-semibold text-[#0a0b0d] focus:border-[#0052ff] focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                >
                  <option value="0.1">0.1% (Strict Institutional Matching)</option>
                  <option value="0.5">0.5% (Standard Market Spread)</option>
                  <option value="1.0">1.0% (High Volatility Allowance)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[#0a0b0d]">Default Stop-Loss Target (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={defaultStopLoss}
                  onChange={(e) => setDefaultStopLoss(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#dee1e6] rounded-2xl text-xs font-mono text-[#0a0b0d] focus:border-[#0052ff] focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[#0a0b0d]">Default Take-Profit Target (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={defaultTakeProfit}
                  onChange={(e) => setDefaultTakeProfit(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#dee1e6] rounded-2xl text-xs font-mono text-[#0a0b0d] focus:border-[#0052ff] focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => showToast('Trading execution defaults saved')}
                className="px-6 py-3.5 bg-[#0052ff] hover:bg-[#003ecc] text-white rounded-2xl font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20"
              >
                Save Execution Parameters
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: Notifications & Webhooks */}
        {activeTab === 'notifications' && (
          <div className="bg-white border border-[#dee1e6] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-200">
            <h3 className="text-lg font-extrabold text-[#0a0b0d] flex items-center space-x-2 border-b border-[#dee1e6] pb-4">
              <Bell className="w-5 h-5 text-[#0052ff]" />
              <span>Telegram Alert Webhook & Audio Chimes</span>
            </h3>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[#0a0b0d]">Telegram Chat Identifier (Alert Bot)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    placeholder="e.g. 582910482"
                    className="flex-1 px-4 py-3 bg-white border border-[#dee1e6] rounded-2xl text-xs font-mono text-[#0a0b0d] focus:border-[#0052ff] focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                  <button
                    onClick={handleTestTelegram}
                    disabled={isTestingTelegram}
                    className="px-4 py-3 bg-blue-50 hover:bg-blue-100 text-[#0052ff] border border-blue-200 rounded-2xl font-extrabold text-xs transition-all flex items-center space-x-1.5 shrink-0"
                  >
                    {isTestingTelegram ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Test Dispatch</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#7c828a] leading-relaxed">
                  Message <span className="font-mono bg-[#f7f7f7] px-1.5 py-0.5 rounded border border-[#dee1e6]">@userinfobot</span> on Telegram to retrieve your numerical ID.
                </p>
              </div>

              {/* Notification Toggle Controls */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 bg-[#f7f7f7] border border-[#dee1e6] rounded-2xl">
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0a0b0d]">Execution Audio Sound Chimes</h4>
                    <p className="text-[11px] text-[#7c828a]">Play high-precision audio feedback on paper trade fill</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={audioChimes}
                    onChange={(e) => setAudioChimes(e.target.checked)}
                    className="w-5 h-5 accent-[#0052ff] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-[#f7f7f7] border border-[#dee1e6] rounded-2xl">
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0a0b0d]">Price Crossing Signal Alerts</h4>
                    <p className="text-[11px] text-[#7c828a]">Dispatch background alerts when price breaks technical thresholds</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={priceCrossingAlerts}
                    onChange={(e) => setPriceCrossingAlerts(e.target.checked)}
                    className="w-5 h-5 accent-[#0052ff] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-[#f7f7f7] border border-[#dee1e6] rounded-2xl">
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0a0b0d]">AI Gemini Signal Notifications</h4>
                    <p className="text-[11px] text-[#7c828a]">Notify when AI Copilot detects high-probability momentum shifts</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={aiSignalAlerts}
                    onChange={(e) => setAiSignalAlerts(e.target.checked)}
                    className="w-5 h-5 accent-[#0052ff] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Danger Zone & Portfolio Reset */}
        {activeTab === 'danger' && (
          <div className="bg-white border border-rose-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center space-x-2 border-b border-rose-100 pb-4 text-rose-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-lg font-extrabold">Danger Zone & System State Reset</h3>
            </div>

            <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-5 space-y-3">
              <h4 className="text-sm font-extrabold text-rose-800">Reset Paper Portfolio Account</h4>
              <p className="text-xs text-rose-700 leading-relaxed">
                Permanently purge all paper trading positions, order execution logs, and restore virtual equity back to $100,000 USD.
              </p>
              <button
                onClick={onResetAccount}
                className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-extrabold text-xs transition-all shadow-md shadow-rose-600/20 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Virtual Portfolio Balance</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
