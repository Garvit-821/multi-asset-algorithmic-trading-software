import { TrendingUp, ShieldAlert, Cpu, Bell, Zap, ArrowRight, ArrowUpRight, Activity, CheckCircle, Globe, Smartphone } from 'lucide-react';

interface LandingPageProps {
  onLaunch: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-blue-500 selection:text-white">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="relative border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <TrendingUp className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-400 bg-clip-text text-transparent">
                CryptoAgent
              </span>
              <p className="text-3xs text-slate-400 font-bold uppercase tracking-wider -mt-0.5">Quant Terminal</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-300">
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#risk" className="hover:text-blue-400 transition-colors">Risk Analytics</a>
            <a href="#ai" className="hover:text-blue-400 transition-colors">AI Backtest</a>
            <a href="#alerts" className="hover:text-blue-400 transition-colors">Alerts</a>
          </div>

          <button
            onClick={onLaunch}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 transition-all flex items-center space-x-2 text-sm"
          >
            <span>Launch Terminal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 z-10">
        <div className="flex-1 text-center lg:text-left space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Sub-Second Market Streaming Active</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
            Institutional Algorithmic Trading <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              For Every Portfolio
            </span>
          </h2>
          
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Monitor real-time market candlesticks via low-latency WebSockets, backtest advanced indicators with client-side simulations, and practice risk management using our persistent paper trading sandbox.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <button
              onClick={onLaunch}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl font-extrabold shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center justify-center space-x-2 text-base"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl font-bold transition-all text-center"
            >
              Explore Features
            </a>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-800/60 max-w-md mx-auto lg:mx-0">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">1,000+</p>
              <p className="text-3xs sm:text-2xs text-slate-500 font-bold uppercase tracking-wider">Monte Carlo Paths</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">&lt; 150ms</p>
              <p className="text-3xs sm:text-2xs text-slate-500 font-bold uppercase tracking-wider">WebSocket Latency</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white">100%</p>
              <p className="text-3xs sm:text-2xs text-slate-500 font-bold uppercase tracking-wider">Risk Sandbox</p>
            </div>
          </div>
        </div>

        {/* Hero Graphic Card */}
        <div className="flex-1 w-full max-w-md lg:max-w-none relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-600/20 rounded-3xl blur-2xl pointer-events-none"></div>
          
          {/* Mockup Dashboard */}
          <div className="relative bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-850 mb-6">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-3xs text-slate-500 font-bold font-mono ml-2">QUANT_SANDBOX_SIM.EXE</span>
              </div>
              <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-3xs font-mono text-blue-400">ACTIVE</span>
            </div>

            {/* Simulated UI metrics */}
            <div className="space-y-4 font-mono">
              <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-3xs text-slate-500 font-bold uppercase tracking-wider">Net Asset Value (NAV)</p>
                  <p className="text-lg font-black text-white">$100,014.49</p>
                </div>
                <div className="text-right">
                  <p className="text-3xs text-green-500 font-bold flex items-center justify-end">
                    <ArrowUpRight className="w-3 h-3 mr-0.5" /> +0.01%
                  </p>
                  <p className="text-3xs text-slate-500">Practice portfolio</p>
                </div>
              </div>

