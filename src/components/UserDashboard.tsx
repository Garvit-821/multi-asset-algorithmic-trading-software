import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Clock, Bell, Send, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { supabase, StrategyAlert, ManualTrade } from '../lib/supabase';
import { fetchRealtimePrice } from '../services/dataFeed';
import type { AssetType } from './TradingViewChart';

interface TriggeredPriceAlert {
  id: string;
  symbol: string;
  asset_type: AssetType;
  exchange?: string;
  alert_type: string;
  target_price?: number;
  message?: string;
  triggered_at: string;
  created_at: string;
}

interface FeedItem {
  id: string;
  type: 'strategy' | 'manual' | 'price_alert';
  coin_name?: string;
  symbol?: string;
  asset_type?: AssetType;
  exchange?: string;
  condition_type?: string;
  condition_message?: string;
  entry_price?: number;
  stop_loss?: number;
  target_price?: number;
  message?: string;
  status?: string;
  created_at: string;
  triggered_at?: string;
  currentPrice?: number;
}

export function UserDashboard() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'strategy' | 'manual' | 'price_alert'>('all');

  useEffect(() => {
    loadFeedItems();

    // Set up real-time subscriptions
    const strategyChannel = supabase
      .channel('strategy_alerts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'strategy_alerts',
        },
        () => {
          loadFeedItems();
        }
      )
      .subscribe();

    const manualChannel = supabase
      .channel('manual_trades_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'manual_trades',
        },
        () => {
          loadFeedItems();
        }
      )
      .subscribe();

    const priceAlertsChannel = supabase
      .channel('price_alerts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'price_alerts',
        },
        () => {
          loadFeedItems();
        }
      )
      .subscribe();

    // Refresh prices every 10 seconds
    const priceInterval = setInterval(() => {
      loadFeedItems();
    }, 10000);

    return () => {
      supabase.removeChannel(strategyChannel);
      supabase.removeChannel(manualChannel);
      supabase.removeChannel(priceAlertsChannel);
      clearInterval(priceInterval);
    };
  }, []);

  const loadFeedItems = async () => {
    setLoading(true);

    const [strategyData, manualData, priceAlertData] = await Promise.all([
      supabase
        .from('strategy_alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('manual_trades')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('price_alerts')
        .select('*')
        .eq('status', 'triggered')
        .order('triggered_at', { ascending: false })
        .limit(10),
    ]);

    const items: FeedItem[] = [];

    // Add strategy alerts
    if (strategyData.data) {
      strategyData.data.forEach((alert: StrategyAlert) => {
        items.push({
          id: alert.id,
          type: 'strategy',
          coin_name: alert.coin_name,
          asset_type: 'crypto',
          condition_type: alert.condition_type,
          condition_message: alert.condition_message,
          entry_price: alert.entry_price,
          stop_loss: alert.stop_loss,
          target_price: alert.target_price,
          status: alert.status,
          created_at: alert.created_at,
        });
      });
    }

    // Add manual trades
    if (manualData.data) {
      manualData.data.forEach((trade: ManualTrade) => {
        items.push({
          id: trade.id,
          type: 'manual',
          coin_name: trade.coin_name,
          asset_type: 'crypto',
          entry_price: trade.entry_price,
          stop_loss: trade.stop_loss,
          target_price: trade.target_price,
          message: trade.message,
          created_at: trade.created_at,
        });
      });
    }

    // Add triggered price alerts
    if (priceAlertData.data) {
      priceAlertData.data.forEach((alert: TriggeredPriceAlert) => {
        items.push({
          id: alert.id,
          type: 'price_alert',
          symbol: alert.symbol,
          asset_type: alert.asset_type,
          exchange: alert.exchange,
          condition_type: alert.alert_type,
          target_price: alert.target_price,
          message: alert.message,
          triggered_at: alert.triggered_at,
          created_at: alert.created_at,
        });
      });
    }

    // Sort by created_at descending
    items.sort((a, b) => {
      const timeA = a.triggered_at || a.created_at;
      const timeB = b.triggered_at || b.created_at;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });

    // Fetch current prices for all items
    const itemsWithPrices = await Promise.all(
      items.map(async (item) => {
        const symbol = item.symbol || item.coin_name || '';
        const assetType = item.asset_type || 'crypto';
        if (symbol && assetType === 'crypto') {
          try {
            const price = await fetchRealtimePrice(symbol, 'crypto');
            return { ...item, currentPrice: price || undefined };
          } catch {
            return item;
          }
        }
        return item;
      })
    );

    setFeedItems(itemsWithPrices);
    setLoading(false);
  };

  const getItemIcon = (item: FeedItem) => {
    switch (item.type) {
      case 'strategy':
        if (item.condition_type?.includes('Oversold') || item.condition_type?.includes('Support')) {
          return <TrendingUp className="w-6 h-6 text-green-600" />;
        }
        if (item.condition_type?.includes('Overbought') || item.condition_type?.includes('Resistance')) {
          return <TrendingDown className="w-6 h-6 text-red-600" />;
        }
        return <Activity className="w-6 h-6 text-blue-600" />;
      case 'manual':
        return <Send className="w-6 h-6 text-purple-600" />;
      case 'price_alert':
        return <Bell className="w-6 h-6 text-orange-600" />;
    }
  };

  const getItemTypeBadge = (item: FeedItem) => {
    switch (item.type) {
      case 'strategy':
        return (
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
            AI STRATEGY
          </span>
        );
      case 'manual':
        return (
          <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full border border-purple-200">
            MANUAL
          </span>
        );
      case 'price_alert':
        return (
          <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full border border-orange-200">
            TRIGGERED
          </span>
        );
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const calculateProfitLoss = (item: FeedItem) => {
    if (!item.currentPrice || !item.entry_price) return null;

    const change = item.currentPrice - item.entry_price;
    const percentChange = (change / item.entry_price) * 100;
    return { change, percentChange };
  };

  const filteredItems = filter === 'all' 
    ? feedItems 
    : feedItems.filter(item => item.type === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 text-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Trading Feed</h2>
          <p className="text-gray-600 mt-1">Real-time alerts and signals</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('strategy')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            filter === 'strategy'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          AI Strategy
        </button>
        <button
          onClick={() => setFilter('manual')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            filter === 'manual'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Manual
        </button>
        <button
          onClick={() => setFilter('price_alert')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            filter === 'price_alert'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Alerts
        </button>
      </div>

      {/* Feed Items */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const symbol = item.symbol || item.coin_name || 'N/A';
          const profitLoss = calculateProfitLoss(item);

          return (
            <div
              key={`${item.type}-${item.id}`}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                    {getItemIcon(item)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{symbol}</h3>
                      {getItemTypeBadge(item)}
                    </div>
                    {item.condition_type && (
                      <p className="text-sm text-gray-600">{item.condition_type}</p>
                    )}
                    {item.currentPrice && (
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-700">Current: </span>
                        <span className="text-lg font-mono font-semibold text-gray-900">
                          ${item.currentPrice.toFixed(4)}
                        </span>
                        {profitLoss && (
                          <span
                            className={`text-sm font-semibold flex items-center ${
                              profitLoss.change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {profitLoss.change >= 0 ? (
                              <ArrowUpRight className="w-4 h-4 mr-1" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 mr-1" />
                            )}
                            {profitLoss.percentChange.toFixed(2)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(item.triggered_at || item.created_at)}
                </div>
              </div>

              {(item.condition_message || item.message) && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700">
                    {item.condition_message || item.message}
                  </p>
                </div>
              )}

              {(item.entry_price || item.target_price) && (
                <div className="grid grid-cols-3 gap-3">
                  {item.entry_price && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-gray-600 text-xs mb-1">Entry Price</p>
                      <p className="text-gray-900 font-semibold">${item.entry_price.toFixed(4)}</p>
                    </div>
                  )}
                  {item.stop_loss && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-gray-600 text-xs mb-1">Stop Loss</p>
                      <p className="text-red-600 font-semibold">${item.stop_loss.toFixed(4)}</p>
                    </div>
                  )}
                  {item.target_price && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-gray-600 text-xs mb-1">
                        {item.type === 'price_alert' ? 'Target Price' : 'Target'}
                      </p>
                      <p className="text-green-600 font-semibold">${item.target_price.toFixed(4)}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Zap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'No trading signals available yet' 
              : `No ${filter} signals available yet`}
          </p>
        </div>
      )}
    </div>
  );
}

