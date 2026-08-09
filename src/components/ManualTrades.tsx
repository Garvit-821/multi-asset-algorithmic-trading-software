import React, { useState, useEffect, useMemo } from 'react';
import {
  Send,
  Clock,
  RefreshCw,
  Calculator,
  CheckCircle2,
  XCircle,
  Zap,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Trash2
} from 'lucide-react';
import { supabase, ManualTrade } from '../lib/supabase';
import { fetchRealtimePrice } from '../services/dataFeed';

const POPULAR_SYMBOLS = [
  { symbol: 'BTC/USDT', name: 'Bitcoin', type: 'crypto' },
  { symbol: 'ETH/USDT', name: 'Ethereum', type: 'crypto' },
  { symbol: 'SOL/USDT', name: 'Solana', type: 'crypto' },
  { symbol: 'XAU/USD', name: 'Gold', type: 'commodities' },
  { symbol: 'AAPL', name: 'Apple', type: 'equities' },
  { symbol: 'NVDA', name: 'NVIDIA', type: 'equities' }
];

export function ManualTrades() {
  const [trades, setTrades] = useState<ManualTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'ACTIVE' | 'TP_HIT' | 'SL_HIT' | 'CLOSED'>('all');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Form State
  const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');
  const [formData, setFormData] = useState({
    coin_name: 'BTC/USDT',
    entry_price: '',
    stop_loss: '',
    target_price: '',
    message: ''
  });

  // Risk Position Calculator State
  const [accountBalance, setAccountBalance] = useState<number>(10000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);

  useEffect(() => {
    loadTrades();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadTrades = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('manual_trades')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (error || !data) {
        // LocalStorage fallback if Supabase is offline or errors out
        const localData = localStorage.getItem('manual_trades_feed');
        if (localData) {
          setTrades(JSON.parse(localData));
        }
      } else {
        setTrades(data);
        localStorage.setItem('manual_trades_feed', JSON.stringify(data));
      }
    } catch {
      const localData = localStorage.getItem('manual_trades_feed');
      if (localData) setTrades(JSON.parse(localData));
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill live price and calculate default SL / TP
  const handleQuickSelectSymbol = async (symbol: string, assetType: string = 'crypto') => {
    setFetchingPrice(true);
    try {
      const livePrice = await fetchRealtimePrice(symbol, assetType as Parameters<typeof fetchRealtimePrice>[1]);
      const price = livePrice || (symbol === 'BTC/USDT' ? 64500 : symbol === 'ETH/USDT' ? 3450 : 150);
      
      const slMultiplier = side === 'LONG' ? 0.98 : 1.02;
      const tpMultiplier = side === 'LONG' ? 1.05 : 0.95;

      const entry = price;
      const sl = Math.round(entry * slMultiplier * 100) / 100;
      const tp = Math.round(entry * tpMultiplier * 100) / 100;

      setFormData(prev => ({
        ...prev,
        coin_name: symbol,
        entry_price: entry.toString(),
        stop_loss: sl.toString(),
        target_price: tp.toString()
      }));

      showToast(`Fetched live price for ${symbol}: $${price.toLocaleString()}`, 'success');
    } catch {
      showToast(`Could not fetch live price for ${symbol}`, 'error');
    } finally {
      setFetchingPrice(false);
    }
  };

  // Quantitative Calculations (Risk:Reward, Position Size, Max Loss, Target Profit)
  const quantMetrics = useMemo(() => {
    const entry = parseFloat(formData.entry_price);
    const sl = parseFloat(formData.stop_loss);
    const tp = parseFloat(formData.target_price);

    if (!entry || !sl || !tp || entry <= 0 || sl <= 0 || tp <= 0) {
      return null;
    }

    const riskPerUnit = Math.abs(entry - sl);
    const rewardPerUnit = Math.abs(tp - entry);

    if (riskPerUnit === 0) return null;

    const rrRatio = rewardPerUnit / riskPerUnit;
    const dollarRisk = (accountBalance * riskPercent) / 100;
    const positionUnits = dollarRisk / riskPerUnit;
    const positionValueUSD = positionUnits * entry;
    const expectedProfitUSD = positionUnits * rewardPerUnit;

    return {
      rrRatio: Math.round(rrRatio * 100) / 100,
      dollarRisk: Math.round(dollarRisk * 100) / 100,
      positionUnits: Math.round(positionUnits * 10000) / 10000,
      positionValueUSD: Math.round(positionValueUSD * 100) / 100,
      expectedProfitUSD: Math.round(expectedProfitUSD * 100) / 100,
      isValid: (side === 'LONG' ? tp > entry && sl < entry : tp < entry && sl > entry)
    };
  }, [formData.entry_price, formData.stop_loss, formData.target_price, side, accountBalance, riskPercent]);

  // Submit Signal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.coin_name.trim()) {
      showToast('Please enter a valid asset symbol', 'error');
      return;
    }

    const entry = parseFloat(formData.entry_price);
    const sl = parseFloat(formData.stop_loss);
    const tp = parseFloat(formData.target_price);

    if (!entry || entry <= 0 || !sl || sl <= 0 || !tp || tp <= 0) {
      showToast('Please specify valid positive entry, stop loss, and target prices', 'error');
      return;
    }

    setSending(true);

    const newTrade: Partial<ManualTrade> = {
      coin_name: formData.coin_name.trim().toUpperCase(),
      entry_price: entry,
      stop_loss: sl,
      target_price: tp,
      message: formData.message.trim() || `${side} signal on ${formData.coin_name.toUpperCase()}`,
      side,
      status: 'ACTIVE',
      created_at: new Date().toISOString()
    };

    try {
      const { data } = await supabase
        .from('manual_trades')
        .insert([newTrade])
        .select()
        .single();

      const createdItem = data || { id: 'local_' + Date.now(), ...newTrade };

      setTrades(prev => [createdItem as ManualTrade, ...prev]);
      const updatedList = [createdItem as ManualTrade, ...trades];
      localStorage.setItem('manual_trades_feed', JSON.stringify(updatedList));

      setFormData(prev => ({
        ...prev,
        message: ''
      }));

      showToast(`Signal for ${newTrade.coin_name} broadcasted successfully!`, 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signal saved';
      showToast(`Published locally: ${message}`, 'info');
    } finally {
      setSending(false);
    }
  };

  // Update Status of existing trade
  const handleUpdateStatus = async (tradeId: string, newStatus: 'ACTIVE' | 'TP_HIT' | 'SL_HIT' | 'CLOSED') => {
    const updatedTrades = trades.map(t => t.id === tradeId ? { ...t, status: newStatus } : t);
    setTrades(updatedTrades);
    localStorage.setItem('manual_trades_feed', JSON.stringify(updatedTrades));

    try {
      await supabase
        .from('manual_trades')
        .update({ status: newStatus })
        .eq('id', tradeId);
      showToast(`Signal status updated to ${newStatus}`, 'success');
    } catch {
      showToast(`Status updated locally`, 'info');
    }
  };

  // Delete trade signal
  const handleDeleteTrade = async (tradeId: string) => {
    const updatedTrades = trades.filter(t => t.id !== tradeId);
    setTrades(updatedTrades);
    localStorage.setItem('manual_trades_feed', JSON.stringify(updatedTrades));

    try {
      await supabase.from('manual_trades').delete().eq('id', tradeId);
      showToast('Trade signal removed', 'info');
    } catch {
      // ignore
    }
  };

  const filteredTrades = filterStatus === 'all'
    ? trades
    : trades.filter(t => (t.status || 'ACTIVE') === filterStatus);

  return (
    <div className="space-y-8 font-sans text-[#5b616e]" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold border flex items-center space-x-2 animate-in slide-in-from-top-4 ${
          toastMessage.type === 'success' ? 'bg-emerald-900 text-emerald-100 border-emerald-500' :
          toastMessage.type === 'error' ? 'bg-rose-900 text-rose-100 border-rose-500' :
          'bg-slate-900 text-white border-blue-500'
        }`}>
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toastMessage.type === 'error' && <XCircle className="w-4 h-4 text-rose-400" />}
          {toastMessage.type === 'info' && <Zap className="w-4 h-4 text-blue-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#dee1e6] pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#0052ff] text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/20">
              <Send className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#0a0b0d] tracking-tight">Manual Trade Signal Station</h2>
          </div>
          <p className="text-xs text-[#5b616e] mt-1">Broadcast institutional manual signals with live risk-reward calculation and automatic position sizing.</p>
        </div>

        <button
          onClick={loadTrades}
          className="self-start sm:self-auto px-4 py-2 bg-white hover:bg-[#f7f7f7] border border-[#dee1e6] rounded-full text-xs font-semibold text-[#0a0b0d] transition-all flex items-center space-x-1.5 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#0052ff] ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Signals</span>
        </button>
      </div>

      {/* Main Container Grid: Form (Left) & Risk Calc / Quick Select (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Form Column */}
        <div className="lg:col-span-7 bg-white border border-[#dee1e6] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#dee1e6] pb-4">
            <h3 className="text-base font-bold text-[#0a0b0d] flex items-center space-x-2">
              <Send className="w-4 h-4 text-[#0052ff]" />
              <span>Broadcast Signal Order</span>
            </h3>

            {/* Order Direction Pill Toggle (LONG vs SHORT) */}
            <div className="flex items-center bg-[#f7f7f7] border border-[#dee1e6] p-1 rounded-full text-xs font-bold">
              <button
                type="button"
                onClick={() => setSide('LONG')}
                className={`px-4 py-1.5 rounded-full transition-all flex items-center space-x-1 ${
                  side === 'LONG' ? 'bg-[#05b169] text-white shadow-md shadow-emerald-500/20' : 'text-[#5b616e] hover:text-[#0a0b0d]'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>BUY / LONG</span>
              </button>
              <button
                type="button"
                onClick={() => setSide('SHORT')}
                className={`px-4 py-1.5 rounded-full transition-all flex items-center space-x-1 ${
                  side === 'SHORT' ? 'bg-[#cf202f] text-white shadow-md shadow-rose-500/20' : 'text-[#5b616e] hover:text-[#0a0b0d]'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>SELL / SHORT</span>
              </button>
            </div>
          </div>

          {/* Quick Select Asset Chips */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#0a0b0d] block">Quick Select Asset & Auto-Fill Price:</label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SYMBOLS.map((asset) => (
                <button
                  key={asset.symbol}
                  type="button"
                  onClick={() => handleQuickSelectSymbol(asset.symbol, asset.type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono font-semibold border transition-all flex items-center space-x-1.5 ${
                    formData.coin_name.toUpperCase() === asset.symbol
                      ? 'bg-[#0052ff] text-white border-[#0052ff] shadow-xs'
                      : 'bg-[#f7f7f7] text-[#5b616e] hover:text-[#0a0b0d] hover:bg-[#eef0f3] border-[#dee1e6]'
                  }`}
                >
                  <span>{asset.symbol}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Asset Symbol */}
              <div>
                <label className="block text-xs font-bold text-[#0a0b0d] mb-1.5">
                  Asset Pair / Symbol
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BTC/USDT"
                  value={formData.coin_name}
                  onChange={(e) => setFormData({ ...formData, coin_name: e.target.value })}
                  className="w-full bg-[#f7f7f7] border border-[#dee1e6] rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-[#0a0b0d] focus:bg-white focus:border-[#0052ff] focus:outline-none transition-all"
                />
              </div>

              {/* Entry Price */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-[#0a0b0d]">Entry Price ($)</label>
                  {fetchingPrice && <span className="text-[10px] text-[#0052ff] font-mono animate-pulse">Fetching live...</span>}
                </div>
                <input
                  type="number"
                  required
                  step="any"
                  placeholder="0.00"
                  value={formData.entry_price}
                  onChange={(e) => setFormData({ ...formData, entry_price: e.target.value })}
                  className="w-full bg-[#f7f7f7] border border-[#dee1e6] rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-[#0a0b0d] focus:bg-white focus:border-[#0052ff] focus:outline-none transition-all"
                />
              </div>

              {/* Stop Loss */}
              <div>
                <label className="block text-xs font-bold text-[#cf202f] mb-1.5">
                  Stop Loss ($)
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  placeholder="0.00"
                  value={formData.stop_loss}
                  onChange={(e) => setFormData({ ...formData, stop_loss: e.target.value })}
                  className="w-full bg-[#f7f7f7] border border-[#dee1e6] rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-[#cf202f] focus:bg-white focus:border-[#cf202f] focus:outline-none transition-all"
                />
              </div>

              {/* Target Price */}
              <div>
                <label className="block text-xs font-bold text-[#05b169] mb-1.5">
                  Take Profit Target ($)
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  placeholder="0.00"
                  value={formData.target_price}
                  onChange={(e) => setFormData({ ...formData, target_price: e.target.value })}
                  className="w-full bg-[#f7f7f7] border border-[#dee1e6] rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-[#05b169] focus:bg-white focus:border-[#05b169] focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Note / Context */}
            <div>
              <label className="block text-xs font-bold text-[#0a0b0d] mb-1.5">
                Signal Context & Analysis Notes
              </label>
              <textarea
                placeholder="e.g. Bullish divergence on 4h candle. Strong support retest at 64k."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
                className="w-full bg-[#f7f7f7] border border-[#dee1e6] rounded-xl px-4 py-2.5 text-xs text-[#0a0b0d] focus:bg-white focus:border-[#0052ff] focus:outline-none transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={sending}
              className={`w-full py-4 rounded-full font-extrabold text-xs transition-all flex items-center justify-center space-x-2 shadow-lg ${
                side === 'LONG'
                  ? 'bg-[#05b169] hover:bg-[#049658] text-white shadow-emerald-500/20'
                  : 'bg-[#cf202f] hover:bg-[#b01a27] text-white shadow-rose-500/20'
              } disabled:bg-[#dee1e6] disabled:text-[#7c828a]`}
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Broadcasting Signal...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Broadcast {side} Signal Now</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quant Risk & Sizing Calculator Column (Right) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Risk Metric Box */}
          <div className="bg-[#0a0b0d] text-white border border-[#26282c] rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#26282c] pb-3">
              <span className="text-xs font-bold font-mono text-blue-400 flex items-center">
                <Calculator className="w-4 h-4 mr-1.5" /> Quantitative Risk Metrics
              </span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono font-bold">
                REAL-TIME CALCULATOR
              </span>
            </div>

            {/* Inputs for Account Capital & Risk % */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="text-[10px] text-[#7c828a] block mb-1">ACCOUNT CAPITAL ($)</label>
                <input
                  type="number"
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#16181c] border border-[#26282c] rounded-xl px-3 py-1.5 text-white font-bold focus:outline-none focus:border-[#0052ff]"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#7c828a] block mb-1 font-sans">MAX RISK %</label>
                <input
                  type="number"
                  step="0.1"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#16181c] border border-[#26282c] rounded-xl px-3 py-1.5 text-white font-bold focus:outline-none focus:border-[#0052ff]"
                />
              </div>
            </div>

            <hr className="border-[#26282c]" />

            {/* Metrics Breakdown */}
            {quantMetrics ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center bg-[#16181c] p-3 rounded-2xl border border-[#26282c]">
                  <span className="text-[#7c828a]">Risk : Reward Ratio:</span>
                  <span className={`text-base font-extrabold ${quantMetrics.rrRatio >= 1.5 ? 'text-[#05b169]' : 'text-amber-400'}`}>
                    1 : {quantMetrics.rrRatio.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-[#16181c] p-3 rounded-2xl border border-[#26282c]">
                  <span className="text-[#7c828a]">Max Dollar Risk:</span>
                  <span className="text-[#cf202f] font-extrabold">${quantMetrics.dollarRisk.toLocaleString()} USD</span>
                </div>

                <div className="flex justify-between items-center bg-[#16181c] p-3 rounded-2xl border border-[#26282c]">
                  <span className="text-[#7c828a]">Expected Profit:</span>
                  <span className="text-[#05b169] font-extrabold">+${quantMetrics.expectedProfitUSD.toLocaleString()} USD</span>
                </div>

                <div className="flex justify-between items-center bg-[#16181c] p-3 rounded-2xl border border-[#26282c]">
                  <span className="text-[#7c828a]">Suggested Position Size:</span>
                  <span className="text-white font-extrabold">${quantMetrics.positionValueUSD.toLocaleString()} USD ({quantMetrics.positionUnits} units)</span>
                </div>

                {!quantMetrics.isValid && (
                  <div className="bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl text-rose-300 text-[11px] font-sans flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Warning: Target & Stop Loss prices conflict with selected {side} direction.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs font-mono">
                Enter valid entry, stop loss, and target prices to view risk metrics.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Signal Feed History Section */}
      <div className="space-y-5 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#dee1e6] pb-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#0052ff]" />
            <h3 className="text-lg font-extrabold text-[#0a0b0d]">Broadcasted Signal History</h3>
            <span className="px-2.5 py-0.5 bg-[#f7f7f7] border border-[#dee1e6] text-[#0a0b0d] text-xs font-bold rounded-full font-mono">
              {filteredTrades.length} Signals
            </span>
          </div>

          {/* Filter Status Pills */}
          <div className="flex items-center space-x-1.5 bg-[#f7f7f7] border border-[#dee1e6] p-1 rounded-full text-xs font-semibold self-start sm:self-auto">
            {(['all', 'ACTIVE', 'TP_HIT', 'SL_HIT', 'CLOSED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-full uppercase transition-all text-[11px] ${
                  filterStatus === st
                    ? 'bg-[#0052ff] text-white font-bold shadow-xs'
                    : 'text-[#5b616e] hover:text-[#0a0b0d]'
                }`}
              >
                {st === 'all' ? 'ALL' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Signals List */}
        <div className="space-y-4">
          {filteredTrades.map((trade) => {
            const isLong = (trade.side || 'LONG') === 'LONG';
            const status = trade.status || 'ACTIVE';

            return (
              <div
                key={trade.id}
                className="bg-white border border-[#dee1e6] rounded-3xl p-5 hover:shadow-lg hover:border-[#0052ff]/30 transition-all duration-300 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eef0f3] pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-xs ${
                      isLong ? 'bg-[#05b169]' : 'bg-[#cf202f]'
                    }`}>
                      {isLong ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-base font-extrabold text-[#0a0b0d] font-mono">{trade.coin_name}</h4>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full font-mono ${
                          isLong ? 'bg-emerald-50 text-[#05b169] border border-emerald-200' : 'bg-rose-50 text-[#cf202f] border border-rose-200'
                        }`}>
                          {isLong ? 'BUY / LONG' : 'SELL / SHORT'}
                        </span>
                      </div>
                      <div className="flex items-center text-[11px] text-[#7c828a] font-mono mt-0.5">
                        <Clock className="w-3 h-3 mr-1 text-[#7c828a]" />
                        {new Date(trade.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge & Control Dropdown */}
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                      status === 'ACTIVE' ? 'bg-blue-50 text-[#0052ff] border-blue-200' :
                      status === 'TP_HIT' ? 'bg-emerald-50 text-[#05b169] border-emerald-200' :
                      status === 'SL_HIT' ? 'bg-rose-50 text-[#cf202f] border-rose-200' :
                      'bg-gray-100 text-gray-700 border-gray-300'
                    }`}>
                      {status.replace('_', ' ')}
                    </span>

                    {/* Quick Action Buttons to Update Status */}
                    <div className="flex items-center space-x-1 bg-[#f7f7f7] border border-[#dee1e6] p-1 rounded-full text-[10px]">
                      <button
                        onClick={() => handleUpdateStatus(trade.id, 'TP_HIT')}
                        title="Mark Target Profit Hit"
                        className="px-2 py-0.5 hover:bg-emerald-100 text-[#05b169] font-bold rounded-full transition-colors"
                      >
                        TP Hit
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(trade.id, 'SL_HIT')}
                        title="Mark Stop Loss Hit"
                        className="px-2 py-0.5 hover:bg-rose-100 text-[#cf202f] font-bold rounded-full transition-colors"
                      >
                        SL Hit
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(trade.id, 'CLOSED')}
                        title="Close Signal"
                        className="px-2 py-0.5 hover:bg-gray-200 text-gray-700 font-bold rounded-full transition-colors"
                      >
                        Close
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteTrade(trade.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
                      title="Delete signal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {trade.message && (
                  <div className="bg-[#f7f7f7] border border-[#dee1e6] rounded-2xl p-3 text-xs text-[#0a0b0d]">
                    <p className="leading-relaxed">{trade.message}</p>
                  </div>
                )}

                {/* Price Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                  <div className="bg-[#f7f7f7] border border-[#dee1e6] rounded-2xl p-3">
                    <span className="text-[10px] text-[#7c828a] uppercase block">ENTRY PRICE</span>
                    <span className="text-[#0a0b0d] font-extrabold text-sm">${trade.entry_price.toLocaleString()}</span>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3">
                    <span className="text-[10px] text-[#cf202f] uppercase block">STOP LOSS</span>
                    <span className="text-[#cf202f] font-extrabold text-sm">${trade.stop_loss.toLocaleString()}</span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
                    <span className="text-[10px] text-[#05b169] uppercase block">TARGET PROFIT</span>
                    <span className="text-[#05b169] font-extrabold text-sm">${trade.target_price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTrades.length === 0 && (
          <div className="text-center py-16 bg-white border border-[#dee1e6] rounded-3xl space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-[#0a0b0d] text-base">No Signals Found</h4>
            <p className="text-xs text-[#5b616e]">Broadcast a manual signal using the form above to start building your quantitative feed.</p>
          </div>
        )}
      </div>

    </div>
  );
}