              {/* Simulated Chart Paths */}
              <div className="h-32 flex items-end justify-between px-2 pt-4 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="px-3 py-1 bg-slate-950/90 border border-slate-800 rounded-lg text-3xs text-slate-300 flex items-center space-x-1.5 shadow-xl">
                    <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
                    <span>Risk Matrix Enabled</span>
                  </div>
                </div>
                {Array.from({ length: 18 }).map((_, i) => {
                  const h1 = Math.round(30 + Math.sin(i * 0.8) * 20 + Math.cos(i * 1.5) * 10);
                  const h2 = Math.round(40 + Math.sin(i * 0.8) * 15);
                  return (
                    <div key={i} className="w-3 flex flex-col justify-end space-y-1">
                      <div className="w-full bg-blue-500/40 rounded-t" style={{ height: `${h1}px` }}></div>
                      <div className="w-full bg-indigo-500 rounded-t" style={{ height: `${h2}px` }}></div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-850">
                  <p className="text-4xs text-slate-500 font-bold uppercase">Sharpe Ratio</p>
                  <p className="text-sm font-black text-blue-400">1.84</p>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-850">
                  <p className="text-4xs text-slate-500 font-bold uppercase">Value at Risk (95%)</p>
                  <p className="text-sm font-black text-red-400">$1,348.87</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-slate-950/60 border-y border-slate-800/50 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <h3 className="text-xs text-blue-500 font-black uppercase tracking-widest">System Capabilities</h3>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Engineered For Algorithmic Trading</h2>
            <p className="text-slate-400 text-sm">Every tool required to evaluate, simulate, and broadcast strategies at scale.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-blue-500/30 hover:bg-slate-900/60 transition-all group">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Live WebSockets charts</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Connects directly to Binance sub-second streaming endpoints to track financial candlesticks in real-time. Full lightweight-charts support.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/30 hover:bg-slate-900/60 transition-all group">
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">AI Strategy Backtesting</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Evaluate trading rules (EMA, RSI, Bollinger Bands) against historical market cycles client-side. Find optimized strategy parameters with one click.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-purple-500/30 hover:bg-slate-900/60 transition-all group">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Persistent Paper Sandbox</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Practice executing buy/sell order sizes using a simulated $100,000 cash balance. Saved locally so you can continue practice runs at any time.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-pink-500/30 hover:bg-slate-900/60 transition-all group">
              <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">High-Water Mark Drawdowns</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Graph historical peak-to-trough performance curves and shade drawdown phases. Measure maximum drawdowns, durations, and recovery rates.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-orange-500/30 hover:bg-slate-900/60 transition-all group">
              <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Monte Carlo Ruin Engine</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Simulate 1,000 price paths using Geometric Brownian Motion based on portfolio volatility. Predict the probability of hitting a drawdown margin call.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-green-500/30 hover:bg-slate-900/60 transition-all group">
              <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Instant Telegram Alerts</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Set conditional crossing parameters that run in the background. Dispatches sub-second Telegram notifications directly to your phone when triggers hit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quantitative Deep Dive Section */}
      <section id="risk" className="py-20 px-6 max-w-7xl mx-auto z-10 relative">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h3 className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Risk Management</h3>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Keep Your Drawdown Protected</h2>
            <p className="text-slate-400 leading-relaxed">
              Institutional quantitative trading is built on statistics, not guesses. CryptoAgent integrates mathematical models to quantify the exact downside risks of your active portfolio setup.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white">Value at Risk (VaR)</h5>
                  <p className="text-xs text-slate-400">Determine your maximum portfolio capital exposure over 24 hours at 95% and 99% confidence bands.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white">Sortino Ratio Downside Isolation</h5>
                  <p className="text-xs text-slate-400">Focus on the volatility that actually matters: downside losses. Sortino ignores positive upside variance.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-white">Cross-Asset Correlations</h5>
                  <p className="text-xs text-slate-400">Map your allocations against Bitcoin, S&P 500, Gold, and Forex pairs to measure systemic sector dependency.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 w-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-bold text-white">Risk Matrix Dashboard View</h4>
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
              </div>
              
              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-bold">
                    <span className="text-slate-400">Bitcoin Correlation</span>
                    <span className="text-white">+0.84</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden relative">
                    <div className="w-1/2 absolute left-1/2 h-1.5 bg-green-500 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-bold">
                    <span className="text-slate-400">S&P 500 Correlation</span>
                    <span className="text-white">+0.72</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden relative">
                    <div className="w-1/2 absolute left-1/2 h-1.5 bg-green-500 rounded-full" style={{ width: '36%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-bold">
                    <span className="text-slate-400">Gold Bullion Correlation</span>
                    <span className="text-white">-0.21</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden relative">
                    <div className="w-1/2 absolute right-1/2 h-1.5 bg-orange-400 rounded-full" style={{ width: '10.5%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 text-center relative border-t border-slate-850 z-10">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Ready to test your quant strategy?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Initialize your virtual portfolio with $100,000 USD immediately. Zero risk, instant live setups, full statistical matrix analytics.
          </p>
          <div>
            <button
              onClick={onLaunch}
              className="px-10 py-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/35 transition-all inline-flex items-center space-x-2 text-lg"
            >
              <span>Access Terminal Now</span>
              <ArrowRight className="w-5 h-5 animate-bounce-horizontal" />
            </button>
          </div>
          <div className="flex justify-center items-center space-x-6 text-xs text-slate-500 pt-6">
            <span className="flex items-center"><Globe className="w-4 h-4 mr-1 text-slate-600" /> Web Platform</span>
            <span className="flex items-center"><Smartphone className="w-4 h-4 mr-1 text-slate-600" /> Responsive Layout</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-850 bg-slate-950 py-8 px-6 text-center text-xs text-slate-500 relative z-10">
        <p>© 2026 CryptoAgent Inc. Licensed under the MIT License. All simulation accounts are strictly virtual.</p>
      </footer>
    </div>
  );
};
