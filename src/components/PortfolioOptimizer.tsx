import React, { useState } from 'react';
import { Target, TrendingUp, BarChart3, Shield, Loader2 } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid } from 'recharts';
import { fetchChartData } from '../services/dataFeed';

interface OptimizedPortfolio {
  weights: Record<string, number>;
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
}

const ASSET_POOL = [
  { symbol: 'BTC/USDT', name: 'Bitcoin (Crypto)', baseReturn: 0.45, baseVol: 0.65 },
  { symbol: 'ETH/USDT', name: 'Ethereum (Crypto)', baseReturn: 0.38, baseVol: 0.72 },
  { symbol: 'SOL/USDT', name: 'Solana (Crypto)', baseReturn: 0.65, baseVol: 0.85 },
];

export function PortfolioOptimizer() {
  const [selectedAssets, setSelectedAssets] = useState<string[]>(['BTC/USDT', 'ETH/USDT', 'SOL/USDT']);
  const [lookback, setLookback] = useState<number>(90);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [simulatedPortfolios, setSimulatedPortfolios] = useState<any[]>([]);
  const [tangencyPortfolio, setTangencyPortfolio] = useState<OptimizedPortfolio | null>(null);
  const [gmvPortfolio, setGmvPortfolio] = useState<OptimizedPortfolio | null>(null);

  const toggleAsset = (symbol: string) => {
    if (selectedAssets.includes(symbol)) {
      if (selectedAssets.length > 2) {
        setSelectedAssets(selectedAssets.filter(a => a !== symbol));
      }
    } else {
      setSelectedAssets([...selectedAssets, symbol]);
    }
  };

  const runOptimization = async () => {
    setLoading(true);
    setError(null);
    try {
      if (selectedAssets.length < 2) {
        throw new Error('Please select at least 2 assets to optimize.');
      }

      // Fetch historical data for covariance calculation
      const priceSeriesData: Record<string, number[]> = {};
      
      for (const symbol of selectedAssets) {
        const candles = await fetchChartData(symbol, '1d', lookback);
        if (!candles || candles.length < 5) {
          throw new Error(`Insufficient historical data found for ${symbol}`);
        }
        priceSeriesData[symbol] = candles.map(c => c.close);
      }

      // Calculate daily returns
      const dailyReturns: Record<string, number[]> = {};
      const avgReturns: Record<string, number> = {};
      
      selectedAssets.forEach(symbol => {
        const prices = priceSeriesData[symbol];
        const returns: number[] = [];
        for (let i = 1; i < prices.length; i++) {
          returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
        }
        dailyReturns[symbol] = returns;
        
        const sum = returns.reduce((a, b) => a + b, 0);
        avgReturns[symbol] = sum / returns.length;
      });

      // Calculate covariance matrix
      const len = dailyReturns[selectedAssets[0]].length;
      const covarianceMatrix: Record<string, Record<string, number>> = {};
      
      selectedAssets.forEach(symbolA => {
        covarianceMatrix[symbolA] = {};
        const avgA = avgReturns[symbolA];
        const returnsA = dailyReturns[symbolA];

        selectedAssets.forEach(symbolB => {
          const avgB = avgReturns[symbolB];
          const returnsB = dailyReturns[symbolB];
          
          let covarianceSum = 0;
          for (let i = 0; i < len; i++) {
            covarianceSum += (returnsA[i] - avgA) * (returnsB[i] - avgB);
          }
          covarianceMatrix[symbolA][symbolB] = covarianceSum / (len - 1);
        });
      });

      // Simulate 500 random weight portfolios
      const portfolios: OptimizedPortfolio[] = [];
      let bestSharpe: OptimizedPortfolio | null = null;
      let minVolatility: OptimizedPortfolio | null = null;
      
      const riskFreeRate = 0.02; // 2% annualized risk free rate

      for (let p = 0; p < 500; p++) {
        // Generate random weights that sum to 1.0
        const rawWeights: Record<string, number> = {};
        let weightSum = 0;
        selectedAssets.forEach(symbol => {
          const w = Math.random();
          rawWeights[symbol] = w;
          weightSum += w;
        });

        const normalizedWeights: Record<string, number> = {};
        selectedAssets.forEach(symbol => {
          normalizedWeights[symbol] = rawWeights[symbol] / weightSum;
        });

        // Compute Expected Portfolio Return (annualized)
        let expectedReturn = 0;
        selectedAssets.forEach(symbol => {
          expectedReturn += normalizedWeights[symbol] * avgReturns[symbol];
        });
        expectedReturn = expectedReturn * 252; // Annualize daily return

        // Compute Portfolio Volatility (annualized)
        let portfolioVariance = 0;
        selectedAssets.forEach(symbolA => {
          selectedAssets.forEach(symbolB => {
            portfolioVariance += normalizedWeights[symbolA] * normalizedWeights[symbolB] * covarianceMatrix[symbolA][symbolB];
          });
        });
        const volatility = Math.sqrt(portfolioVariance) * Math.sqrt(252); // Annualize volatility

        const sharpeRatio = (expectedReturn - riskFreeRate) / volatility;

        const portfolioObj: OptimizedPortfolio = {
          weights: normalizedWeights,
          expectedReturn,
          volatility,
          sharpeRatio
        };

        portfolios.push(portfolioObj);

        // Find Maximum Sharpe (Tangency)
        if (!bestSharpe || sharpeRatio > bestSharpe.sharpeRatio) {
          bestSharpe = portfolioObj;
        }

        // Find Global Minimum Variance (GMV)
        if (!minVolatility || volatility < minVolatility.volatility) {
          minVolatility = portfolioObj;
        }
      }

      setSimulatedPortfolios(
        portfolios.map(p => ({
          x: Number((p.volatility * 100).toFixed(2)), // Volatility % on X axis
          y: Number((p.expectedReturn * 100).toFixed(2)), // Return % on Y axis
          sharpe: Number(p.sharpeRatio.toFixed(2))
        }))
      );

      setTangencyPortfolio(bestSharpe);
      setGmvPortfolio(minVolatility);
    } catch (err: any) {
      setError(err.message || 'Portfolio optimization execution failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <div className="flex items-center space-x-2">
          <Target className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Modern Portfolio Optimization</h2>
        </div>
        <p className="text-gray-600 mt-1">Compute historical covariance models to find the mathematical maximum Sharpe allocations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Card */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs h-fit space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">1. Select Assets</h3>
            <div className="space-y-2">
              {ASSET_POOL.map(asset => {
                const isSelected = selectedAssets.includes(asset.symbol);
                return (
                  <button
                    key={asset.symbol}
                    onClick={() => toggleAsset(asset.symbol)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-blue-200 bg-blue-50/50 text-blue-600'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-xs font-semibold">{asset.name}</span>
                    <span className="text-[10px] font-mono font-bold">{asset.symbol}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">2. Parameters</h3>
            <div className="space-y-2">
              <label className="text-xs text-gray-500 font-medium block">Lookback Horizon (Days)</label>
              <select
                value={lookback}
                onChange={(e) => setLookback(parseInt(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-full text-xs font-semibold text-gray-700 bg-white"
              >
                <option value={30}>30 Days (Short-Term)</option>
                <option value={90}>90 Days (Medium-Term)</option>
                <option value={180}>180 Days (Long-Term)</option>
              </select>
            </div>
          </div>

          <button
            onClick={runOptimization}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-full text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Simulating frontiers...</span>
              </>
            ) : (
              <span>Optimize Portfolio</span>
            )}
          </button>
        </div>

        {/* Frontier Plot Canvas */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-6">Markowitz Efficient Frontier</h3>
            {simulatedPortfolios.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Volatility" 
                      unit="%" 
                      stroke="#a8acb3" 
                      fontSize={10} 
                      tickLine={false} 
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Expected Return" 
                      unit="%" 
                      stroke="#a8acb3" 
                      fontSize={10} 
                      tickLine={false} 
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #dee1e6' }}
                      itemStyle={{ fontFamily: 'JetBrains Mono', fontSize: '11px' }}
                    />
                    <Scatter name="Portfolios" data={simulatedPortfolios} fill="#a8acb3" opacity={0.3} line={false} shape="circle" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 p-6 text-center">
                <BarChart3 className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-xs font-semibold text-gray-500">Run optimization to plot efficient portfolio nodes.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center space-x-2 text-sm font-semibold">
          <span>{error}</span>
        </div>
      )}

      {/* Allocation Weights Table */}
      {tangencyPortfolio && gmvPortfolio && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Max Sharpe Allocation */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm font-bold text-gray-900">Maximum Sharpe (Tangency) Allocation</h4>
              </div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-mono">
                SR: {tangencyPortfolio.sharpeRatio.toFixed(2)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pb-4">
              <div>
                <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">Annualized Return</span>
                <span className="text-xl font-bold font-mono text-green-600 mt-1 block">
                  {(tangencyPortfolio.expectedReturn * 100).toFixed(2)}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">Annualized Volatility</span>
                <span className="text-xl font-bold font-mono text-gray-900 mt-1 block">
                  {(tangencyPortfolio.volatility * 100).toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {Object.entries(tangencyPortfolio.weights).map(([symbol, weight]) => (
                <div key={symbol} className="flex items-center justify-between text-xs py-1 border-b border-gray-50">
                  <span className="font-semibold text-gray-700">{symbol}</span>
                  <span className="font-bold font-mono text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded">
                    {(weight * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Min Variance Allocation */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <h4 className="text-sm font-bold text-gray-900">Global Minimum Variance Allocation</h4>
              </div>
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-mono">
                SR: {gmvPortfolio.sharpeRatio.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-4">
              <div>
                <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">Annualized Return</span>
                <span className="text-xl font-bold font-mono text-green-600 mt-1 block">
                  {(gmvPortfolio.expectedReturn * 100).toFixed(2)}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">Annualized Volatility</span>
                <span className="text-xl font-bold font-mono text-gray-900 mt-1 block">
                  {(gmvPortfolio.volatility * 100).toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {Object.entries(gmvPortfolio.weights).map(([symbol, weight]) => (
                <div key={symbol} className="flex items-center justify-between text-xs py-1 border-b border-gray-50">
                  <span className="font-semibold text-gray-700">{symbol}</span>
                  <span className="font-bold font-mono text-green-600 bg-green-50/50 px-2 py-0.5 rounded">
                    {(weight * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
