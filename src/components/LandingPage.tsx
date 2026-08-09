import React, { useEffect, useState } from 'react';
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
  Sliders,
  Maximize2
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
  const [liveSimValue, setLiveSimValue] = useState<number>(64520.40);

  // Simulate live price fluctuation for high-tech feel
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.48) * 25;
      setLiveSimValue((prev) => Math.round((prev + delta) * 100) / 100);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Inject Inter and JetBrains Mono fonts for institutional typography
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  const assetList = [
    { symbol: 'BTC/USDT', name: 'Bitcoin', price: `$${liveSimValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, change: '+2.45%', isPositive: true, category: 'crypto', icon: '₿', volume: '$28.4B' },
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
      <header className="bg-white/90 backdrop-blur-md border-b border-[#dee1e6] h-16 sticky top-0 z-50 transition-all">
        <div className="max-w-[1320px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={onLaunch}>
            <div className="w-9 h-9 bg-gradient-to-br from-[#0052ff] via-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-[#0a0b0d]" style={{ letterSpacing: '-0.6px' }}>
                Stratrade
              </span>
              <span className="text-[9px] text-[#0052ff] font-extrabold uppercase tracking-widest -mt-1">Workstation v1.2</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-[#5b616e]">
            <a href="#showcase" className="hover:text-[#0052ff] transition-colors">Terminal Tour</a>
            <a href="#features" className="hover:text-[#0052ff] transition-colors">Quantitative Tools</a>
            <a href="#risk" className="hover:text-[#0052ff] transition-colors">Math & Models</a>
            <a href="#explore" className="hover:text-[#0052ff] transition-colors">Market Catalog</a>
            <a href="#tech" className="hover:text-[#0052ff] transition-colors">Architecture</a>
          </nav>

          {/* Nav CTAs */}
          <div className="hidden md:flex items-center space-x-3">
            <a
              href="https://github.com/Garvit-821/multi-asset-algorithmic-trading-software"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-4 bg-[#16181c] hover:bg-[#202328] text-white rounded-xl font-bold text-xs transition-all border border-[#26282c] flex items-center space-x-2 shadow-xs group"
            >
              <Github className="w-4 h-4 text-amber-400" />
              <span>Star on GitHub</span>
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 group-hover:rotate-12 transition-transform" />
            </a>

            <button
              onClick={onLaunch}
              className="h-10 px-5 bg-gradient-to-r from-[#0052ff] to-[#0042cc] hover:from-[#0046db] hover:to-[#0038b3] text-white rounded-xl font-extrabold text-xs transition-all shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 flex items-center space-x-2 group"
            >
              <span>Launch Workstation</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-[#dee1e6] p-6 shadow-xl z-40 lg:hidden flex flex-col space-y-4 animate-in slide-in-from-top-2 duration-200">
            <a href="#showcase" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-[#0a0b0d] hover:text-[#0052ff]">Terminal Tour</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-[#0a0b0d] hover:text-[#0052ff]">Quantitative Tools</a>
            <a href="#risk" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-[#0a0b0d] hover:text-[#0052ff]">Math & Models</a>
            <a href="#explore" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-[#0a0b0d] hover:text-[#0052ff]">Market Catalog</a>
            <a href="#tech" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-[#0a0b0d] hover:text-[#0052ff]">Architecture</a>
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
                className="w-full py-3 bg-[#0052ff] hover:bg-[#003ecc] text-white rounded-xl font-extrabold text-xs transition-all text-center flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20"
              >
                <span>Launch Workstation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ─── 2. HIGH IMPACT HERO BAND WITH GRID MESH BACKGROUND ───────────── */}
      <section className="bg-[#0a0b0d] text-white py-16 lg:py-24 px-6 relative overflow-hidden">
        {/* Subtle CSS Grid Background Mesh */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(#2a303c 1px, transparent 1px), radial-gradient(#2a303c 1px, #0a0b0d 1px)`,
            backgroundSize: `40px 40px`,
            backgroundPosition: `0 0, 20px 20px`
          }}
        />

        {/* Ambient Glow Lights */}
        <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-[#0052ff]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-[1320px] mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">

          {/* Hero Left Column Text */}
          <div className="flex-1 text-center lg:text-left space-y-6 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-[#14161b] border border-[#282d38] rounded-full text-xs font-bold text-slate-300 shadow-inner">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
              <span className="text-white font-mono text-[11px] uppercase tracking-wider">Institutional Algorithmic Software</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.06]" style={{ letterSpacing: '-1.8px' }}>
              Institutional Algorithmic Trading{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
                Workstation.
              </span>
            </h1>

            <p className="text-[#a8acb3] text-base md:text-lg font-normal leading-relaxed">
              Connect to low-latency Binance WebSockets, calculate analytical Black-Scholes Option Greeks, query Google Gemini AI market intelligence, and simulate Monte Carlo risk paths.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onLaunch}
                className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-[#0052ff] via-blue-600 to-indigo-600 hover:from-[#0044d6] hover:to-indigo-700 text-white rounded-2xl font-extrabold text-sm transition-all flex items-center justify-center space-x-2.5 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 group"
              >
                <Terminal className="w-4 h-4 text-blue-200" />
                <span>Launch Workstation Terminal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="https://github.com/Garvit-821/multi-asset-algorithmic-trading-software"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto h-14 px-7 bg-[#14161b] hover:bg-[#1f232c] text-white rounded-2xl font-bold text-sm border border-[#282d38] transition-all flex items-center justify-center space-x-2.5 group shadow-xs"
              >
                <Github className="w-4 h-4 text-amber-400" />
                <span>Star Source Code</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
              </a>
            </div>

            {/* Key Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#1a1d24] text-left font-mono">
              <div className="bg-[#121419]/90 border border-[#222733] rounded-2xl p-3.5 backdrop-blur-md hover:border-blue-500/40 transition-colors">
                <p className="text-xl font-extrabold text-white">&lt;150ms</p>
                <p className="text-[10px] text-[#8e939e] uppercase font-sans font-bold tracking-wider">Stream Latency</p>
              </div>
              <div className="bg-[#121419]/90 border border-[#222733] rounded-2xl p-3.5 backdrop-blur-md hover:border-emerald-500/40 transition-colors">
                <p className="text-xl font-extrabold text-emerald-400">1,000+</p>
                <p className="text-[10px] text-[#8e939e] uppercase font-sans font-bold tracking-wider">Monte Carlo Paths</p>
              </div>
              <div className="bg-[#121419]/90 border border-[#222733] rounded-2xl p-3.5 backdrop-blur-md hover:border-blue-400/40 transition-colors">
                <p className="text-xl font-extrabold text-blue-400">5 Greeks</p>
                <p className="text-[10px] text-[#8e939e] uppercase font-sans font-bold tracking-wider">Option Sensitivity</p>
              </div>
              <div className="bg-[#121419]/90 border border-[#222733] rounded-2xl p-3.5 backdrop-blur-md hover:border-amber-400/40 transition-colors">
                <p className="text-xl font-extrabold text-amber-400">$100,000</p>
                <p className="text-[10px] text-[#8e939e] uppercase font-sans font-bold tracking-wider">Virtual Sandbox</p>
              </div>
            </div>
          </div>

          {/* Hero Right Column: 3D Layered Workstation Preview Frame */}
          <div className="flex-1 w-full flex justify-center items-center relative h-[400px] sm:h-[450px]">

            {/* Backdrop Glow Grid */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-indigo-600/10 to-transparent rounded-3xl blur-2xl transform rotate-3 scale-95" />

            {/* Primary Main Terminal Mockup Card */}
            <div className="absolute w-[95%] sm:w-[420px] bg-[#12141a]/95 border border-[#2a303d] rounded-3xl p-5 shadow-2xl z-20 backdrop-blur-xl transform -rotate-1 hover:rotate-0 transition-all duration-300 hover:border-blue-500/50">
              <div className="flex justify-between items-center pb-3 border-b border-[#202530] mb-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1.5">
                    <span className="w-2.5 h-2.5 bg-rose-500/80 rounded-full inline-block"></span>
                    <span className="w-2.5 h-2.5 bg-amber-500/80 rounded-full inline-block"></span>
                    <span className="w-2.5 h-2.5 bg-emerald-500/80 rounded-full inline-block"></span>
                  </div>
                  <span className="text-xs font-bold text-slate-300 font-mono pl-2">BTC/USDT WebSocket</span>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold rounded-md border border-emerald-500/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                  <span>FEED ACTIVE</span>
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block font-mono">SPOT VALUATION</span>
                    <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                      ${liveSimValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400 font-mono flex items-center justify-end">
                      <ArrowUpRight className="w-4 h-4 mr-0.5" /> +2.45%
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">24H High: $64,890</span>
                  </div>
                </div>

                {/* Animated Candle/Sparkline Chart Simulation */}
                <div className="bg-[#0b0c0f] border border-[#1e232d] rounded-2xl p-3 h-24 flex items-end justify-between gap-1.5">
                  {[35, 42, 28, 55, 48, 65, 58, 72, 85, 78, 88, 95, 90, 98, 100].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full">
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 via-indigo-500 to-emerald-400 rounded-t-xs"
                        style={{ height: `${val}%` }}
                      />
                    </div>
                  ))}
                </div>

                {/* AI Signal Pill */}
                <div className="bg-[#181c26] border border-[#2b3345] rounded-xl p-3 flex items-start space-x-3 text-xs text-slate-300">
                  <BrainCircuit className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">Gemini 2.0 AI Insight</span>
                      <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">CONFIDENCE: 92%</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Bullish MACD histogram expansion on 1h time frame. Recommended entry target: $64,800.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlapping Card 2: Options Greeks Pill */}
            <div className="absolute w-[80%] sm:w-[320px] bg-[#161a24] border border-[#2e374a] rounded-2xl p-4 shadow-2xl z-10 transform translate-x-14 translate-y-32 rotate-3 hidden sm:block">
              <div className="flex items-center justify-between pb-2 border-b border-[#2e374a] mb-2.5 text-xs font-mono">
                <span className="font-extrabold text-amber-400 flex items-center">
                  <Sliders className="w-3.5 h-3.5 mr-1" /> Black-Scholes Greeks
                </span>
                <span className="text-[10px] text-slate-400">DTE: 30d</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-[#0e1118] p-2 rounded-lg border border-[#232a39]">
                  <span className="text-slate-400 block text-[9px]">CALL DELTA ($\Delta$)</span>
                  <span className="text-emerald-400 font-bold">+0.6420</span>
                </div>
                <div className="bg-[#0e1118] p-2 rounded-lg border border-[#232a39]">
                  <span className="text-slate-400 block text-[9px]">THETA ($\Theta$)</span>
                  <span className="text-rose-400 font-bold">-$42.80/day</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 3. LIVE MARKET TICKER BANNER ───────────────────────────────────── */}
      <div className="bg-[#121419] border-y border-[#20242e] py-3 text-xs font-mono text-white overflow-hidden">
        <div className="max-w-[1320px] mx-auto px-6 flex items-center justify-between space-x-6 overflow-x-auto scrollbar-none">
          <span className="text-[#0052ff] font-extrabold uppercase text-[10px] tracking-wider shrink-0 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping mr-2"></span>
            LIVE STREAM INDEX:
          </span>
          {assetList.map((asset) => (
            <div key={asset.symbol} className="flex items-center space-x-2 shrink-0 bg-[#191c24] px-3 py-1 rounded-lg border border-[#262c3a]">
              <span className="font-bold text-slate-300">{asset.symbol}</span>
              <span className="text-white font-bold">{asset.price}</span>
              <span className={`text-[10px] font-bold ${asset.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {asset.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 4. INTERACTIVE TERMINAL SIMULATOR SHOWCASE ─────────────────────── */}
      <section id="showcase" className="bg-[#f7f7f7] py-20 px-6 border-b border-[#dee1e6]">
        <div className="max-w-[1320px] mx-auto space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs text-[#0052ff] font-extrabold uppercase tracking-widest">Interactive Workstation Showcase</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0a0b0d] tracking-tight" style={{ letterSpacing: '-0.8px' }}>
              Explore the Stratrade Workstation Suite.
            </h2>
            <p className="text-sm text-[#5b616e]">
              Click through the main platform modules below to see real live preview simulations.
            </p>
          </div>

          {/* Tab Selection Bar */}
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
                  className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-bold text-xs whitespace-nowrap transition-all ${isActive
                      ? 'bg-[#0052ff] text-white shadow-lg shadow-blue-500/25 scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-[#dee1e6]'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Terminal Window Frame */}
          <div className="bg-[#0d0f14] border border-[#222733] rounded-3xl overflow-hidden shadow-2xl text-white">

            {/* Window Browser Top Control Bar */}
            <div className="bg-[#151821] px-5 py-3 border-b border-[#222733] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-rose-500 rounded-full inline-block"></span>
                <span className="w-3 h-3 bg-amber-500 rounded-full inline-block"></span>
                <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block"></span>
                <span className="text-slate-400 pl-3 text-[11px] hidden sm:inline">stratrade-workstation://app/{activeFeatureTab}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
                <span className="flex items-center text-emerald-400"><Play className="w-3 h-3 mr-1 fill-emerald-400" /> ENGINE ONLINE</span>
                <Maximize2 className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
              </div>
            </div>

            {/* Tab Contents Frame */}
            <div className="p-6 sm:p-10">
              {activeFeatureTab === 'derivatives' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-5">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-extrabold uppercase border border-blue-500/20">
                      Black-Scholes & Greeks Engine
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                      Analytical Option Pricing & Volatility Surfaces.
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Compute theoretical Call/Put options fair values, real-time risk sensitivities ($\Delta, \Gamma, \Theta, \nu, \rho$), 2D implied volatility skew heatmaps, and multi-leg strategy payoff curves (Iron Condors, Bull Spreads, Straddles).
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2">
                      <div className="bg-[#181c26] p-3 rounded-xl border border-[#2b3345]">
                        <span className="text-slate-400 text-[10px] block">CALL FAIR VALUE</span>
                        <span className="text-emerald-400 font-bold text-lg">$2,845.50</span>
                      </div>
                      <div className="bg-[#181c26] p-3 rounded-xl border border-[#2b3345]">
                        <span className="text-slate-400 text-[10px] block">PUT FAIR VALUE</span>
                        <span className="text-rose-400 font-bold text-lg">$1,920.10</span>
                      </div>
                    </div>
                    <button onClick={onLaunch} className="px-6 py-3 bg-[#0052ff] hover:bg-[#003ecc] text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center space-x-2">
                      <span>Launch Options Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="lg:col-span-6 bg-[#12151d] rounded-2xl p-5 border border-[#252c3d] space-y-4 font-mono text-xs">
                    <div className="flex justify-between border-b border-[#252c3d] pb-2 text-slate-300">
                      <span className="font-bold text-blue-400">OPTIONS MATRIX // STRIKE $64,500</span>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">DTE: 30 DAYS</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between bg-[#191d28] p-2.5 rounded-lg">
                        <span className="text-slate-400">Delta ($\Delta$):</span>
                        <span className="text-emerald-400 font-bold">+0.6420 (Call) / -0.3580 (Put)</span>
                      </div>
                      <div className="flex justify-between bg-[#191d28] p-2.5 rounded-lg">
                        <span className="text-slate-400">Gamma ($\Gamma$):</span>
                        <span className="text-blue-400 font-bold">0.000142 per $1 underlying</span>
                      </div>
                      <div className="flex justify-between bg-[#191d28] p-2.5 rounded-lg">
                        <span className="text-slate-400">Theta ($\Theta$):</span>
                        <span className="text-rose-400 font-bold">-$42.80 daily time decay</span>
                      </div>
                      <div className="flex justify-between bg-[#191d28] p-2.5 rounded-lg">
                        <span className="text-slate-400">Vega ($\nu$):</span>
                        <span className="text-indigo-400 font-bold">+$12.40 per 1% IV shift</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeFeatureTab === 'ai' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-5">
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-xs font-extrabold uppercase border border-purple-500/20">
                      Google Gemini 2.0 API Integration
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                      Real-Time AI Market Intelligence & Copilot.
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Connect your Google Gemini API key to unlock natural language market analysis, real-time indicator signal explanations, automated strategy synthesis, and a persistent floating AI assistant drawer.
                    </p>
                    <button onClick={onLaunch} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-purple-500/20 flex items-center space-x-2">
                      <span>Open AI Copilot</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="lg:col-span-6 bg-[#12151d] rounded-2xl p-5 border border-[#252c3d] space-y-3 font-sans">
                    <div className="flex items-center space-x-2 border-b border-[#252c3d] pb-2">
                      <BrainCircuit className="w-5 h-5 text-purple-400" />
                      <span className="font-bold text-xs text-white">Gemini Market Intelligence Output</span>
                    </div>
                    <div className="bg-[#191d28] p-4 rounded-xl text-slate-200 border border-[#2a3142] space-y-2">
                      <span className="text-purple-400 font-bold font-mono text-xs block">&gt; PROMPT: "Analyze BTC/USDT momentum"</span>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        "BTC/USDT displays strong institutional accumulation above $64,000. RSI sits at 54 with positive MACD divergence on 1h candles. Suggested tactical target: $66,200 with tight stop loss at $63,700."
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeFeatureTab === 'backtest' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-5">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-extrabold uppercase border border-emerald-500/20">
                      Historical Backtester & Replay
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                      Advanced Strategy Backtesting Engine.
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Evaluate technical indicator trading rules against historical kline datasets. Obtain institutional risk metrics including Sharpe Ratio, Sortino Ratio, Max Drawdown, and Equity Curves.
                    </p>
                    <button onClick={onLaunch} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-2">
                      <span>Run Backtester</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="lg:col-span-6 bg-[#12151d] rounded-2xl p-5 border border-[#252c3d] space-y-4 font-mono text-xs">
                    <div className="flex justify-between border-b border-[#252c3d] pb-2 text-slate-300">
                      <span className="font-bold text-emerald-400">BACKTEST REPORT // EMA CROSSOVER</span>
                      <span className="text-[10px] text-slate-400">1,240 CANDLES</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-[#191d28] p-3 rounded-xl border border-[#2a3142]">
                        <span className="text-slate-400 text-[10px] block">SHARPE RATIO</span>
                        <span className="text-emerald-400 font-bold text-xl">2.41</span>
                      </div>
                      <div className="bg-[#191d28] p-3 rounded-xl border border-[#2a3142]">
                        <span className="text-slate-400 text-[10px] block">WIN RATE</span>
                        <span className="text-blue-400 font-bold text-xl">64.8%</span>
                      </div>
                      <div className="bg-[#191d28] p-3 rounded-xl border border-[#2a3142]">
                        <span className="text-slate-400 text-[10px] block">MAX DRAWDOWN</span>
                        <span className="text-rose-400 font-bold text-xl">-4.2%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeFeatureTab === 'visual' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-5">
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-extrabold uppercase border border-amber-500/20">
                      No-Code Visual Graph Builder
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                      Drag-and-Drop Visual Strategy Builder.
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Construct algorithmic entry/exit rules visually without code. Connect indicator trigger nodes, stop loss parameters, and take profit targets into executable strategy pipelines.
                    </p>
                    <button onClick={onLaunch} className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center space-x-2">
                      <span>Open Visual Builder</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="lg:col-span-6 bg-[#12151d] rounded-2xl p-5 border border-[#252c3d] space-y-3 font-mono text-xs">
                    <div className="bg-[#191d28] p-3.5 rounded-xl border border-[#2a3142] flex items-center justify-between">
                      <span className="text-amber-400 font-bold">NODE 1: RSI (14) &lt; 30 (Oversold)</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">ENTRY TRIGGER</span>
                    </div>
                    <div className="text-center text-slate-500 font-bold">↓ EXECUTE ACTION ↓</div>
                    <div className="bg-[#191d28] p-3.5 rounded-xl border border-[#2a3142] flex items-center justify-between">
                      <span className="text-emerald-400 font-bold">NODE 2: Buy Market (TP: +3.0%, SL: -1.5%)</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">ORDER EXECUTION</span>
                    </div>
                  </div>
                </div>
              )}

              {activeFeatureTab === 'optimizer' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-5">
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-extrabold uppercase border border-indigo-500/20">
                      Markowitz & Stochastic Risk Engine
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                      Efficient Frontier & Monte Carlo Optimization.
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Optimize portfolio capital allocation using Markowitz modern portfolio theory. Simulate 1,000+ stochastic price trajectories and calculate Parametric Value at Risk (VaR 95% & 99%).
                    </p>
                    <button onClick={onLaunch} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center space-x-2">
                      <span>Optimize Portfolio Risk</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="lg:col-span-6 bg-[#12151d] rounded-2xl p-5 border border-[#252c3d] space-y-4 font-mono text-xs">
                    <div className="flex justify-between border-b border-[#252c3d] pb-2 text-slate-300">
                      <span className="font-bold text-indigo-400">MARKOWITZ OPTIMAL ALLOCATION</span>
                      <span className="text-[10px] text-slate-400">MAX SHARPE TARGET</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1"><span>Bitcoin (BTC): 45%</span><span className="text-emerald-400 font-bold">Optimal</span></div>
                        <div className="w-full bg-[#191d28] rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: '45%' }}></div></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1"><span>Ethereum (ETH): 35%</span><span className="text-blue-400 font-bold">Optimal</span></div>
                        <div className="w-full bg-[#191d28] rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: '35%' }}></div></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1"><span>Gold Bullion: 20%</span><span className="text-amber-400 font-bold">Hedge</span></div>
                        <div className="w-full bg-[#191d28] rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full" style={{ width: '20%' }}></div></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeFeatureTab === 'paper' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-5">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-extrabold uppercase border border-emerald-500/20">
                      Risk-Free Trading Sandbox
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                      $100,000 Virtual Capital Paper Account.
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Practice trading and validate quantitative rules in real-time market conditions with zero capital risk. Track virtual equity curves, active positions, order fills, and reset your account anytime.
                    </p>
                    <button onClick={onLaunch} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-2">
                      <span>Start Paper Trading</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="lg:col-span-6 bg-[#12151d] rounded-2xl p-5 border border-[#252c3d] space-y-4 font-mono text-xs">
                    <div className="bg-[#191d28] p-5 rounded-2xl border border-[#2a3142] space-y-2">
                      <span className="text-slate-400 text-[10px] block">VIRTUAL ACCOUNT CAPITAL</span>
                      <span className="text-3xl font-extrabold text-emerald-400">$100,000.00 USD</span>
                      <p className="text-xs text-slate-300 pt-1">Status: Active Paper Account • 0 Open Positions</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* ─── 5. DEEP DIVE FEATURE GRID (9 PILLARS) ──────────────────────────── */}
      <section id="features" className="bg-white py-20 px-6">
        <div className="max-w-[1320px] mx-auto space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs text-[#0052ff] font-extrabold uppercase tracking-widest">Built for Performance</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0a0b0d] tracking-tight" style={{ letterSpacing: '-0.8px' }}>
              Institutional Quantitative Tools.
            </h2>
            <p className="text-sm text-[#5b616e]">
              Engineered with sub-second WebSocket feeds, mathematical precision, and high-performance client execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Feature 1 */}
            <div className="bg-white border border-[#dee1e6] rounded-2xl p-6 hover:shadow-xl hover:border-[#0052ff]/40 transition-all duration-300 space-y-3 group hover:-translate-y-1">
              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-[#0052ff] group-hover:text-white transition-colors shadow-xs">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Low-Latency WebSockets</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Direct sub-second price socket mapping utilizing Binance real-time stream feeds with automatic REST polling fallback.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-[#dee1e6] rounded-2xl p-6 hover:shadow-xl hover:border-[#0052ff]/40 transition-all duration-300 space-y-3 group hover:-translate-y-1">
              <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-xs">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Black-Scholes & Option Greeks</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Calculate theoretical Call/Put values, Delta, Gamma, Theta, Vega, and Rho risk sensitivities in real-time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-[#dee1e6] rounded-2xl p-6 hover:shadow-xl hover:border-[#0052ff]/40 transition-all duration-300 space-y-3 group hover:-translate-y-1">
              <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-xs">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Google Gemini AI Copilot</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Contextual AI market intelligence, technical pattern explanation, and interactive strategy synthesis.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-[#dee1e6] rounded-2xl p-6 hover:shadow-xl hover:border-[#0052ff]/40 transition-all duration-300 space-y-3 group hover:-translate-y-1">
              <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors shadow-xs">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Monte Carlo & VaR Risk</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Stochastic pathing simulations (1,000+ runs) and Parametric Value at Risk (VaR 95% & 99%) estimation.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white border border-[#dee1e6] rounded-2xl p-6 hover:shadow-xl hover:border-[#0052ff]/40 transition-all duration-300 space-y-3 group hover:-translate-y-1">
              <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">No-Code Visual Builder</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Drag-and-drop indicator nodes, entry/exit condition blocks, stop loss, and take profit target pipelines.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white border border-[#dee1e6] rounded-2xl p-6 hover:shadow-xl hover:border-[#0052ff]/40 transition-all duration-300 space-y-3 group hover:-translate-y-1">
              <div className="w-11 h-11 bg-[#0052ff]/10 text-[#0052ff] rounded-xl flex items-center justify-center group-hover:bg-[#0052ff] group-hover:text-white transition-colors shadow-xs">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Telegram Alert Push Bot</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Automated price boundary and strategy signal notifications delivered directly to your Telegram chat.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="bg-white border border-[#dee1e6] rounded-2xl p-6 hover:shadow-xl hover:border-[#0052ff]/40 transition-all duration-300 space-y-3 group hover:-translate-y-1">
              <div className="w-11 h-11 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors shadow-xs">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Tick-by-Tick Market Replay</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Play back historical market candle sequences at 1x to 10x speed to test manual and algorithmic decisions.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="bg-white border border-[#dee1e6] rounded-2xl p-6 hover:shadow-xl hover:border-[#0052ff]/40 transition-all duration-300 space-y-3 group hover:-translate-y-1">
              <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors shadow-xs">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Markowitz Efficient Frontier</h3>
              <p className="text-xs text-[#5b616e] leading-relaxed">
                Optimal Sharpe portfolio asset weighting and multi-asset correlation matrices calculated on-client.
              </p>
            </div>

            {/* Feature 9 */}
            <div className="bg-white border border-[#dee1e6] rounded-2xl p-6 hover:shadow-xl hover:border-[#0052ff]/40 transition-all duration-300 space-y-3 group hover:-translate-y-1">
              <div className="w-11 h-11 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors shadow-xs">
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

      {/* ─── 6. ASSET EXPLORER CATALOG ───────────────────────────────────────── */}
      <section id="explore" className="bg-[#f7f7f7] py-20 px-6 border-t border-b border-[#dee1e6]">
        <div className="max-w-[1320px] mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs text-[#0052ff] font-extrabold uppercase tracking-widest">Multi-Asset Index</span>
              <h2 className="text-3xl font-extrabold text-[#0a0b0d] tracking-tight mt-1" style={{ letterSpacing: '-0.8px' }}>
                Real-Time Asset Catalog.
              </h2>
              <p className="text-sm text-[#5b616e]">Track live streaming price feeds across global markets.</p>
            </div>

            {/* Asset Filter Pills */}
            <div className="flex items-center space-x-2 bg-white border border-[#dee1e6] p-1.5 rounded-2xl self-start sm:self-auto text-xs font-semibold shadow-xs">
              {(['all', 'crypto', 'commodities', 'equities'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedAssetCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl capitalize transition-all ${selectedAssetCategory === cat
                      ? 'bg-[#0052ff] text-white font-bold shadow-md shadow-blue-500/20'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#dee1e6] rounded-3xl overflow-hidden shadow-xs">
            <div className="grid grid-cols-4 px-6 py-4 bg-[#f7f7f7] border-b border-[#dee1e6] text-xs font-extrabold text-[#0a0b0d] uppercase tracking-wider font-mono">
              <span>Asset Name</span>
              <span className="text-right">Live Price</span>
              <span className="text-right">24h Change</span>
              <span className="text-right hidden sm:block">Volume (24h)</span>
            </div>

            <div className="divide-y divide-[#eef0f3]">
              {filteredAssets.map((asset) => (
                <div key={asset.symbol} className="grid grid-cols-4 px-6 py-4.5 items-center hover:bg-[#f7f7f7] transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-blue-50/80 border border-blue-100 rounded-xl flex items-center justify-center font-bold text-blue-600 text-xs shadow-xs">
                      {asset.icon}
                    </div>
                    <div>
                      <span className="font-bold text-[#0a0b0d] text-sm block sm:inline">{asset.name}</span>
                      <span className="text-xs font-mono text-[#7c828a] sm:ml-2">{asset.symbol}</span>
                    </div>
                  </div>
                  <span className="text-right font-mono text-sm text-[#0a0b0d] font-extrabold">{asset.price}</span>
                  <span className={`text-right font-mono text-sm font-extrabold flex items-center justify-end ${asset.isPositive ? 'text-[#05b169]' : 'text-[#cf202f]'}`}>
                    {asset.isPositive ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                    {asset.change}
                  </span>
                  <span className="text-right text-xs text-[#7c828a] font-mono hidden sm:block">{asset.volume}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. TECH STACK & PRIVACY HIGHLIGHT SECTION ───────────────────────── */}
      <section id="tech" className="bg-white py-20 px-6">
        <div className="max-w-[1320px] mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <span className="text-xs text-[#0052ff] font-extrabold uppercase tracking-widest">Engineering & Security</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0a0b0d] tracking-tight leading-tight" style={{ letterSpacing: '-1px' }}>
              Privacy-First & On-Client Execution.
            </h2>
            <p className="text-sm text-[#5b616e] leading-relaxed">
              Stratrade runs all complex mathematical calculations, Black-Scholes option pricing models, and backtesting routines client-side directly inside your browser.
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

          <div className="flex-1 bg-[#0a0b0d] border border-[#22252b] rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#22252b] pb-3">
              <span className="text-xs font-bold text-amber-400 font-mono">Stratrade Architecture Spec</span>
              <span className="text-[10px] text-emerald-400 font-mono">STABLE v1.2.0</span>
            </div>
            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="flex justify-between"><span>Core Framework:</span><span className="text-white font-bold">React 18 + TypeScript</span></div>
              <div className="flex justify-between"><span>State Management:</span><span className="text-white font-bold">Client Hooks & Memoization</span></div>
              <div className="flex justify-between"><span>Real-Time Stream:</span><span className="text-emerald-400 font-bold">Binance WebSocket API</span></div>
              <div className="flex justify-between"><span>AI Integration:</span><span className="text-purple-400 font-bold">Google Gemini API</span></div>
              <div className="flex justify-between"><span>Styling Engine:</span><span className="text-blue-400 font-bold">Vanilla Tailwind CSS</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. PRE-FOOTER CALL TO ACTION ────────────────────────────────────── */}
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
              className="h-14 px-9 bg-gradient-to-r from-[#0052ff] via-blue-600 to-indigo-600 hover:from-[#0044d6] hover:to-indigo-700 text-white rounded-2xl font-extrabold text-base transition-all inline-flex items-center justify-center space-x-2.5 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 group"
            >
              <Terminal className="w-5 h-5 text-blue-200" />
              <span>Launch Workstation Terminal</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── 9. INSTITUTIONAL FOOTER ────────────────────────────────────────── */}
      <footer className="bg-white border-t border-[#dee1e6] py-12 px-6">
        <div className="max-w-[1320px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#0052ff] to-[#003ecc] rounded-xl flex items-center justify-center shadow-xs">
              <TrendingUp className="w-4.5 h-4.5 text-white" />
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

        <div className="max-w-[1320px] mx-auto mt-8 pt-6 border-t border-[#eef0f3] text-center text-[11px] text-[#7c828a] tracking-wide font-semibold">
          © 2026 Stratrade Inc. All rights reserved. Built for institutional multi-asset algorithmic trading.
        </div>
      </footer>

    </div>
  );
};
