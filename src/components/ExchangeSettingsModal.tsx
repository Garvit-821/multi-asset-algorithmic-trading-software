import { useState, useEffect } from 'react';
import { Key, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, X, Cpu, Server, Trash2 } from 'lucide-react';
import { exchangeConnector, ExchangeId, ExchangeStatus } from '../services/exchangeConnector';

interface ExchangeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExchangeSettingsModal({ isOpen, onClose }: ExchangeSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<ExchangeId>('binance_testnet');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [configuredExchanges, setConfiguredExchanges] = useState<Set<string>>(new Set());

  const [statuses, setStatuses] = useState<Record<ExchangeId, ExchangeStatus>>({
    binance: { exchangeId: 'binance', name: 'Binance Live', status: 'disconnected' },
    binance_testnet: { exchangeId: 'binance_testnet', name: 'Binance Testnet', status: 'disconnected' },
    coinbase: { exchangeId: 'coinbase', name: 'Coinbase Advanced', status: 'disconnected' },
    kraken: { exchangeId: 'kraken', name: 'Kraken', status: 'disconnected' },
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadServerKeyStatus();
    }
  }, [isOpen]);

  const loadServerKeyStatus = async () => {
    setLoading(true);
    try {
      const configured = await exchangeConnector.syncServerKeyStatus();
      setConfiguredExchanges(new Set(configured));
    } catch (_err) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSaveServerKeys = async () => {
    if (!apiKey || !apiSecret) {
      setErrorMessage('API Key and API Secret are required.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await exchangeConnector.saveServerCredentials(activeTab, {
        apiKey,
        apiSecret,
        passphrase,
        isTestnet: activeTab === 'binance_testnet',
      });
      setConfiguredExchanges((prev) => new Set(prev).add(activeTab));
      setSuccessMessage(`API Keys for ${exchangeConnector.getExchangeName(activeTab)} securely encrypted and saved to server vault.`);
      setApiKey('');
      setApiSecret('');
      setPassphrase('');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save credentials to server vault.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKeys = async (exchangeId: ExchangeId) => {
    if (!window.confirm(`Are you sure you want to remove server keys for ${exchangeConnector.getExchangeName(exchangeId)}?`)) return;
    setLoading(true);
    try {
      await exchangeConnector.deleteServerCredentials(exchangeId);
      setConfiguredExchanges((prev) => {
        const next = new Set(prev);
        next.delete(exchangeId);
        return next;
      });
      setSuccessMessage(`Server keys removed for ${exchangeConnector.getExchangeName(exchangeId)}.`);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to delete server keys.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (exchangeId: ExchangeId) => {
    setStatuses((prev) => ({
      ...prev,
      [exchangeId]: { ...prev[exchangeId], status: 'testing' },
    }));

    const result = await exchangeConnector.testConnection(exchangeId);
    setStatuses((prev) => ({
      ...prev,
      [exchangeId]: result,
    }));
  };

  if (!isOpen) return null;

  const exchanges: Array<{ id: ExchangeId; name: string; isTestnet?: boolean }> = [
    { id: 'binance_testnet', name: 'Binance Testnet', isTestnet: true },
    { id: 'binance', name: 'Binance (Live)' },
    { id: 'coinbase', name: 'Coinbase Advanced' },
    { id: 'kraken', name: 'Kraken' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-3xl my-auto max-h-[92vh] flex flex-col overflow-hidden text-gray-900">
        {/* Header */}
        <div className="bg-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-gray-200 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <Key className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Server-Side Exchange Vault</h2>
              <p className="text-xs text-gray-500">
                Institutional AES-GCM Encrypted API Vault & Server Execution Proxy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-y-auto md:overflow-hidden">
          {/* Exchange Selector Sidebar */}
          <div className="w-full md:w-56 bg-gray-50/50 border-b md:border-b-0 md:border-r border-gray-200 p-3 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible shrink-0 gap-2 md:gap-1">
            <p className="hidden md:block px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Connectors</p>
            {exchanges.map((ex) => {
              const status = statuses[ex.id];
              const isConfigured = configuredExchanges.has(ex.id);
              const isActive = activeTab === ex.id;
              return (
                <button
                  key={ex.id}
                  onClick={() => {
                    setActiveTab(ex.id);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-between transition-all shrink-0 md:w-full ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Server className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate">{ex.name}</span>
                  </div>
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ml-2 ${
                      isConfigured || status.status === 'connected'
                        ? 'bg-green-500 shadow-sm shadow-green-500/50'
                        : status.status === 'testing'
                        ? 'bg-amber-500 animate-pulse'
                        : status.status === 'auth_failed'
                        ? 'bg-red-500'
                        : 'bg-gray-300'
                    }`}
                  />
                </button>
              );
            })}

            <div className="pt-2 md:pt-6 md:px-1 shrink-0">
              <button
                onClick={() => exchangeConnector.setActiveExchange(activeTab)}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Set Active Engine</span>
              </button>
            </div>
          </div>

          {/* Active Connector Credentials Form */}
          <div className="flex-1 p-4 sm:p-6 bg-white overflow-y-auto flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    {exchangeConnector.getExchangeName(activeTab)}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Server Vault Encrypted Keys & Edge Execution Proxy
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${
                      configuredExchanges.has(activeTab)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {configuredExchanges.has(activeTab) ? 'Vault Configured' : 'Not Connected'}
                  </span>
                  <button
                    onClick={() => handleTestConnection(activeTab)}
                    disabled={statuses[activeTab].status === 'testing'}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                    title="Test API Connection"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        statuses[activeTab].status === 'testing' ? 'animate-spin text-blue-600' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Alert Messages */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Input Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                    API Key
                  </label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={`Enter ${exchangeConnector.getExchangeName(activeTab)} API Key...`}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-xs text-gray-900 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                    API Secret
                  </label>
                  <input
                    type="password"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    placeholder="Enter Secret Key..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-xs text-gray-900 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {activeTab === 'coinbase' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                      Passphrase (If applicable)
                    </label>
                    <input
                      type="password"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      placeholder="Coinbase Passphrase..."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-xs text-gray-900 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={handleSaveServerKeys}
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs sm:text-sm flex items-center space-x-2 shadow-sm transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Encrypting & Saving...' : 'Save Keys to Server Vault'}</span>
                </button>

                {configuredExchanges.has(activeTab) && (
                  <button
                    onClick={() => handleDeleteKeys(activeTab)}
                    disabled={loading}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Server Keys</span>
                  </button>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>🔒 Zero-Knowledge Frontend Architecture</span>
              <span>Keys encrypted via AES-GCM backend secret</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
