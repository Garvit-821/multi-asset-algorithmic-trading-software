import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Compass,
  Terminal,
  Zap,
  BrainCircuit,
  BarChart2,
  Sparkles,
  ShieldCheck,
  Key,
  Bell,
  Layers,
  Calculator,
  Search,
  CheckCircle2,
  ChevronRight,
  Command,
  Play
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchPlatform?: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  onLaunchPlatform,
}) => {
  const [activeSection, setActiveSection] = useState<string>('getting-started');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const sections = [
    { id: 'getting-started', title: '1. Getting Started & Sandbox', icon: Compass },
    { id: 'trading-terminal', title: '2. Multi-Asset Terminal', icon: Terminal },
    { id: 'algo-execution', title: '3. Algorithmic Order Execution', icon: Zap },
    { id: 'ai-intelligence', title: '4. AI Copilot & Signals', icon: BrainCircuit },
    { id: 'backtesting', title: '5. Quantitative Backtester', icon: BarChart2 },
    { id: 'strategy-builders', title: '6. AI & Visual Builders', icon: Sparkles },
    { id: 'portfolio-risk', title: '7. Portfolio & Risk Analytics', icon: Layers },
    { id: 'derivatives', title: '8. Options & Derivatives', icon: Calculator },
    { id: 'alerts-telegram', title: '9. Alerts & Telegram Bot', icon: Bell },
    { id: 'vault-security', title: '10. Server-Side Key Vault', icon: ShieldCheck },
    { id: 'command-hotkeys', title: '11. Command Palette & Hotkeys', icon: Command },
  ];

  const filteredSections = sections.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl w-full max-w-5xl my-auto h-[90vh] flex flex-col overflow-hidden text-gray-900 font-sans">
        
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Stratrade Platform & Feature Guide</h2>
              <p className="text-xs text-gray-500">Comprehensive feature-by-feature manual for institutional algorithmic trading</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {onLaunchPlatform && (
              <button
                onClick={() => {
                  onClose();
                  onLaunchPlatform();
                }}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-xs shadow-sm transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Launch Workstation</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          
          {/* Left Sidebar Menu */}
          <div className="w-full md:w-72 bg-gray-50/80 border-b md:border-b-0 md:border-r border-gray-200 p-4 flex flex-col shrink-0">
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search feature guide..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {filteredSections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm font-bold'
                        : 'text-gray-700 hover:bg-gray-200/60 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-600'}`} />
                      <span className="truncate">{sec.title}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Content Viewer */}
          <div className="flex-1 p-6 md:p-8 bg-white overflow-y-auto space-y-6 text-sm leading-relaxed text-gray-700">
            
            {activeSection === 'getting-started' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
                  <Compass className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">1. Getting Started & Virtual Paper Sandbox</h3>
                </div>
                <p>
                  Stratrade gives you instant access to institutional-grade trading tools with a <strong>$100,000 USD virtual sandbox account</strong>. No real funds are required to practice and backtest algorithms.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2 text-xs text-blue-950">
                  <h4 className="font-bold flex items-center space-x-1.5 text-blue-900">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Quickstart Steps:</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 font-sans">
                    <li>Click <strong>"Launch Workstation"</strong> to enter the main trading workspace.</li>
                    <li>Toggle between <strong>Live Engine Mode</strong> and <strong>Paper Sandbox Mode</strong> in the top header bar.</li>
                    <li>Reset your paper portfolio anytime with 1-click in the Paper Trading view.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeSection === 'trading-terminal' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
                  <Terminal className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">2. Multi-Asset Trading Terminal</h3>
                </div>
                <p>
                  The Trading Terminal offers real-time streaming price charts and depth visualization across four primary asset classes:
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <strong className="text-gray-900 block font-mono">Crypto (BTC, ETH, SOL)</strong>
                    Live WebSockets & 1m/5m/15m/1h candles.
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <strong className="text-gray-900 block font-mono">Forex (EUR/USD, GBP/USD)</strong>
                    Currency pair rate monitoring.
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <strong className="text-gray-900 block font-mono">Stocks (AAPL, NVDA)</strong>
                    Equity market volume & price data.
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <strong className="text-gray-900 block font-mono">Commodities (Gold, Oil)</strong>
                    Precious metals & energy benchmarks.
                  </div>
                </div>
                <div className="pt-2">
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">Technical Indicators</h4>
                  <p className="text-xs">
                    Toggle RSI (Relative Strength Index), MACD, EMA 9/21/50/200, and Bollinger Bands with one click directly on the interactive chart.
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'algo-execution' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
                  <Zap className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">3. Institutional Algorithmic Execution Engine</h3>
                </div>
                <p>
                  Execute institutional-sized orders without causing price slippage or signaling trade intent to high-frequency algorithms:
                </p>
                <div className="space-y-3 text-xs">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                    <strong className="text-blue-600 font-bold">TWAP (Time-Weighted Average Price):</strong>
                    <p>Slices large orders into equal time intervals over a set duration. Features optional <strong>Random Variance (0%-30%)</strong> to disguise order patterns.</p>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                    <strong className="text-purple-600 font-bold">VWAP (Volume-Weighted Average Price):</strong>
                    <p>Matches slice size to historical intraday volume curves (weighing more volume at market open and close).</p>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                    <strong className="text-emerald-600 font-bold">Iceberg Orders:</strong>
                    <p>Displays only a small visible order quantity in public order books while maintaining the remainder in hidden reserve.</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'ai-intelligence' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
                  <BrainCircuit className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">4. AI Market Intelligence & Copilot</h3>
                </div>
                <p>
                  Powered by Google Gemini 3.5 & 2.5 APIs, Stratrade provides real-time quantitative AI analysis:
                </p>
                <ul className="list-disc list-inside space-y-2 text-xs">
                  <li><strong>AI Signal Setups:</strong> Evaluates price structure to propose entries, stop loss, and take profit levels.</li>
                  <li><strong>Social Sentiment Feed:</strong> Aggregates live sentiment from Twitter, Reddit, and market news channels.</li>
                  <li><strong>Floating AI Drawer:</strong> Accessible anywhere across the workspace via the floating AI button or <code>Ctrl+K</code>.</li>
                </ul>
              </div>
            )}

            {activeSection === 'backtesting' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
                  <BarChart2 className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">5. Advanced Quantitative Backtester</h3>
                </div>
                <p>
                  Test trading rules on historical candle data to measure edge and risk profiles before risking capital:
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <strong>Sharpe & Sortino Ratios:</strong> Measures risk-adjusted returns and downside volatility.
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <strong>Monte Carlo Simulations:</strong> Runs 1,000+ randomized trade sequences to stress-test drawdowns.
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'strategy-builders' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">6. AI & Visual Strategy Builders</h3>
                </div>
                <p>Build trading bots with zero code required:</p>
                <div className="space-y-2 text-xs">
                  <p><strong>Natural Language Prompts:</strong> Type rules like <em>"Buy BTC when RSI &lt; 30 and volume spikes"</em> to generate full code.</p>
                  <p><strong>Drag-and-Drop Visual Graph:</strong> Connect condition boxes, logical operators (AND/OR), and action nodes visually.</p>
                </div>
              </div>
            )}

            {activeSection === 'portfolio-risk' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
                  <Layers className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">7. Portfolio Optimizer & Risk Analytics</h3>
                </div>
                <p>
                  Apply Markowitz Modern Portfolio Theory to find optimal asset weights for maximum return at your target volatility:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li><strong>Efficient Frontier Graph:</strong> Visualizes portfolio return vs volatility curves.</li>
                  <li><strong>Parametric Value at Risk (VaR):</strong> Computes maximum expected 1-day and 10-day losses at 95% and 99% confidence.</li>
                </ul>
              </div>
            )}

            {activeSection === 'derivatives' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
                  <Calculator className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">8. Options & Derivatives Dashboard</h3>
                </div>
                <p>Analyze options chains and compute Black-Scholes theoretical option prices and risk sensitivity Greeks:</p>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center">
                  <div className="p-2 bg-blue-50 text-blue-900 rounded-lg"><strong>Δ Delta</strong><br />Price Direction</div>
                  <div className="p-2 bg-purple-50 text-purple-900 rounded-lg"><strong>Γ Gamma</strong><br />Delta Acceleration</div>
                  <div className="p-2 bg-rose-50 text-rose-900 rounded-lg"><strong>Θ Theta</strong><br />Time Decay</div>
                </div>
              </div>
            )}

            {activeSection === 'alerts-telegram' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
                  <Bell className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">9. Price Alerts & Telegram Bot Integration</h3>
                </div>
                <p>
                  Set custom price alerts (Above, Below, Cross) and receive push notifications directly on your smartphone via Telegram:
                </p>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-2">
                  <p>1. Open <strong>Alerts Manager</strong> in the platform.</p>
                  <p>2. Enter your Telegram Chat ID.</p>
                  <p>3. Alerts are dispatched instantly via backend Deno Edge Functions.</p>
                </div>
              </div>
            )}

            {activeSection === 'vault-security' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">10. Server-Side Exchange Vault Security</h3>
                </div>
                <p>
                  Connect Binance, Coinbase, or Kraken live API keys with <strong>Zero-Knowledge client security</strong>:
                </p>
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl text-xs space-y-1">
                  <p className="font-bold">🔒 Institutional Key Protection:</p>
                  <p>API keys are encrypted server-side using AES-GCM 256-bit encryption. Keys are never stored in browser memory or <code>localStorage</code>, and HMAC order signatures are computed exclusively inside isolated backend Edge Functions.</p>
                </div>
              </div>
            )}

            {activeSection === 'command-hotkeys' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
                  <Command className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">11. Universal Command Palette & Hotkeys</h3>
                </div>
                <p>Master platform navigation using fast keyboard shortcuts:</p>
                <div className="bg-gray-900 text-gray-100 font-mono text-xs p-4 rounded-xl space-y-2">
                  <div className="flex justify-between border-b border-gray-800 pb-1">
                    <span>Ctrl + K / Cmd + K</span>
                    <span className="text-blue-400">Open Command Palette / AI Copilot</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-1">
                    <span>B</span>
                    <span className="text-green-400">Quick Buy Order Modal</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-1">
                    <span>S</span>
                    <span className="text-red-400">Quick Sell Order Modal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Esc</span>
                    <span className="text-gray-400">Close Active Modal / Drawer</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 shrink-0">
          <span>Stratrade User Manual & Feature Guide v1.2</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-bold transition-colors"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
