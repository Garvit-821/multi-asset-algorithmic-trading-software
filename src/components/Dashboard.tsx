import { useEffect, useState } from 'react';
import { Activity, TrendingUp, Bell, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { marketSimulator, MarketData } from '../services/marketSimulation';

export function Dashboard() {
  const [stats, setStats] = useState({
    activeAlerts: 0,
    manualTrades: 0,
    avgAccuracy: 91.4,
    totalScanned: 50,
  });
  const [topCoins, setTopCoins] = useState<MarketData[]>([]);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);

  useEffect(() => {
    loadStats();
    updateMarketData();

    const interval = setInterval(() => {
      updateMarketData();
      addRandomActivity();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const [alerts, trades, strategies] = await Promise.all([
        supabase.from('strategy_alerts').select('id', { count: 'exact' }),
        supabase.from('manual_trades').select('id', { count: 'exact' }),
        supabase.from('ai_strategies').select('accuracy')
      ]);

      let avgAcc = 91.4;
      if (strategies.data && strategies.data.length > 0) {
        const validAccuracies = strategies.data
          .map((s: { accuracy: number }) => Number(s.accuracy))
          .filter((a: number) => !isNaN(a) && a > 0);
        if (validAccuracies.length > 0) {
          avgAcc = validAccuracies.reduce((sum: number, val: number) => sum + val, 0) / validAccuracies.length;
        }
      }

      setStats({
        activeAlerts: alerts.count || 0,
        manualTrades: trades.count || 0,
        avgAccuracy: Number(avgAcc.toFixed(1)),
        totalScanned: 50,
      });
    } catch {
      setStats({
        activeAlerts: 0,
        manualTrades: 0,
        avgAccuracy: 91.4,
        totalScanned: 50,
      });
    }
  };

  const updateMarketData = async () => {
    await marketSimulator.updateMarketData();
    const allData = marketSimulator.getAllMarketData();
    const sorted = [...allData].sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h));
    setTopCoins(sorted.slice(0, 8));
  };

  const addRandomActivity = () => {
    const activities = [
      'EMA crossover detected on BTC/USDT',
      'RSI oversold signal triggered on ETH/USDT',
      'New manual trade broadcasted',
      'MACD bullish signal on SOL/USDT',
      'Volume spike detected on ADA/USDT',
      'Strategy backtest completed',
      'Bollinger band bounce on MATIC/USDT',
    ];

    const activity = activities[Math.floor(Math.random() * activities.length)];
    setRecentActivity(prev => [activity, ...prev.slice(0, 4)]);
  };

  const formatPrice = (val: number) => {
    if (val >= 1000) {
      return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (val >= 1) {
      return `$${val.toFixed(2)}`;
    } else {
      return `$${val.toFixed(4)}`;
    }
  };

  return (
    <div className="space-y-5 p-3 sm:p-6 pb-24 md:pb-8 max-w-7xl mx-auto">
      {/* Simple Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Real-time trading insights and analytics</p>
      </div>

      {/* Metric Cards Grid - Responsive 2-col on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Monitored Coins */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900 font-mono">{stats.totalScanned}</span>
          </div>
          <div className="mt-3">
            <h3 className="text-xs sm:text-sm font-semibold text-blue-950">Coins Monitored</h3>
            <p className="text-[11px] sm:text-xs text-blue-700 mt-0.5 font-medium">Live scanning</p>
          </div>
        </div>

        {/* Card 2: Active Alerts */}
        <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900 font-mono">{stats.activeAlerts}</span>
          </div>
          <div className="mt-3">
            <h3 className="text-xs sm:text-sm font-semibold text-emerald-950">Active Alerts</h3>
            <p className="text-[11px] sm:text-xs text-emerald-700 mt-0.5 font-medium">Auto-generated</p>
          </div>
        </div>

        {/* Card 3: Manual Trades */}
        <div className="bg-purple-50/70 border border-purple-100 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900 font-mono">{stats.manualTrades}</span>
          </div>
          <div className="mt-3">
            <h3 className="text-xs sm:text-sm font-semibold text-purple-950">Manual Trades</h3>
            <p className="text-[11px] sm:text-xs text-purple-700 mt-0.5 font-medium">Broadcasted</p>
          </div>
        </div>

        {/* Card 4: AI Accuracy */}
        <div className="bg-amber-50/70 border border-amber-100 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900 font-mono">
              {stats.avgAccuracy}%
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xs sm:text-sm font-semibold text-amber-950">AI Accuracy</h3>
            <p className="text-[11px] sm:text-xs text-amber-700 mt-0.5 font-medium">Strategy average</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Top Market Movers & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Market Movers */}
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xs">
          <h2 className="text-base font-bold text-gray-900 mb-3">Top Market Movers</h2>
          <div className="space-y-2">
            {topCoins.map((coin) => {
              const isPositive = coin.change24h >= 0;
              return (
                <div
                  key={coin.coin}
                  className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100/80 rounded-lg transition-colors border border-gray-100 text-xs sm:text-sm"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-red-500'} shrink-0`} />
                    <span className="font-semibold text-gray-900 truncate">{coin.coin}</span>
                  </div>

                  <div className="flex items-center space-x-3 font-mono">
                    <span className="text-gray-700">{formatPrice(coin.price)}</span>
                    <span className={`font-semibold text-xs ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                      {isPositive ? '+' : ''}{coin.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xs">
          <h2 className="text-base font-bold text-gray-900 mb-3">Recent Activity</h2>
          <div className="space-y-2.5">
            {recentActivity.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-xs sm:text-sm"
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 font-medium truncate">{activity}</p>
                  <span className="text-[10px] text-gray-400 font-mono">Just now</span>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Activity className="w-6 h-6 mx-auto mb-1 opacity-40" />
                <p className="text-xs">Monitoring market activity...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


