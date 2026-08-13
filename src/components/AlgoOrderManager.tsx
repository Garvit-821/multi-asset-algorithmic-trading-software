import { useState, useEffect } from 'react';
import { Play, Pause, Square, Zap, Clock, BarChart2, Layers, ChevronRight, Activity } from 'lucide-react';
import { algoExecutionService, AlgoOrderConfig, AlgoStrategyType } from '../services/algoExecutionService';
import { exchangeConnector, ExchangeId } from '../services/exchangeConnector';

interface AlgoOrderManagerProps {
  symbol: string;
  currentPrice: number | null;
}

export function AlgoOrderManager({ symbol, currentPrice }: AlgoOrderManagerProps) {
  const [orders, setOrders] = useState<AlgoOrderConfig[]>([]);
  const [activeStrategy, setActiveStrategy] = useState<AlgoStrategyType>('TWAP');
  
  // Order Parameters Form State
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [totalQuantity, setTotalQuantity] = useState<number>(1.0);
  const [durationMinutes, setDurationMinutes] = useState<number>(5);
  const [sliceIntervalSeconds, setSliceIntervalSeconds] = useState<number>(10);
  const [randomizeVariancePercent, setRandomizeVariancePercent] = useState<number>(15);
  const [displayQuantity, setDisplayQuantity] = useState<number>(0.1);
  const [exchangeId, setExchangeId] = useState<ExchangeId>('binance_testnet');

  const [selectedOrderForLogs, setSelectedOrderForLogs] = useState<AlgoOrderConfig | null>(null);

  useEffect(() => {
    const unsubscribe = algoExecutionService.subscribe((updatedOrders) => {
      setOrders(updatedOrders);
      if (selectedOrderForLogs) {
        const found = updatedOrders.find((o) => o.id === selectedOrderForLogs.id);
        if (found) setSelectedOrderForLogs(found);
      }
    });
    return unsubscribe;
  }, [selectedOrderForLogs]);

  const handleLaunchOrder = async () => {
    if (totalQuantity <= 0) return;

    const newOrder = await algoExecutionService.createAlgoOrder({
      strategyType: activeStrategy,
      symbol,
      side,
      totalQuantity,
      exchangeId,
      durationMinutes,
      sliceIntervalSeconds,
      randomizeVariancePercent,
      displayQuantity,
      limitPrice: currentPrice || undefined,
    });

    algoExecutionService.startOrder(newOrder.id);
  };

  const handlePause = (id: string) => {
    algoExecutionService.pauseOrder(id);
  };

  const handleResume = (id: string) => {
    algoExecutionService.startOrder(id);
  };

  const handleCancel = (id: string) => {
    algoExecutionService.cancelOrder(id);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden text-gray-900">
      {/* Top Header */}
      <div className="bg-white text-gray-900 p-4 sm:p-5 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Institutional Algorithmic Execution</h2>
            <p className="text-xs text-gray-500">TWAP, VWAP & Iceberg Order Management for {symbol}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={exchangeId}
            onChange={(e) => setExchangeId(e.target.value as ExchangeId)}
            className="w-full sm:w-auto bg-gray-50 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="binance_testnet">Binance Testnet</option>
            <option value="binance">Binance (Live)</option>
            <option value="coinbase">Coinbase Advanced</option>
            <option value="kraken">Kraken</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden min-h-0">
        {/* Order Configuration Panel */}
        <div className="w-full lg:w-5/12 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50 flex flex-col justify-between overflow-y-auto shrink-0 space-y-5">
          <div className="space-y-5">
            {/* Strategy Selector Tabs */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Execution Strategy
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-gray-200/70 p-1 rounded-lg">
                <button
                  onClick={() => setActiveStrategy('TWAP')}
                  className={`py-2 text-xs font-bold rounded-md flex items-center justify-center space-x-1 transition-all ${
                    activeStrategy === 'TWAP'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>TWAP</span>
                </button>

                <button
                  onClick={() => setActiveStrategy('VWAP')}
                  className={`py-2 text-xs font-bold rounded-md flex items-center justify-center space-x-1 transition-all ${
                    activeStrategy === 'VWAP'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>VWAP</span>
                </button>

                <button
                  onClick={() => setActiveStrategy('ICEBERG')}
                  className={`py-2 text-xs font-bold rounded-md flex items-center justify-center space-x-1 transition-all ${
                    activeStrategy === 'ICEBERG'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Iceberg</span>
                </button>
              </div>
            </div>

            {/* Side Switch */}
            <div className="grid grid-cols-2 gap-2 bg-gray-200/70 p-1 rounded-lg">
              <button
                onClick={() => setSide('BUY')}
                className={`py-2 font-bold text-xs rounded-md transition-all ${
                  side === 'BUY' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                BUY {symbol}
              </button>
              <button
                onClick={() => setSide('SELL')}
                className={`py-2 font-bold text-xs rounded-md transition-all ${
                  side === 'SELL' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                SELL {symbol}
              </button>
            </div>

            {/* Total Order Quantity */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase block mb-1">
                Total Order Quantity
              </label>
              <input
                type="number"
                step="0.01"
                value={totalQuantity}
                onChange={(e) => setTotalQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Strategy Specific Settings */}
            {activeStrategy === 'TWAP' && (
              <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-xs font-bold text-blue-600 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Time-Weighted Slicing Options</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-500 font-semibold block mb-1">Duration (Mins)</label>
                    <input
                      type="number"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded font-mono text-xs text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500 font-semibold block mb-1">Interval (Secs)</label>
                    <input
                      type="number"
                      value={sliceIntervalSeconds}
                      onChange={(e) => setSliceIntervalSeconds(parseInt(e.target.value) || 5)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded font-mono text-xs text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-gray-500 font-semibold block mb-1">
                    Random Variance ({randomizeVariancePercent}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={randomizeVariancePercent}
                    onChange={(e) => setRandomizeVariancePercent(parseInt(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <p className="text-[10px] text-gray-400 leading-tight">
                    Randomizes slice sizes by up to ±{randomizeVariancePercent}% to disguise trade intent from market algorithms.
                  </p>
                </div>
              </div>
            )}

            {activeStrategy === 'VWAP' && (
              <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-xs font-bold text-blue-600 flex items-center space-x-1">
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Volume Curve Distribution Profile</span>
                </p>
                <div>
                  <label className="text-[11px] text-gray-500 font-semibold block mb-1">Slice Interval (Secs)</label>
                  <input
                    type="number"
                    value={sliceIntervalSeconds}
                    onChange={(e) => setSliceIntervalSeconds(parseInt(e.target.value) || 5)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded font-mono text-xs text-gray-900"
                  />
                </div>
                <p className="text-[10px] text-gray-500 leading-tight">
                  Automatically weighs slice sizes according to U-shaped intraday volume curves (25% open, 10% mid, 25% close).
                </p>
              </div>
            )}

            {activeStrategy === 'ICEBERG' && (
              <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-xs font-bold text-blue-600 flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Hidden Order Book Masking</span>
                </p>
                <div>
                  <label className="text-[11px] text-gray-500 font-semibold block mb-1">Visible Display Size</label>
                  <input
                    type="number"
                    step="0.01"
                    value={displayQuantity}
                    onChange={(e) => setDisplayQuantity(parseFloat(e.target.value) || 0.01)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded font-mono text-xs text-gray-900"
                  />
                </div>
                <p className="text-[10px] text-gray-500 leading-tight">
                  Only <span className="font-bold font-mono">{displayQuantity}</span> will be submitted to the order book. The remaining <span className="font-bold font-mono">{(totalQuantity - displayQuantity).toFixed(4)}</span> stays hidden in reserve.
                </p>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={handleLaunchOrder}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2 text-sm"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch {activeStrategy} Algo Order</span>
            </button>
          </div>
        </div>

        {/* Active Algo Orders Monitor & History */}
        <div className="w-full lg:w-7/12 p-4 sm:p-5 bg-white flex flex-col justify-between overflow-y-auto shrink-0">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
                <span>Active Algorithmic Orders ({orders.length})</span>
              </h3>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500 space-y-2">
                <Clock className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-sm font-semibold">No active algorithmic execution tasks</p>
                <p className="text-xs">Configure strategy parameters on the left to launch an institutional TWAP, VWAP, or Iceberg order.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => {
                  const progressPct = Math.min(100, Math.round((ord.filledQuantity / ord.totalQuantity) * 100));
                  return (
                    <div
                      key={ord.id}
                      className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              ord.side === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {ord.side} {ord.strategyType}
                          </span>
                          <span className="font-bold text-sm text-gray-900">{ord.symbol}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              ord.status === 'RUNNING'
                                ? 'bg-blue-100 text-blue-800'
                                : ord.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : ord.status === 'PAUSED'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {ord.status}
                          </span>

                          {ord.status === 'RUNNING' && (
                            <button
                              onClick={() => handlePause(ord.id)}
                              className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                              title="Pause"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                          )}

                          {ord.status === 'PAUSED' && (
                            <button
                              onClick={() => handleResume(ord.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Resume"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}

                          {ord.status !== 'COMPLETED' && ord.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleCancel(ord.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Cancel"
                            >
                              <Square className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-xs font-mono text-gray-600 mb-1">
                          <span>Filled: {ord.filledQuantity} / {ord.totalQuantity}</span>
                          <span className="font-bold text-blue-600">{progressPct}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Details Footer & View Logs button */}
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                        <span>Engine: {exchangeConnector.getExchangeName(ord.exchangeId)}</span>
                        <button
                          onClick={() => setSelectedOrderForLogs(ord)}
                          className="font-semibold text-blue-600 hover:underline flex items-center space-x-1"
                        >
                          <span>Slices ({ord.sliceLogs.length})</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Order Execution Logs Drawer / Modal */}
          {selectedOrderForLogs && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Slice Execution Logs for {selectedOrderForLogs.id}
                </h4>
                <button
                  onClick={() => setSelectedOrderForLogs(null)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Close
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto bg-gray-900 rounded-lg p-3 text-xs font-mono text-gray-200 space-y-1">
                {selectedOrderForLogs.sliceLogs.length === 0 ? (
                  <p className="text-gray-500 italic">No slice executions recorded yet.</p>
                ) : (
                  selectedOrderForLogs.sliceLogs.map((log) => (
                    <div key={log.id} className="flex justify-between border-b border-gray-800 pb-1">
                      <span className="text-gray-400">#{log.sliceIndex} [{log.timestamp}]</span>
                      <span className="text-green-400">Qty: {log.quantity} @ ${log.price}</span>
                      <span className="text-blue-400">{log.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
