import React, { useEffect, useState } from 'react';
import { TrendingUp, ShieldAlert, Cpu, Zap, ArrowRight, CheckCircle, Globe, Smartphone, Menu, X, ArrowUpRight } from 'lucide-react';

interface LandingPageProps {
  onLaunch: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Inject Inter and JetBrains Mono for pristine institutional typography
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#5b616e] flex flex-col font-sans overflow-x-hidden select-none selection:bg-[#0052ff] selection:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Top Nav (top-nav-light) */}
      <header className="relative bg-white border-b border-[#dee1e6] h-16 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onLaunch}>
            <div className="w-8 h-8 bg-[#0052ff] rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#0a0b0d]" style={{ letterSpacing: '-0.5px' }}>
              CryptoAgent
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#5b616e]">
            <a href="#explore" className="hover:text-[#0a0b0d] transition-colors">Explore Assets</a>
            <a href="#features" className="hover:text-[#0a0b0d] transition-colors">Features</a>
            <a href="#risk" className="hover:text-[#0a0b0d] transition-colors">Quantitative Risk</a>
          </nav>

          {/* Nav CTAs */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={onLaunch}
              className="h-11 px-5 bg-[#0052ff] hover:bg-[#003ecc] text-white rounded-full font-semibold text-sm transition-all shadow-sm flex items-center space-x-2"
            >
              <span>Launch Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[#f7f7f7] text-[#0a0b0d] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-[#dee1e6] p-6 shadow-lg z-40 md:hidden flex flex-col space-y-4">
            <a
              href="#explore"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-[#0a0b0d] hover:text-[#0052ff]"
            >
              Explore Assets
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-[#0a0b0d] hover:text-[#0052ff]"
            >
              Features
            </a>
            <a
              href="#risk"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-[#0a0b0d] hover:text-[#0052ff]"
            >
              Quantitative Risk
            </a>
            <hr className="border-[#eef0f3]" />
            <div className="flex flex-col space-y-3 pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLaunch();
                }}
                className="w-full text-center py-3 text-sm font-bold text-[#0a0b0d] hover:bg-[#f7f7f7] rounded-full transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLaunch();
                }}
                className="w-full py-3 bg-[#0052ff] hover:bg-[#003ecc] text-white rounded-full font-bold text-sm transition-all text-center flex items-center justify-center space-x-2"
              >
                <span>Launch Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Band (hero-band-dark) */}
      <section className="bg-[#0a0b0d] text-white py-16 md:py-24 px-6 relative overflow-hidden">
        {/* Subtle accent light */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#0052ff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">

          {/* Left Column Text */}
          <div className="flex-1 text-center lg:text-left space-y-6 max-w-xl">
            <span className="inline-block px-3 py-1 bg-[#16181c] border border-[#26282c] rounded-full text-xs font-semibold text-[#a8acb3] uppercase tracking-wider">
              System Sandbox Live
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.05]" style={{ letterSpacing: '-1.5px' }}>
              Institutional algorithmic trading for everyone.
            </h1>

