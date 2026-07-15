import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, ArrowUpRight, ArrowDownRight, Wallet, History } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface HistoricalEvent {
  id: string;
  name: string;
  asset: string;
  description: string;
  startDate: string;
  endDate: string;
  prices: number[];
}

const HISTORICAL_EVENTS: HistoricalEvent[] = [
  {
    id: 'ftx',
    name: 'FTX Insolvency & Crash',
    asset: 'BTC/USDT',
    description: 'November 2022: FTX Exchange goes bankrupt. Mass liquidations drop Bitcoin from $21,300 to $15,600.',
    startDate: 'Nov 6, 2022',
    endDate: 'Nov 12, 2022',
    prices: [21300, 20900, 20600, 19800, 18500, 15800, 15600, 16200, 16800, 16500, 16400, 15900]
  },
  {
    id: 'covid',
    name: 'COVID-19 Black Thursday',
    asset: 'BTC/USDT',
    description: 'March 2020: Global markets collapse. Bitcoin loses over 50% in 48 hours, falling to $3,800.',
    startDate: 'Mar 10, 2020',
    endDate: 'Mar 16, 2020',
    prices: [7900, 7700, 7950, 7300, 4800, 3800, 5200, 5400, 5000, 5300, 5800, 6200]
  },
  {
    id: 'luna',
    name: 'LUNA/UST Stablecoin Collapse',
    asset: 'UST/USD',
    description: 'May 2022: TerraUST depegs, wiping out $40B in market cap. UST falls from $1.00 to cents.',
    startDate: 'May 7, 2022',
    endDate: 'May 13, 2022',
    prices: [1.00, 0.98, 0.95, 0.70, 0.35, 0.12, 0.08, 0.04, 0.15, 0.06, 0.02, 0.01]
  }
];

