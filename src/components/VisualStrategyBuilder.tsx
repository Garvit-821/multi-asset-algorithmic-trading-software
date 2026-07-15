import React, { useState } from 'react';
import { ArrowRight, Play, Settings, Plus, Trash2, HelpCircle, Sparkles, TrendingUp, ShieldAlert, Award } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { fetchChartData } from '../services/dataFeed';

interface VisualNode {
  id: string;
  type: 'indicator' | 'operator' | 'value' | 'action';
  name: string;
  value: string;
  params?: Record<string, number>;
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
  { symbol: 'BTC/USDT', name: 'Bitcoin (Crypto)' },
  { symbol: 'ETH/USDT', name: 'Ethereum (Crypto)' },
  { symbol: 'SOL/USDT', name: 'Solana (Crypto)' },
];

export function VisualStrategyBuilder() {
  const [selectedAsset, setSelectedAsset] = useState(AVAILABLE_ASSETS[0]);
  const [nodes, setNodes] = useState<VisualNode[]>([
    { id: '1', type: 'indicator', name: 'RSI', value: 'rsi', params: { period: 14 } },
    { id: '2', type: 'operator', name: 'Crosses Below', value: 'crosses_below' },
    { id: '3', type: 'value', name: 'Constant Value', value: '30' },
    { id: '4', type: 'action', name: 'Action: BUY', value: 'buy' }
  ]);
  const [backtestResults, setBacktestResults] = useState<BacktestResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add block node to workspace pipeline
  const addNode = (type: 'indicator' | 'operator' | 'value' | 'action', name: string, value: string, params?: Record<string, number>) => {
    const newNode: VisualNode = {
      id: Math.random().toString(),
      type,
      name,
      value,
      params
    };
    setNodes([...nodes, newNode]);
  };

  const removeNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
  };

  const updateNodeParam = (id: string, key: string, val: number) => {
    setNodes(nodes.map(n => {
      if (n.id === id) {
        return {
          ...n,
          params: {
            ...n.params,
            [key]: val
          }
        };
      }
      return n;
    }));
  };

  const updateNodeValue = (id: string, val: string) => {
    setNodes(nodes.map(n => {
      if (n.id === id) {
        return { ...n, value: val };
      }
      return n;
    }));
  };

  // Backtest compiler
  const compileAndBacktest = async () => {
    setLoading(true);
    setError(null);
    try {
      // Find indicators, operations, and actions from the pipeline
      const indicatorNode = nodes.find(n => n.type === 'indicator');
      const operatorNode = nodes.find(n => n.type === 'operator');
      const valueNode = nodes.find(n => n.type === 'value');
      const actionNode = nodes.find(n => n.type === 'action');

      if (!indicatorNode || !operatorNode || !valueNode || !actionNode) {
        throw new Error('Pipeline incomplete! Make sure you connect an Indicator, Operator, Value, and Action.');
      }

      // Fetch historical candles
      const candles = await fetchChartData(selectedAsset.symbol, '1d', 100);
      if (!candles || candles.length === 0) {
        throw new Error('Could not fetch historical data for ' + selectedAsset.symbol);
      }

      const prices = candles.map(c => c.close);
      const dates = candles.map(c => {
        const d = new Date(Number(c.time) * 1000);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });

      // Calculate indicators
      const indicatorVal = indicatorNode.value;
      const period = indicatorNode.params?.period || 14;
      const thresholdVal = parseFloat(valueNode.value) || 50;

      let indicatorSeries: number[] = [];

      if (indicatorVal === 'rsi') {
        indicatorSeries = calculateRSI(prices, period);
      } else if (indicatorVal === 'ema') {
        indicatorSeries = calculateEMA(prices, period);
      } else {
        indicatorSeries = prices; // Fallback
      }

      // Simulate trading
      let balance = 10000;
      let position: { entryPrice: number; size: number } | null = null;
      let wins = 0;
      let totalTrades = 0;
      let maxEquity = balance;
      let maxDrawdown = 0;
      let grossProfit = 0;
      let grossLoss = 0;
      const equityCurve = [{ date: dates[0] || 'Start', value: balance }];

      for (let i = 1; i < prices.length; i++) {
        const price = prices[i];
        const indVal = indicatorSeries[i];
        const prevIndVal = indicatorSeries[i - 1];

        // Trigger condition evaluate
        let shouldBuy = false;
        let shouldSell = false;

        const operator = operatorNode.value;

        if (operator === 'crosses_below') {
          if (indVal < thresholdVal && prevIndVal >= thresholdVal) {
            shouldBuy = true;
          }
        } else if (operator === 'crosses_above') {
          if (indVal > thresholdVal && prevIndVal <= thresholdVal) {
            shouldBuy = true;
          }
        } else if (operator === 'greater_than') {
          if (indVal > thresholdVal) {
            shouldBuy = true;
          }
        } else if (operator === 'less_than') {
          if (indVal < thresholdVal) {
            shouldBuy = true;
          }
        }

        // Sell is inverse trigger or standard drawdown targets
        if (position) {
          const pctChange = (price - position.entryPrice) / position.entryPrice;
          if (pctChange >= 0.04 || pctChange <= -0.02 || (operator === 'crosses_above' && indVal > thresholdVal)) {
            shouldSell = true;
          }
        }

        // Execute trades
        if (position && shouldSell) {
          const profit = (position.size * price) - (position.size * position.entryPrice);
          balance += profit;
          totalTrades++;
          if (profit > 0) {
            wins++;
            grossProfit += profit;
          } else {
            grossLoss += Math.abs(profit);
          }
          position = null;
        } else if (!position && shouldBuy && actionNode.value === 'buy') {
          position = {
            entryPrice: price,
            size: balance / price
          };
        }

        const currentEquity = position ? (position.size * price) : balance;
        if (currentEquity > maxEquity) {
          maxEquity = currentEquity;
        }
        const dd = ((maxEquity - currentEquity) / maxEquity) * 100;
        if (dd > maxDrawdown) {
          maxDrawdown = dd;
        }

        equityCurve.push({
          date: dates[i],
          value: Math.round(currentEquity)
        });
      }

      const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
      const profitRatio = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 3.0 : 1.0;

      setBacktestResults({
        accuracy: Number(winRate.toFixed(1)),
        winRate: Number(winRate.toFixed(1)),
        drawdown: Number((-maxDrawdown).toFixed(1)),
        profitRatio: Number(profitRatio.toFixed(2)),
        totalTrades,
        equityCurve
      });
    } catch (err: any) {
      setError(err.message || 'Backtest compilation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Visual Strategy Sandbox</h2>
        </div>
        <p className="text-gray-600 mt-1">Design and compile quantitative trading rules using interactive logic blocks.</p>
      </div>

      {/* Editor & Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Toolbox */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 mb-4">Pipeline Blocks</h3>
          
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">1. Technical Indicators</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addNode('indicator', 'RSI', 'rsi', { period: 14 })}
                  className="px-3 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded-full text-xs font-semibold text-gray-600 text-center transition-all"
                >
                  Relative Strength (RSI)
                </button>
                <button
                  onClick={() => addNode('indicator', 'EMA', 'ema', { period: 9 })}
                  className="px-3 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded-full text-xs font-semibold text-gray-600 text-center transition-all"
                >
                  Exp Moving Average (EMA)
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">2. Conditions & Operators</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addNode('operator', 'Crosses Below', 'crosses_below')}
                  className="px-3 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded-full text-xs font-semibold text-gray-600 text-center transition-all"
                >
                  Crosses Below
                </button>
                <button
                  onClick={() => addNode('operator', 'Crosses Above', 'crosses_above')}
                  className="px-3 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded-full text-xs font-semibold text-gray-600 text-center transition-all"
                >
                  Crosses Above
                </button>
                <button
                  onClick={() => addNode('operator', 'Is Greater Than', 'greater_than')}
                  className="px-3 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded-full text-xs font-semibold text-gray-600 text-center transition-all"
                >
                  Is Greater Than
                </button>
                <button
                  onClick={() => addNode('operator', 'Is Less Than', 'less_than')}
                  className="px-3 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded-full text-xs font-semibold text-gray-600 text-center transition-all"
                >
                  Is Less Than
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">3. Threshold Value</p>
              <button
                onClick={() => addNode('value', 'Constant Value', '50')}
                className="w-full px-3 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded-full text-xs font-semibold text-gray-600 text-center transition-all"
              >
                + Add Parameter Constant
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">4. Execution Output</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addNode('action', 'Action: BUY', 'buy')}
                  className="px-3 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded-full text-xs font-semibold text-gray-600 text-center transition-all"
                >
                  Trigger BUY Order
                </button>
                <button
                  onClick={() => addNode('action', 'Action: SELL', 'sell')}
                  className="px-3 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200 rounded-full text-xs font-semibold text-gray-600 text-center transition-all"
                >
                  Trigger SELL Order
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Pipeline Canvas */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-6">Visual Pipeline Canvas</h3>
            
            <div className="flex flex-col md:flex-row items-center justify-center md:space-x-4 space-y-4 md:space-y-0 relative py-8">
              {nodes.map((node, index) => (
                <React.Fragment key={node.id}>
                  {/* Node Card */}
                  <div className="w-full max-w-[200px] bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col justify-between relative shadow-xs">
                    <button
                      onClick={() => removeNode(node.id)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-full"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                        {node.type}
                      </span>
                      <h4 className="text-sm font-semibold text-gray-900 mt-1">{node.name}</h4>
                    </div>

                    <div className="mt-4">
                      {node.type === 'indicator' && node.params && (
                        <div className="space-y-2">
                          <label className="text-[10px] text-gray-500 font-medium">Period</label>
                          <input
                            type="number"
                            value={node.params.period}
                            onChange={(e) => updateNodeParam(node.id, 'period', parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded font-mono bg-white"
                          />
                        </div>
                      )}

                      {node.type === 'value' && (
                        <div className="space-y-2">
                          <label className="text-[10px] text-gray-500 font-medium">Value</label>
                          <input
                            type="text"
                            value={node.value}
                            onChange={(e) => updateNodeValue(node.id, e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded font-mono bg-white"
                          />
                        </div>
                      )}

                      {node.type === 'operator' && (
                        <select
                          value={node.value}
                          onChange={(e) => updateNodeValue(node.id, e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white font-medium text-gray-700"
                        >
                          <option value="crosses_below">Crosses Below</option>
                          <option value="crosses_above">Crosses Above</option>
                          <option value="greater_than">Greater Than</option>
                          <option value="less_than">Less Than</option>
                        </select>
                      )}

                      {node.type === 'action' && (
                        <span className="inline-block px-3.5 py-1.5 bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold rounded-full mt-2 font-mono">
                          {node.value.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Flow Arrow (not for last node) */}
                  {index < nodes.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-gray-400 rotate-90 md:rotate-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Asset & Compile */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Asset</label>
              <select
                value={selectedAsset.symbol}
                onChange={(e) => setSelectedAsset(AVAILABLE_ASSETS.find(a => a.symbol === e.target.value) || AVAILABLE_ASSETS[0])}
                className="px-3.5 py-2 border border-gray-300 rounded-full text-xs font-semibold text-gray-700 bg-white"
              >
                {AVAILABLE_ASSETS.map(a => (
                  <option key={a.symbol} value={a.symbol}>{a.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={compileAndBacktest}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-full text-xs font-bold transition-all flex items-center space-x-2 w-full md:w-auto justify-center shadow-xs"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Compiling...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Compile & Backtest</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center space-x-2 text-sm font-semibold">
          <ShieldAlert className="w-4 h-4 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Backtest Results Area */}
      {backtestResults && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Backtest Strategy Results</h3>
            <span className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-full font-mono">
              SUCCESSFUL SIMULATION
            </span>
          </div>

          {/* Stats Matrix Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Win Rate</span>
              <span className="text-2xl font-bold text-gray-900 block font-mono mt-1">
                {backtestResults.winRate}%
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Profit Ratio</span>
              <span className="text-2xl font-bold text-gray-900 block font-mono mt-1">
                {backtestResults.profitRatio}
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Max Drawdown</span>
              <span className="text-2xl font-bold text-red-600 block font-mono mt-1">
                {backtestResults.drawdown}%
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Trades</span>
              <span className="text-2xl font-bold text-gray-900 block font-mono mt-1">
                {backtestResults.totalTrades}
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 col-span-2 md:col-span-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">End Valuation</span>
              <span className="text-2xl font-bold text-green-600 block font-mono mt-1">
                ${backtestResults.equityCurve[backtestResults.equityCurve.length - 1]?.value.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Equity Chart */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Backtest Equity Curve</h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={backtestResults.equityCurve}>
                  <defs>
                    <linearGradient id="visualEquityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0052ff" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#0052ff" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f3" />
                  <XAxis dataKey="date" stroke="#a8acb3" fontSize={10} tickLine={false} />
                  <YAxis stroke="#a8acb3" fontSize={10} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #dee1e6' }}
                    labelStyle={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: 'bold' }}
                    itemStyle={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#0052ff' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#0052ff" strokeWidth={2} fillOpacity={1} fill="url(#visualEquityGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Indicator math libraries
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
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  for (let i = 0; i <= period; i++) rsi.push(50);
  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period;
    if (avgLoss === 0) rsi.push(100);
    else rsi.push(100 - 100 / (1 + avgGain / avgLoss));
  }
  return rsi;
}
