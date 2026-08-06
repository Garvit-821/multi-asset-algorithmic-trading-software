import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Dices,
  Calendar,
  Play,
  Sparkles,
  ShieldAlert,
  Clock,
  Settings2,
  RefreshCw,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import {
  BacktestConfig,
  BacktestFullResult,
  runAdvancedBacktest
} from '../services/backtestEngine';

const AVAILABLE_ASSETS = [
  { symbol: 'BTC/USDT', name: 'Bitcoin (BTC)', type: 'crypto' as const },
  { symbol: 'ETH/USDT', name: 'Ethereum (ETH)', type: 'crypto' as const },
  { symbol: 'SOL/USDT', name: 'Solana (SOL)', type: 'crypto' as const },
  { symbol: 'AAPL', name: 'Apple Inc (Stock)', type: 'stock' as const },
  { symbol: 'EUR/USD', name: 'EUR / USD (Forex)', type: 'forex' as const },
];

const STRATEGY_PRESETS = [
  { id: 'rsi_reversion', name: 'RSI Mean Reversion', desc: 'Buys oversold RSI (<30), exits on overbought (>70)' },
  { id: 'ema_crossover', name: 'EMA Golden Crossover', desc: 'Fast EMA (9) crosses Slow EMA (21) bullish signal' },
  { id: 'macd_momentum', name: 'MACD Zero Crossover', desc: 'Triggers on MACD histogram zero-line momentum flips' },
  { id: 'bollinger_reversion', name: 'Bollinger Band Bounce', desc: 'Mean reversion strategy on lower band touch' },
  { id: 'grid_trading', name: 'Quantitative Grid Strategy', desc: 'Automated channel grid execution across price tiers' },
];

