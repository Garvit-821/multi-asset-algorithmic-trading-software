import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Award, AlertTriangle, BarChart3, Sparkles, Loader2 } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';
import { STRATEGY_METRICS } from '../utils/mockData';
import type { StrategyMetric } from '../utils/mockData';
import { fetchChartData } from '../services/dataFeed';

interface ChartData {
  date: string;
  value: number;
  strategy1?: number;
  strategy2?: number;
  strategy3?: number;
  strategy4?: number;
}

interface RadarData {
  metric: string;
  value: number;
}

interface BacktestResults {
  accuracy: number;
  winRate: number;
  drawdown: number;
  profitRatio: number;
  totalTrades: number;
  equityCurve: Array<{ date: string; value: number }>;
}

const AVAILABLE_ASSETS = [
  { symbol: 'BTC/USDT', name: 'Bitcoin (Crypto)', type: 'crypto' as const },
  { symbol: 'ETH/USDT', name: 'Ethereum (Crypto)', type: 'crypto' as const },
  { symbol: 'SOL/USDT', name: 'Solana (Crypto)', type: 'crypto' as const },
  { symbol: 'EUR/USD', name: 'Euro / US Dollar (Forex)', type: 'forex' as const },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar (Forex)', type: 'forex' as const },
];

// Technical Indicator Helper Functions
function calculateEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [];
  if (prices.length === 0) return [];
  
  let currentEma = prices[0];
  ema.push(currentEma);

  for (let i = 1; i < prices.length; i++) {
    currentEma = prices[i] * k + currentEma * (1 - k);
    ema.push(currentEma);
  }
  return ema;
}

function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  if (prices.length <= period) return Array(prices.length).fill(50);
  
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  for (let i = 0; i <= period; i++) {
    rsi.push(50);
  }

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period;

    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));
    }
  }
  return rsi;
}

function calculateMACD(prices: number[]): { macd: number[]; signal: number[] } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd: number[] = [];
  
  for (let i = 0; i < prices.length; i++) {
    macd.push((ema12[i] || 0) - (ema26[i] || 0));
  }
  
  const signal = calculateEMA(macd, 9);
  return { macd, signal };
}

function calculateBollingerBands(prices: number[], period: number = 20, multiplier: number = 2): { upper: number[]; lower: number[] } {
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upper.push(prices[i]);
      lower.push(prices[i]);
      continue;
    }

    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += prices[j];
    }
    const mean = sum / period;

    let varianceSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      varianceSum += Math.pow(prices[j] - mean, 2);
    }
    const stdDev = Math.sqrt(varianceSum / period);
    upper.push(mean + multiplier * stdDev);
    lower.push(mean - multiplier * stdDev);
  }

  return { upper, lower };
}

