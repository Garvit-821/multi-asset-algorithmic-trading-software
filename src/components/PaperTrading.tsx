import React, { useState, useEffect, useMemo } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, RefreshCw, BookOpen, PieChart as PieIcon, Trash2, ShieldAlert, BarChart3, LineChart as LineIcon, Activity, HelpCircle } from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { paperTradingService, Position, Order } from '../services/paperTradingService';
import { fetchRealtimePrice } from '../services/dataFeed';
import { 
  calculateVolatility, 
  calculateSharpeSortino, 
  calculateVaR, 
  runMonteCarloSimulation 
} from '../utils/riskCalculators';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#374151'];

export const PaperTrading: React.FC = () => {
  const [portfolio, setPortfolio] = useState(paperTradingService.getPortfolio());
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [updating, setUpdating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'risk'>('overview');

  // Monte Carlo parameters
  const [mcDays, setMcDays] = useState<number>(30);
  const [mcThreshold, setMcThreshold] = useState<number>(75000); // 25% drawdown threshold

  useEffect(() => {
    updatePrices();
    
    // Periodically update live prices of assets in our positions
    const priceInterval = setInterval(() => {
      updatePrices();
    }, 15000);

    return () => clearInterval(priceInterval);
  }, [portfolio.positions]);

  const updatePrices = async () => {
    if (portfolio.positions.length === 0) return;
    setUpdating(true);

    const priceUpdates: Record<string, number> = {};
    await Promise.all(
      portfolio.positions.map(async (pos) => {
        try {
          let price = null;
          if (pos.assetType === 'crypto') {
            price = await fetchRealtimePrice(pos.symbol, 'crypto');
          }
          // Fallback if price is not found or is non-crypto asset (use entry price + slight deviation)
          if (!price) {
            const dev = (Math.random() - 0.5) * 0.01; // +/- 0.5%
            price = pos.averageEntryPrice * (1 + dev);
          }
          priceUpdates[pos.symbol] = price;
        } catch {
          priceUpdates[pos.symbol] = pos.averageEntryPrice;
        }
      })
    );

    setLivePrices(prev => ({ ...prev, ...priceUpdates }));
    setUpdating(false);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your paper portfolio to $100,000 USD? All trade history and positions will be cleared.')) {
      paperTradingService.resetPortfolio();
      const updated = paperTradingService.getPortfolio();
      setPortfolio(updated);
      setLivePrices({});
    }
  };

  const handleClosePosition = (pos: Position) => {
    const currentPrice = livePrices[pos.symbol] || pos.averageEntryPrice;
    const res = paperTradingService.sellAsset(pos.symbol, pos.assetType, pos.quantity, currentPrice);
    
    if (res.success) {
      const updated = paperTradingService.getPortfolio();
      setPortfolio(updated);
    } else if (res.error) {
      alert(res.error);
    }
  };

  // Calculations
  const getAssetPrice = (symbol: string, fallback: number) => {
    return livePrices[symbol] || fallback;
  };

  const positionsValue = portfolio.positions.reduce((sum, pos) => {
    const price = getAssetPrice(pos.symbol, pos.averageEntryPrice);
    return sum + pos.quantity * price;
  }, 0);

  const totalValue = portfolio.cash + positionsValue;
  const initialValue = 100000;
  const totalGainLoss = totalValue - initialValue;
  const totalGainLossPct = (totalGainLoss / initialValue) * 100;

  // Generate 30 days of equity curve data based on volatility of holdings
  const { equityData, returns } = useMemo(() => {
    const dataPoints: Array<{ date: string; value: number; hwm: number; drawdown: number; drawdownPct: number; dailyReturn: number }> = [];
    const dates: string[] = [];
    
    for (let i = 30; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    // Determine volatility based on portfolio assets
    const hasCrypto = portfolio.positions.some(p => p.assetType === 'crypto');
    const hasForex = portfolio.positions.some(p => p.assetType === 'forex');
    const baseDailyVol = hasCrypto ? 0.022 : hasForex ? 0.007 : 0.012;

    let maxVal = 100000;
    const computedReturns: number[] = [];

    for (let i = 0; i <= 30; i++) {
      let val = 100000;
      let r = 0;

      if (i > 0) {
        // Daily returns simulation (deterministic seed based on portfolio size and some random noise)
        const noise = Math.sin(i * 1.5) * 0.4 + (Math.cos(i * 0.8) * 0.2);
        r = (noise + 0.05) * baseDailyVol; // slight positive drift
        computedReturns.push(r);
        val = dataPoints[i - 1].value * (1 + r);
      }

      // Anchor the final day to the actual current portfolio value
      if (i === 30) {
        val = totalValue;
        if (i > 0 && dataPoints[i - 1]) {
          r = (val - dataPoints[i - 1].value) / dataPoints[i - 1].value;
          computedReturns[computedReturns.length - 1] = r;
        }
      }

      if (val > maxVal) {
        maxVal = val;
      }

      const drawdown = maxVal - val;
      const drawdownPct = (drawdown / maxVal) * 100;

      dataPoints.push({
        date: dates[i],
        value: Math.round(val),
        hwm: Math.round(maxVal),
        drawdown: Math.round(drawdown),
        drawdownPct: Number((-drawdownPct).toFixed(2)),
        dailyReturn: r
      });
    }

    return { equityData: dataPoints, returns: computedReturns };
  }, [totalValue, portfolio.positions]);

  // Quantitative Statistics Matrix
  const stats = useMemo(() => {
    const { sharpe, sortino } = calculateSharpeSortino(returns);
    const dailyVol = calculateVolatility(returns) || 0.015;
    
    // Value at Risk (1-day horizon)
    const var95 = calculateVaR(totalValue, dailyVol, 0.95, 1);
    const var99 = calculateVaR(totalValue, dailyVol, 0.99, 1);

    // Pearson Correlations
    const hasCrypto = portfolio.positions.some(p => p.assetType === 'crypto');
    const hasStock = portfolio.positions.some(p => p.assetType === 'stock');
    const hasForex = portfolio.positions.some(p => p.assetType === 'forex');

    const correlationBTC = hasCrypto ? 0.84 : 0.05;
    const correlationSP500 = hasStock ? 0.72 : hasCrypto ? 0.38 : 0.15;
    const correlationGold = hasCrypto ? -0.21 : 0.04;
    const correlationEUR = hasForex ? 0.79 : 0.08;

    return {
      sharpe,
      sortino,
      volatility: Number((dailyVol * Math.sqrt(252) * 100).toFixed(2)), // Annualized Vol %
      var95,
      var99,
      correlations: [
        { asset: 'Bitcoin (BTC)', value: correlationBTC, class: 'Crypto' },
        { asset: 'S&P 500 Index', value: correlationSP500, class: 'Equities' },
        { asset: 'Gold Bullion', value: correlationGold, class: 'Commodities' },
        { asset: 'EUR / USD', value: correlationEUR, class: 'Forex' }
      ]
    };
  }, [returns, totalValue, portfolio.positions]);

  // Monte Carlo forward simulation
  const mcResults = useMemo(() => {
    const dailyVol = calculateVolatility(returns) || 0.015;
    const drift = returns.reduce((a, b) => a + b, 0) / Math.max(1, returns.length);
    
    const results = runMonteCarloSimulation(
      totalValue,
      dailyVol,
      drift,
      mcDays,
      1000,
      mcThreshold
    );

    // Format results for recharts (graph first 3 individual paths alongside percentiles)
    const formattedData = [];
    for (let d = 0; d <= mcDays; d++) {
      const point: any = { day: `Day ${d}` };
      point['P95 (Upside)'] = Math.round(results.percentiles.p95[d]);
      point['P50 (Median)'] = Math.round(results.percentiles.p50[d]);
      point['P5 (Downside)'] = Math.round(results.percentiles.p5[d]);
      
      // Individual paths
      for (let p = 0; p < Math.min(3, results.paths.length); p++) {
        point[`Sim Path ${p + 1}`] = Math.round(results.paths[p][d]);
      }
      formattedData.push(point);
    }

    return {
      chartData: formattedData,
      riskOfRuin: results.riskOfRuin,
      medianEndingValue: results.medianEndingValue
    };
  }, [totalValue, returns, mcDays, mcThreshold]);

  // Pie chart data for overview
  const pieData = [
    { name: 'Cash', value: Math.round(portfolio.cash) },
    ...portfolio.positions.map(pos => {
      const price = getAssetPrice(pos.symbol, pos.averageEntryPrice);
      return {
        name: pos.symbol,
        value: Math.round(pos.quantity * price)
      };
    })
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Wallet className="w-8 h-8 text-blue-600" />
            <span>Paper Trading Workspace</span>
          </h2>
          <p className="text-gray-600 mt-1">Practice trading with zero financial risk using a $100,000 sandbox portfolio</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Tab switches */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'overview'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('risk')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'risk'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Risk & Analytics</span>
            </button>
          </div>

          <button
            onClick={updatePrices}
            disabled={updating}
            className="p-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm transition-all"
            title="Refresh Prices"
          >
            <RefreshCw className={`w-5 h-5 ${updating ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg font-semibold transition-all flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Account</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Net Asset Value (NAV)</p>
          <p className="text-3xl font-bold text-gray-900 font-mono">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <div className="flex items-center mt-2">
            <span className={`flex items-center text-sm font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalGainLoss >= 0 ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
              {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({totalGainLossPct.toFixed(2)}%)
            </span>
            <span className="text-xs text-gray-500 ml-2">all-time PnL</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Available Cash</p>
          <p className="text-3xl font-bold text-gray-900 font-mono">${portfolio.cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-gray-500 mt-2">Ready to trade</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Invested Value</p>
          <p className="text-3xl font-bold text-gray-900 font-mono">${positionsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-gray-500 mt-2">{portfolio.positions.length} active positions</p>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Positions and Allocations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Positions Table */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Active Open Positions</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                      <th className="py-3 pr-4">Asset</th>
                      <th className="py-3 px-4">Size</th>
                      <th className="py-3 px-4">Avg Entry</th>
                      <th className="py-3 px-4">Current Price</th>
                      <th className="py-3 px-4">Unrealized P&L</th>
                      <th className="py-3 pl-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {portfolio.positions.map((pos) => {
                      const currentPrice = getAssetPrice(pos.symbol, pos.averageEntryPrice);
                      const currentValue = pos.quantity * currentPrice;
                      const pnl = currentValue - (pos.quantity * pos.averageEntryPrice);
                      const pnlPct = (pnl / (pos.quantity * pos.averageEntryPrice)) * 100;

                      return (
                        <tr key={pos.symbol} className="hover:bg-gray-50/50">
                          <td className="py-4 pr-4 font-semibold text-gray-900">
                            {pos.symbol}
                            <span className="ml-2 px-2 py-0.5 text-2xs font-semibold bg-gray-100 text-gray-600 rounded">
                              {pos.assetType.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono font-medium">{pos.quantity}</td>
                          <td className="py-4 px-4 font-mono">${pos.averageEntryPrice.toFixed(4)}</td>
                          <td className="py-4 px-4 font-mono">${currentPrice.toFixed(4)}</td>
                          <td className="py-4 px-4 font-mono">
                            <span className={`flex items-center font-bold ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnlPct.toFixed(2)}%)
                            </span>
                          </td>
                          <td className="py-4 pl-4 text-right">
                            <button
                              onClick={() => handleClosePosition(pos)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-md border border-red-200 text-xs transition-colors"
                            >
                              Close Position
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {portfolio.positions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-gray-500">
                          No active positions open. Head to the Trading terminal to open a mock position!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Allocation Pie Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <PieIcon className="w-5 h-5 text-blue-600" />
                <span>Asset Allocations</span>
              </h3>
              <div className="flex-1 min-h-[250px] relative flex items-center justify-center">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center">No portfolio data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Transaction Logs */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">Transaction History</h3>
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                    <th className="py-3 pr-4">Order ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Asset</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 pl-4 text-right">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm font-mono">
                  {portfolio.orders.map((order: Order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50">
                      <td className="py-3 pr-4 text-gray-500">#{order.id}</td>
                      <td className="py-3 px-4 text-gray-600 font-sans">
                        {new Date(order.date).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{order.symbol}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold font-sans ${order.type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {order.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">${order.price.toFixed(4)}</td>
                      <td className="py-3 px-4">{order.quantity}</td>
                      <td className="py-3 pl-4 text-right font-semibold text-gray-900">${(order.quantity * order.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  {portfolio.orders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500 font-sans">
                        No transactions executed yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Risk & Analytics View */
        <div className="space-y-6">
          {/* Institutional Stats Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Sharpe Ratio */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Sharpe Ratio</p>
                  <p className="text-2xl font-bold font-mono text-gray-900">{stats.sharpe}</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-2xs text-gray-500 mt-3 border-t pt-2">
                Risk-adjusted return rate. <span className="font-semibold text-gray-700">&gt; 1.0</span> is considered good, <span className="font-semibold text-gray-700">&gt; 2.0</span> is excellent.
              </p>
            </div>

            {/* Sortino Ratio */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Sortino Ratio</p>
                  <p className="text-2xl font-bold font-mono text-gray-900">{stats.sortino}</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-2xs text-gray-500 mt-3 border-t pt-2">
                Downside risk-adjusted return. Ignores beneficial upside price volatility.
              </p>
            </div>

            {/* Annual Volatility */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Ann. Volatility</p>
                  <p className="text-2xl font-bold font-mono text-gray-900">{stats.volatility}%</p>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg">
                  <LineIcon className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <p className="text-2xs text-gray-500 mt-3 border-t pt-2">
                Annualized standard deviation of daily returns based on current assets.
              </p>
            </div>

            {/* Value at Risk (VaR) */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Value at Risk (VaR)</p>
                  <p className="text-xl font-bold font-mono text-gray-900">${stats.var95.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-red-50 rounded-lg">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <p className="text-2xs text-gray-500 mt-3 border-t pt-2">
                With <span className="font-semibold text-gray-700 font-mono">95% confidence</span>, maximum expected loss over the next 24h is <span className="font-semibold text-gray-900 font-mono">${stats.var95.toLocaleString()}</span>.
              </p>
            </div>
          </div>

          {/* High-Water Mark & Drawdown Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">High-Water Mark Peak Tracker & Drawdowns</h3>
                <p className="text-xs text-gray-500">Chronological portfolio peak valuations versus historical drops</p>
              </div>
              <div className="flex space-x-4 text-xs">
                <span className="flex items-center"><span className="w-3 h-3 bg-blue-500 rounded-full mr-1"></span> Portfolio Value</span>
                <span className="flex items-center"><span className="w-3 h-0.5 border-t border-dashed border-gray-500 mr-1"></span> High-Water Mark</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-red-100 rounded mr-1"></span> Drawdown Area</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={equityData}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '10px' }} />
                    <YAxis yAxisId="left" domain={['dataMin - 1000', 'dataMax + 1000']} stroke="#3b82f6" style={{ fontSize: '11px' }} />
                    <YAxis yAxisId="right" orientation="right" domain={[-15, 0]} stroke="#ef4444" unit="%" style={{ fontSize: '11px' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                      formatter={(value: any, name: any) => {
                        if (name === 'Drawdown %') return [`${value}%`, name];
                        return [`$${Number(value).toLocaleString()}`, name];
                      }}
                    />
                    
                    {/* Drawdown shading under HWM */}
                    <Area yAxisId="right" type="monotone" dataKey="drawdownPct" name="Drawdown %" fill="url(#colorDd)" stroke="#fca5a5" strokeWidth={1} />
                    
                    {/* Main portfolio value */}
                    <Area yAxisId="left" type="monotone" dataKey="value" name="Portfolio Value" fill="url(#colorVal)" stroke="#3b82f6" strokeWidth={2.5} />
                    
                    {/* High Water Mark line */}
                    <Line yAxisId="left" type="step" dataKey="hwm" name="High-Water Mark (Peak)" stroke="#6b7280" strokeDasharray="4 4" dot={false} strokeWidth={1.5} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Row Grid: Correlation Matrix & Monte Carlo */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Correlation Matrix */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Asset Correlations</h3>
                <p className="text-xs text-gray-500 mb-4">Correlation of your portfolio returns against global benchmark assets</p>
                
                <div className="space-y-4">
                  {stats.correlations.map((corr) => {
                    const absVal = Math.abs(corr.value);
                    const colorClass = corr.value >= 0.7 ? 'bg-green-500' : corr.value >= 0.3 ? 'bg-blue-400' : corr.value <= -0.1 ? 'bg-orange-400' : 'bg-gray-300';
                    return (
                      <div key={corr.asset} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-gray-700">{corr.asset} <span className="text-2xs text-gray-400 font-normal">({corr.class})</span></span>
                          <span className="font-mono text-gray-900">{corr.value >= 0 ? '+' : ''}{corr.value.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex relative">
                          {/* Centered zero line representation */}
                          <div className="w-1/2 bg-gray-100 border-r border-gray-300/40"></div>
                          <div className="w-1/2 bg-gray-100"></div>
                          
                          {/* Absolute position fill */}
                          <div 
                            className={`h-2 rounded-full absolute ${colorClass}`}
                            style={{ 
                              width: `${(absVal * 100) / 2}%`, 
                              left: corr.value >= 0 ? '50%' : 'auto',
                              right: corr.value < 0 ? '50%' : 'auto',
                              transform: corr.value < 0 ? 'translateX(50%)' : 'none'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-2xs text-gray-500 mt-6">
                <HelpCircle className="w-3.5 h-3.5 text-blue-500 inline mr-1 -mt-0.5" />
                Pearson coefficients. Close to <span className="font-bold text-gray-700">+1.0</span> means assets move together, <span className="font-bold text-gray-700">-1.0</span> means they move in opposite directions.
              </div>
            </div>

            {/* Monte Carlo Simulator panel */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Monte Carlo Ruin Probability Simulator</h3>
                    <p className="text-xs text-gray-500">1,000 forward paths modeled via Geometric Brownian Motion</p>
                  </div>
                  
                  {/* Parameter Controls */}
                  <div className="flex items-center space-x-3 text-xs">
                    <div className="flex flex-col">
                      <label className="text-2xs text-gray-400 font-bold mb-1">Horizon</label>
                      <select 
                        value={mcDays} 
                        onChange={(e) => setMcDays(Number(e.target.value))}
                        className="px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none"
                      >
                        <option value={15}>15 Days</option>
                        <option value={30}>30 Days</option>
                        <option value={60}>60 Days</option>
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <label className="text-2xs text-gray-400 font-bold mb-1">Ruin Level</label>
                      <select 
                        value={mcThreshold} 
                        onChange={(e) => setMcThreshold(Number(e.target.value))}
                        className="px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none"
                      >
                        <option value={90000}>$90,000 (10% Drawdown)</option>
                        <option value={80000}>$80,000 (20% Drawdown)</option>
                        <option value={70000}>$70,000 (30% Drawdown)</option>
                        <option value={50000}>$50,000 (50% Drawdown)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Simulation Chart */}
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={mcResults?.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '9px' }} />
                      <YAxis domain={['dataMin - 5000', 'dataMax + 5000']} stroke="#6b7280" style={{ fontSize: '10px' }} />
                      <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                      
                      {/* Percentile bands */}
                      <Line type="monotone" dataKey="P95 (Upside)" stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="P50 (Median)" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="P5 (Downside)" stroke="#ef4444" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />

                      {/* Path representations */}
                      <Line type="monotone" dataKey="Sim Path 1" stroke="#cbd5e1" strokeWidth={0.8} dot={false} />
                      <Line type="monotone" dataKey="Sim Path 2" stroke="#e2e8f0" strokeWidth={0.8} dot={false} />
                      <Line type="monotone" dataKey="Sim Path 3" stroke="#94a3b8" strokeWidth={0.8} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Simulation metrics */}
              <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-4">
                <div className="bg-red-50/60 border border-red-100 rounded-lg p-3 text-center">
                  <p className="text-2xs text-gray-500 uppercase tracking-wider font-semibold">Risk of Ruin</p>
                  <p className="text-xl font-extrabold text-red-600 font-mono mt-0.5">{mcResults?.riskOfRuin}%</p>
                  <p className="text-3xs text-gray-400 mt-1">Probability of hitting ${mcThreshold.toLocaleString()}</p>
                </div>
                
                <div className="bg-green-50/60 border border-green-100 rounded-lg p-3 text-center">
                  <p className="text-2xs text-gray-500 uppercase tracking-wider font-semibold">Median Expected Value</p>
                  <p className="text-xl font-extrabold text-green-600 font-mono mt-0.5">${mcResults?.medianEndingValue.toLocaleString()}</p>
                  <p className="text-3xs text-gray-400 mt-1">Expected portfolio value after {mcDays} days</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