            <p className="text-[#a8acb3] text-base md:text-lg font-normal leading-relaxed">
              Connect to Binance low-latency WebSocket feeds, configure custom AI indicators, and simulate risk exposures using our quantitative portfolio engine.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onLaunch}
                className="w-full sm:w-auto h-14 px-8 bg-[#0052ff] hover:bg-[#003ecc] text-white rounded-full font-semibold text-base transition-all flex items-center justify-center space-x-2"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <a
                href="#features"
                className="w-full sm:w-auto h-14 px-8 bg-[#16181c] hover:bg-[#202328] text-white rounded-full font-semibold text-base border border-[#26282c] transition-all flex items-center justify-center"
              >
                Explore Features
              </a>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#16181c] max-w-sm mx-auto lg:mx-0 text-left font-mono">
              <div>
                <p className="text-2xl font-bold text-white">1k+</p>
                <p className="text-3xs text-[#a8acb3] uppercase tracking-wider">Sim Paths</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">&lt;150ms</p>
                <p className="text-3xs text-[#a8acb3] uppercase tracking-wider">Latency</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">$100k</p>
                <p className="text-3xs text-[#a8acb3] uppercase tracking-wider">Sandbox</p>
              </div>
            </div>
          </div>

          {/* Right Column: Layered Mockups (product-ui-card-dark) */}
          <div className="flex-1 w-full flex flex-col justify-center items-center relative h-[360px] sm:h-[400px]">

            {/* Primary Deck Card */}
            <div className="absolute w-[90%] sm:w-[350px] bg-[#16181c] border border-[#26282c] rounded-3xl p-5 shadow-xl transform -rotate-2 z-20">
              <div className="flex justify-between items-center pb-3 border-b border-[#26282c] mb-4">
                <span className="text-2xs font-bold text-[#a8acb3] uppercase tracking-widest">NAV Portfolio</span>
                <span className="px-2 py-0.5 bg-[#05b169]/10 text-[#05b169] text-3xs font-bold rounded">ONLINE</span>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-medium text-white tracking-tight" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  $100,014.49
                </p>
                <div className="flex items-center space-x-1.5 text-xs text-[#05b169]">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span className="font-semibold">+0.01% (24h)</span>
                </div>
              </div>

              {/* Mini Sparkline Mock */}
              <div className="h-16 flex items-end justify-between pt-4">
                {Array.from({ length: 15 }).map((_, idx) => {
                  const heights = [20, 24, 18, 30, 42, 35, 50, 45, 60, 48, 55, 65, 40, 52, 58];
                  return (
                    <div
                      key={idx}
                      className="w-1.5 bg-[#0052ff] rounded-t-xs"
                      style={{ height: `${heights[idx]}%` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Overlapping Card 2 */}
            <div className="absolute w-[80%] sm:w-[280px] bg-[#202328] border border-[#30333a] rounded-3xl p-5 shadow-2xl z-10 transform translate-x-16 translate-y-24 rotate-3 hidden sm:block">
              <div className="flex items-center justify-between pb-2 border-b border-[#30333a] mb-3">
                <span className="text-4xs text-[#a8acb3] uppercase tracking-wider font-bold">Risk Exposure</span>
                <span className="w-2.5 h-2.5 bg-[#0052ff] rounded-full"></span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#a8acb3]">Sharpe Ratio</span>
                  <span className="font-bold text-white font-mono">1.84</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a8acb3]">Value at Risk (95%)</span>
                  <span className="font-bold text-[#cf202f] font-mono">$1,348.87</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Asset Explorer List (Explore Assets - Soft Gray Elevation Band `#f7f7f7`) */}
      <section id="explore" className="bg-[#f7f7f7] py-20 px-6 border-b border-[#dee1e6]">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-xl mb-12 space-y-2 text-center sm:text-left">
            <span className="text-xs text-[#0052ff] font-bold uppercase tracking-widest">Asset row catalog</span>
            <h2 className="text-3xl font-normal tracking-tight text-[#0a0b0d] leading-none" style={{ letterSpacing: '-0.8px' }}>
              Real-time quotes index.
            </h2>
            <p className="text-sm text-[#5b616e]">Track simulated feed valuations mapped directly to global markets.</p>
          </div>

          <div className="bg-white border border-[#dee1e6] rounded-3xl overflow-hidden shadow-xs">
            {/* Header row */}
            <div className="grid grid-cols-3 sm:grid-cols-4 px-6 py-4 bg-[#f7f7f7] border-b border-[#dee1e6] text-xs font-bold text-[#0a0b0d] uppercase tracking-wider">
              <span>Asset</span>
              <span className="text-right">Price</span>
              <span className="text-right">24h Change</span>
              <span className="text-right hidden sm:block">Category</span>
            </div>

            {/* Asset Row 1 */}
            <div className="grid grid-cols-3 sm:grid-cols-4 px-6 py-5 border-b border-[#eef0f3] items-center hover:bg-[#f7f7f7] transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#f4b000]/10 rounded-full flex items-center justify-center font-bold text-[#f4b000]">₿</div>
                <div>
                  <span className="font-semibold text-[#0a0b0d] block sm:inline">Bitcoin</span>
                  <span className="text-3xs text-[#7c828a] sm:ml-2">BTC</span>
                </div>
              </div>
              <span className="text-right font-mono text-sm text-[#0a0b0d] font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>$62,548.48</span>
              <span className="text-right font-mono text-sm font-semibold text-[#05b169]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>+0.16%</span>
              <span className="text-right text-xs text-[#7c828a] hidden sm:block">Crypto</span>
            </div>

            {/* Asset Row 2 */}
            <div className="grid grid-cols-3 sm:grid-cols-4 px-6 py-5 border-b border-[#eef0f3] items-center hover:bg-[#f7f7f7] transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#0052ff]/10 rounded-full flex items-center justify-center font-bold text-[#0052ff]">Ξ</div>
                <div>
                  <span className="font-semibold text-[#0a0b0d] block sm:inline">Ethereum</span>
                  <span className="text-3xs text-[#7c828a] sm:ml-2">ETH</span>
                </div>
              </div>
              <span className="text-right font-mono text-sm text-[#0a0b0d] font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>$3,421.15</span>
              <span className="text-right font-mono text-sm font-semibold text-[#cf202f]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>-1.04%</span>
              <span className="text-right text-xs text-[#7c828a] hidden sm:block">Crypto</span>
            </div>

            {/* Asset Row 3 */}
            <div className="grid grid-cols-3 sm:grid-cols-4 px-6 py-5 items-center hover:bg-[#f7f7f7] transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#f4b000]/10 rounded-full flex items-center justify-center font-bold text-[#f4b000]">Au</div>
                <div>
                  <span className="font-semibold text-[#0a0b0d] block sm:inline">Gold Bullion</span>
                  <span className="text-3xs text-[#7c828a] sm:ml-2">GOLD</span>
                </div>
              </div>
              <span className="text-right font-mono text-sm text-[#0a0b0d] font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>$2,382.40</span>
              <span className="text-right font-mono text-sm font-semibold text-[#05b169]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>+0.42%</span>
              <span className="text-right text-xs text-[#7c828a] hidden sm:block">Commodities</span>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Grids (White Canvas `#ffffff`) */}
      <section id="features" className="bg-white py-20 px-6">
        <div className="max-w-[1200px] mx-auto">

          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <span className="text-xs text-[#0052ff] font-bold uppercase tracking-widest">Built for performance</span>
            <h2 className="text-3xl font-normal tracking-tight text-[#0a0b0d] leading-none" style={{ letterSpacing: '-0.8px' }}>
              Advanced Algorithmic Tooling.
            </h2>
            <p className="text-sm text-[#5b616e]">
              Engineered with clean code configurations and complete mathematical accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Feature 1 */}
            <div className="bg-white border border-[#dee1e6] rounded-3xl p-8 hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 bg-[#0052ff]/10 rounded-full flex items-center justify-center text-[#0052ff]">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0a0b0d]">WebSocket Data Feeds</h3>
              <p className="text-sm leading-relaxed text-[#5b616e]">
                Direct sub-second price socket mapping utilizing Binance's real-time streams. Falls back gracefully to REST APIs for traditional commodities.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-[#dee1e6] rounded-3xl p-8 hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 bg-[#0052ff]/10 rounded-full flex items-center justify-center text-[#0052ff]">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0a0b0d]">AI Backtesting Engine</h3>
              <p className="text-sm leading-relaxed text-[#5b616e]">
                Evaluate indicator trading strategies against historical klines. Optimize parameters dynamically to discover performance models.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-[#dee1e6] rounded-3xl p-8 hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 bg-[#0052ff]/10 rounded-full flex items-center justify-center text-[#0052ff]">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0a0b0d]">Risk Optimization Suite</h3>
              <p className="text-sm leading-relaxed text-[#5b616e]">
                Visualize peak portfolio valuations, high-water marks, and drawdown durations inside composed charts without clutter.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Quantitative Risk Deep Dive (Soft Gray Elevation Band `#f7f7f7`) */}
      <section id="risk" className="bg-[#f7f7f7] py-20 px-6 border-t border-b border-[#dee1e6]">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center gap-12">

          <div className="flex-1 space-y-6">
            <span className="text-xs text-[#0052ff] font-bold uppercase tracking-widest">Mathematics & Models</span>
            <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-[#0a0b0d] leading-none" style={{ letterSpacing: '-1px' }}>
              Stochastic modeling. Verified risk metrics.
            </h2>
            <p className="text-sm leading-relaxed text-[#5b616e]">
              Analyze your asset holdings under Monte Carlo pathing simulations. CryptoAgent integrates mathematical frameworks directly on-client to estimate capital safety.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-[#0052ff] shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-[#0a0b0d] text-sm">Parametric Value at Risk (VaR)</h5>
                  <p className="text-xs text-[#5b616e] mt-0.5">Determine maximum 24h loss exposures under 95% and 99% statistical limits.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-[#0052ff] shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-[#0a0b0d] text-sm">Sortino Downside Volatility</h5>
                  <p className="text-xs text-[#5b616e] mt-0.5">Penalize only negative deviations, providing an accurate risk-adjusted return representation.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Styled Mockup Block */}
          <div className="flex-1 bg-white border border-[#dee1e6] rounded-3xl p-6 w-full shadow-xs">
            <h4 className="text-xs font-bold text-[#0a0b0d] uppercase tracking-wider mb-4">Correlation Coefficients Matrix</h4>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-bold">
                  <span className="text-[#5b616e]">BTC Correlation</span>
                  <span className="text-[#05b169] font-mono">+0.84</span>
                </div>
                <div className="w-full bg-[#f7f7f7] rounded-full h-1.5 overflow-hidden relative">
                  <div className="w-1/2 absolute left-1/2 h-1.5 bg-[#05b169] rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-bold">
                  <span className="text-[#5b616e]">S&P 500 Correlation</span>
                  <span className="text-[#05b169] font-mono">+0.72</span>
                </div>
                <div className="w-full bg-[#f7f7f7] rounded-full h-1.5 overflow-hidden relative">
                  <div className="w-1/2 absolute left-1/2 h-1.5 bg-[#05b169] rounded-full" style={{ width: '36%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-bold">
                  <span className="text-[#5b616e]">Gold Bullion Correlation</span>
                  <span className="text-[#cf202f] font-mono">-0.21</span>
                </div>
                <div className="w-full bg-[#f7f7f7] rounded-full h-1.5 overflow-hidden relative">
                  <div className="w-1/2 absolute right-1/2 h-1.5 bg-[#cf202f] rounded-full" style={{ width: '10.5%' }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Pre-Footer CTA (cta-band-dark) */}
      <section className="bg-[#0a0b0d] text-white py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0052ff]/5 pointer-events-none"></div>
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-normal tracking-tight leading-none" style={{ letterSpacing: '-1px' }}>
            Access the trading workspace.
          </h2>
          <p className="text-[#a8acb3] text-sm leading-relaxed max-w-md mx-auto">
            Test quantitative rules immediately with $100,000 in virtual capital. Complete risk metrics mapping out-of-the-box.
          </p>
          <div>
            <button
              onClick={onLaunch}
              className="h-14 px-8 bg-[#0052ff] hover:bg-[#003ecc] text-white rounded-full font-semibold text-base transition-all inline-flex items-center justify-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer (footer-light) */}
      <footer className="bg-white border-t border-[#dee1e6] py-12 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-[#0052ff] rounded-full flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-bold text-[#0a0b0d] tracking-tight">CryptoAgent Terminal</span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-[#5b616e]">
            <span className="flex items-center"><Globe className="w-4 h-4 mr-1 text-[#7c828a]" /> Web Terminal</span>
            <span className="flex items-center"><Smartphone className="w-4 h-4 mr-1 text-[#7c828a]" /> Mobile Sandbox</span>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto mt-8 pt-6 border-t border-[#eef0f3] text-center text-3xs text-[#7c828a] tracking-wide uppercase font-semibold">
          © 2026 CryptoAgent Inc. All rights reserved.
        </div>
      </footer>

    </div>
  );
};
