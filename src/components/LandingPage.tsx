import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  ShieldAlert,
  Cpu,
  Zap,
  ArrowRight,
  Globe,
  Smartphone,
  Menu,
  X,
  Github,
  Star,
  BrainCircuit,
  Calculator,
  BarChart2,
  Target,
  Sparkles,
  History,
  Wallet,
  Lock,
  Bell,
  Layers,
  Terminal,
  Play,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
  ChevronRight,
  Code2,
  Compass,
  Check,
  CreditCard,
  CheckCircle2
} from 'lucide-react';

import {
  PlanId,
  PaymentReceipt,
} from '../services/subscriptionService';
import { CheckoutModal } from './payment/CheckoutModal';
import { PaymentConfirmationModal } from './payment/PaymentConfirmationModal';

interface LandingPageProps {
  onLaunch: () => void;
  onOpenCheckout?: (planId: PlanId) => void;
}

type FeatureTab = 'derivatives' | 'ai' | 'backtest' | 'visual' | 'optimizer' | 'paper';
type AssetCategory = 'all' | 'crypto' | 'commodities' | 'equities';

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch, onOpenCheckout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState<FeatureTab>('derivatives');
  const [selectedAssetCategory, setSelectedAssetCategory] = useState<AssetCategory>('all');
  const [liveSimValue, setLiveSimValue] = useState<number>(64520.40);
  const [isAnnualBilling, setIsAnnualBilling] = useState<boolean>(true);

  // Modal checkout state local to LandingPage (if onOpenCheckout not handled externally)
  const [checkoutPlanId, setCheckoutPlanId] = useState<PlanId | null>(null);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  // Live simulation tick update (4s interval to avoid main-thread churn)
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.48) * 22;
      setLiveSimValue((prev) => Math.round((prev + delta) * 100) / 100);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Asset list with sparkline datasets for humanized visual presentation
  const assetList = useMemo(() => [
    {
      symbol: 'BTC/USDT',
      name: 'Bitcoin',
      price: `$${liveSimValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      change: '+2.45%',
      isPositive: true,
      category: 'crypto',
      icon: '₿',
      volume: '$28.4B',
      sparkline: [40, 42, 45, 43, 48, 52, 58, 55, 62, 68]
    },
    {
      symbol: 'ETH/USDT',
      name: 'Ethereum',
      price: '$3,450.20',
      change: '+1.82%',
      isPositive: true,
      category: 'crypto',
      icon: 'Ξ',
      volume: '$14.2B',
      sparkline: [30, 32, 31, 35, 38, 42, 40, 44, 46, 50]
    },
    {
      symbol: 'SOL/USDT',
      name: 'Solana',
      price: '$148.50',
      change: '-0.95%',
      isPositive: false,
      category: 'crypto',
      icon: '◎',
      volume: '$4.1B',
      sparkline: [60, 58, 55, 52, 50, 48, 51, 47, 46, 44]
    },
    {
      symbol: 'XAU/USD',
      name: 'Gold Bullion',
      price: '$2,382.40',
      change: '+0.42%',
      isPositive: true,
      category: 'commodities',
      icon: 'Au',
      volume: '$12.8B',
      sparkline: [50, 51, 52, 51, 53, 54, 53, 55, 56, 58]
    },
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: '$225.10',
      change: '+1.15%',
      isPositive: true,
      category: 'equities',
      icon: '',
      volume: '$8.6B',
      sparkline: [20, 22, 25, 24, 28, 30, 32, 31, 34, 38]
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corp.',
      price: '$128.80',
      change: '+3.74%',
      isPositive: true,
      category: 'equities',
      icon: 'N',
      volume: '$22.1B',
      sparkline: [10, 15, 22, 30, 38, 45, 55, 62, 70, 82]
    },
  ], [liveSimValue]);

  const filteredAssets = selectedAssetCategory === 'all'
    ? assetList
    : assetList.filter(a => a.category === selectedAssetCategory);

  const handleSelectPlan = (planId: PlanId) => {
    if (onOpenCheckout) {
      onOpenCheckout(planId);
    } else {
      setCheckoutPlanId(planId);
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#5b616e] flex flex-col font-sans overflow-x-hidden selection:bg-[#0052ff] selection:text-white" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ─── 1. TOP HEADER NAVIGATION (DESIGN.md top-nav-light) ─────────────── */}
      <header className="bg-[#ffffff]/90 backdrop-blur-md border-b border-[#dee1e6] h-16 sticky top-0 z-50 transition-all">
        <div className="max-w-[1240px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={onLaunch}>
            <div className="w-9 h-9 bg-[#0052ff] rounded-full flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:bg-[#003ecc] transition-all">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#0a0b0d]" style={{ letterSpacing: '-0.5px' }}>
                Stratrade
              </span>
              <span className="text-[9px] text-[#0052ff] font-extrabold uppercase tracking-widest -mt-1">Workstation v1.2</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-[#5b616e]">
            <a href="#showcase" className="hover:text-[#0052ff] transition-colors flex items-center space-x-1.5">
              <Compass className="w-4 h-4 text-[#0052ff]" />
              <span>Terminal Tour</span>
            </a>
            <a href="#features" className="hover:text-[#0052ff] transition-colors">Quant Suite</a>
            <a href="#explore" className="hover:text-[#0052ff] transition-colors">Asset Catalog</a>
            <a href="#pricing" className="hover:text-[#0052ff] transition-colors font-bold text-[#0052ff]">Pricing Plans</a>
            <a href="#tech" className="hover:text-[#0052ff] transition-colors">Architecture</a>
          </nav>

          {/* Nav Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <a
              href="https://github.com/Garvit-821/multi-asset-algorithmic-trading-software"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-4 bg-[#eef0f3] hover:bg-[#dee1e6] text-[#0a0b0d] rounded-full font-semibold text-xs transition-all flex items-center space-x-2 shadow-xs group"
            >
              <Github className="w-3.5 h-3.5 text-[#0a0b0d]" />
              <span>GitHub</span>
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 group-hover:rotate-12 transition-transform" />
            </a>

            <button
              onClick={onLaunch}
              className="h-10 px-6 bg-[#0052ff] hover:bg-[#003ecc] text-white rounded-full font-bold text-xs transition-all shadow-md shadow-blue-500/20 flex items-center space-x-2 group"
            >
              <span>Launch Terminal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full bg-[#f7f7f7] text-[#0a0b0d] hover:bg-[#eef0f3] transition-colors border border-[#dee1e6]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-[#dee1e6] p-6 shadow-2xl z-40 lg:hidden flex flex-col space-y-4 font-sans text-sm">
            <a href="#showcase" onClick={() => setMobileMenuOpen(false)} className="text-[#0a0b0d] hover:text-[#0052ff] font-bold">Terminal Tour</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-[#0a0b0d] hover:text-[#0052ff] font-bold">Quant Suite</a>
            <a href="#explore" onClick={() => setMobileMenuOpen(false)} className="text-[#0a0b0d] hover:text-[#0052ff] font-bold">Asset Catalog</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-[#0052ff] font-bold">Pricing Plans</a>
            <a href="#tech" onClick={() => setMobileMenuOpen(false)} className="text-[#0a0b0d] hover:text-[#0052ff] font-bold">Architecture</a>
            <hr className="border-[#dee1e6]" />
            <button
              onClick={() => { setMobileMenuOpen(false); onLaunch(); }}
              className="w-full py-3 bg-[#0052ff] text-white rounded-full font-bold text-sm text-center flex items-center justify-center space-x-2"
            >
              <span>Launch Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {/* ─── 2. HERO SECTION: FULL-BLEED DARK EDITORIAL (DESIGN.md hero-band-dark) ─── */}
      <section className="bg-[#0a0b0d] text-white py-20 lg:py-28 px-6 relative overflow-hidden">
        {/* Ambient Subtle Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage: `radial-gradient(#2a303c 1px, transparent 1px), radial-gradient(#2a303c 1px, #0a0b0d 1px)`,
            backgroundSize: `48px 48px`,
            backgroundPosition: `0 0, 24px 24px`
          }}
        />

        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#0052ff]/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-[1240px] mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">

          {/* Hero Left Column Text */}
          <div className="flex-1 text-center lg:text-left space-y-6 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-[#16181c] border border-[#282d38] rounded-full text-xs font-semibold text-slate-300">
              <span className="w-2 h-2 bg-[#05b169] rounded-full animate-ping" />
              <span className="text-white font-mono text-[11px] uppercase tracking-wider">Institutional Algorithmic Trading Software</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.05]" style={{ letterSpacing: '-1.8px' }}>
              Institutional Algorithmic Trading{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 font-bold">
                Workstation.
              </span>
            </h1>

            <p className="text-[#a8acb3] text-base md:text-lg font-normal leading-relaxed">
              Connect to low-latency Binance WebSockets, compute Black-Scholes Option Greeks, query Google Gemini AI market intelligence, and run Monte Carlo stochastic risk paths directly in your browser.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onLaunch}
                className="w-full sm:w-auto h-14 px-8 bg-[#0052ff] hover:bg-[#003ecc] text-white rounded-full font-bold text-sm transition-all flex items-center justify-center space-x-2.5 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/35 group"
              >
                <Terminal className="w-4.5 h-4.5 text-blue-200" />
                <span>Launch Terminal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#pricing"
                className="w-full sm:w-auto h-14 px-7 bg-[#16181c] hover:bg-[#202328] text-white rounded-full font-bold text-sm border border-[#26282c] transition-all flex items-center justify-center space-x-2.5 group"
              >
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span>View Pricing Plans</span>
              </a>
            </div>

            {/* Key Metric Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#1a1d24] text-left font-mono">
              <div className="bg-[#16181c] border border-[#26282c] rounded-2xl p-3.5 backdrop-blur-md">
                <p className="text-xl font-bold text-white">&lt;150ms</p>
                <p className="text-[10px] text-[#7c828a] uppercase font-sans font-semibold tracking-wider">Stream Latency</p>
              </div>
              <div className="bg-[#16181c] border border-[#26282c] rounded-2xl p-3.5 backdrop-blur-md">
                <p className="text-xl font-bold text-[#05b169]">1,000+</p>
                <p className="text-[10px] text-[#7c828a] uppercase font-sans font-semibold tracking-wider">Monte Carlo Paths</p>
              </div>
              <div className="bg-[#16181c] border border-[#26282c] rounded-2xl p-3.5 backdrop-blur-md">
                <p className="text-xl font-bold text-blue-400">5 Greeks</p>
                <p className="text-[10px] text-[#7c828a] uppercase font-sans font-semibold tracking-wider">Options Sensitivity</p>
              </div>
              <div className="bg-[#16181c] border border-[#26282c] rounded-2xl p-3.5 backdrop-blur-md">
                <p className="text-xl font-bold text-amber-400">$100,000</p>
                <p className="text-[10px] text-[#7c828a] uppercase font-sans font-semibold tracking-wider">Virtual Sandbox</p>
              </div>
            </div>
          </div>

          {/* Hero Right Column: Layered Product-UI Mockup Cards (DESIGN.md product-ui-card-dark) */}
          <div className="flex-1 w-full flex justify-center items-center relative h-[400px] sm:h-[450px]">
            <div className="absolute w-[95%] sm:w-[420px] bg-[#16181c] border border-[#282d38] rounded-3xl p-5 shadow-2xl z-20 backdrop-blur-xl transform -rotate-1 hover:rotate-0 transition-all duration-300">
              <div className="flex justify-between items-center pb-3 border-b border-[#222733] mb-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1.5">
                    <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block"></span>
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block"></span>
                    <span className="w-2.5 h-2.5 bg-[#05b169] rounded-full inline-block"></span>
                  </div>
                  <span className="text-xs font-bold text-slate-300 font-mono pl-2">BTC/USDT WebSocket</span>
                </div>
                <span className="px-2.5 py-0.5 bg-[#05b169]/10 text-[#05b169] text-[10px] font-bold rounded-full border border-[#05b169]/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-[#05b169] rounded-full animate-ping"></span>
                  <span>FEED ACTIVE</span>
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-[10px] font-semibold text-[#7c828a] block font-mono">SPOT VALUATION</span>
                    <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                      ${liveSimValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#05b169] font-mono flex items-center justify-end">
                      <ArrowUpRight className="w-4 h-4 mr-0.5" /> +2.45%
                    </span>
                    <span className="text-[10px] text-[#7c828a] font-mono">24H High: $64,890</span>
                  </div>
                </div>

                {/* Animated Candle/Sparkline Chart Simulation */}
                <div className="bg-[#0a0b0d] border border-[#222733] rounded-2xl p-3 h-24 flex items-end justify-between gap-1.5">
                  {[35, 42, 28, 55, 48, 65, 58, 72, 85, 78, 88, 95, 90, 98, 100].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full">
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 via-indigo-500 to-[#05b169] rounded-t-xs"
                        style={{ height: `${val}%` }}
                      />
                    </div>
                  ))}
                </div>

                {/* Options Greeks Summary Pill */}
                <div className="bg-[#1c1f26] border border-[#2b3345] rounded-xl p-3 flex items-start space-x-3 text-xs text-slate-300">
                  <Calculator className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div className="font-mono text-[11px] space-y-0.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">Black-Scholes Options Matrix</span>
                      <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full">DTE: 30d</span>
                    </div>
                    <p className="text-slate-400">Δ Delta: <strong className="text-[#05b169]">+0.6420</strong> | Θ Theta: <strong className="text-rose-400">-$42.80/d</strong> | ν Vega: <strong className="text-indigo-400">+$12.40</strong></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 3. LIVE MARKET TICKER STRIP ────────────────────────────────────── */}
      <div className="bg-[#16181c] border-y border-[#26282c] py-3 text-xs font-mono text-white">
        <div className="max-w-[1240px] mx-auto px-6 flex items-center space-x-6 overflow-x-auto scrollbar-none">
          <span className="text-[#0052ff] font-extrabold uppercase text-[10px] tracking-widest shrink-0 flex items-center">
            <span className="w-2 h-2 bg-[#0052ff] rounded-full animate-ping mr-2"></span>
            LIVE STREAM INDEX:
          </span>
          {assetList.map((asset) => (
            <div key={asset.symbol} className="flex items-center space-x-2 shrink-0 bg-[#0a0b0d] px-3 py-1.5 rounded-lg border border-[#26282c]">
              <span className="font-bold text-slate-300">{asset.symbol}</span>
              <span className="text-white font-bold">{asset.price}</span>
              <span className={`text-[10px] font-bold ${asset.isPositive ? 'text-[#05b169]' : 'text-[#cf202f]'}`}>
                {asset.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 4. INTERACTIVE TERMINAL SIMULATOR SHOWCASE ─────────────────────── */}
      <section id="showcase" className="bg-[#f7f7f7] py-20 px-6 border-b border-[#dee1e6]">
        <div className="max-w-[1240px] mx-auto space-y-10">

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs text-[#0052ff] font-extrabold uppercase tracking-widest">Interactive Workstation Suite</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0a0b0d] tracking-tight" style={{ letterSpacing: '-0.8px' }}>
              Explore the Quantitative Terminal.
            </h2>
            <p className="text-sm text-[#5b616e]">
              Click through the main platform modules below to see real live preview simulations.
            </p>
          </div>

          {/* Module Selector Pill Bar */}
          <div className="flex overflow-x-auto justify-start md:justify-center gap-2 pb-2 scrollbar-none">
            {[
              { id: 'derivatives' as FeatureTab, label: 'Options & Derivatives', icon: Calculator },
              { id: 'ai' as FeatureTab, label: 'AI Copilot & Intelligence', icon: BrainCircuit },
              { id: 'backtest' as FeatureTab, label: 'Advanced Backtester', icon: BarChart2 },
              { id: 'visual' as FeatureTab, label: 'Visual Strategy Builder', icon: Sparkles },
              { id: 'optimizer' as FeatureTab, label: 'Portfolio Optimizer', icon: Target },
              { id: 'paper' as FeatureTab, label: '$100k Paper Sandbox', icon: Wallet },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFeatureTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFeatureTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-full font-bold text-xs whitespace-nowrap transition-all ${isActive
                      ? 'bg-[#0052ff] text-white shadow-md shadow-blue-500/20 scale-105'
                      : 'bg-white text-[#5b616e] hover:bg-[#eef0f3] border border-[#dee1e6]'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Terminal Window Frame */}
          <div className="bg-[#0a0b0d] border border-[#26282c] rounded-3xl overflow-hidden shadow-2xl text-white">

            {/* Window Top Control Bar */}
            <div className="bg-[#16181c] px-5 py-3 border-b border-[#26282c] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-rose-500 rounded-full inline-block"></span>
                <span className="w-3 h-3 bg-amber-500 rounded-full inline-block"></span>
                <span className="w-3 h-3 bg-[#05b169] rounded-full inline-block"></span>
                <span className="text-[#7c828a] pl-3 text-[11px] hidden sm:inline">stratrade.io/app/{activeFeatureTab}</span>
              </div>
              <div className="flex items-center space-x-3 text-[#7c828a] text-[11px]">
                <span className="flex items-center text-[#05b169]"><Play className="w-3 h-3 mr-1 fill-[#05b169]" /> ENGINE ONLINE</span>
                <Maximize2 className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
              </div>
            </div>

            {/* Tab Contents Frame */}
            <div className="p-6 sm:p-10">

              {/* TAB 1: DERIVATIVES */}
              {activeFeatureTab === 'derivatives' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-5">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-mono font-bold uppercase border border-blue-500/20">
                      Black-Scholes & Option Greeks
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                      Analytical Pricing & Sensitivity Matrix.
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed font-sans">
                      Compute theoretical Call/Put fair values using Abramowitz & Stegun polynomial normal distributions. Analyze real-time risk sensitivities across 5 core Greeks:
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs text-slate-300">
                      <span className="bg-[#16181c] border border-[#26282c] p-2 rounded-xl"><strong className="text-[#05b169]">Δ (Delta):</strong> Price Sensitivity</span>
                      <span className="bg-[#16181c] border border-[#26282c] p-2 rounded-xl"><strong className="text-blue-400">Γ (Gamma):</strong> Delta Convexity</span>
                      <span className="bg-[#16181c] border border-[#26282c] p-2 rounded-xl"><strong className="text-rose-400">Θ (Theta):</strong> Time Decay</span>
                      <span className="bg-[#16181c] border border-[#26282c] p-2 rounded-xl"><strong className="text-indigo-400">ν (Vega):</strong> Volatility Shift</span>
                      <span className="bg-[#16181c] border border-[#26282c] p-2 rounded-xl"><strong className="text-amber-400">ρ (Rho):</strong> Interest Rate</span>
                    </div>

                    <button onClick={onLaunch} className="px-6 py-3 bg-[#0052ff] hover:bg-[#003ecc] text-white rounded-full font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center space-x-2">
                      <span>Launch Options Engine</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="lg:col-span-6 bg-[#16181c] rounded-2xl p-5 border border-[#26282c] space-y-3 font-mono text-xs">
                    <div className="flex justify-between border-b border-[#26282c] pb-2 text-slate-300">
                      <span className="font-bold text-blue-400">OPTIONS MATRIX // BTC STRIKE $64,500</span>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">DTE: 30 DAYS</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between bg-[#0a0b0d] p-2.5 rounded-xl border border-[#26282c]">
                        <span className="text-[#7c828a]">Delta (Δ):</span>
                        <span className="text-[#05b169] font-bold">+0.6420 (Call) / -0.3580 (Put)</span>
                      </div>
                      <div className="flex justify-between bg-[#0a0b0d] p-2.5 rounded-xl border border-[#26282c]">
                        <span className="text-[#7c828a]">Gamma (Γ):</span>
                        <span className="text-blue-400 font-bold">0.000142 per $1 shift</span>
                      </div>
                      <div className="flex justify-between bg-[#0a0b0d] p-2.5 rounded-xl border border-[#26282c]">
                        <span className="text-[#7c828a]">Theta (Θ):</span>
                        <span className="text-[#cf202f] font-bold">-$42.80 / day time decay</span>
                      </div>
                      <div className="flex justify-between bg-[#0a0b0d] p-2.5 rounded-xl border border-[#26282c]">
                        <span className="text-[#7c828a]">Vega (ν):</span>
                        <span className="text-indigo-400 font-bold">+$12.40 per 1% IV shift</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AI COPILOT */}
              {activeFeatureTab === 'ai' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-5">
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs font-mono font-bold uppercase border border-purple-500/20">
                      Google Gemini 2.0 API Integration
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                      Real-Time AI Market Intelligence & Copilot.
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed font-sans">
                      Connect your Google Gemini API key to unlock natural language market analysis, real-time indicator signal explanations, automated strategy synthesis, and a persistent floating AI assistant drawer.
                    </p>
                    <button onClick={onLaunch} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold text-xs shadow-lg shadow-purple-500/20 flex items-center space-x-2">
                      <span>Open AI Copilot</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="lg:col-span-6 bg-[#16181c] rounded-2xl p-5 border border-[#26282c] space-y-3 font-sans">
                    <div className="flex items-center space-x-2 border-b border-[#26282c] pb-2">
                      <BrainCircuit className="w-5 h-5 text-purple-400" />
                      <span className="font-bold text-xs text-white">Gemini Market Intelligence Output</span>
                    </div>
                    <div className="bg-[#0a0b0d] p-4 rounded-xl text-slate-200 border border-[#26282c] space-y-2">
                      <span className="text-purple-400 font-bold font-mono text-xs block">&gt; PROMPT: "Analyze BTC/USDT momentum"</span>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        "BTC/USDT displays strong institutional accumulation above $64,000. RSI sits at 54 with positive MACD divergence on 1h candles. Suggested tactical target: $66,200 with tight stop loss at $63,700."
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: BACKTESTER */}
              {activeFeatureTab === 'backtest' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-5">
                    <span className="px-3 py-1 bg-[#05b169]/10 text-[#05b169] rounded-full text-xs font-mono font-bold uppercase border border-[#05b169]/20">
                      Historical Backtester & Replay
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                      Advanced Strategy Backtesting Engine.
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed font-sans">
                      Evaluate technical indicator trading rules against historical kline datasets. Obtain institutional risk metrics including Sharpe Ratio, Sortino Ratio, Max Drawdown, and Equity Curves.
                    </p>
                    <button onClick={onLaunch} className="px-6 py-3 bg-[#05b169] hover:bg-[#049658] text-white rounded-full font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-2">
                      <span>Run Backtester</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="lg:col-span-6 bg-[#16181c] rounded-2xl p-5 border border-[#26282c] space-y-4 font-mono text-xs">
                    <div className="flex justify-between border-b border-[#26282c] pb-2 text-slate-300">
                      <span className="font-bold text-[#05b169]">BACKTEST REPORT // EMA CROSSOVER</span>
                      <span className="text-[10px] text-[#7c828a]">1,240 CANDLES</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-[#0a0b0d] p-3 rounded-xl border border-[#26282c]">
                        <span className="text-[#7c828a] text-[10px] block">SHARPE RATIO</span>
                        <span className="text-[#05b169] font-bold text-xl">2.41</span>
                      </div>
                      <div className="bg-[#0a0b0d] p-3 rounded-xl border border-[#26282c]">
                        <span className="text-[#7c828a] text-[10px] block">WIN RATE</span>
                        <span className="text-blue-400 font-bold text-xl">64.8%</span>
                      </div>
                      <div className="bg-[#0a0b0d] p-3 rounded-xl border border-[#26282c]">
                        <span className="text-[#7c828a] text-[10px] block">MAX DRAWDOWN</span>
                        <span className="text-[#cf202f] font-bold text-xl">-4.2%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: VISUAL BUILDER */}
              {activeFeatureTab === 'visual' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-5">
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-mono font-bold uppercase border border-amber-500/20">
                      No-Code Visual Graph Builder
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                      Drag-and-Drop Visual Strategy Builder.
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed font-sans">
                      Construct algorithmic entry/exit rules visually without code. Connect indicator trigger nodes, stop loss parameters, and take profit targets into executable strategy pipelines.
                    </p>
                    <button onClick={onLaunch} className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center space-x-2">
                      <span>Open Visual Builder</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="lg:col-span-6 bg-[#16181c] rounded-2xl p-5 border border-[#26282c] space-y-3 font-mono text-xs">
                    <div className="bg-[#0a0b0d] p-3.5 rounded-xl border border-[#26282c] flex items-center justify-between">
                      <span className="text-amber-400 font-bold">NODE 1: RSI (14) &lt; 30 (Oversold)</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">ENTRY TRIGGER</span>
                    </div>
                    <div className="text-center text-[#7c828a] font-bold">↓ EXECUTE ACTION ↓</div>
                    <div className="bg-[#0a0b0d] p-3.5 rounded-xl border border-[#26282c] flex items-center justify-between">
                      <span className="text-[#05b169] font-bold">NODE 2: Buy Market (TP: +3.0%, SL: -1.5%)</span>
                      <span className="text-[10px] bg-[#05b169]/20 text-[#05b169] px-2 py-0.5 rounded-full">ORDER EXECUTION</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: OPTIMIZER */}
              {activeFeatureTab === 'optimizer' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-5">
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-mono font-bold uppercase border border-indigo-500/20">
                      Markowitz & Stochastic Risk Engine
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                      Efficient Frontier & Monte Carlo Optimization.
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed font-sans">
                      Optimize portfolio capital allocation using Markowitz modern portfolio theory. Simulate 1,000+ stochastic price trajectories and calculate Parametric Value at Risk (VaR 95% & 99%).
                    </p>
                    <button onClick={onLaunch} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center space-x-2">
                      <span>Optimize Risk</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="lg:col-span-6 bg-[#16181c] rounded-2xl p-5 border border-[#26282c] space-y-4 font-mono text-xs">
                    <div className="flex justify-between border-b border-[#26282c] pb-2 text-slate-300">
                      <span className="font-bold text-indigo-400">MARKOWITZ OPTIMAL ALLOCATION</span>
                      <span className="text-[10px] text-[#7c828a]">MAX SHARPE TARGET</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1"><span>Bitcoin (BTC): 45%</span><span className="text-[#05b169] font-bold">Optimal</span></div>
                        <div className="w-full bg-[#0a0b0d] rounded-full h-2"><div className="bg-[#05b169] h-2 rounded-full" style={{ width: '45%' }}></div></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1"><span>Ethereum (ETH): 35%</span><span className="text-blue-400 font-bold">Optimal</span></div>
                        <div className="w-full bg-[#0a0b0d] rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: '35%' }}></div></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1"><span>Gold Bullion: 20%</span><span className="text-amber-400 font-bold">Hedge</span></div>
                        <div className="w-full bg-[#0a0b0d] rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full" style={{ width: '20%' }}></div></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: PAPER SANDBOX */}
              {activeFeatureTab === 'paper' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-5">
                    <span className="px-3 py-1 bg-[#05b169]/10 text-[#05b169] rounded-full text-xs font-mono font-bold uppercase border border-[#05b169]/20">
                      Risk-Free Virtual Trading
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                      $100,000 Virtual Capital Sandbox.
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed font-sans">
                      Practice trading and validate quantitative rules in real-time market conditions with zero capital risk. Track virtual equity curves, active positions, order fills, and reset your account anytime.
                    </p>
                    <button onClick={onLaunch} className="px-6 py-3 bg-[#05b169] hover:bg-[#049658] text-white rounded-full font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-2">
                      <span>Start Paper Trading</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="lg:col-span-6 bg-[#16181c] rounded-2xl p-5 border border-[#26282c] space-y-4 font-mono text-xs">
                    <div className="bg-[#0a0b0d] p-5 rounded-2xl border border-[#26282c] space-y-2">
                      <span className="text-[#7c828a] text-[10px] block uppercase">VIRTUAL ACCOUNT CAPITAL</span>
                      <span className="text-3xl font-extrabold text-[#05b169]">$100,000.00 USD</span>
                      <p className="text-xs text-slate-300 pt-1">Status: Active Paper Account • 0 Open Positions</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* ─── 5. BESPOKE ASSET CATALOG (DESIGN.md surface-card & asset-row) ─────── */}
      <section id="explore" className="py-20 px-6 border-b border-[#dee1e6] bg-[#ffffff]">
        <div className="max-w-[1240px] mx-auto space-y-8">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs text-[#0052ff] font-extrabold uppercase tracking-widest">Multi-Asset Index</span>
              <h2 className="text-3xl font-extrabold text-[#0a0b0d] tracking-tight mt-1" style={{ letterSpacing: '-0.8px' }}>
                Real-Time Asset Catalog.
              </h2>
              <p className="text-sm text-[#5b616e]">Track live streaming price feeds across global market assets.</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-2 bg-[#f7f7f7] border border-[#dee1e6] p-1.5 rounded-full self-start sm:self-auto text-xs font-semibold">
              {(['all', 'crypto', 'commodities', 'equities'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedAssetCategory(cat)}
                  className={`px-4 py-1.5 rounded-full capitalize transition-all ${selectedAssetCategory === cat
                      ? 'bg-[#0052ff] text-white font-bold shadow-md shadow-blue-500/20'
                      : 'text-[#5b616e] hover:text-[#0a0b0d]'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Asset Grid Cards (DESIGN.md rounded.xl & product-ui-card-light) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAssets.map((asset) => (
              <div
                key={asset.symbol}
                className="bg-[#ffffff] border border-[#dee1e6] rounded-3xl p-5 hover:border-[#0052ff]/40 hover:shadow-lg transition-all duration-300 space-y-4 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#f7f7f7] border border-[#dee1e6] rounded-full flex items-center justify-center font-bold text-[#0052ff] text-sm font-mono shadow-xs group-hover:bg-[#0052ff] group-hover:text-white transition-colors">
                      {asset.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0a0b0d] text-base">{asset.name}</h4>
                      <span className="text-xs font-mono text-[#7c828a]">{asset.symbol}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center ${asset.isPositive ? 'text-[#05b169] bg-[#05b169]/10' : 'text-[#cf202f] bg-[#cf202f]/10'}`}>
                    {asset.isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                    {asset.change}
                  </span>
                </div>

                {/* Price & Sparkline */}
                <div className="flex items-end justify-between pt-2 border-t border-[#eef0f3]">
                  <div>
                    <span className="text-[10px] font-mono text-[#7c828a] uppercase block">LIVE PRICE</span>
                    <span className="text-xl font-extrabold font-mono text-[#0a0b0d] tracking-tight">{asset.price}</span>
                  </div>

                  {/* Sparkline Graphic */}
                  <div className="w-24 h-9 flex items-end justify-between gap-1">
                    {asset.sparkline.map((val, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 rounded-t-xs transition-all ${asset.isPositive ? 'bg-[#05b169]/70 group-hover:bg-[#05b169]' : 'bg-[#cf202f]/70 group-hover:bg-[#cf202f]'}`}
                        style={{ height: `${val}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono text-[#7c828a] pt-1">
                  <span>24h Vol: {asset.volume}</span>
                  <span className="text-[#0052ff] font-bold group-hover:translate-x-1 transition-transform flex items-center cursor-pointer" onClick={onLaunch}>
                    Trade Asset <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── 6. INSTITUTIONAL PRICING SECTION (DESIGN.md pricing-tier-card) ──── */}
      <section id="pricing" className="py-20 px-6 bg-[#f7f7f7] border-b border-[#dee1e6]">
        <div className="max-w-[1240px] mx-auto space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs text-[#0052ff] font-extrabold uppercase tracking-widest">Simple Transparent Monetization</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0a0b0d] tracking-tight" style={{ letterSpacing: '-1.2px' }}>
              Access Professional Quantitative Alpha.
            </h2>
            <p className="text-sm text-[#5b616e]">
              Start with our full-featured free paper sandbox or unlock institutional AI signals, option greeks engines, and backtesting.
            </p>

            {/* Monthly / Annual Billing Toggle */}
            <div className="inline-flex items-center bg-white border border-[#dee1e6] p-1.5 rounded-full shadow-xs text-xs font-semibold">
              <button
                onClick={() => setIsAnnualBilling(false)}
                className={`px-5 py-2 rounded-full transition-all ${!isAnnualBilling ? 'bg-[#0a0b0d] text-white font-bold' : 'text-[#5b616e] hover:text-[#0a0b0d]'}`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setIsAnnualBilling(true)}
                className={`px-5 py-2 rounded-full transition-all flex items-center space-x-1.5 ${isAnnualBilling ? 'bg-[#0052ff] text-white font-bold' : 'text-[#5b616e] hover:text-[#0a0b0d]'}`}
              >
                <span>Annual Billing</span>
                <span className="bg-emerald-400 text-[#0a0b0d] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">SAVE 20%</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid (3-Up) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

            {/* TIER 1: DEVELOPER FREE */}
            <div className="bg-white border border-[#dee1e6] rounded-3xl p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-300 space-y-6">
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 bg-[#f7f7f7] text-[#0a0b0d] rounded-full text-xs font-bold border border-[#dee1e6]">
                  DEVELOPER SANDBOX
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-[#0a0b0d]">Free Account</h3>
                  <p className="text-xs text-[#5b616e] mt-1">Ideal for individual traders learning quantitative concepts.</p>
                </div>
                <div className="flex items-baseline space-x-1 font-mono pt-2">
                  <span className="text-4xl font-extrabold text-[#0a0b0d]">$0</span>
                  <span className="text-xs text-[#7c828a]">/ forever</span>
                </div>

                <hr className="border-[#hairline-soft]" />

                <ul className="space-y-3 text-xs text-[#0a0b0d]">
                  <li className="flex items-center space-x-2.5"><Check className="w-4 h-4 text-[#05b169] shrink-0" /><span>$100,000 Virtual Paper Account</span></li>
                  <li className="flex items-center space-x-2.5"><Check className="w-4 h-4 text-[#05b169] shrink-0" /><span>Real-Time Binance Crypto WebSockets</span></li>
                  <li className="flex items-center space-x-2.5"><Check className="w-4 h-4 text-[#05b169] shrink-0" /><span>Black-Scholes Call/Put Fair Values</span></li>
                  <li className="flex items-center space-x-2.5"><Check className="w-4 h-4 text-[#05b169] shrink-0" /><span>Standard Indicators (RSI, MACD, EMA)</span></li>
                  <li className="flex items-center space-x-2.5"><Check className="w-4 h-4 text-[#05b169] shrink-0" /><span>Local Browser Storage & Privacy</span></li>
                </ul>
              </div>

              <button
                onClick={onLaunch}
                className="w-full py-3.5 bg-[#f7f7f7] hover:bg-[#eef0f3] text-[#0a0b0d] border border-[#dee1e6] rounded-full font-bold text-xs transition-all text-center"
              >
                Launch Free Sandbox
              </button>
            </div>

            {/* TIER 2: PRO QUANT (FEATURED / HIGHLIGHTED) */}
            <div className="bg-[#0a0b0d] text-white border-2 border-[#0052ff] rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative transform lg:-translate-y-2 space-y-6">
              {/* Popular Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0052ff] text-white font-extrabold text-[11px] uppercase tracking-wider px-4 py-1 rounded-full shadow-md flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>MOST POPULAR CHOICE</span>
              </div>

              <div className="space-y-4 pt-2">
                <div className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-mono font-bold border border-blue-500/40">
                  PRO QUANT TRADER
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white">Pro Quant Pass</h3>
                  <p className="text-xs text-[#a8acb3] mt-1">Full analytical power for active algorithmic & derivatives traders.</p>
                </div>
                <div className="flex items-baseline space-x-1 font-mono pt-2">
                  <span className="text-5xl font-extrabold text-white">{isAnnualBilling ? '$39' : '$49'}</span>
                  <span className="text-xs text-[#a8acb3]">/ month {isAnnualBilling ? '(billed annually)' : ''}</span>
                </div>

                <hr className="border-[#26282c]" />

                <ul className="space-y-3 text-xs text-slate-200">
                  <li className="flex items-center space-x-2.5"><CheckCircle2 className="w-4 h-4 text-[#05b169] shrink-0" /><span><strong>Everything in Free</strong>, plus:</span></li>
                  <li className="flex items-center space-x-2.5"><CheckCircle2 className="w-4 h-4 text-[#05b169] shrink-0" /><span>Option Greeks Matrix (Δ, Γ, Θ, ν, ρ)</span></li>
                  <li className="flex items-center space-x-2.5"><CheckCircle2 className="w-4 h-4 text-[#05b169] shrink-0" /><span>Google Gemini 2.0 AI Market Copilot</span></li>
                  <li className="flex items-center space-x-2.5"><CheckCircle2 className="w-4 h-4 text-[#05b169] shrink-0" /><span>Historical Backtester & Replay Engine</span></li>
                  <li className="flex items-center space-x-2.5"><CheckCircle2 className="w-4 h-4 text-[#05b169] shrink-0" /><span>No-Code Visual Strategy Builder</span></li>
                  <li className="flex items-center space-x-2.5"><CheckCircle2 className="w-4 h-4 text-[#05b169] shrink-0" /><span>Telegram Signal Notification Bot</span></li>
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlan('pro')}
                className="w-full py-4 bg-[#0052ff] hover:bg-[#003ecc] text-white rounded-full font-extrabold text-sm transition-all text-center shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2"
              >
                <span>Start Pro Quant Trial</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* TIER 3: INSTITUTIONAL ALPHA */}
            <div className="bg-white border border-[#dee1e6] rounded-3xl p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-300 space-y-6">
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 bg-[#f7f7f7] text-[#0a0b0d] rounded-full text-xs font-bold border border-[#dee1e6]">
                  FUNDS & DESKS
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-[#0a0b0d]">Institutional Alpha</h3>
                  <p className="text-xs text-[#5b616e] mt-1">For funds, prop trading desks, and quantitative researchers.</p>
                </div>
                <div className="flex items-baseline space-x-1 font-mono pt-2">
                  <span className="text-4xl font-extrabold text-[#0a0b0d]">{isAnnualBilling ? '$159' : '$199'}</span>
                  <span className="text-xs text-[#7c828a]">/ month</span>
                </div>

                <hr className="border-[#hairline-soft]" />

                <ul className="space-y-3 text-xs text-[#0a0b0d]">
                  <li className="flex items-center space-x-2.5"><Check className="w-4 h-4 text-[#05b169] shrink-0" /><span><strong>Everything in Pro Quant</strong>, plus:</span></li>
                  <li className="flex items-center space-x-2.5"><Check className="w-4 h-4 text-[#05b169] shrink-0" /><span>Markowitz & Monte Carlo Risk Engine (1,000+ paths)</span></li>
                  <li className="flex items-center space-x-2.5"><Check className="w-4 h-4 text-[#05b169] shrink-0" /><span>Parametric Value at Risk (VaR 95% & 99%)</span></li>
                  <li className="flex items-center space-x-2.5"><Check className="w-4 h-4 text-[#05b169] shrink-0" /><span>Multi-Asset Catalog (Crypto, Forex, Equities)</span></li>
                  <li className="flex items-center space-x-2.5"><Check className="w-4 h-4 text-[#05b169] shrink-0" /><span>Custom API Webhook Dispatcher</span></li>
                  <li className="flex items-center space-x-2.5"><Check className="w-4 h-4 text-[#05b169] shrink-0" /><span>Dedicated Quant Support & Strategy Reviews</span></li>
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlan('institutional')}
                className="w-full py-3.5 bg-[#0a0b0d] hover:bg-[#16181c] text-white rounded-full font-bold text-xs transition-all text-center"
              >
                Upgrade to Institutional
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 7. DEEP DIVE QUANTITATIVE PILLARS GRID (DESIGN.md feature-card) ──── */}
      <section id="features" className="py-20 px-6 bg-[#ffffff] border-b border-[#dee1e6]">
        <div className="max-w-[1240px] mx-auto space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs text-[#0052ff] font-extrabold uppercase tracking-widest">High-Performance Modules</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0a0b0d] tracking-tight" style={{ letterSpacing: '-0.8px' }}>
              Institutional Quantitative Tools.
            </h2>
            <p className="text-sm text-[#5b616e]">
              Engineered with sub-second WebSocket feeds, mathematical precision, and high-performance client execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Feature 1 */}
            <div className="bg-[#ffffff] border border-[#dee1e6] rounded-3xl p-6 hover:shadow-xl hover:border-[#0052ff]/40 transition-all duration-300 space-y-3 group hover:-translate-y-1">
              <div className="w-11 h-11 bg-blue-50 text-[#0052ff] rounded-full flex items-center justify-center group-hover:bg-[#0052ff] group-hover:text-white transition-colors shadow-xs">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0a0b0d]">Low-Latency WebSockets</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Direct sub-second price socket mapping utilizing Binance real-time stream feeds with automatic REST polling fallback.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#ffffff] border border-[#dee1e6] rounded-3xl p-6 hover:shadow-xl hover:border-[#0052ff]/40 transition-all duration-300 space-y-3 group hover:-translate-y-1">
              <div className="w-11 h-11 bg-emerald-50 text-[#05b169] rounded-full flex items-center justify-center group-hover:bg-[#05b169] group-hover:text-white transition-colors shadow-xs">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0a0b0d]">Black-Scholes & Option Greeks</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Calculate Call/Put values, Delta (Δ), Gamma (Γ), Theta (Θ), Vega (ν), and Rho (ρ) risk sensitivities in real-time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#ffffff] border border-[#dee1e6] rounded-3xl p-6 hover:shadow-xl hover:border-[#0052ff]/40 transition-all duration-300 space-y-3 group hover:-translate-y-1">
              <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-xs">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0a0b0d]">Google Gemini AI Copilot</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Contextual AI market intelligence, technical pattern explanation, and interactive strategy synthesis.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#ffffff] border border-[#dee1e6] rounded-3xl p-6 hover:shadow-xl hover:border-[#0052ff]/40 transition-all duration-300 space-y-3 group hover:-translate-y-1">
              <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors shadow-xs">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0a0b0d]">Monte Carlo & VaR Risk</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Stochastic pathing simulations (1,000+ runs) and Parametric Value at Risk (VaR 95% & 99%) estimation.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#ffffff] border border-[#dee1e6] rounded-3xl p-6 hover:shadow-xl hover:border-[#0052ff]/40 transition-all duration-300 space-y-3 group hover:-translate-y-1">
              <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0a0b0d]">No-Code Visual Builder</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Drag-and-drop indicator nodes, entry/exit condition blocks, stop loss, and take profit target pipelines.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#ffffff] border border-[#dee1e6] rounded-3xl p-6 hover:shadow-xl hover:border-[#0052ff]/40 transition-all duration-300 space-y-3 group hover:-translate-y-1">
              <div className="w-11 h-11 bg-blue-50 text-[#0052ff] rounded-full flex items-center justify-center group-hover:bg-[#0052ff] group-hover:text-white transition-colors shadow-xs">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0a0b0d]">Telegram Alert Push Bot</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Automated price boundary and strategy signal notifications delivered directly to your Telegram chat.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="bg-[#ffffff] border border-[#dee1e6] rounded-3xl p-6 hover:shadow-xl hover:border-[#0052ff]/40 transition-all duration-300 space-y-3 group hover:-translate-y-1">
              <div className="w-11 h-11 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors shadow-xs">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0a0b0d]">Tick-by-Tick Market Replay</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Play back historical market candle sequences at 1x to 10x speed to test manual and algorithmic decisions.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="bg-[#ffffff] border border-[#dee1e6] rounded-3xl p-6 hover:shadow-xl hover:border-[#0052ff]/40 transition-all duration-300 space-y-3 group hover:-translate-y-1">
              <div className="w-11 h-11 bg-rose-50 text-[#cf202f] rounded-full flex items-center justify-center group-hover:bg-[#cf202f] group-hover:text-white transition-colors shadow-xs">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0a0b0d]">Markowitz Efficient Frontier</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Optimal Sharpe portfolio asset weighting and multi-asset correlation matrices calculated on-client.
              </p>
            </div>

            {/* Feature 9 */}
            <div className="bg-[#ffffff] border border-[#dee1e6] rounded-3xl p-6 hover:shadow-xl hover:border-[#0052ff]/40 transition-all duration-300 space-y-3 group hover:-translate-y-1">
              <div className="w-11 h-11 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0a0b0d]">Level-2 Order Book DOM</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Depth of Market order ladder with real-time bid/ask pressure imbalance gauges and execution controls.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 8. ARCHITECTURE & SECURITY SPECIFICATION ────────────────────────── */}
      <section id="tech" className="py-20 px-6 bg-[#ffffff]">
        <div className="max-w-[1240px] mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <span className="text-xs text-[#0052ff] font-extrabold uppercase tracking-widest">Security & Performance</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0a0b0d] tracking-tight leading-tight" style={{ letterSpacing: '-0.8px' }}>
              Privacy-First Client-Side Execution.
            </h2>
            <p className="text-sm text-[#5b616e] leading-relaxed">
              Stratrade runs all complex mathematical calculations, Black-Scholes option pricing models, and backtesting routines client-side directly inside your browser.
            </p>

            <div className="space-[#dee1e6] space-y-4 pt-2">
              <div className="flex items-start space-x-3">
                <Lock className="w-5 h-5 text-[#0052ff] shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-[#0a0b0d] text-sm">Client-Side API Key Security</h5>
                  <p className="text-xs text-[#5b616e] mt-0.5">Your Google Gemini API key is stored exclusively in your browser's localStorage and is never transmitted to any external backend server.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Cpu className="w-5 h-5 text-[#0052ff] shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-[#0a0b0d] text-sm">High-Precision Math Engines</h5>
                  <p className="text-xs text-[#5b616e] mt-0.5">Abramowitz & Stegun polynomial normal distribution algorithms ensure sub-penny precision across options pricing and Greeks calculation.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#0a0b0d] border border-[#26282c] rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#26282c] pb-3">
              <span className="text-xs font-bold text-amber-400 font-mono flex items-center">
                <Code2 className="w-4 h-4 mr-1.5" /> Architecture Specification
              </span>
              <span className="text-[10px] text-[#05b169] font-mono">STABLE v1.2.0</span>
            </div>
            <div className="space-y-3 font-mono text-xs text-slate-400">
              <div className="flex justify-between"><span>Core Framework:</span><span className="text-white font-bold">React 18 + TypeScript</span></div>
              <div className="flex justify-between"><span>State Management:</span><span className="text-white font-bold">Client Hooks & Memoization</span></div>
              <div className="flex justify-between"><span>Real-Time Stream:</span><span className="text-[#05b169] font-bold">Binance WebSocket API</span></div>
              <div className="flex justify-between"><span>AI Integration:</span><span className="text-purple-400 font-bold">Google Gemini API</span></div>
              <div className="flex justify-between"><span>Styling System:</span><span className="text-[#0052ff] font-bold">Coinbase Design Specs (DESIGN.md)</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9. PRE-FOOTER CTA (DESIGN.md cta-band-dark) ────────────────────── */}
      <section className="bg-[#0a0b0d] text-white py-20 px-6 text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-normal tracking-tight" style={{ letterSpacing: '-1.3px' }}>
            Ready to Experience the Workstation?
          </h2>
          <p className="text-[#a8acb3] text-sm leading-relaxed max-w-md mx-auto">
            Test quantitative trading strategies immediately with $100,000 in virtual paper capital. Full options pricing, backtesting, and AI Copilot unlocked.
          </p>
          <div>
            <button
              onClick={onLaunch}
              className="h-14 px-9 bg-[#0052ff] hover:bg-[#003ecc] text-white rounded-full font-bold text-base transition-all inline-flex items-center justify-center space-x-2.5 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/35 group"
            >
              <Terminal className="w-5 h-5 text-blue-200" />
              <span>Launch Terminal Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── 10. FOOTER (DESIGN.md footer-light) ─────────────────────────────── */}
      <footer className="bg-[#ffffff] border-t border-[#dee1e6] py-12 px-6">
        <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#0052ff] rounded-full flex items-center justify-center shadow-xs">
              <TrendingUp className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-base font-bold text-[#0a0b0d] tracking-tight">Stratrade Workstation</span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-[#5b616e] font-sans">
            <a
              href="https://github.com/Garvit-821/multi-asset-algorithmic-trading-software"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-[#0a0b0d] hover:text-[#0052ff] transition-colors font-semibold"
            >
              <Github className="w-4 h-4 mr-1.5 text-[#0a0b0d]" />
              <span>GitHub Repository</span>
            </a>
            <span className="flex items-center"><Globe className="w-4 h-4 mr-1 text-[#7c828a]" /> Web Workstation</span>
            <span className="flex items-center"><Smartphone className="w-4 h-4 mr-1 text-[#7c828a]" /> Mobile Sandbox</span>
          </div>
        </div>

        <div className="max-w-[1240px] mx-auto mt-8 pt-6 border-t border-[#eef0f3] text-center text-xs text-[#7c828a]">
          © 2026 Stratrade Inc. All rights reserved. Built for institutional multi-asset algorithmic trading.
        </div>
      </footer>

      {/* Local Checkout & Receipt Modals (when launched directly from Landing Page) */}
      {checkoutPlanId && (
        <CheckoutModal
          isOpen={true}
          selectedPlanId={checkoutPlanId}
          onClose={() => setCheckoutPlanId(null)}
          onSuccess={(res) => {
            setCheckoutPlanId(null);
            setReceipt(res);
          }}
        />
      )}

      {receipt && (
        <PaymentConfirmationModal
          isOpen={true}
          receipt={receipt}
          onClose={() => setReceipt(null)}
          onLaunchWorkstation={() => {
            setReceipt(null);
            onLaunch();
          }}
        />
      )}

    </div>
  );
};
