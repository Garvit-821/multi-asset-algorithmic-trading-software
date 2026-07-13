import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, RefreshCw, BookOpen, PieChart as PieIcon, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { paperTradingService, Position, Order } from '../services/paperTradingService';
import { fetchRealtimePrice } from '../services/dataFeed';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#374151'];

export const PaperTrading: React.FC = () => {
  const [portfolio, setPortfolio] = useState(paperTradingService.getPortfolio());
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [updating, setUpdating] = useState<boolean>(false);

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

  // Pie chart data
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Wallet className="w-8 h-8 text-blue-600" />
            <span>Paper Trading Workspace</span>
          </h2>
          <p className="text-gray-600 mt-1">Practice trading with zero financial risk using a $100,000 sandbox portfolio</p>
        </div>
        <div className="flex items-center space-x-3">
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
        <h3 className="text-xl font-bold text-gray-900 mb-4">Transaction History</h3>
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
                  <td className="py-3 px-4 text-gray-600">
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
    </div>
  );
};
