import { useState, useEffect } from 'react';
import { Bell, Trash2, CheckCircle, XCircle, Send, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { AssetType } from './TradingViewChart';
import { sendTelegramAlert as sendTelegram } from '../services/telegramService';

interface PriceAlert {
  id: string;
  symbol: string;
  asset_type: AssetType;
  exchange?: string;
  alert_type: 'price_above' | 'price_below' | 'price_cross' | 'manual';
  target_price?: number;
  condition_value?: number;
  message?: string;
  status: 'active' | 'triggered' | 'cancelled';
  telegram_enabled: boolean;
  telegram_chat_id?: string;
  triggered_at?: string;
  created_at: string;
}

export function AlertsManager() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    asset_type: 'crypto' as AssetType,
    exchange: '',
    alert_type: 'price_above' as const,
    target_price: 0,
    message: '',
    telegram_enabled: false,
  });

  useEffect(() => {
    loadAlerts();
    
    // Real-time subscription
    const channel = supabase
      .channel('price_alerts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'price_alerts',
        },
        () => {
          loadAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadAlerts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setAlerts(data as PriceAlert[]);
    }
    setLoading(false);
  };

  const createAlert = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('You must be logged in to create an alert.');
      return;
    }

    // Validation
    if (!newAlert.symbol || !newAlert.symbol.trim()) {
      alert('Please enter a symbol (e.g., BTC/USDT)');
      return;
    }

    if (!newAlert.target_price || newAlert.target_price <= 0) {
      alert('Please enter a valid target price greater than 0');
      return;
    }

    const { data, error } = await supabase.from('price_alerts').insert({
      user_id: user.id,
      symbol: newAlert.symbol.trim(),
      asset_type: newAlert.asset_type,
      exchange: newAlert.exchange || null,
      alert_type: newAlert.alert_type,
      target_price: newAlert.target_price,
      message: newAlert.message || null,
      status: 'active',
      telegram_enabled: newAlert.telegram_enabled,
    }).select().single();

    if (error) {
      console.error('Error creating alert:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      console.error('User ID:', user.id);
      console.error('Alert data being inserted:', {
        user_id: user.id,
        symbol: newAlert.symbol.trim(),
        asset_type: newAlert.asset_type,
        exchange: newAlert.exchange || null,
        alert_type: newAlert.alert_type,
        target_price: newAlert.target_price,
        message: newAlert.message || null,
        status: 'active',
        telegram_enabled: newAlert.telegram_enabled,
      });
      alert(`Failed to create alert: ${error.message}\n\nCheck console for details.`);
      return;
    }

    if (data) {
      setShowCreateModal(false);
      setNewAlert({
        symbol: '',
        asset_type: 'crypto',
        exchange: '',
        alert_type: 'price_above',
        target_price: 0,
        message: '',
        telegram_enabled: false,
      });
      loadAlerts();
      alert('Alert created successfully!');
    }
  };

  const deleteAlert = async (id: string) => {
    await supabase.from('price_alerts').delete().eq('id', id);
    loadAlerts();
  };

  const sendTelegramAlert = async (priceAlert: PriceAlert) => {
    // Get user's Telegram chat ID from settings (stored in user metadata or separate table)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !priceAlert.telegram_chat_id) {
      window.alert('Please configure your Telegram Chat ID in Settings.');
      return;
    }

    const success = await sendTelegram(priceAlert.telegram_chat_id, {
      symbol: priceAlert.symbol,
      assetType: priceAlert.asset_type,
      exchange: priceAlert.exchange,
      alertType: priceAlert.alert_type,
      targetPrice: priceAlert.target_price || undefined,
      message: priceAlert.message || undefined,
    });

    if (success) {
      window.alert('Telegram alert sent successfully!');
    } else {
      window.alert('Failed to send Telegram alert. Check console for details.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading alerts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 text-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Price Alerts</h2>
          <p className="text-gray-600 mt-1">Manage your trading alerts</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Alert</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border ${
              alert.status === 'active'
                ? 'bg-white border-gray-200'
                : alert.status === 'triggered'
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{alert.symbol}</h3>
                {alert.exchange && (
                  <span className="text-sm text-gray-500">{alert.exchange}</span>
                )}
              </div>
              {alert.status === 'active' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : alert.status === 'triggered' ? (
                <CheckCircle className="w-5 h-5 text-green-400 fill-current" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-500" />
              )}
            </div>

            <div className="space-y-2 mb-3">
              <div className="text-sm text-gray-600">
                Type: <span className="text-gray-900 capitalize">{alert.alert_type.replace('_', ' ')}</span>
              </div>
              {alert.target_price && (
                <div className="text-sm text-gray-600">
                  Target: <span className="text-gray-900">${alert.target_price.toFixed(4)}</span>
                </div>
              )}
              {alert.message && (
                <div className="text-sm text-gray-700 bg-gray-100 p-2 rounded">
                  {alert.message}
                </div>
              )}
              {alert.telegram_enabled && (
                <div className="flex items-center space-x-1 text-sm text-blue-600">
                  <Send className="w-4 h-4" />
                  <span>Telegram enabled</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <span className="text-xs text-gray-500">
                {new Date(alert.created_at).toLocaleDateString()}
              </span>
              <div className="flex items-center space-x-2">
                {alert.telegram_enabled && alert.status === 'active' && (
                  <button
                    onClick={() => sendTelegramAlert(alert)}
                    className="p-1 text-blue-400 hover:text-blue-300"
                    title="Send test alert"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="p-1 text-red-400 hover:text-red-300"
                  title="Delete alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No alerts yet. Create your first alert!</p>
        </div>
      )}

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Create Price Alert</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Symbol</label>
                <input
                  type="text"
                  value={newAlert.symbol}
                  onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                  placeholder="BTC/USDT"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asset Type</label>
                <select
                  value={newAlert.asset_type}
                  onChange={(e) => setNewAlert({ ...newAlert, asset_type: e.target.value as AssetType })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                >
                  <option value="crypto">Crypto</option>
                  <option value="forex">Forex</option>
                  <option value="stock">Stock</option>
                  <option value="commodity">Commodity</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Price *</label>
                <input
                  type="number"
                  value={newAlert.target_price || ''}
                  onChange={(e) => setNewAlert({ ...newAlert, target_price: e.target.value ? parseFloat(e.target.value) : 0 })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                  step="0.0001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message (optional)</label>
                <textarea
                  value={newAlert.message}
                  onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newAlert.telegram_enabled}
                  onChange={(e) => setNewAlert({ ...newAlert, telegram_enabled: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm text-gray-700">Enable Telegram notifications</label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createAlert}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Create Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

