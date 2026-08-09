import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';
import { supabase, StrategyAlert } from '../lib/supabase';
import { marketSimulator, AlertTrigger } from '../services/marketSimulation';

export function StrategyAlerts() {
  const [alerts, setAlerts] = useState<StrategyAlert[]>([]);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    loadAlerts();

    const alertInterval = setInterval(() => {
      const newAlert = marketSimulator.generateRandomAlert();
      if (newAlert) {
        createAlert(newAlert);
      }
    }, 3000);

    const scanAnimation = setInterval(() => {
      setScanning(prev => !prev);
    }, 1500);

    return () => {
      clearInterval(alertInterval);
      clearInterval(scanAnimation);
    };
  }, []);

  const loadAlerts = async () => {
    const { data } = await supabase
      .from('strategy_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setAlerts(data);
    }
  };

  const createAlert = async (alertData: AlertTrigger) => {
    const payload = {
      ...alertData,
      status: alertData.status || 'active',
    };
    const { data, error } = await supabase
      .from('strategy_alerts')
      .insert([payload])
      .select()
      .single();

    if (data && !error) {
      setAlerts(prev => [data, ...prev].slice(0, 20));
    }
  };

  const getConditionIcon = (type: string) => {
    if (type.includes('Oversold') || type.includes('Support')) {
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    }
    if (type.includes('Overbought') || type.includes('Resistance')) {
      return <TrendingDown className="w-5 h-5 text-red-600" />;
    }
    return <Activity className="w-5 h-5 text-blue-600" />;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Strategy Alerts</h2>
          <p className="text-gray-600 mt-1">Automated signals from 50+ cryptocurrencies</p>
        </div>
        <div className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
          <div className={`w-2 h-2 rounded-full ${scanning ? 'bg-green-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-sm text-gray-700">Scanning Markets</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-300 animate-slideIn"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getConditionIcon(alert.condition_type)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{alert.coin_name}</h3>
                  <p className="text-sm text-gray-600">{alert.condition_type}</p>
                </div>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(alert.created_at)}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-blue-800">{alert.condition_message}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-gray-50 border border-gray-200 rounded p-2">
                <p className="text-gray-600 text-xs mb-1">Entry</p>
                <p className="text-gray-900 font-semibold">${alert.entry_price}</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded p-2">
                <p className="text-gray-600 text-xs mb-1">Stop Loss</p>
                <p className="text-red-600 font-semibold">${alert.stop_loss}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-2">
                <p className="text-gray-600 text-xs mb-1">Target</p>
                <p className="text-green-600 font-semibold">${alert.target_price}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Scanning markets for trading opportunities...</p>
        </div>
      )}
    </div>
  );
}
