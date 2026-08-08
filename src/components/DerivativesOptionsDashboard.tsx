import { useState, useMemo } from 'react';
import { Calculator, Layers, Activity, TrendingUp } from 'lucide-react';
import {
  calculateBlackScholes,
  generateOptionChain,
  generateStrategyPayoff,
  generateVolatilitySurface,
  OptionChainItem,
  VolatilitySurfacePoint,
  OptionStrategy
} from '../services/blackScholesEngine';

import { BSCalculatorTab } from './derivatives/BSCalculatorTab';
import { OptionsChainMatrixTab } from './derivatives/OptionsChainMatrixTab';
import { StrategyPayoffTab } from './derivatives/StrategyPayoffTab';
import { VolatilitySurfaceTab } from './derivatives/VolatilitySurfaceTab';

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
  const [strategyType, setStrategyType] = useState<OptionStrategy>('bull_call_spread');
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

      {/* TAB CONTENTS */}
      {activeTab === 'calculator' && (
        <BSCalculatorTab
          currentSpot={currentSpot}
          strikePrice={strikePrice}
          setStrikePrice={setStrikePrice}
          dte={dte}
          setDte={setDte}
          volatilityPct={volatilityPct}
          setVolatilityPct={setVolatilityPct}
          riskFreeRatePct={riskFreeRatePct}
          setRiskFreeRatePct={setRiskFreeRatePct}
          bsResult={bsResult}
        />
      )}

      {activeTab === 'chain' && (
        <OptionsChainMatrixTab
          optionChain={optionChain}
          currentSpot={currentSpot}
        />
      )}

      {activeTab === 'payoff' && (
        <StrategyPayoffTab
          strategyType={strategyType}
          setStrategyType={setStrategyType}
          payoffData={payoffData}
          currentSpot={currentSpot}
        />
      )}

      {activeTab === 'surface' && (
        <VolatilitySurfaceTab
          ivSurfaceData={ivSurfaceData}
        />
      )}
    </div>
  );
}
