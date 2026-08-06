import { useState, useMemo } from 'react';
import {
  Calculator,
  Layers,
  Activity,
  Zap,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import {
  calculateBlackScholes,
  generateOptionChain,
  generateStrategyPayoff,
  generateVolatilitySurface,
  OptionChainItem,
  VolatilitySurfacePoint
} from '../services/blackScholesEngine';

export function DerivativesOptionsDashboard() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'chain' | 'payoff' | 'surface'>('calculator');

  // Asset selection
  const [symbol, setSymbol] = useState<'BTC/USDT' | 'ETH/USDT' | 'SOL/USDT' | 'AAPL'>('BTC/USDT');

  // Spot prices
  const spotPriceMap: Record<string, number> = {
    'BTC/USDT': 64500,
    'ETH/USDT': 3450,
    'SOL/USDT': 148,
    'AAPL': 225,
  };

  const currentSpot = spotPriceMap[symbol];

  // Calculator State
  const [strikePrice, setStrikePrice] = useState<number>(spotPriceMap[symbol]);
  const [dte, setDte] = useState<number>(30);
  const [volatilityPct, setVolatilityPct] = useState<number>(55);
  const [riskFreeRatePct, setRiskFreeRatePct] = useState<number>(4.5);

  // Synchronize strike when symbol changes
  const handleSymbolChange = (newSym: 'BTC/USDT' | 'ETH/USDT' | 'SOL/USDT' | 'AAPL') => {
    setSymbol(newSym);
    setStrikePrice(spotPriceMap[newSym]);
  };

  // Black-Scholes Calculation
  const bsResult = useMemo(() => {
    return calculateBlackScholes({
      spotPrice: currentSpot,
      strikePrice,
      timeToMaturityYears: Math.max(1, dte) / 365,
      volatilityPct,
      riskFreeRatePct,
    });
  }, [currentSpot, strikePrice, dte, volatilityPct, riskFreeRatePct]);

  // Option Chain
  const optionChain: OptionChainItem[] = useMemo(() => {
    return generateOptionChain(currentSpot, dte, volatilityPct, riskFreeRatePct, 11);
  }, [currentSpot, dte, volatilityPct, riskFreeRatePct]);

  // Strategy Payoff State
  const [strategyType, setStrategyType] = useState<'long_call' | 'long_put' | 'bull_call_spread' | 'bear_put_spread' | 'straddle' | 'iron_condor'>('bull_call_spread');
  const payoffData = useMemo(() => {
    return generateStrategyPayoff(strategyType, currentSpot, volatilityPct, dte);
  }, [strategyType, currentSpot, volatilityPct, dte]);

  // Volatility Surface
  const ivSurfaceData: VolatilitySurfacePoint[] = useMemo(() => {
    return generateVolatilitySurface(currentSpot, volatilityPct);
  }, [currentSpot, volatilityPct]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
              <Calculator className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Derivatives & Options Pricing Dashboard</h2>
              <p className="text-xs sm:text-sm text-gray-500">Black-Scholes analytical valuation, real-time Greeks, Option Chain matrix & Volatility Surfaces.</p>
            </div>
          </div>
        </div>

        {/* Asset Selector — dropdown on mobile, pills on sm+ */}
        <div className="self-start md:self-auto">
        {/* Asset Selector — dropdown on mobile, pills on sm+ */}
        <div className="self-start md:self-auto">
          {/* Mobile dropdown */}
          <div className="sm:hidden">
            <select
              value={symbol}
              onChange={(e) => handleSymbolChange(e.target.value as 'BTC/USDT' | 'ETH/USDT' | 'SOL/USDT' | 'AAPL')}
              className="w-full px-3 py-2 text-sm font-semibold bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {(['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'AAPL'] as const).map((sym) => (
                <option key={sym} value={sym}>{sym}</option>
              ))}
            </select>
          </div>
          {/* Desktop pills */}
          <div className="hidden sm:flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-xl p-1.5">
            {(['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'AAPL'] as const).map((sym) => (
              <button
                key={sym}
                onClick={() => handleSymbolChange(sym)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${symbol === sym
                    ? 'bg-white text-blue-600 shadow-xs border border-gray-200'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Bar — dropdown on mobile, pills on sm+ */}
      <div>
        {/* Mobile: select dropdown */}
        <div className="sm:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as 'calculator' | 'chain' | 'payoff' | 'surface')}
            className="w-full px-3 py-2.5 text-sm font-semibold bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          >
            <option value="calculator">🧮 Black-Scholes Calculator</option>
            <option value="chain">📊 Options Chain Matrix</option>
            <option value="payoff">📈 Strategy Payoff Diagrams</option>
            <option value="surface">🌊 IV Volatility Surface</option>
          </select>
        </div>

        {/* Desktop: scrollable tab pills */}
        <div className="hidden sm:flex overflow-x-auto whitespace-nowrap space-x-2 border-b border-gray-200 pb-2 scrollbar-none">
          {[
            { id: 'calculator', label: 'Black-Scholes Calculator', icon: Calculator },
            { id: 'chain', label: 'Options Chain Matrix', icon: Layers },
            { id: 'payoff', label: 'Strategy Payoff Diagrams', icon: TrendingUp },
            { id: 'surface', label: 'IV Volatility Surface', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'calculator' | 'chain' | 'payoff' | 'surface')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: BLACK-SCHOLES CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Form Column */}
          <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center justify-between">
              <span>Model Input Parameters</span>
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                Spot: ${currentSpot.toLocaleString()}
              </span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Strike Price ($K)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={strikePrice}
                    onChange={(e) => setStrikePrice(Number(e.target.value))}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-gray-700">Days to Expiration (DTE)</label>
                  <span className="text-xs font-bold text-gray-900">{dte} Days ({(dte / 365).toFixed(3)} yrs)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="365"
                  value={dte}
                  onChange={(e) => setDte(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-gray-700">Implied Volatility (IV %)</label>
                  <span className="text-xs font-bold text-blue-600">{volatilityPct}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  value={volatilityPct}
                  onChange={(e) => setVolatilityPct(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-gray-700">Risk-Free Rate (r %)</label>
                  <span className="text-xs font-bold text-gray-900">{riskFreeRatePct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.1"
                  value={riskFreeRatePct}
                  onChange={(e) => setRiskFreeRatePct(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>$d_1$ Factor:</span>
                <span className="font-mono font-bold text-gray-900">{bsResult.d1}</span>
              </div>
              <div className="flex justify-between">
                <span>$d_2$ Factor:</span>
                <span className="font-mono font-bold text-gray-900">{bsResult.d2}</span>
              </div>
            </div>
          </div>

          {/* Pricing & Greeks Cards Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Call vs Put Theoretical Prices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* CALL CARD */}
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold uppercase text-emerald-700 tracking-wider">Call Option</span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {strikePrice < currentSpot ? 'ITM' : 'OTM'}
                  </span>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900 font-mono">
                    ${bsResult.callPrice.toFixed(2)}
                  </div>
                  <p className="text-xs text-emerald-700 mt-1">Theoretical Black-Scholes Fair Value</p>
                </div>

                <div className="pt-2 border-t border-emerald-200/60 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-emerald-700 block">Intrinsic:</span>
                    <span className="font-bold text-emerald-950 font-mono">${bsResult.intrinsicValueCall}</span>
                  </div>
                  <div>
                    <span className="text-emerald-700 block">Time Value:</span>
                    <span className="font-bold text-emerald-950 font-mono">${bsResult.timeValueCall}</span>
                  </div>
                </div>
              </div>

              {/* PUT CARD */}
              <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold uppercase text-rose-700 tracking-wider">Put Option</span>
                  <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
                    {strikePrice > currentSpot ? 'ITM' : 'OTM'}
                  </span>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-rose-900 font-mono">
                    ${bsResult.putPrice.toFixed(2)}
                  </div>
                  <p className="text-xs text-rose-700 mt-1">Theoretical Black-Scholes Fair Value</p>
                </div>

                <div className="pt-2 border-t border-rose-200/60 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-rose-700 block">Intrinsic:</span>
                    <span className="font-bold text-rose-950 font-mono">${bsResult.intrinsicValuePut}</span>
                  </div>
                  <div>
                    <span className="text-rose-700 block">Time Value:</span>
                    <span className="font-bold text-rose-950 font-mono">${bsResult.timeValuePut}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Options Greeks Grid */}
            <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Options Risk Sensitivity Matrix (Greeks)</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {/* DELTA */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 uppercase block">Delta ($\Delta$)</span>
                  <div className="text-xs font-mono font-bold text-emerald-600">Call: +{bsResult.callGreeks.delta}</div>
                  <div className="text-xs font-mono font-bold text-rose-600">Put: {bsResult.putGreeks.delta}</div>
                  <p className="text-[10px] text-gray-400">Price sensitivity per $1 underlying shift</p>
                </div>

                {/* GAMMA */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 uppercase block">Gamma ($\Gamma$)</span>
                  <div className="text-xs font-mono font-bold text-blue-600">{bsResult.callGreeks.gamma}</div>
                  <div className="text-xs font-mono font-bold text-blue-600">{bsResult.putGreeks.gamma}</div>
                  <p className="text-[10px] text-gray-400">Delta rate of change per $1 shift</p>
                </div>

                {/* THETA */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 uppercase block">Theta ($\Theta$)</span>
                  <div className="text-xs font-mono font-bold text-rose-600">Call: ${bsResult.callGreeks.theta}</div>
                  <div className="text-xs font-mono font-bold text-rose-600">Put: ${bsResult.putGreeks.theta}</div>
                  <p className="text-[10px] text-gray-400">Time decay value lost per day</p>
                </div>

                {/* VEGA */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 uppercase block">Vega (ν)</span>
                  <div className="text-xs font-mono font-bold text-indigo-600">${bsResult.callGreeks.vega}</div>
                  <div className="text-xs font-mono font-bold text-indigo-600">${bsResult.putGreeks.vega}</div>
                  <p className="text-[10px] text-gray-400">Option change per +1% Volatility shift</p>
                </div>

                {/* RHO */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 uppercase block">Rho ($\rho$)</span>
                  <div className="text-xs font-mono font-bold text-gray-700">Call: ${bsResult.callGreeks.rho}</div>
                  <div className="text-xs font-mono font-bold text-gray-700">Put: ${bsResult.putGreeks.rho}</div>
                  <p className="text-[10px] text-gray-400">Option change per +1% Interest Rate shift</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OPTIONS CHAIN MATRIX */}
      {activeTab === 'chain' && (
        <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900">Institutional Option Chain Matrix</h3>
              <p className="text-xs text-gray-500">Live strike prices, Call & Put quotes, IV %, and Delta/Gamma risk profiles.</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1 font-semibold text-emerald-600">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>
                <span>CALLS</span>
              </span>
              <span className="flex items-center space-x-1 font-semibold text-rose-600">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block"></span>
                <span>PUTS</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="text-[10px] text-gray-500 sm:hidden mb-2 flex items-center justify-between font-mono bg-gray-50 px-2 py-1 rounded">
              <span>← Swipe left/right for Call/Put Greeks →</span>
              <span className="font-bold text-blue-600">Matrix</span>
            </div>
            <table className="w-full text-left text-xs font-mono min-w-[720px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px]">
                  <th className="py-2.5 px-3 text-emerald-700">Call Bid</th>
                  <th className="py-2.5 px-3 text-emerald-700">Call Ask</th>
                  <th className="py-2.5 px-3 text-emerald-700">Call IV</th>
                  <th className="py-2.5 px-3 text-emerald-700">Call $\Delta$</th>
                  <th className="py-2.5 px-3 text-center bg-gray-100 text-gray-900 font-extrabold">STRIKE ($K$)</th>
                  <th className="py-2.5 px-3 text-rose-700">Put $\Delta$</th>
                  <th className="py-2.5 px-3 text-rose-700">Put IV</th>
                  <th className="py-2.5 px-3 text-rose-700">Put Bid</th>
                  <th className="py-2.5 px-3 text-rose-700">Put Ask</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {optionChain.map((item) => {
                  const isAtm = Math.abs(item.strike - currentSpot) < (currentSpot * 0.02);
                  return (
                    <tr
                      key={item.strike}
                      className={`hover:bg-gray-50/80 transition-colors ${isAtm ? 'bg-amber-50/60 font-bold' : ''
                        }`}
                    >
                      {/* Call Bid/Ask */}
                      <td className="py-2.5 px-3 text-emerald-600 font-semibold">${item.callBid}</td>
                      <td className="py-2.5 px-3 text-emerald-600 font-semibold">${item.callAsk}</td>
                      <td className="py-2.5 px-3 text-gray-600">{item.callIvPct}%</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-700">+{item.callGreeks.delta}</td>

                      {/* Strike */}
                      <td className="py-2.5 px-3 text-center bg-gray-50 font-extrabold text-gray-900 border-x border-gray-200">
                        ${item.strike}
                        {isAtm && <span className="ml-1 text-[9px] text-amber-700 bg-amber-200 px-1 rounded">ATM</span>}
                      </td>

                      {/* Put Delta */}
                      <td className="py-2.5 px-3 font-semibold text-rose-700">{item.putGreeks.delta}</td>
                      <td className="py-2.5 px-3 text-gray-600">{item.putIvPct}%</td>
                      <td className="py-2.5 px-3 text-rose-600 font-semibold">${item.putBid}</td>
                      <td className="py-2.5 px-3 text-rose-600 font-semibold">${item.putAsk}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STRATEGY PAYOFF DIAGRAMS */}
      {activeTab === 'payoff' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Multi-Leg Strategy Payoff Profile</h3>
                <p className="text-xs text-gray-500">Visualize net P&L at expiration across multi-leg options combinations.</p>
              </div>

              {/* Strategy Selector */}
              <select
                value={strategyType}
                onChange={(e) => setStrategyType(e.target.value as OptionStrategy)}
                className="px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:bg-white"
              >
                <option value="long_call">Long Call</option>
                <option value="long_put">Long Put</option>
                <option value="bull_call_spread">Bull Call Spread</option>
                <option value="bear_put_spread">Bear Put Spread</option>
                <option value="straddle">Long Straddle</option>
                <option value="iron_condor">Iron Condor</option>
              </select>
            </div>

            {/* Metrics Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <span className="text-[11px] font-bold text-emerald-700 uppercase block">Max Profit Potential</span>
                <span className="text-base font-extrabold text-emerald-900 font-mono">{payoffData.maxProfit}</span>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                <span className="text-[11px] font-bold text-rose-700 uppercase block">Max Loss Risk</span>
                <span className="text-base font-extrabold text-rose-900 font-mono">{payoffData.maxLoss}</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <span className="text-[11px] font-bold text-blue-700 uppercase block">Break-Even Threshold</span>
                <span className="text-base font-extrabold text-blue-900 font-mono">{payoffData.breakEven}</span>
              </div>
            </div>

            {/* Recharts Payoff Curve */}
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={payoffData.points}>
                  <defs>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="underlyingPrice"
                    tickFormatter={(val) => `$${val}`}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                  />
                  <YAxis
                    tickFormatter={(val) => `$${val}`}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                  />
                  <Tooltip
                    formatter={(value: unknown) => [`$${value}`, 'Net PnL at Expiry']}
                    labelFormatter={(label) => `Underlying: $${label}`}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                  />
                  <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
                  <ReferenceLine x={currentSpot} stroke="#2563eb" strokeDasharray="4 4" label={{ value: 'Current Spot', fill: '#2563eb', fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="payoffNet"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#profitGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VOLATILITY SURFACE */}
      {activeTab === 'surface' && (
        <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900">Implied Volatility (IV) Surface Matrix</h3>
            <p className="text-xs text-gray-500">2D heatmap grid displaying volatility skew across strikes ($K$) and expiration terms (DTE).</p>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-center text-xs font-mono">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px]">
                  <th className="py-2.5 px-3 text-left">Strike Price</th>
                  <th>7 DTE</th>
                  <th>14 DTE</th>
                  <th>30 DTE</th>
                  <th>60 DTE</th>
                  <th>90 DTE</th>
                  <th>180 DTE</th>
                  <th>365 DTE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.from(new Set(ivSurfaceData.map((d) => d.strike))).map((strike) => {
                  return (
                    <tr key={strike} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 text-left font-bold text-gray-900 bg-gray-50 border-r border-gray-200">
                        ${strike}
                      </td>
                      {[7, 14, 30, 60, 90, 180, 365].map((dteVal) => {
                        const pt = ivSurfaceData.find((d) => d.strike === strike && d.dte === dteVal);
                        const iv = pt ? pt.ivPct : 45;
                        const bgClass =
                          iv > 70
                            ? 'bg-rose-100 text-rose-900 font-bold'
                            : iv > 55
                              ? 'bg-amber-100 text-amber-900 font-semibold'
                              : 'bg-emerald-50 text-emerald-800';

                        return (
                          <td key={dteVal} className={`py-2 px-2 rounded ${bgClass}`}>
                            {iv}%
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
