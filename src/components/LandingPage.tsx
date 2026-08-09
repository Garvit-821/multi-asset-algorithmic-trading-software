import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  ShieldAlert,
  Cpu,
  Zap,
  ArrowRight,
  CheckCircle,
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
  Layers
} from 'lucide-react';

interface LandingPageProps {
  onLaunch: () => void;
}

type FeatureTab = 'derivatives' | 'ai' | 'backtest' | 'visual' | 'optimizer' | 'paper';
type AssetCategory = 'all' | 'crypto' | 'commodities' | 'equities';

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState<FeatureTab>('derivatives');
  const [selectedAssetCategory, setSelectedAssetCategory] = useState<AssetCategory>('all');

  useEffect(() => {
    // Inject Inter and JetBrains Mono fonts for institutional typography
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  const assetList = [
    { symbol: 'BTC/USDT', name: 'Bitcoin', price: '$64,500.00', change: '+2.45%', isPositive: true, category: 'crypto', icon: '₿', volume: '$28.4B' },
    { symbol: 'ETH/USDT', name: 'Ethereum', price: '$3,450.20', change: '+1.82%', isPositive: true, category: 'crypto', icon: 'Ξ', volume: '$14.2B' },
    { symbol: 'SOL/USDT', name: 'Solana', price: '$148.50', change: '-0.95%', isPositive: false, category: 'crypto', icon: 'S', volume: '$4.1B' },
    { symbol: 'GOLD', name: 'Gold Bullion (oz)', price: '$2,382.40', change: '+0.42%', isPositive: true, category: 'commodities', icon: 'Au', volume: '$12.8B' },
    { symbol: 'AAPL', name: 'Apple Inc.', price: '$225.10', change: '+1.15%', isPositive: true, category: 'equities', icon: '', volume: '$8.6B' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: '$128.80', change: '+3.74%', isPositive: true, category: 'equities', icon: 'N', volume: '$22.1B' },
  ];

  const filteredAssets = selectedAssetCategory === 'all'
    ? assetList
    : assetList.filter(a => a.category === selectedAssetCategory);

  return (
    <div className="min-h-screen bg-white text-[#5b616e] flex flex-col font-sans overflow-x-hidden select-none selection:bg-[#0052ff] selection:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ─── 1. TOP HEADER NAVIGATION ────────────────────────────────────────── */}
      <header className="bg-white border-b border-[#dee1e6] h-16 sticky top-0 z-50 shadow-2xs">
        <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onLaunch}>
            <div className="w-9 h-9 bg-gradient-to-br from-[#0052ff] to-[#003ecc] rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-[#0a0b0d]" style={{ letterSpacing: '-0.5px' }}>
                Stratrade
              </span>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest -mt-1">Workstation</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-[#5b616e]">
            <a href="#showcase" className="hover:text-[#0a0b0d] transition-colors">Platform Modules</a>
            <a href="#features" className="hover:text-[#0a0b0d] transition-colors">Quantitative Tools</a>
            <a href="#risk" className="hover:text-[#0a0b0d] transition-colors">Risk & Math Engine</a>
            <a href="#explore" className="hover:text-[#0a0b0d] transition-colors">Asset Catalog</a>
            <a href="#tech" className="hover:text-[#0a0b0d] transition-colors">Tech Architecture</a>
          </nav>

          {/* Nav CTAs */}
          <div className="hidden md:flex items-center space-x-3">
            <a
              href="https://github.com/Garvit-821/multi-asset-algorithmic-trading-software"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-4 bg-[#16181c] hover:bg-[#202328] text-white rounded-xl font-semibold text-xs transition-all border border-[#26282c] flex items-center space-x-2 shadow-xs group"
            >
              <Github className="w-4 h-4 text-amber-400" />
              <span>Star on GitHub</span>
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
            </a>

            <button
              onClick={onLaunch}
              className="h-10 px-5 bg-[#0052ff] hover:bg-[#003ecc] text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-blue-500/20 flex items-center space-x-2"
            >
              <span>Launch Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-[#f7f7f7] text-[#0a0b0d] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-[#dee1e6] p-6 shadow-xl z-40 lg:hidden flex flex-col space-y-4">
            <a href="#showcase" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-[#0a0b0d] hover:text-[#0052ff]">Platform Modules</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-[#0a0b0d] hover:text-[#0052ff]">Quantitative Tools</a>
            <a href="#risk" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-[#0a0b0d] hover:text-[#0052ff]">Risk & Math Engine</a>
            <a href="#explore" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-[#0a0b0d] hover:text-[#0052ff]">Asset Catalog</a>
            <a href="#tech" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-[#0a0b0d] hover:text-[#0052ff]">Tech Architecture</a>
            <hr className="border-[#eef0f3]" />
            <div className="flex flex-col space-y-3 pt-1">
              <a
                href="https://github.com/Garvit-821/multi-asset-algorithmic-trading-software"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#16181c] text-white rounded-xl font-bold text-xs transition-all text-center flex items-center justify-center space-x-2 border border-[#26282c]"
              >
                <Github className="w-4 h-4 text-amber-400" />
                <span>Star on GitHub</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </a>
              <button
                onClick={() => { setMobileMenuOpen(false); onLaunch(); }}
                className="w-full py-3 bg-[#0052ff] hover:bg-[#003ecc] text-white rounded-xl font-bold text-xs transition-all text-center flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20"
              >
                <span>Launch Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ─── 2. HIGH IMPACT HERO BAND ────────────────────────────────────────── */}
      <section className="bg-[#0a0b0d] text-white py-16 lg:py-24 px-6 relative overflow-hidden">
        {/* Glow Accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0052ff]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">

          {/* Hero Left Column Text */}
          <div className="flex-1 text-center lg:text-left space-y-6 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-[#16181c] border border-[#26282c] rounded-full text-xs font-semibold text-[#a8acb3]">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-white font-mono uppercase text-[11px] tracking-wider">v1.2.0 Institutional Workstation Live</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]" style={{ letterSpacing: '-1.5px' }}>
              Multi-Asset Algorithmic Trading Workstation.
            </h1>

            <p className="text-[#a8acb3] text-base md:text-lg font-normal leading-relaxed">
              Institutional quantitative software built with low-latency Binance WebSockets, analytical Black-Scholes option pricing, Google Gemini AI Copilot intelligence, and Monte Carlo risk models.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onLaunch}
                className="w-full sm:w-auto h-13 px-8 bg-[#0052ff] hover:bg-[#003ecc] text-white rounded-xl font-extrabold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 group"
              >
                <span>Open Terminal Workstation</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="https://github.com/Garvit-821/multi-asset-algorithmic-trading-software"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto h-13 px-7 bg-[#16181c] hover:bg-[#202328] text-white rounded-xl font-bold text-sm border border-[#26282c] transition-all flex items-center justify-center space-x-2.5 group"
              >
                <Github className="w-4 h-4 text-amber-400" />
                <span>Explore Source Code</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
              </a>
            </div>

            {/* Key Metrics Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#16181c] text-left font-mono">
              <div className="bg-[#14161a] border border-[#22252b] rounded-xl p-3">
                <p className="text-xl font-extrabold text-white">&lt;150ms</p>
                <p className="text-[10px] text-[#8e939e] uppercase tracking-wider font-sans">Socket Latency</p>
              </div>
              <div className="bg-[#14161a] border border-[#22252b] rounded-xl p-3">
                <p className="text-xl font-extrabold text-emerald-400">1,000+</p>
                <p className="text-[10px] text-[#8e939e] uppercase tracking-wider font-sans">Monte Carlo Paths</p>
              </div>
              <div className="bg-[#14161a] border border-[#22252b] rounded-xl p-3">
                <p className="text-xl font-extrabold text-blue-400">5 Greeks</p>
                <p className="text-[10px] text-[#8e939e] uppercase tracking-wider font-sans">Options Sensitivity</p>
              </div>
              <div className="bg-[#14161a] border border-[#22252b] rounded-xl p-3">
                <p className="text-xl font-extrabold text-amber-400">$100,000</p>
                <p className="text-[10px] text-[#8e939e] uppercase tracking-wider font-sans">Virtual Sandbox</p>
              </div>
            </div>
          </div>

          {/* Hero Right Column: Layered UI Preview Deck */}
          <div className="flex-1 w-full flex justify-center items-center relative h-[380px] sm:h-[430px]">

            {/* Main Interactive Workstation Card */}
            <div className="absolute w-[92%] sm:w-[390px] bg-[#14161b] border border-[#262a33] rounded-3xl p-5 shadow-2xl z-20 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="flex justify-between items-center pb-3 border-b border-[#222630] mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
                  <span className="text-xs font-bold text-white font-mono">BTC/USDT WebSocket Stream</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold rounded border border-emerald-500/20">LIVE 24H</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-extrabold text-white font-mono tracking-tight">$64,500.00</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">+2.45%</span>
                </div>

                {/* Simulated Sparkline Bars */}
                <div className="h-16 flex items-end justify-between gap-1 pt-2">
                  {[24, 30, 22, 45, 38, 55, 48, 62, 75, 68, 80, 92, 85, 96, 100].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-blue-600 to-emerald-400 rounded-t-xs"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>

                {/* AI Copilot Signal Pill */}
                <div className="bg-[#1e222d] border border-[#2e3444] rounded-xl p-3 flex items-start space-x-2.5 text-xs text-slate-300">
                  <BrainCircuit className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Gemini AI Copilot Signal</span>
                    <p className="text-[11px] text-slate-400">RSI oversold (28.4) with bullish MACD crossover on 15m candle.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlapping Deck Card 2: Black Scholes Greeks */}
            <div className="absolute w-[80%] sm:w-[310px] bg-[#1a1e27] border border-[#2d3445] rounded-2xl p-4 shadow-2xl z-10 transform translate-x-12 translate-y-28 rotate-3 hidden sm:block">
              <div className="flex items-center justify-between pb-2 border-b border-[#2d3445] mb-2 text-xs">
                <span className="font-extrabold text-amber-400 font-mono">Option Greeks Matrix</span>
                <span className="text-[10px] text-slate-400 font-mono">DTE: 30d</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-[#13161f] p-2 rounded border border-[#262d3d]">
                  <span className="text-slate-400 block text-[9px]">CALL DELTA</span>
                  <span className="text-emerald-400 font-bold">+0.6420</span>
                </div>
                <div className="bg-[#13161f] p-2 rounded border border-[#262d3d]">
                  <span className="text-slate-400 block text-[9px]">GAMMA</span>
                  <span className="text-blue-400 font-bold">0.000142</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 3. INTERACTIVE FEATURE SHOWCASE PREVIEW ─────────────────────────── */}
      <section id="showcase" className="bg-[#f7f7f7] py-20 px-6 border-b border-[#dee1e6]">
        <div className="max-w-[1280px] mx-auto space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs text-[#0052ff] font-extrabold uppercase tracking-widest">Interactive Workstation Tour</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0a0b0d] tracking-tight" style={{ letterSpacing: '-0.8px' }}>
              Explore the Stratrade Quantitative Suite.
            </h2>
            <p className="text-sm text-[#5b616e]">
              Click through the main platform modules below to see how our institutional tools operate.
            </p>
          </div>

          {/* Showcase Tabs Pill Bar */}
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
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${isActive
                      ? 'bg-[#0052ff] text-white shadow-md shadow-blue-500/20'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-[#dee1e6]'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Showcase Card Content */}
          <div className="bg-white border border-[#dee1e6] rounded-3xl p-6 sm:p-10 shadow-sm">
            {activeFeatureTab === 'derivatives' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-extrabold uppercase border border-blue-100">
                    Black-Scholes & Greeks Engine
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    Analytical Option Pricing & Volatility Surfaces.
                  </h3>
                  <p className="text-sm text-[#5b616e] leading-relaxed">
                    Compute Black-Scholes option theoretical values, real-time risk sensitivities ($\Delta, \Gamma, \Theta, \nu, \rho$), 2D implied volatility skew heatmaps, and multi-leg strategy payoff curves (Iron Condors, Bull Spreads, Straddles).
                  </p>
                  <ul className="space-y-2 text-xs font-semibold text-gray-800">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Instant Newton-Raphson Implied Volatility (IV) solver</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Institutional Option Chain matrix with real-time Call/Put quotes</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Interactive Recharts strategy payoff profile at expiration</span>
                    </li>
                  </ul>
                  <button onClick={onLaunch} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/10 flex items-center space-x-2">
                    <span>Try Derivatives Engine</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="lg:col-span-6 bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white font-mono space-y-3 text-xs">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-amber-400 font-bold">BS-CALCULATOR // BTC-64500-C</span>
                    <span className="text-slate-400">DTE: 30 Days</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                      <span className="text-slate-400 text-[10px] block">CALL FAIR VALUE</span>
                      <span className="text-emerald-400 font-bold text-lg">$2,845.50</span>
                    </div>
                    <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                      <span className="text-slate-400 text-[10px] block">PUT FAIR VALUE</span>
                      <span className="text-rose-400 font-bold text-lg">$1,920.10</span>
                    </div>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700 space-y-1 text-[11px]">
                    <div className="flex justify-between"><span>Delta ($\Delta$):</span><span className="text-emerald-400 font-bold">+0.642</span></div>
                    <div className="flex justify-between"><span>Gamma ($\Gamma$):</span><span className="text-blue-400 font-bold">0.00014</span></div>
                    <div className="flex justify-between"><span>Theta ($\Theta$):</span><span className="text-rose-400 font-bold">-$42.80/day</span></div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'ai' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-extrabold uppercase border border-purple-100">
                    Google Gemini 2.0 API Integration
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    Real-Time AI Market Intelligence & Copilot.
                  </h3>
                  <p className="text-sm text-[#5b616e] leading-relaxed">
                    Connect your Google Gemini API key to unlock natural language market analysis, real-time indicator signal breakdowns, automated strategy synthesis, and a persistent floating AI assistant drawer.
                  </p>
                  <ul className="space-y-2 text-xs font-semibold text-gray-800">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Natural language strategy generation & rule translation</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Privacy-first local API key storage (Keys never leave your browser)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Contextual chart reading for technical pattern recognition</span>
                    </li>
                  </ul>
                  <button onClick={onLaunch} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-500/10 flex items-center space-x-2">
                    <span>Launch AI Copilot</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="lg:col-span-6 bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white space-y-3">
                  <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                    <BrainCircuit className="w-5 h-5 text-purple-400" />
                    <span className="font-bold text-xs">AI Copilot Analysis Log</span>
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="bg-slate-800/80 p-3 rounded-xl text-slate-200">
                      <span className="text-purple-400 font-bold block mb-1">PROMPT &gt; "Evaluate BTC breakout potential on 1h time"</span>
                      <p className="text-slate-300 font-sans text-[12px] leading-relaxed">
                        "BTC/USDT is compressing inside a symmetrical triangle. RSI at 54 shows neutral momentum, while 200 EMA support at $63,800 remains intact. Recommended setup: Bullish stop-entry above $64,800."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'backtest' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-extrabold uppercase border border-emerald-100">
                    Historical Simulation Engine
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    Advanced Strategy Backtesting & Market Replay.
                  </h3>
                  <p className="text-sm text-[#5b616e] leading-relaxed">
                    Test technical indicator combinations against historical kline datasets. Evaluate institutional risk metrics including Sharpe Ratio, Sortino Ratio, Max Drawdown, and Equity Curves.
                  </p>
                  <ul className="space-y-2 text-xs font-semibold text-gray-800">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Customizable fee structures, slippage modeling, and leverage</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Tick-by-tick Market Replay simulator with speed playback control</span>
                    </li>
                  </ul>
                  <button onClick={onLaunch} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/10 flex items-center space-x-2">
                    <span>Run Backtester</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="lg:col-span-6 bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white font-mono space-y-3 text-xs">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-emerald-400 font-bold">BACKTEST RESULTS // EMA + RSI CROSS</span>
                    <span className="text-slate-400">1,240 Candles</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-800 p-2 rounded-xl">
                      <span className="text-slate-400 text-[10px] block">SHARPE</span>
                      <span className="text-emerald-400 font-bold text-base">2.41</span>
                    </div>
                    <div className="bg-slate-800 p-2 rounded-xl">
                      <span className="text-slate-400 text-[10px] block">WIN RATE</span>
                      <span className="text-blue-400 font-bold text-base">64.8%</span>
                    </div>
                    <div className="bg-slate-800 p-2 rounded-xl">
                      <span className="text-slate-400 text-[10px] block">MAX DRAWDOWN</span>
                      <span className="text-rose-400 font-bold text-base">-4.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'visual' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-extrabold uppercase border border-amber-100">
                    No-Code Logic Designer
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    Drag-and-Drop Visual Strategy Builder.
                  </h3>
                  <p className="text-sm text-[#5b616e] leading-relaxed">
                    Build complex algorithmic rules visually without writing code. Connect indicator condition nodes, risk parameters, stop losses, and take profit targets into executable execution pipelines.
                  </p>
                  <button onClick={onLaunch} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-md shadow-amber-500/10 flex items-center space-x-2">
                    <span>Open Visual Builder</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="lg:col-span-6 bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white font-mono space-y-3 text-xs">
                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                    <span className="text-amber-400 font-bold">Node 1: RSI (14) &lt; 30</span>
                    <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">ENTRY TRIGGER</span>
                  </div>
                  <div className="text-center text-slate-500 font-bold">↓ THEN CONNECT TO ↓</div>
                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                    <span className="text-emerald-400 font-bold">Node 2: Buy 0.5 BTC (Take Profit: +3%, SL: -1.5%)</span>
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">EXECUTION NODE</span>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'optimizer' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-extrabold uppercase border border-indigo-100">
                    Markowitz & Stochastic Risk Engine
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    Efficient Frontier & Monte Carlo Optimization.
                  </h3>
                  <p className="text-sm text-[#5b616e] leading-relaxed">
                    Optimize portfolio capital allocation using Markowitz modern portfolio theory. Simulate 1,000+ stochastic price trajectories and calculate Parametric Value at Risk (VaR 95% & 99%).
                  </p>
                  <button onClick={onLaunch} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-500/10 flex items-center space-x-2">
                    <span>Optimize Portfolio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="lg:col-span-6 bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white font-mono space-y-3 text-xs">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-indigo-400 font-bold">MARKOWITZ OPTIMAL ALLOCATION</span>
                    <span className="text-slate-400">Max Sharpe Target</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1"><span>Bitcoin (BTC): 45%</span><span className="text-emerald-400">Optimal</span></div>
                      <div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: '45%' }}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1"><span>Ethereum (ETH): 35%</span><span className="text-blue-400">Optimal</span></div>
                      <div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: '35%' }}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1"><span>Gold Bullion: 20%</span><span className="text-amber-400">Hedge</span></div>
                      <div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full" style={{ width: '20%' }}></div></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'paper' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-extrabold uppercase border border-emerald-100">
                    Risk-Free Trading Sandbox
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    $100,000 Virtual Capital Paper Account.
                  </h3>
                  <p className="text-sm text-[#5b616e] leading-relaxed">
                    Practice trading and validate quantitative strategies in real-time market conditions with zero risk. Track virtual equity curves, active positions, order fills, and reset your account anytime.
                  </p>
                  <button onClick={onLaunch} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/10 flex items-center space-x-2">
                    <span>Start Paper Trading</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="lg:col-span-6 bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white font-mono space-y-3 text-xs">
                  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <span className="text-slate-400 text-[10px] block">VIRTUAL ACCOUNT BALANCE</span>
                    <span className="text-2xl font-bold text-emerald-400">$100,000.00 USD</span>
                    <p className="text-[11px] text-slate-300 mt-1">Status: Active Paper Account • 0 Open Positions</p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ─── 4. DEEP DIVE FEATURE GRID (9 PILLARS) ──────────────────────────── */}
      <section id="features" className="bg-white py-20 px-6">
        <div className="max-w-[1280px] mx-auto space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs text-[#0052ff] font-extrabold uppercase tracking-widest">Built for Performance</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0a0b0d] tracking-tight" style={{ letterSpacing: '-0.8px' }}>
              Institutional Quantitative Feature Suite.
            </h2>
            <p className="text-sm text-[#5b616e]">
              Engineered with sub-second WebSocket feeds, mathematical precision, and high-performance client execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Feature 1 */}
            <div className="bg-white border border-[#dee1e6] rounded-2xl p-6 hover:shadow-md transition-all space-y-3 group">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Low-Latency WebSockets</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Direct sub-second price socket mapping utilizing Binance real-time stream feeds with automatic REST polling fallback.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-[#dee1e6] rounded-2xl p-6 hover:shadow-md transition-all space-y-3 group">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Black-Scholes & Option Greeks</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Calculate theoretical Call/Put values, Delta, Gamma, Theta, Vega, and Rho risk sensitivities in real-time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-[#dee1e6] rounded-2xl p-6 hover:shadow-md transition-all space-y-3 group">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Google Gemini AI Copilot</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Contextual AI market intelligence, technical pattern explanation, and interactive strategy synthesis.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-[#dee1e6] rounded-2xl p-6 hover:shadow-md transition-all space-y-3 group">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Monte Carlo & VaR Risk</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Stochastic pathing simulations (1,000+ runs) and Parametric Value at Risk (VaR 95% & 99%) estimation.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white border border-[#dee1e6] rounded-2xl p-6 hover:shadow-md transition-all space-y-3 group">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">No-Code Visual Builder</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Drag-and-drop indicator nodes, entry/exit condition blocks, stop loss, and take profit target pipelines.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white border border-[#dee1e6] rounded-2xl p-6 hover:shadow-md transition-all space-y-3 group">
              <div className="w-10 h-10 bg-[#0052ff]/10 text-[#0052ff] rounded-xl flex items-center justify-center group-hover:bg-[#0052ff] group-hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Telegram Alert Push Bot</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Automated price boundary and strategy signal notifications delivered directly to your Telegram chat.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="bg-white border border-[#dee1e6] rounded-2xl p-6 hover:shadow-md transition-all space-y-3 group">
              <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Tick-by-Tick Market Replay</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Play back historical market candle sequences at 1x to 10x speed to test manual and algorithmic decisions.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="bg-white border border-[#dee1e6] rounded-2xl p-6 hover:shadow-md transition-all space-y-3 group">
              <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Markowitz Efficient Frontier</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Optimal Sharpe portfolio asset weighting and multi-asset correlation matrices calculated on-client.
              </p>
            </div>

            {/* Feature 9 */}
            <div className="bg-white border border-[#dee1e6] rounded-2xl p-6 hover:shadow-md transition-all space-y-3 group">
              <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Level-2 Order Book DOM</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Depth of Market order ladder with real-time bid/ask pressure imbalance gauges and execution controls.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 5. ASSET EXPLORER CATALOG ───────────────────────────────────────── */}
      <section id="explore" className="bg-[#f7f7f7] py-20 px-6 border-t border-b border-[#dee1e6]">
        <div className="max-w-[1280px] mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs text-[#0052ff] font-extrabold uppercase tracking-widest">Multi-Asset Coverage</span>
              <h2 className="text-3xl font-extrabold text-[#0a0b0d] tracking-tight mt-1" style={{ letterSpacing: '-0.8px' }}>
                Real-Time Asset Feed Catalog.
              </h2>
              <p className="text-sm text-[#5b616e]">Track simulated and live streaming quotes across global markets.</p>
            </div>

            {/* Asset Filter Pills */}
            <div className="flex items-center space-x-2 bg-white border border-[#dee1e6] p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
              {(['all', 'crypto', 'commodities', 'equities'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedAssetCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${selectedAssetCategory === cat
                      ? 'bg-[#0052ff] text-white font-bold shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#dee1e6] rounded-3xl overflow-hidden shadow-xs">
            <div className="grid grid-cols-4 px-6 py-4 bg-[#f7f7f7] border-b border-[#dee1e6] text-xs font-extrabold text-[#0a0b0d] uppercase tracking-wider">
              <span>Asset Name</span>
              <span className="text-right">Live Price</span>
              <span className="text-right">24h Change</span>
              <span className="text-right hidden sm:block">Volume (24h)</span>
            </div>

            <div className="divide-y divide-[#eef0f3]">
              {filteredAssets.map((asset) => (
                <div key={asset.symbol} className="grid grid-cols-4 px-6 py-4 items-center hover:bg-[#f7f7f7] transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center font-bold text-blue-600 text-xs">
                      {asset.icon}
                    </div>
                    <div>
                      <span className="font-bold text-[#0a0b0d] text-sm block sm:inline">{asset.name}</span>
                      <span className="text-xs font-mono text-[#7c828a] sm:ml-2">{asset.symbol}</span>
                    </div>
                  </div>
                  <span className="text-right font-mono text-sm text-[#0a0b0d] font-bold">{asset.price}</span>
                  <span className={`text-right font-mono text-sm font-extrabold ${asset.isPositive ? 'text-[#05b169]' : 'text-[#cf202f]'}`}>
                    {asset.change}
                  </span>
                  <span className="text-right text-xs text-[#7c828a] font-mono hidden sm:block">{asset.volume}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. TECH STACK & PRIVACY HIGHLIGHT SECTION ───────────────────────── */}
      <section id="tech" className="bg-white py-20 px-6">
        <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <span className="text-xs text-[#0052ff] font-extrabold uppercase tracking-widest">Engineering & Security</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0a0b0d] tracking-tight leading-tight" style={{ letterSpacing: '-1px' }}>
              Privacy-First & On-Client Execution Architecture.
            </h2>
            <p className="text-sm text-[#5b616e] leading-relaxed">
              Stratrade runs all complex mathematical calculations, Black-Scholes pricing models, and backtesting routines client-side directly inside your browser.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3">
                <Lock className="w-5 h-5 text-[#0052ff] shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-[#0a0b0d] text-sm">Client-Side API Key Storage</h5>
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

          <div className="flex-1 bg-[#0a0b0d] border border-[#22252b] rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#22252b] pb-3">
              <span className="text-xs font-bold text-amber-400 font-mono">Stratrade Architecture Spec</span>
              <span className="text-[10px] text-emerald-400 font-mono">STABLE v1.2.0</span>
            </div>
            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="flex justify-between"><span>Core Framework:</span><span className="text-white font-bold">React 18 + TypeScript</span></div>
              <div className="flex justify-between"><span>State Management:</span><span className="text-white font-bold">Client Hooks & Memoization</span></div>
              <div className="flex justify-between"><span>Real-time Stream:</span><span className="text-emerald-400 font-bold">Binance WebSocket API</span></div>
              <div className="flex justify-between"><span>AI Integration:</span><span className="text-purple-400 font-bold">Google Gemini API</span></div>
              <div className="flex justify-between"><span>Styling Engine:</span><span className="text-blue-400 font-bold">Vanilla Tailwind CSS</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. PRE-FOOTER CALL TO ACTION ────────────────────────────────────── */}
      <section className="bg-[#0a0b0d] text-white py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0052ff]/10 pointer-events-none"></div>
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none" style={{ letterSpacing: '-1px' }}>
            Ready to Launch the Trading Workstation?
          </h2>
          <p className="text-[#a8acb3] text-sm leading-relaxed max-w-md mx-auto">
            Test quantitative trading strategies immediately with $100,000 in virtual paper capital. Full options pricing, backtesting, and AI Copilot unlocked.
          </p>
          <div>
            <button
              onClick={onLaunch}
              className="h-14 px-9 bg-[#0052ff] hover:bg-[#003ecc] text-white rounded-xl font-extrabold text-base transition-all inline-flex items-center justify-center space-x-2.5 shadow-lg shadow-blue-500/25 group"
            >
              <span>Launch Workstation Terminal</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── 8. INSTITUTIONAL FOOTER ────────────────────────────────────────── */}
      <footer className="bg-white border-t border-[#dee1e6] py-12 px-6">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-[#0052ff] rounded-xl flex items-center justify-center shadow-xs">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-extrabold text-[#0a0b0d] tracking-tight">Stratrade Terminal</span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-[#5b616e]">
            <a
              href="https://github.com/Garvit-821/multi-asset-algorithmic-trading-software"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-[#0a0b0d] hover:text-[#0052ff] font-bold transition-colors"
            >
              <Github className="w-4 h-4 mr-1.5 text-amber-500" />
              <span>Star on GitHub</span>
            </a>
            <span className="flex items-center"><Globe className="w-4 h-4 mr-1 text-[#7c828a]" /> Web Workstation</span>
            <span className="flex items-center"><Smartphone className="w-4 h-4 mr-1 text-[#7c828a]" /> Mobile Sandbox</span>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto mt-8 pt-6 border-t border-[#eef0f3] text-center text-[11px] text-[#7c828a] tracking-wide font-semibold">
          © 2026 Stratrade Inc. All rights reserved. Built for institutional multi-asset algorithmic trading.
        </div>
      </footer>

    </div>
  );
};
