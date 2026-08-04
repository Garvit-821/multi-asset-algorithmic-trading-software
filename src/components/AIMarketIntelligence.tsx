import { useState, useEffect, useRef } from 'react';
import {
  Bot,
  BrainCircuit,
  Grid,
  Sliders,
  Send,
  Sparkles,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Play
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { aiCopilotService, CopilotMessage } from '../services/aiCopilotService';
import { generateCrossAssetCorrelationMatrix, CorrelationMatrixData } from '../services/correlationService';
import { runGridSearchOptimization, GridOptimizationSummary } from '../services/gridSearchOptimizer';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

export function AIMarketIntelligence() {
  const [activeTab, setActiveTab] = useState<'copilot' | 'correlation' | 'optimizer'>('copilot');

  // Tab 1: Copilot State
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: '👋 Hello! I am your AI Trading Copilot. I analyze your live paper portfolio, risk exposures, and trade executions in real time. How can I help you today?',
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Tab 2: Correlation Matrix State
  const [correlationData, setCorrelationData] = useState<CorrelationMatrixData | null>(null);

  // Tab 3: Grid Search Optimizer State
  const [optStrategy, setOptStrategy] = useState<'rsi' | 'ema_crossover'>('rsi');
  const [optSymbol] = useState('BTC/USDT');
  const [optSummary, setOptSummary] = useState<GridOptimizationSummary | null>(null);
  const [optLoading, setOptLoading] = useState(false);

  // Initial load
  useEffect(() => {
    setCorrelationData(generateCrossAssetCorrelationMatrix());
    handleRunOptimizer('rsi', 'BTC/USDT');
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Copilot prompt submission
  const handleSendQuery = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: q,
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setCopilotLoading(true);

    try {
      const response = await aiCopilotService.processQuery(q);
      setMessages(prev => [...prev, response]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: '⚠️ Apologies, I ran into an error processing your query. Please try again.',
      }]);
    } finally {
      setCopilotLoading(false);
    }
  };

  // Refresh Correlation Matrix
  const handleRefreshCorrelation = () => {
    setCorrelationData(generateCrossAssetCorrelationMatrix());
  };

  // Run Grid Search Optimization
  const handleRunOptimizer = async (stratType = optStrategy, sym = optSymbol) => {
    setOptLoading(true);
    try {
      const res = await runGridSearchOptimization({
        symbol: sym,
        assetType: 'crypto',
        strategyType: stratType,
        initialCapital: 10000,
        paramRanges: stratType === 'rsi'
          ? [
              { name: 'RSI Period', key: 'period', min: 8, max: 24, step: 2 },
              { name: 'Oversold Level', key: 'oversold', min: 20, max: 40, step: 5 }
            ]
          : [
              { name: 'Fast EMA', key: 'fast', min: 5, max: 15, step: 2 },
              { name: 'Slow EMA', key: 'slow', min: 20, max: 40, step: 5 }
            ]
      });
      setOptSummary(res);
    } catch (e) {
      console.error('Optimizer error:', e);
    } finally {
      setOptLoading(false);
    }
  };

  return (
    <div className="p-3 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-5 sm:p-8 rounded-2xl sm:rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-semibold">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>AI Market Intelligence Hub</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
            AI Copilot, Correlation & Optimizer
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Query your live portfolio in natural language, detect cross-asset correlation exposure risks, and auto-tune strategy parameters using grid search optimization.
          </p>
        </div>

        {/* Tab Selector Buttons Horizontal Swipe Container */}
        <div className="relative z-10 bg-slate-800/80 p-1.5 rounded-2xl flex items-center space-x-1 border border-slate-700 overflow-x-auto no-scrollbar w-full md:w-auto">
          <button
            onClick={() => setActiveTab('copilot')}
            className={`shrink-0 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'copilot' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI Copilot</span>
          </button>
          <button
            onClick={() => setActiveTab('correlation')}
            className={`shrink-0 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'correlation' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Correlation Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab('optimizer')}
            className={`shrink-0 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'optimizer' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Grid Optimizer</span>
          </button>
        </div>
      </div>

      {/* TAB 1: AI TRADING COPILOT */}
      {activeTab === 'copilot' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Quick Prompts Panel */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Recommended Natural Language Queries</h3>
              </div>
              <p className="text-xs text-gray-500">Click any prompt to instantly query your portfolio and strategy performance.</p>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => handleSendQuery('What is my exposure to tech stocks and crypto?')}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-2xl text-xs font-semibold text-gray-700 hover:text-blue-700 transition-all flex items-center justify-between group"
                >
                  <span>"What is my exposure to tech stocks?"</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 shrink-0 ml-2" />
                </button>

                <button
                  onClick={() => handleSendQuery('Analyze my worst losing trades this week')}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-2xl text-xs font-semibold text-gray-700 hover:text-blue-700 transition-all flex items-center justify-between group"
                >
                  <span>"Analyze my worst losing trades this week"</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 shrink-0 ml-2" />
                </button>

                <button
                  onClick={() => handleSendQuery('How can I rebalance my portfolio to reduce risk?')}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-2xl text-xs font-semibold text-gray-700 hover:text-blue-700 transition-all flex items-center justify-between group"
                >
                  <span>"Suggest portfolio rebalancing steps"</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 shrink-0 ml-2" />
                </button>

                <button
                  onClick={() => handleSendQuery('What is my current win rate and cash balance?')}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-2xl text-xs font-semibold text-gray-700 hover:text-blue-700 transition-all flex items-center justify-between group"
                >
                  <span>"Audit my portfolio cash & win rate"</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 shrink-0 ml-2" />
                </button>
              </div>
            </div>

            {/* AI Assistant Status */}
            <div className="bg-blue-50/60 border border-blue-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center space-x-2 text-blue-700 font-bold text-xs">
                <Zap className="w-4 h-4 shrink-0" />
                <span>Live Portfolio Integration Active</span>
              </div>
              <p className="text-xs text-blue-900/80 leading-relaxed">
                The AI Copilot evaluates position balances, average entry costs, order execution logs, and live tick prices to generate actionable insights.
              </p>
            </div>
          </div>

          {/* Conversational Chat Window */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl sm:rounded-3xl shadow-xs flex flex-col h-[500px] sm:h-[600px] overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900">Stratrade AI Copilot</h3>
                  <span className="text-[10px] text-green-600 font-bold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                    <span>Connected to Portfolio Engine</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Chat Stream Messages */}
            <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[85%] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs space-y-3 ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-50 border border-gray-200 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between space-x-4 border-b pb-2 border-black/10">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                        {msg.sender === 'user' ? 'You' : 'AI Copilot'}
                      </span>
                      <span className="text-[10px] opacity-60 font-mono">{msg.timestamp}</span>
                    </div>

                    <div className="text-xs leading-relaxed whitespace-pre-line font-sans">
                      {msg.text}
                    </div>

                    {/* Metadata Visualizer for Exposure */}
                    {msg.metadata?.exposureData && (
                      <div className="pt-3 border-t border-gray-200 space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Sector Exposure Breakdown</span>
                        <div className="h-40 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={msg.metadata.exposureData}
                                dataKey="percent"
                                nameKey="category"
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                label={(entry) => `${entry.category}: ${entry.percent}%`}
                              >
                                {msg.metadata.exposureData.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Recommendation Chips */}
                    {msg.metadata?.recommendations && (
                      <div className="pt-3 border-t border-gray-200/80 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">Actionable Recommendations</span>
                        {msg.metadata.recommendations.map((rec, i) => (
                          <div key={i} className="flex items-start space-x-2 text-[11px] text-gray-700 bg-white p-2 rounded-xl border border-gray-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {copilotLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 text-xs text-gray-500 flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                    <span>Analyzing portfolio state & market parameters...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3.5 sm:p-4 border-t border-gray-200 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendQuery();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask AI Copilot about portfolio exposure or trades..."
                  className="flex-1 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || copilotLoading}
                  className="p-2.5 sm:p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl sm:rounded-2xl transition-all shadow-md shadow-blue-500/20 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-ASSET CORRELATION MATRIX */}
      {activeTab === 'correlation' && correlationData && (
        <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900">Cross-Asset Pearson Correlation Heatmap Matrix</h3>
              <p className="text-xs text-gray-500">Real-time correlation coefficients ($r \in [-1.0, +1.0]$) across Crypto, Equities, Forex, and Commodities.</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500 font-mono">Updated: {correlationData.lastUpdated}</span>
              <button
                onClick={handleRefreshCorrelation}
                className="px-3 sm:px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 flex items-center space-x-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Matrix</span>
              </button>
            </div>
          </div>

          {/* High Risk Alerts Header */}
          {correlationData.highRiskPairs.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 space-y-2">
              <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>High Correlation Over-Exposure Warning ({correlationData.highRiskPairs.length} Pairs Detected)</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {correlationData.highRiskPairs.map((pair, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-white border border-amber-300 text-amber-900 text-[11px] sm:text-xs font-bold rounded-full font-mono shadow-2xs">
                    {pair.assetA} & {pair.assetB} (r = +{pair.correlation})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Heatmap Matrix Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse min-w-[580px]">
              <thead>
                <tr>
                  <th className="p-3 text-xs font-bold text-gray-400 uppercase text-left">Asset Pair</th>
                  {correlationData.symbols.map((sym) => (
                    <th key={sym} className="p-3 text-xs font-bold text-gray-700 uppercase font-mono">
                      {sym.split('/')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlationData.symbols.map((rowSym, rowIndex) => (
                  <tr key={rowSym} className="border-t border-gray-100">
                    <td className="p-3 text-xs font-bold text-gray-900 text-left font-mono">{rowSym}</td>
                    {correlationData.matrix[rowIndex].map((val, colIndex) => {
                      const isSelf = rowIndex === colIndex;
                      const isPositive = val > 0;

                      // Dynamic heatmap color intensity
                      let bgClass = 'bg-gray-100 text-gray-800';
                      if (isSelf) {
                        bgClass = 'bg-gray-900 text-white font-bold';
                      } else if (isPositive) {
                        if (val >= 0.8) bgClass = 'bg-emerald-600 text-white font-bold';
                        else if (val >= 0.5) bgClass = 'bg-emerald-200 text-emerald-900 font-semibold';
                        else bgClass = 'bg-emerald-50 text-emerald-800';
                      } else {
                        if (val <= -0.5) bgClass = 'bg-rose-500 text-white font-bold';
                        else bgClass = 'bg-rose-100 text-rose-900';
                      }

                      return (
                        <td key={colIndex} className="p-2">
                          <div className={`py-2 px-3 rounded-xl text-xs font-mono transition-all hover:scale-105 ${bgClass}`}>
                            {val > 0 && !isSelf ? `+${val}` : val}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUTO PARAMETER OPTIMIZER (GRID SEARCH) */}
      {activeTab === 'optimizer' && (
        <div className="space-y-6">
          {/* Controls Panel */}
          <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Auto Parameter Optimizer (Grid Search)</h3>
                <p className="text-xs text-gray-500">Automatically test range combinations across visual strategies to find peak Sharpe Ratio settings.</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                <select
                  value={optStrategy}
                  onChange={(e) => {
                    const strat = e.target.value as 'rsi' | 'ema_crossover';
                    setOptStrategy(strat);
                    handleRunOptimizer(strat, optSymbol);
                  }}
                  className="w-full sm:w-auto px-3.5 sm:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="rsi">RSI Mean Reversion Optimization</option>
                  <option value="ema_crossover">EMA Crossover Optimization</option>
                </select>

                <button
                  onClick={() => handleRunOptimizer()}
                  disabled={optLoading}
                  className="w-full sm:w-auto justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-2 shadow-xs shrink-0 whitespace-nowrap"
                >
                  {optLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Optimizing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white shrink-0" />
                      <span className="whitespace-nowrap">Run Grid Search</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Best Result Snapshot Card */}
            {optSummary && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider font-mono inline-block">
                    OPTIMAL PARAMETER CONFIGURATION DISCOVERED
                  </span>
                  <h4 className="text-lg sm:text-xl font-black text-emerald-950 font-mono mt-1">
                    {optSummary.bestResult.paramLabel}
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Tested {optSummary.totalCombinationsTested} parameter combinations in {optSummary.executionTimeMs}ms.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full lg:w-auto">
                  <div className="bg-white border border-emerald-200 rounded-xl p-2.5 sm:p-3 text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block truncate">Sharpe</span>
                    <span className="text-base sm:text-lg font-extrabold text-emerald-600 font-mono">{optSummary.bestResult.sharpeRatio}</span>
                  </div>
                  <div className="bg-white border border-emerald-200 rounded-xl p-2.5 sm:p-3 text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block truncate">Win Rate</span>
                    <span className="text-base sm:text-lg font-extrabold text-blue-600 font-mono">{optSummary.bestResult.winRatePct}%</span>
                  </div>
                  <div className="bg-white border border-emerald-200 rounded-xl p-2.5 sm:p-3 text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block truncate">Net Profit</span>
                    <span className="text-base sm:text-lg font-extrabold text-green-600 font-mono">+{optSummary.bestResult.totalReturnPct}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Top 5 Ranked Configurations Table & Chart */}
          {optSummary && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Leaderboard Table */}
              <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-gray-900">Top 5 Parameter Configurations (Ranked by Sharpe)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[450px]">
                    <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-y border-gray-200">
                      <tr>
                        <th className="px-3 py-2.5">Rank</th>
                        <th className="px-3 py-2.5">Parameter Set</th>
                        <th className="px-3 py-2.5">Sharpe</th>
                        <th className="px-3 py-2.5">Win Rate</th>
                        <th className="px-3 py-2.5">Return (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-mono">
                      {optSummary.topResults.map((res, i) => (
                        <tr key={i} className={i === 0 ? 'bg-emerald-50/50 font-bold' : 'hover:bg-gray-50'}>
                          <td className="px-3 py-3 text-gray-900">#{i + 1}</td>
                          <td className="px-3 py-3 text-blue-600 font-bold">{res.paramLabel}</td>
                          <td className="px-3 py-3 text-gray-900">{res.sharpeRatio}</td>
                          <td className="px-3 py-3 text-gray-900">{res.winRatePct}%</td>
                          <td className="px-3 py-3 text-green-600">+{res.totalReturnPct}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sharpe Surface Visualization Chart */}
              <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-gray-900">Parameter Sharpe Surface Point Cloud</h4>
                <div className="h-[220px] sm:h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={optSummary.surface2D.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="label" stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} label={{ value: 'Sharpe Ratio', angle: -90, position: 'insideLeft', fontSize: 9 }} />
                      <Tooltip />
                      <Bar dataKey="z" name="Sharpe Ratio" fill="#2563eb" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