export function AdvancedBacktester() {
  const [config, setConfig] = useState<BacktestConfig>({
    symbol: 'BTC/USDT',
    assetType: 'crypto',
    timeframe: '1h',
    strategyPreset: 'rsi_reversion',
    initialCapital: 10000,
    stopLossPct: 2.0,
    takeProfitPct: 5.0,
    commissionPct: 0.1,
    slippagePct: 0.05,
    rsiPeriod: 14,
    rsiOversold: 30,
    rsiOverbought: 70,
    fastEmaPeriod: 9,
    slowEmaPeriod: 21,
    feeTier: 'standard',
    makerFeePct: 0.02,
    takerFeePct: 0.05,
    marketImpactFactor: 0.02,
    networkLatencyMs: 50,
    executionMode: 'tick_granular',
  });

  const [activeTab, setActiveTab] = useState<'equity' | 'montecarlo' | 'heatmap' | 'trades'>('equity');
  const [result, setResult] = useState<BacktestFullResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Run backtest on initial mount or when requested
  const handleExecuteBacktest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await runAdvancedBacktest(config);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Backtest failed to execute.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleExecuteBacktest();
  }, []);

  return (
    <div className="p-3 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 p-5 sm:p-8 rounded-2xl sm:rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quantitative Analytics Suite v2.5</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
            Advanced Backtesting & Risk Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Test quantitative trading strategies against historical OHLCV data, evaluate benchmark alpha against SPY & BTC, run Monte Carlo Risk simulations, and inspect monthly profit heatmaps.
          </p>
        </div>

        <div className="relative z-10 flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={handleExecuteBacktest}
            disabled={loading}
            className="w-full sm:w-auto justify-center px-6 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center space-x-2 hover:scale-[1.02] active:scale-95"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run Strategy Backtest</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-5 sm:space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center space-x-2">
            <Settings2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm sm:text-base font-bold text-gray-900">Strategy & Execution Parameters</h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 font-mono hidden sm:inline">Live Candle Engine Active</span>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition-all"
            >
              {showConfig ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>

        {showConfig && (
          <div className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Target Asset */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Target Asset
            </label>
            <select
              value={config.symbol}
              onChange={(e) => {
                const asset = AVAILABLE_ASSETS.find(a => a.symbol === e.target.value);
                if (asset) {
                  setConfig({ ...config, symbol: asset.symbol, assetType: asset.type });
                }
              }}
              className="w-full px-3 sm:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {AVAILABLE_ASSETS.map(a => (
                <option key={a.symbol} value={a.symbol}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Strategy Preset */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Strategy Algorithm
            </label>
            <select
              value={config.strategyPreset}
              onChange={(e) => setConfig({ ...config, strategyPreset: e.target.value as any })}
              className="w-full px-3 sm:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STRATEGY_PRESETS.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Initial Capital */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Initial Portfolio Capital ($)
            </label>
            <input
              type="number"
              value={config.initialCapital}
              onChange={(e) => setConfig({ ...config, initialCapital: Math.max(100, parseFloat(e.target.value) || 10000) })}
              className="w-full px-3 sm:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Timeframe */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Candle Resolution
            </label>
            <select
              value={config.timeframe}
              onChange={(e) => setConfig({ ...config, timeframe: e.target.value as any })}
              className="w-full px-3 sm:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1m">1 Minute Candles</option>
              <option value="5m">5 Minute Candles</option>
              <option value="15m">15 Minute Candles</option>
              <option value="1h">1 Hour Candles</option>
              <option value="1d">1 Day Candles</option>
            </select>
          </div>
        </div>

        {/* Risk & Friction Settings Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-[10px] sm:text-[11px] font-semibold text-gray-500 mb-1">Take Profit (%)</label>
            <input
              type="number"
              step="0.5"
              value={config.takeProfitPct}
              onChange={(e) => setConfig({ ...config, takeProfitPct: parseFloat(e.target.value) || 5 })}
              className="w-full px-2.5 sm:px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900"
            />
          </div>
          <div>
            <label className="block text-[10px] sm:text-[11px] font-semibold text-gray-500 mb-1">Stop Loss (%)</label>
            <input
              type="number"
              step="0.5"
              value={config.stopLossPct}
              onChange={(e) => setConfig({ ...config, stopLossPct: parseFloat(e.target.value) || 2 })}
              className="w-full px-2.5 sm:px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-red-600"
            />
          </div>
          <div>
            <label className="block text-[10px] sm:text-[11px] font-semibold text-gray-500 mb-1">Commission Fee (%)</label>
            <input
              type="number"
              step="0.01"
              value={config.commissionPct}
              onChange={(e) => setConfig({ ...config, commissionPct: parseFloat(e.target.value) || 0.1 })}
              className="w-full px-2.5 sm:px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900"
            />
          </div>
          <div>
            <label className="block text-[10px] sm:text-[11px] font-semibold text-gray-500 mb-1">Est. Base Slippage (%)</label>
            <input
              type="number"
              step="0.01"
              value={config.slippagePct}
              onChange={(e) => setConfig({ ...config, slippagePct: parseFloat(e.target.value) || 0.05 })}
              className="w-full px-2.5 sm:px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900"
            />
          </div>
        </div>

        {/* Phase 2: High-Fidelity & Granular Execution Controls */}
        <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Institutional High-Fidelity Simulation Controls</span>
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">Phase 2 Granular Mode</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-1">Fee Structure Tier</label>
              <select
                value={config.feeTier || 'standard'}
                onChange={(e) => setConfig({ ...config, feeTier: e.target.value as any })}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
              >
                <option value="standard">Standard (0.075% / 0.10%)</option>
                <option value="vip_maker">VIP Maker Tier (0.02% / 0.05%)</option>
                <option value="vip_taker">VIP Taker Tier (0.04% / 0.08%)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-1">Network Execution Latency</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={config.networkLatencyMs || 50}
                  onChange={(e) => setConfig({ ...config, networkLatencyMs: Number(e.target.value) })}
                  className="w-full accent-blue-600"
                />
                <span className="text-xs font-mono font-bold text-gray-900 w-12 text-right">{config.networkLatencyMs || 50}ms</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-1">Liquidity Impact Factor</label>
              <input
                type="number"
                step="0.01"
                value={config.marketImpactFactor || 0.02}
                onChange={(e) => setConfig({ ...config, marketImpactFactor: parseFloat(e.target.value) || 0.02 })}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-1">Execution Granularity</label>
              <button
                onClick={() => setConfig({ ...config, executionMode: config.executionMode === 'tick_granular' ? 'ohlc_bar' : 'tick_granular' })}
                className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                  config.executionMode === 'tick_granular'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                {config.executionMode === 'tick_granular' ? '⚡ High-Freq Tick Simulation' : '📊 Standard OHLC Bar'}
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center space-x-2 text-xs sm:text-sm font-semibold">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Results Viewport */}
      {result && (
        <div className="space-y-6">
          {/* Key Metric Snapshot Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">Strategy Return</span>
              <div className="mt-1.5 flex items-baseline space-x-1">
                <span className={`text-lg sm:text-2xl font-extrabold font-mono ${result.metrics.totalReturnPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.metrics.totalReturnPct >= 0 ? '+' : ''}{result.metrics.totalReturnPct}%
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-gray-500 mt-1 truncate">Final: ${result.metrics.finalBalance.toLocaleString()}</span>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">Benchmark Alpha</span>
              <div className="mt-1.5 flex items-baseline space-x-1">
                <span className={`text-lg sm:text-2xl font-extrabold font-mono ${result.metrics.alpha >= 0 ? 'text-green-600' : 'text-amber-600'}`}>
                  {result.metrics.alpha >= 0 ? '+' : ''}{result.metrics.alpha}%
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-gray-500 mt-1 truncate">vs Asset ({result.metrics.benchmarkReturnPct}%)</span>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">Sharpe Ratio</span>
              <div className="mt-1.5">
                <span className="text-lg sm:text-2xl font-extrabold font-mono text-gray-900">{result.metrics.sharpeRatio}</span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-gray-500 mt-1 truncate">Sortino: {result.metrics.sortinoRatio}</span>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">Win Rate</span>
              <div className="mt-1.5">
                <span className="text-lg sm:text-2xl font-extrabold font-mono text-blue-600">{result.metrics.winRatePct}%</span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-gray-500 mt-1 truncate">{result.metrics.winningTrades}W / {result.metrics.losingTrades}L</span>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">Profit Factor</span>
              <div className="mt-1.5">
                <span className="text-lg sm:text-2xl font-extrabold font-mono text-gray-900">{result.metrics.profitFactor}</span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-gray-500 mt-1 truncate">Avg Win +{result.metrics.avgWinPct}%</span>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">Max Drawdown</span>
              <div className="mt-1.5">
                <span className="text-lg sm:text-2xl font-extrabold font-mono text-red-600">-{result.metrics.maxDrawdownPct}%</span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-gray-500 mt-1 truncate">Peak-to-Trough</span>
            </div>
          </div>

          {/* Phase 2: High-Fidelity Diagnostics Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Maker Fees Paid</span>
              <span className="text-sm font-bold font-mono text-gray-900">${result.metrics.totalMakerFeesPaid}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Taker Fees Paid</span>
              <span className="text-sm font-bold font-mono text-gray-900">${result.metrics.totalTakerFeesPaid}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Slippage Cost</span>
              <span className="text-sm font-bold font-mono text-amber-600">${result.metrics.totalSlippagePaid}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Latency Drag Impact</span>
              <span className="text-sm font-bold font-mono text-rose-600">-${result.metrics.latencyDragPnlImpact}</span>
            </div>
          </div>

          {/* Tab Navigation Horizontal Swipe Container */}
          <div className="bg-gray-100 p-1.5 rounded-2xl flex items-center space-x-1 overflow-x-auto no-scrollbar w-full">
            <button
              onClick={() => setActiveTab('equity')}
              className={`shrink-0 py-2 px-3.5 sm:px-4 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'equity'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Equity vs Benchmark</span>
            </button>
            <button
              onClick={() => setActiveTab('montecarlo')}
              className={`shrink-0 py-2 px-3.5 sm:px-4 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'montecarlo'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Dices className="w-4 h-4 text-indigo-600" />
              <span>Monte Carlo Risk</span>
            </button>
            <button
              onClick={() => setActiveTab('heatmap')}
              className={`shrink-0 py-2 px-3.5 sm:px-4 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'heatmap'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4 text-green-600" />
              <span>Monthly Heatmap</span>
            </button>
            <button
              onClick={() => setActiveTab('trades')}
              className={`shrink-0 py-2 px-3.5 sm:px-4 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'trades'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Trade Logs ({result.trades.length})</span>
            </button>
          </div>

          {/* TAB 1: EQUITY VS BENCHMARK CHART */}
          {activeTab === 'equity' && (
            <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-5 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">Strategy vs. Benchmark Performance Curves</h3>
                  <p className="text-xs text-gray-500">Compounded equity valuation over time compared with S&P 500 (SPY) and Asset Buy-and-Hold.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
                    <span className="text-gray-700">Strategy Equity</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-gray-700">Asset Buy & Hold</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
                    <span className="text-gray-700">S&P 500 (SPY)</span>
                  </div>
                </div>
              </div>

              {/* Main Equity Chart */}
              <div className="h-[250px] sm:h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.equityCurve}>
                    <defs>
                      <linearGradient id="stratGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={['auto', 'auto']} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                    />
                    <Area type="monotone" dataKey="strategyEquity" name="Strategy" stroke="#2563eb" strokeWidth={3} fill="url(#stratGrad)" />
                    <Line type="monotone" dataKey="benchmarkEquity" name="Asset Buy & Hold" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="spyEquity" name="S&P 500" stroke="#a855f7" strokeWidth={2} dot={false} strokeDasharray="2 2" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Detailed Quantitative Performance Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-100">
                <div className="bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">CAGR (Annualized)</span>
                  <span className="text-lg sm:text-xl font-extrabold text-gray-900 font-mono mt-1 block">
                    {result.metrics.cagr}%
                  </span>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Asset Beta</span>
                  <span className="text-lg sm:text-xl font-extrabold text-gray-900 font-mono mt-1 block">
                    {result.metrics.beta}
                  </span>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Max Win Streak</span>
                  <span className="text-lg sm:text-xl font-extrabold text-green-600 font-mono mt-1 block">
                    {result.metrics.maxConsecutiveWins} trades
                  </span>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Max Loss Streak</span>
                  <span className="text-lg sm:text-xl font-extrabold text-red-600 font-mono mt-1 block">
                    {result.metrics.maxConsecutiveLosses} trades
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MONTE CARLO RISK SIMULATION */}
          {activeTab === 'montecarlo' && (
            <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-5 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">Monte Carlo Bootstrap Resampling ({result.monteCarlo.totalRuns.toLocaleString()} Runs)</h3>
                  <p className="text-xs text-gray-500">Stochastic resampling of trade sequences to model future return distributions and tail risk.</p>
                </div>
                <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-full font-mono w-max">
                  1,000 RESAMPLED PATHS
                </span>
              </div>

              {/* Monte Carlo Risk Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Risk of Ruin</span>
                  <span className={`text-lg sm:text-2xl font-extrabold font-mono mt-1 block ${result.monteCarlo.riskOfRuinPct > 5 ? 'text-red-600' : 'text-indigo-900'}`}>
                    {result.monteCarlo.riskOfRuinPct}%
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-indigo-500 mt-0.5 block truncate">&gt;50% Drawdown risk</span>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">VaR (95%)</span>
                  <span className="text-lg sm:text-2xl font-extrabold text-red-600 font-mono mt-1 block">
                    -{result.monteCarlo.var95}%
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5 block truncate">95% Confidence loss</span>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">VaR (99%)</span>
                  <span className="text-lg sm:text-2xl font-extrabold text-red-700 font-mono mt-1 block">
                    -{result.monteCarlo.var99}%
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5 block truncate">Tail risk horizon</span>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Exp Drawdown</span>
                  <span className="text-lg sm:text-2xl font-extrabold text-amber-600 font-mono mt-1 block">
                    {result.monteCarlo.expectedDrawdownPct}%
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5 block truncate">Worst: {result.monteCarlo.worstCaseDrawdownPct}%</span>
                </div>
              </div>

              {/* Fan Chart Visualization */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Monte Carlo Quantile Trajectories (5th to 95th Percentile)</h4>
                <div className="h-[240px] sm:h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.monteCarlo.percentileCurves}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="step" stroke="#94a3b8" fontSize={10} tickLine={false} label={{ value: 'Execution Step', position: 'insideBottom', offset: -5, fontSize: 9 }} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']} />
                      <Line type="monotone" dataKey="p95" name="95th Percentile" stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="p75" name="75th Percentile" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                      <Line type="monotone" dataKey="median" name="50th Percentile" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="p25" name="25th Percentile" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                      <Line type="monotone" dataKey="p5" name="5th Percentile" stroke="#ef4444" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MONTHLY RETURNS CALENDAR HEATMAP */}
          {activeTab === 'heatmap' && (
            <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-5 sm:space-y-6">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Monthly Returns Heatmap Matrix</h3>
                <p className="text-xs text-gray-500">Wall-Street style calendar grid displaying monthly percentage returns and win consistency.</p>
              </div>

              {/* Heatmap Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3">
                {result.monthlyReturns.map((m) => {
                  const isPositive = m.returnPct >= 0;

                  return (
                    <div
                      key={m.month}
                      className={`border rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col justify-between transition-all hover:scale-105 ${
                        isPositive
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50/60 border-rose-200 text-rose-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">{m.monthName}</span>
                        <span className="text-[9px] sm:text-[10px] font-mono opacity-75">{m.totalTrades} Trades</span>
                      </div>

                      <div className="my-2 sm:my-3">
                        <span className="text-lg sm:text-xl font-black font-mono">
                          {isPositive ? '+' : ''}{m.returnPct}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-semibold opacity-80 pt-2 border-t border-black/5">
                        <span>Win: {m.winRate}%</span>
                        <span>${m.pnl >= 0 ? '+' : ''}{m.pnl}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Trade Duration Analysis */}
              <div className="pt-4 sm:pt-6 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Trade Holding Duration Analysis</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-gray-500 block">Avg Winning Trade Hold</span>
                      <span className="text-lg sm:text-xl font-bold text-gray-900 font-mono mt-0.5 block">
                        {result.metrics.avgWinHoldingMinutes} minutes
                      </span>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-green-100 text-green-700 rounded-xl">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-gray-500 block">Avg Losing Trade Hold</span>
                      <span className="text-lg sm:text-xl font-bold text-gray-900 font-mono mt-0.5 block">
                        {result.metrics.avgLossHoldingMinutes} minutes
                      </span>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-red-100 text-red-700 rounded-xl">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DETAILED TRADE EXECUTION LOG */}
          {activeTab === 'trades' && (
            <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Executed Strategy Trades ({result.trades.length})</h3>
                <span className="text-xs text-gray-500 font-mono">Commission & Slippage Deducted</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[640px]">
                  <thead className="bg-gray-50 border-y border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-2.5">Trade ID</th>
                      <th className="px-3 py-2.5">Entry Time</th>
                      <th className="px-3 py-2.5">Exit Time</th>
                      <th className="px-3 py-2.5">Entry Price</th>
                      <th className="px-3 py-2.5">Exit Price</th>
                      <th className="px-3 py-2.5">Net PnL ($)</th>
                      <th className="px-3 py-2.5">Net PnL (%)</th>
                      <th className="px-3 py-2.5">Exit Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono">
                    {result.trades.map((t) => {
                      const isWin = t.pnl > 0;
                      return (
                        <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-3 py-2.5 font-bold text-gray-900">{t.id}</td>
                          <td className="px-3 py-2.5 text-gray-600">{t.entryDate}</td>
                          <td className="px-3 py-2.5 text-gray-600">{t.exitDate}</td>
                          <td className="px-3 py-2.5 text-gray-900">${t.entryPrice}</td>
                          <td className="px-3 py-2.5 text-gray-900">${t.exitPrice}</td>
                          <td className={`px-3 py-2.5 font-bold ${isWin ? 'text-green-600' : 'text-red-600'}`}>
                            {isWin ? '+' : ''}${t.pnl}
                          </td>
                          <td className={`px-3 py-2.5 font-bold ${isWin ? 'text-green-600' : 'text-red-600'}`}>
                            {isWin ? '+' : ''}{t.pnlPercent}%
                          </td>
                          <td className="px-3 py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              t.exitReason === 'TAKE_PROFIT'
                                ? 'bg-green-100 text-green-700'
                                : t.exitReason === 'STOP_LOSS'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {t.exitReason}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
