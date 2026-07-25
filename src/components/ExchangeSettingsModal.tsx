import { useState, useEffect } from 'react';
import { Key, Lock, Unlock, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, X, Cpu, Server } from 'lucide-react';
import {
  hasStoredCredentials,
  saveEncryptedCredentials,
  loadDecryptedCredentials,
  clearStoredCredentials,
} from '../utils/cryptoSecurity';
import { exchangeConnector, ExchangeId, ExchangeKeyConfig, ExchangeStatus } from '../services/exchangeConnector';

interface ExchangeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExchangeSettingsModal({ isOpen, onClose }: ExchangeSettingsModalProps) {
  const [passphrase, setPassphrase] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [credentials, setCredentials] = useState<ExchangeKeyConfig>({
    binance: { apiKey: '', apiSecret: '' },
    binance_testnet: { apiKey: '', apiSecret: '' },
    coinbase: { apiKey: '', apiSecret: '', passphrase: '' },
    kraken: { apiKey: '', apiSecret: '' },
  });

  const [activeTab, setActiveTab] = useState<ExchangeId>('binance_testnet');
  const [statuses, setStatuses] = useState<Record<ExchangeId, ExchangeStatus>>({
    binance: { exchangeId: 'binance', name: 'Binance Live', status: 'disconnected' },
    binance_testnet: { exchangeId: 'binance_testnet', name: 'Binance Testnet', status: 'disconnected' },
    coinbase: { exchangeId: 'coinbase', name: 'Coinbase Advanced', status: 'disconnected' },
    kraken: { exchangeId: 'kraken', name: 'Kraken', status: 'disconnected' },
  });

  const [hasEncrypted, setHasEncrypted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setHasEncrypted(hasStoredCredentials());
  }, [isOpen]);

  const handleUnlock = async () => {
    if (!passphrase) {
      setErrorMessage('Please enter your encryption passphrase.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const loaded = await loadDecryptedCredentials<ExchangeKeyConfig>(passphrase);
      if (loaded) {
        setCredentials(loaded);
        exchangeConnector.setCredentials(loaded);
      }
      setIsUnlocked(true);
      setSuccessMessage('Vault unlocked successfully. Credentials loaded in memory.');
    } catch (err: any) {
      setErrorMessage('Invalid passphrase or failed to decrypt credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndEncrypt = async () => {
    if (!passphrase) {
      setErrorMessage('Passphrase is required to encrypt and persist credentials.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      await saveEncryptedCredentials(credentials, passphrase);
      exchangeConnector.setCredentials(credentials);
      setIsUnlocked(true);
      setHasEncrypted(true);
      setSuccessMessage('API Keys securely encrypted (AES-GCM 256-bit) and stored.');
    } catch (err: any) {
      setErrorMessage('Failed to encrypt and save credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (exchangeId: ExchangeId) => {
    setStatuses((prev) => ({
      ...prev,
      [exchangeId]: { ...prev[exchangeId], status: 'testing' },
    }));

    const result = await exchangeConnector.testConnection(exchangeId, credentials[exchangeId]);
    setStatuses((prev) => ({
      ...prev,
      [exchangeId]: result,
    }));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all stored exchange API keys from browser memory?')) {
      clearStoredCredentials();
      setCredentials({
        binance: { apiKey: '', apiSecret: '' },
        binance_testnet: { apiKey: '', apiSecret: '' },
        coinbase: { apiKey: '', apiSecret: '', passphrase: '' },
        kraken: { apiKey: '', apiSecret: '' },
      });
      setIsUnlocked(false);
      setHasEncrypted(false);
      setSuccessMessage('All encrypted exchange credentials removed.');
    }
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
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Multi-Exchange API Vault</h2>
              <p className="text-xs text-gray-500">
                AES-GCM Client-Side Encrypted API Key Storage & Router
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

        {/* Passphrase & Unlock Banner */}
        <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Vault Passphrase {hasEncrypted && !isUnlocked && '(Required to Unlock)'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter passphrase for 256-bit AES encryption..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {hasEncrypted && !isUnlocked ? (
                <button
                  onClick={handleUnlock}
                  disabled={loading}
                  className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-sm transition-all"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Vault</span>
                </button>
              ) : (
                <button
                  onClick={handleSaveAndEncrypt}
                  disabled={loading}
                  className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-sm transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Encrypt & Save</span>
                </button>
              )}
            </div>
          </div>

          {/* Alert Messages */}
          {errorMessage && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Main Body */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-y-auto md:overflow-hidden">
          {/* Exchange Selector Sidebar */}
          <div className="w-full md:w-56 bg-gray-50/50 border-b md:border-b-0 md:border-r border-gray-200 p-3 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible shrink-0 gap-2 md:gap-1">
            <p className="hidden md:block px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Connectors</p>
            {exchanges.map((ex) => {
              const status = statuses[ex.id];
              const isActive = activeTab === ex.id;
              return (
                <button
                  key={ex.id}
                  onClick={() => setActiveTab(ex.id)}
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
                      status.status === 'connected'
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
                    REST & WebSocket API Authorization Keys
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${
                      statuses[activeTab].status === 'connected'
                        ? 'bg-green-100 text-green-800'
                        : statuses[activeTab].status === 'testing'
                        ? 'bg-amber-100 text-amber-800'
                        : statuses[activeTab].status === 'auth_failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {statuses[activeTab].status}
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

              {/* Input Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                    API Key
                  </label>
                  <input
                    type="text"
                    value={credentials[activeTab]?.apiKey || ''}
                    onChange={(e) =>
                      setCredentials((prev) => ({
                        ...prev,
                        [activeTab]: { ...prev[activeTab]!, apiKey: e.target.value },
                      }))
                    }
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
                    value={credentials[activeTab]?.apiSecret || ''}
                    onChange={(e) =>
                      setCredentials((prev) => ({
                        ...prev,
                        [activeTab]: { ...prev[activeTab]!, apiSecret: e.target.value },
                      }))
                    }
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
                      value={credentials.coinbase?.passphrase || ''}
                      onChange={(e) =>
                        setCredentials((prev) => ({
                          ...prev,
                          coinbase: { ...prev.coinbase!, passphrase: e.target.value },
                        }))
                      }
                      placeholder="Coinbase Passphrase..."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-xs text-gray-900 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {statuses[activeTab].latencyMs !== undefined && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between text-xs">
                  <span className="text-gray-500">Ping Latency</span>
                  <span className="font-mono font-bold text-green-600">
                    {statuses[activeTab].latencyMs} ms
                  </span>
                </div>
              )}

              {statuses[activeTab].errorMessage && (
                <p className="text-xs text-red-600 font-mono bg-red-50 p-2 rounded border border-red-200">
                  {statuses[activeTab].errorMessage}
                </p>
              )}
            </div>

            {hasEncrypted && (
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">Persistent storage enabled</span>
                <button
                  onClick={handleClearAll}
                  className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors"
                >
                  Clear All Keys
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
