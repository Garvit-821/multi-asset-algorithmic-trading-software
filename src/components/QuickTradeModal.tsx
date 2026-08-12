import React, { useState } from 'react';
import { X, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import { paperTradingService } from '../services/paperTradingService';

interface QuickTradeModalProps {
  isOpen: boolean;
  initialType: 'BUY' | 'SELL';
  initialSymbol?: string;
  onClose: () => void;
}

export const QuickTradeModal: React.FC<QuickTradeModalProps> = ({
  isOpen,
  initialType,
  initialSymbol = 'BTC/USDT',
  onClose,
}) => {
  const [type, setType] = useState<'BUY' | 'SELL'>(initialType);
  const [symbol, setSymbol] = useState<string>(initialSymbol);
  const [quantity, setQuantity] = useState<string>('0.1');
  const [executed, setExecuted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const currentPrice = 64520.00; // Mock reference market price

  const getAssetType = (sym: string): 'crypto' | 'forex' | 'stock' | 'commodity' => {
    if (sym.includes('/') && !sym.includes('USD')) return 'crypto';
    if (sym === 'AAPL' || sym === 'NVDA') return 'stock';
    if (sym === 'GOLD') return 'commodity';
    return 'crypto';
  };

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const qtyNum = parseFloat(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError('Please enter a valid order quantity');
      return;
    }

    const assetType = getAssetType(symbol);
    const res = type === 'BUY'
      ? paperTradingService.buyAsset(symbol, assetType, qtyNum, currentPrice)
      : paperTradingService.sellAsset(symbol, assetType, qtyNum, currentPrice);

    if (!res.success) {
      setError(res.error || 'Trade execution failed');
      return;
    }

    setExecuted(true);
    setTimeout(() => {
      setExecuted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn select-none">
      <div
        className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 text-white flex items-center justify-between ${
          type === 'BUY' ? 'bg-gradient-to-r from-emerald-900 to-teal-900' : 'bg-gradient-to-r from-rose-900 to-red-950'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md ${
              type === 'BUY' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}>
              {type === 'BUY' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <span>Quick {type === 'BUY' ? 'Buy' : 'Sell'} Order</span>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">Paper Trade</span>
              </h3>
              <p className="text-xs text-white/80">Market order execution hotkey</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {executed ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900">Order Executed Successfully!</h4>
            <p className="text-xs text-slate-500 font-mono">
              {type} {quantity} {symbol} @ ${currentPrice.toLocaleString()}
            </p>
          </div>
        ) : (
          <form onSubmit={handleExecute} className="p-6 space-y-4">
            {/* Toggle Buy / Sell */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setType('BUY')}
                className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
                  type === 'BUY'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setType('SELL')}
                className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
                  type === 'SELL'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                SELL
              </button>
            </div>

            {/* Asset Symbol Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Asset Pair</label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="BTC/USDT">BTC/USDT (Bitcoin)</option>
                <option value="ETH/USDT">ETH/USDT (Ethereum)</option>
                <option value="SOL/USDT">SOL/USDT (Solana)</option>
                <option value="AAPL">AAPL (Apple Inc.)</option>
                <option value="NVDA">NVDA (NVIDIA)</option>
                <option value="GOLD">GOLD (Gold Spot)</option>
              </select>
            </div>

            {/* Quantity Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label className="font-bold text-slate-700">Order Quantity</label>
                <span className="text-slate-500 font-mono text-[11px]">Price: ${currentPrice.toLocaleString()}</span>
              </div>
              <input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.1"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 py-2.5 text-white text-xs font-extrabold rounded-xl transition-all shadow-md ${
                  type === 'BUY'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                }`}
              >
                Execute Market {type}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