export function MarketReplay() {
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent>(HISTORICAL_EVENTS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1); // 1 = 1s interval, 2 = 500ms, 5 = 200ms
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // Game state
  const [balance, setBalance] = useState<number>(10000);
  const [position, setPosition] = useState<{ entryPrice: number; size: number } | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [equityHistory, setEquityHistory] = useState<any[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Restart replay state
  const resetGame = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setBalance(10000);
    setPosition(null);
    setTransactions([]);
    setEquityHistory([{ step: 0, price: selectedEvent.prices[0], equity: 10000 }]);
  };

  useEffect(() => {
    resetGame();
  }, [selectedEvent]);

  // Tick interval loop
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = speed === 1 ? 1500 : speed === 2 ? 800 : 300;
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const next = prev + 1;
          if (next >= selectedEvent.prices.length) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return prev;
          }
          
          // Log equity step
          const activePrice = selectedEvent.prices[next];
          setEquityHistory(prevEq => {
            const currentEquity = position ? (position.size * activePrice) : balance;
            return [...prevEq, { step: next, price: activePrice, equity: Math.round(currentEquity) }];
          });

          return next;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, position, balance]);

  const activePrice = selectedEvent.prices[currentIndex] || selectedEvent.prices[0];
  const unrealizedPnL = position 
    ? (activePrice - position.entryPrice) * position.size
    : 0;
  const currentEquity = position 
    ? balance + unrealizedPnL 
    : balance;

  // Trading actions
  const buyAsset = () => {
    if (position) return; // already in trade
    const size = balance / activePrice;
    setPosition({ entryPrice: activePrice, size });
    setBalance(0);
    
    setTransactions(prev => [
      ...prev,
      {
        type: 'BUY',
        price: activePrice,
        size,
        value: balance,
        time: new Date().toLocaleTimeString()
      }
    ]);
  };

  const sellAsset = () => {
    if (!position) return;
    const finalValue = position.size * activePrice;
    const pnl = finalValue - (position.size * position.entryPrice);
    
    setBalance(finalValue);
    setPosition(null);

    setTransactions(prev => [
      ...prev,
      {
        type: 'SELL',
        price: activePrice,
        size: position.size,
        value: finalValue,
        pnl,
        time: new Date().toLocaleTimeString()
      }
    ]);
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2">
          <History className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Historical Event Market Replay</h2>
        </div>
        <p className="text-gray-600 mt-1">Replay extreme market liquidations tick-by-tick and test your trading performance under crisis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Select Panel */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6 h-fit">
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">1. Select Historical Crisis</h3>
            <div className="space-y-2">
              {HISTORICAL_EVENTS.map(event => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    selectedEvent.id === event.id
                      ? 'border-blue-200 bg-blue-50/50 text-blue-700'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <h4 className="text-xs font-bold">{event.name}</h4>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{event.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Replay Status</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">Replay Progress</span>
              <span className="text-xs font-bold font-mono text-gray-900">
                {currentIndex + 1} / {selectedEvent.prices.length} days
              </span>
            </div>
            
            {/* Playback controls */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Start Replay'}</span>
              </button>
              
              <button
                onClick={resetGame}
                className="p-2.5 border border-gray-200 hover:bg-gray-50 rounded-full transition-all"
              >
                <RotateCcw className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-500 font-semibold block">Simulation Speed</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 5].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`py-1.5 border rounded-full text-[10px] font-bold transition-all ${
                      speed === s
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {s}x Speed
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chart Replay Canvas */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs lg:col-span-2 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-900">Live Price Feed Replay</h3>
                <span className="text-[10px] text-gray-500 font-mono block mt-0.5">Asset: {selectedEvent.asset}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 font-semibold">Active Value</span>
                <span className="text-xl font-bold font-mono text-gray-900 block mt-0.5">
                  ${activePrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Replay Price Line Chart */}
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityHistory}>
                  <defs>
                    <linearGradient id="replayPriceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#cf202f" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#cf202f" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f3" />
                  <XAxis dataKey="step" stroke="#a8acb3" fontSize={10} tickLine={false} />
                  <YAxis stroke="#a8acb3" fontSize={10} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #dee1e6' }}
                    itemStyle={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#cf202f' }}
                  />
                  <Area type="monotone" dataKey="price" stroke="#cf202f" strokeWidth={2} fillOpacity={1} fill="url(#replayPriceGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ledger / Positions Controls */}
          <div className="border-t border-gray-100 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Account Balances */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Trading Account Balances</h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                    <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">Equity Value</span>
                    <span className="text-lg font-bold font-mono text-gray-900 mt-1 block">
                      ${currentEquity.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                    <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">Unrealized P&L</span>
                    <span className={`text-lg font-bold font-mono mt-1 block ${
                      unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Buttons */}
              <div className="flex flex-col justify-center space-y-3">
                {position ? (
                  <button
                    onClick={sellAsset}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold transition-all shadow-xs"
                  >
                    Close Position (SELL at ${activePrice})
                  </button>
                ) : (
                  <button
                    onClick={buyAsset}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-full text-xs font-bold transition-all shadow-xs"
                  >
                    Enter Long Position (BUY at ${activePrice})
                  </button>
                )}
                
                {position && (
                  <p className="text-[10px] text-gray-500 font-semibold text-center">
                    Entered position at <span className="font-mono">${position.entryPrice}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Log */}
      {transactions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-gray-900">Replay Trade Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 uppercase tracking-wider">
                  <th className="py-2.5">Time</th>
                  <th className="py-2.5">Type</th>
                  <th className="py-2.5">Execution Price</th>
                  <th className="py-2.5">Size</th>
                  <th className="py-2.5">Total Value</th>
                  <th className="py-2.5">Realized PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-mono">
                {transactions.map((tx, idx) => (
                  <tr key={idx} className="text-gray-900">
                    <td className="py-2.5">{tx.time}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.type === 'BUY' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5">${tx.price.toLocaleString()}</td>
                    <td className="py-2.5">{tx.size.toFixed(4)}</td>
                    <td className="py-2.5">${tx.value.toLocaleString()}</td>
                    <td className={`py-2.5 ${tx.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.pnl !== undefined ? `${tx.pnl >= 0 ? '+' : ''}$${tx.pnl.toFixed(2)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