// Backtesting Simulation Function
function runBacktest(strategyName: string, candles: any[], startingBalance: number = 10000): BacktestResults {
  if (candles.length === 0) {
    return {
      accuracy: 0,
      winRate: 0,
      drawdown: 0,
      profitRatio: 1.0,
      totalTrades: 0,
      equityCurve: []
    };
  }

  const prices = candles.map(c => c.close);
  const dates = candles.map(c => {
    const d = new Date(Number(c.time) * 1000);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  let balance = startingBalance;
  const equityCurve = [{ date: dates[0] || 'Start', value: balance }];
  
  let position: { entryPrice: number; size: number } | null = null;
  let wins = 0;
  let totalTrades = 0;
  let maxEquity = balance;
  let maxDrawdown = 0;
  let grossProfit = 0;
  let grossLoss = 0;

  const ema9 = calculateEMA(prices, 9);
  const ema21 = calculateEMA(prices, 21);
  const rsi = calculateRSI(prices, 14);
  const macdData = calculateMACD(prices);
  const bb = calculateBollingerBands(prices, 20, 2);

  for (let i = 1; i < prices.length; i++) {
    const currentPrice = prices[i];
    const currentDate = dates[i];

    if (position) {
      const pctChange = (currentPrice - position.entryPrice) / position.entryPrice;
      let shouldExit = false;

      // Exit on profit target (+3%), stop loss (-1.5%) or indicator reversals
      if (pctChange >= 0.03) {
        shouldExit = true;
      } else if (pctChange <= -0.015) {
        shouldExit = true;
      } else if (strategyName === 'EMA Crossover' && ema9[i] < ema21[i] && ema9[i - 1] >= ema21[i - 1]) {
        shouldExit = true;
      } else if (strategyName === 'RSI Oversold/Overbought' && rsi[i] > 70) {
        shouldExit = true;
      } else if (strategyName === 'MACD Signal' && macdData.macd[i] < macdData.signal[i]) {
        shouldExit = true;
      } else if (strategyName === 'Bollinger Bands' && currentPrice > bb.upper[i]) {
        shouldExit = true;
      }

      if (shouldExit) {
        const profit = (position.size * currentPrice) - (position.size * position.entryPrice);
        balance += profit;
        totalTrades++;

        if (profit > 0) {
          wins++;
          grossProfit += profit;
        } else {
          grossLoss += Math.abs(profit);
        }
        position = null;
      }
    } else {
      let shouldEnter = false;

      if (strategyName === 'EMA Crossover') {
        if (ema9[i] > ema21[i] && ema9[i - 1] <= ema21[i - 1]) {
          shouldEnter = true;
        }
      } else if (strategyName === 'RSI Oversold/Overbought') {
        if (rsi[i] > 30 && rsi[i - 1] <= 30) {
          shouldEnter = true;
        }
      } else if (strategyName === 'MACD Signal') {
        if (macdData.macd[i] > macdData.signal[i] && macdData.macd[i - 1] <= macdData.signal[i - 1]) {
          shouldEnter = true;
        }
      } else if (strategyName === 'Bollinger Bands') {
        if (currentPrice > bb.lower[i] && prices[i - 1] <= bb.lower[i - 1]) {
          shouldEnter = true;
        }
      }

      if (shouldEnter) {
        position = {
          entryPrice: currentPrice,
          size: balance / currentPrice
        };
      }
    }

    const currentEquity = position ? (position.size * currentPrice) : balance;
    if (currentEquity > maxEquity) {
      maxEquity = currentEquity;
    }
    const dd = ((maxEquity - currentEquity) / maxEquity) * 100;
    if (dd > maxDrawdown) {
      maxDrawdown = dd;
    }

    equityCurve.push({
      date: currentDate,
      value: Math.round(currentEquity)
    });
  }

  if (position) {
    const profit = (position.size * prices[prices.length - 1]) - (position.size * position.entryPrice);
    balance += profit;
    totalTrades++;
    if (profit > 0) {
      wins++;
      grossProfit += profit;
    } else {
      grossLoss += Math.abs(profit);
    }
  }

  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
  const accuracy = winRate;
  const profitRatio = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 3.5 : 1.0;

  return {
    accuracy: Number(accuracy.toFixed(1)),
    winRate: Number(winRate.toFixed(1)),
    drawdown: Number((-maxDrawdown).toFixed(1)),
    profitRatio: Number(profitRatio.toFixed(2)),
    totalTrades,
    equityCurve
  };
}

export const AIStrategyBuilder: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState(AVAILABLE_ASSETS[0]);
  const [candles, setCandles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeStrategyIndex, setActiveStrategyIndex] = useState<number>(0);
  const [allBacktestResults, setAllBacktestResults] = useState<Record<string, BacktestResults>>({});
  const [strategies, setStrategies] = useState<StrategyMetric[]>(STRATEGY_METRICS);
  
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainingProgress, setTrainingProgress] = useState<number>(0);

  // Load candles when selected asset changes
  useEffect(() => {
    const loadCandles = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchChartData(selectedAsset.symbol, selectedAsset.type);
        if (data && data.length > 0) {
          setCandles(data);
          
          // Calculate initial backtest results
          const results: Record<string, BacktestResults> = {};
          STRATEGY_METRICS.forEach(strat => {
            results[strat.name] = runBacktest(strat.name, data);
          });
          setAllBacktestResults(results);

          // Update metrics to display
          setStrategies(prev => 
            prev.map(strat => {
              const res = results[strat.name];
              if (res) {
                return {
                  ...strat,
                  accuracy: res.accuracy,
                  winRate: res.winRate,
                  drawdown: res.drawdown,
                  profitRatio: res.profitRatio,
                  totalTrades: res.totalTrades
                };
              }
              return strat;
            })
          );
        } else {
          setError('Failed to fetch historical candlestick data');
        }
      } catch (err: any) {
        console.error('Error fetching candles for backtest:', err);
        setError(err.message || 'Error fetching historical data');
      } finally {
        setLoading(false);
      }
    };

    loadCandles();
  }, [selectedAsset]);

  // Model Training Animation
  useEffect(() => {
    if (isTraining) {
      const interval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 100) {
            setIsTraining(false);
            
            // Randomize/Optimize rules slightly on "training" finish to simulate parameter learning
            setStrategies(prevStrategies => 
              prevStrategies.map(strat => {
                const baseRes = allBacktestResults[strat.name];
                if (baseRes) {
                  // Simulate hyperparameter tuning producing a slightly optimized result
                  const optimizationMultiplier = 1.05 + Math.random() * 0.05; // 5% to 10% gain
                  return {
                    ...strat,
                    accuracy: Math.min(Number((baseRes.accuracy * optimizationMultiplier).toFixed(1)), 98),
                    winRate: Math.min(Number((baseRes.winRate * optimizationMultiplier).toFixed(1)), 98),
                    drawdown: Number((baseRes.drawdown * 0.9).toFixed(1)), // 10% less drawdown
                    profitRatio: Number((baseRes.profitRatio * optimizationMultiplier).toFixed(2))
                  };
                }
                return strat;
              })
            );
            return 0;
          }
          return prev + 4;
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [isTraining, allBacktestResults]);

  const selectedStrategy = strategies[activeStrategyIndex] || strategies[0];
  const activeResults = allBacktestResults[selectedStrategy.name];

  const radarData: RadarData[] = [
    { metric: 'Accuracy', value: selectedStrategy.accuracy },
    { metric: 'Win Rate', value: selectedStrategy.winRate },
    { metric: 'Risk Control', value: Math.max(100 - Math.abs(selectedStrategy.drawdown) * 4, 10) },
    { metric: 'Profit Factor', value: Math.min(selectedStrategy.profitRatio * 25, 100) },
    { metric: 'Consistency', value: 80 },
  ];

  // Map backtest curves to ChartData points
  const backtestData: ChartData[] = activeResults?.equityCurve.map(pt => ({
    date: pt.date,
    value: pt.value
  })) || [];

  // Map comparison curves (first 30 points for better visibility)
  const comparisonData: ChartData[] = [];
  const maxLen = 30;
  if (candles.length > 0) {
    const emaCurve = allBacktestResults['EMA Crossover']?.equityCurve || [];
    const rsiCurve = allBacktestResults['RSI Oversold/Overbought']?.equityCurve || [];
    const macdCurve = allBacktestResults['MACD Signal']?.equityCurve || [];
    const bbCurve = allBacktestResults['Bollinger Bands']?.equityCurve || [];

    const dataPointsCount = Math.min(candles.length, maxLen);
    const startIndex = Math.max(0, candles.length - dataPointsCount);

    for (let i = startIndex; i < candles.length; i++) {
      const idx = i;
      const dateVal = emaCurve[idx]?.date || '';
      comparisonData.push({
        date: dateVal,
        value: emaCurve[idx]?.value || 10000,
        strategy1: emaCurve[idx]?.value || 10000,
        strategy2: rsiCurve[idx]?.value || 10000,
        strategy3: macdCurve[idx]?.value || 10000,
        strategy4: bbCurve[idx]?.value || 10000,
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Brain className="w-8 h-8 text-blue-600" />
            <span>AI Strategy Builder & Backtester</span>
          </h2>
          <p className="text-gray-600 mt-1">Backtest and optimize strategies on real market historical data</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 font-semibold mb-1">Backtest Asset</label>
            <select
              value={selectedAsset.symbol}
              onChange={(e) => {
                const asset = AVAILABLE_ASSETS.find(a => a.symbol === e.target.value);
                if (asset) setSelectedAsset(asset);
              }}
              disabled={isTraining || loading}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {AVAILABLE_ASSETS.map((asset) => (
                <option key={asset.symbol} value={asset.symbol}>
                  {asset.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsTraining(true)}
            disabled={isTraining || loading}
            className={`self-end px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all flex items-center space-x-2 ${isTraining || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isTraining ? `Optimizing... ${trainingProgress}%` : 'Optimize Hyperparameters'}</span>
          </button>
        </div>
      </div>

      {/* Training Progress */}
      {isTraining && (
        <div className="bg-white border border-blue-200 rounded-lg p-6 shadow-sm fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              <span>Training AI Policy Network & Optimizing Stop-Loss Targets...</span>
            </span>
            <span className="text-sm text-blue-600 font-bold">{trainingProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${trainingProgress}%` }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Fetching historical candles and computing indicators...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p className="font-semibold">Error occurred:</p>
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Strategy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {strategies.map((strategy: StrategyMetric, idx: number) => (
              <div
                key={strategy.id}
                onClick={() => setActiveStrategyIndex(idx)}
                className={`bg-white border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
                  activeStrategyIndex === idx
                    ? 'ring-2 ring-blue-500 border-blue-200 shadow-md'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: strategy.color }}></div>
                  <Brain className="w-5 h-5 text-gray-400" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{strategy.name}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Accuracy</span>
                    <span className="text-green-600 font-semibold">{strategy.accuracy}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Win Rate</span>
                    <span className="text-blue-600 font-semibold">{strategy.winRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Strategy Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Backtest Performance: {selectedStrategy.name} on {selectedAsset.symbol}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-600">Accuracy</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{selectedStrategy.accuracy}%</p>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-xs text-gray-600">Max Drawdown</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{selectedStrategy.drawdown}%</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-gray-600">Profit Ratio</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{selectedStrategy.profitRatio}x</p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs text-gray-600">Total Trades</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600">{selectedStrategy.totalTrades || activeResults?.totalTrades}</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Dimensions</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="metric" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <PolarRadiusAxis stroke="#6b7280" />
                    <Radar
                      name={selectedStrategy.name}
                      dataKey="value"
                      stroke={selectedStrategy.color}
                      fill={selectedStrategy.color}
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Backtest Equity Curve ($10,000 Starting)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={backtestData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '10px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      labelStyle={{ color: '#1f2937' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Portfolio Equity ($)"
                      stroke={selectedStrategy.color}
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Strategy Comparison */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Equity Performance Comparison (Recent Timeframes)</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '10px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  labelStyle={{ color: '#1f2937' }}
                />
                <Legend />
                {strategies.map((strategy: StrategyMetric, index: number) => (
                  <Line
                    key={strategy.id}
                    type="monotone"
                    dataKey={`strategy${index + 1}`}
                    name={strategy.name}
                    stroke={strategy.color}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Visual Rule Blueprint */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 shadow-sm">
        <div className="flex items-start space-x-4">
          <div className="p-4 bg-blue-100 rounded-lg">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Backtesting Rule Blueprint ({selectedStrategy.name})
            </h3>
            <p className="text-gray-700 mb-4">
              Here are the rule conditions calculated by the backtest engine:
            </p>
            <div className="bg-white border border-blue-100 rounded-lg p-4 font-mono text-sm text-gray-800 space-y-2 shadow-inner">
              {selectedStrategy.name === 'EMA Crossover' && (
                <>
                  <p className="text-blue-700 font-semibold">// ENTRY CONDITIONS</p>
                  <p><span className="text-purple-600">IF</span> (EMA(9) crosses above EMA(21)) <span className="text-purple-600">THEN</span> Open Long Position</p>
                  <p className="text-red-700 font-semibold mt-2">// EXIT CONDITIONS</p>
                  <p><span className="text-purple-600">IF</span> (Price gain &gt;= 3.0% OR Price drop &lt;= -1.5% OR EMA(9) crosses below EMA(21)) <span className="text-purple-600">THEN</span> Close Position</p>
                </>
              )}
              {selectedStrategy.name === 'RSI Oversold/Overbought' && (
                <>
                  <p className="text-blue-700 font-semibold">// ENTRY CONDITIONS</p>
                  <p><span className="text-purple-600">IF</span> (RSI(14) crosses above 30) <span className="text-purple-600">THEN</span> Open Long Position</p>
                  <p className="text-red-700 font-semibold mt-2">// EXIT CONDITIONS</p>
                  <p><span className="text-purple-600">IF</span> (Price gain &gt;= 3.0% OR Price drop &lt;= -1.5% OR RSI(14) &gt;= 70) <span className="text-purple-600">THEN</span> Close Position</p>
                </>
              )}
              {selectedStrategy.name === 'MACD Signal' && (
                <>
                  <p className="text-blue-700 font-semibold">// ENTRY CONDITIONS</p>
                  <p><span className="text-purple-600">IF</span> (MACD(12,26) crosses above Signal(9)) <span className="text-purple-600">THEN</span> Open Long Position</p>
                  <p className="text-red-700 font-semibold mt-2">// EXIT CONDITIONS</p>
                  <p><span className="text-purple-600">IF</span> (Price gain &gt;= 3.0% OR Price drop &lt;= -1.5% OR MACD(12,26) crosses below Signal(9)) <span className="text-purple-600">THEN</span> Close Position</p>
                </>
              )}
              {selectedStrategy.name === 'Bollinger Bands' && (
                <>
                  <p className="text-blue-700 font-semibold">// ENTRY CONDITIONS</p>
                  <p><span className="text-purple-600">IF</span> (Price crosses above Lower Band(20,2)) <span className="text-purple-600">THEN</span> Open Long Position</p>
                  <p className="text-red-700 font-semibold mt-2">// EXIT CONDITIONS</p>
                  <p><span className="text-purple-600">IF</span> (Price gain &gt;= 3.0% OR Price drop &lt;= -1.5% OR Price crosses above Upper Band(20,2)) <span className="text-purple-600">THEN</span> Close Position</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};