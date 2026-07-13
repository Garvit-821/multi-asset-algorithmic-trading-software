import { useEffect, useState } from 'react';
import { Activity, TrendingUp, Bell, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { marketSimulator, MarketData } from '../services/marketSimulation';

export function Dashboard() {
  const [stats, setStats] = useState({
    activeAlerts: 0,
    manualTrades: 0,
    avgAccuracy: 0,
    totalScanned: 50
  });
  const [topCoins, setTopCoins] = useState<MarketData[]>([]);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);

  useEffect(() => {
    loadStats();
    updateMarketData();

    const interval = setInterval(() => {
      updateMarketData();
      addRandomActivity();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    const [alerts, trades, strategies] = await Promise.all([
      supabase.from('strategy_alerts').select('id', { count: 'exact' }),
      supabase.from('manual_trades').select('id', { count: 'exact' }),
      supabase.from('ai_strategies').select('accuracy')
    ]);

    const avgAcc = strategies.data
      ? (strategies.data as any[]).reduce((acc: number, s: any) => acc + s.accuracy, 0) / strategies.data.length
      : 0;

    setStats({
      activeAlerts: alerts.count || 0,
      manualTrades: trades.count || 0,
      avgAccuracy: Math.round(avgAcc),
      totalScanned: 50
    });
  };

  const updateMarketData = async () => {
    await marketSimulator.updateMarketData();
    const allData = marketSimulator.getAllMarketData();
    const sorted = allData.sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h));
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
      'Bollinger band bounce on MATIC/USDT'
    ];

    const activity = activities[Math.floor(Math.random() * activities.length)];
    setRecentActivity(prev => [activity, ...prev.slice(0, 4)]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Real-time trading insights and analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-blue-600" />
            <span className="text-3xl font-bold text-gray-900">{stats.totalScanned}</span>
          </div>
          <h3 className="text-blue-900 font-semibold">Coins Monitored</h3>
          <p className="text-blue-700 text-sm mt-1">Live scanning</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Bell className="w-8 h-8 text-green-600" />
            <span className="text-3xl font-bold text-gray-900">{stats.activeAlerts}</span>
          </div>
          <h3 className="text-green-900 font-semibold">Active Alerts</h3>
          <p className="text-green-700 text-sm mt-1">Auto-generated</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <span className="text-3xl font-bold text-gray-900">{stats.manualTrades}</span>
          </div>
          <h3 className="text-purple-900 font-semibold">Manual Trades</h3>
          <p className="text-purple-700 text-sm mt-1">Broadcasted</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-8 h-8 text-yellow-600" />
            <span className="text-3xl font-bold text-gray-900">{stats.avgAccuracy}%</span>
          </div>
          <h3 className="text-yellow-900 font-semibold">AI Accuracy</h3>
          <p className="text-yellow-700 text-sm mt-1">Strategy average</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Market Movers</h3>
          <div className="space-y-3">
            {topCoins.map((coin) => (
              <div
                key={coin.coin}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${coin.change24h >= 0 ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                  <span className="text-gray-900 font-medium">{coin.coin}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 font-mono">${coin.price.toFixed(4)}</span>
                  <span
                    className={`text-sm font-semibold ${coin.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {coin.change24h >= 0 ? '+' : ''}
                    {coin.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg animate-slideIn"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-gray-700 text-sm">{activity}</p>
                  <span className="text-xs text-gray-500">Just now</span>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Monitoring market activity...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">System Performance</h3>
            <p className="text-gray-700 text-sm">
              All systems operational. Monitoring {stats.totalScanned} cryptocurrencies in real-time with AI-powered analysis.
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-700 font-semibold">Optimal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
