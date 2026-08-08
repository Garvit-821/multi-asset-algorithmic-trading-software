import { DollarSign, Zap } from 'lucide-react';
import { OptionPriceResult } from '../../services/blackScholesEngine';

interface BSCalculatorTabProps {
  currentSpot: number;
  strikePrice: number;
  setStrikePrice: (val: number) => void;
  dte: number;
  setDte: (val: number) => void;
  volatilityPct: number;
  setVolatilityPct: (val: number) => void;
  riskFreeRatePct: number;
  setRiskFreeRatePct: (val: number) => void;
  bsResult: OptionPriceResult;
}

export function BSCalculatorTab({
  currentSpot,
  strikePrice,
  setStrikePrice,
  dte,
  setDte,
  volatilityPct,
  setVolatilityPct,
  riskFreeRatePct,
  setRiskFreeRatePct,
  bsResult,
}: BSCalculatorTabProps) {
  return (
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
  );
}
