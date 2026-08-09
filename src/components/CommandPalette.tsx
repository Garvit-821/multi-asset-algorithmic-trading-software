import { useState, useEffect, useRef } from 'react';
import {
  Search,
  LayoutDashboard,
  TrendingUp,
  BrainCircuit,
  Calculator,
  History,
  Sliders,
  Bell,
  Settings,
  Zap,
  ArrowRight,
  Sparkles,
  Command,
  X,
  Layers,
  Repeat
} from 'lucide-react';

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Navigation' | 'Assets' | 'Quick Actions' | 'Settings';
  icon: React.ElementType;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle?: () => void;
  onNavigate: (view: string) => void;
  onSelectAsset?: (symbol: string) => void;
}

export function CommandPalette({ isOpen, onClose, onToggle, onNavigate, onSelectAsset }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global key listener for Ctrl+K / Cmd+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K' || e.code === 'KeyK')) {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else if (onToggle) {
          onToggle();
        }
      } else if ((e.key === 'Escape' || e.key === 'Esc') && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onToggle]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const commands: CommandItem[] = [
    // Navigation
    { id: 'nav-dash', title: 'Market Overview Dashboard', subtitle: 'Live tickers, charts & order book', category: 'Navigation', icon: LayoutDashboard, action: () => { onNavigate('trading'); onClose(); } },
    { id: 'nav-backtest', title: 'High-Fidelity Backtester', subtitle: 'Slippage, latency & Monte Carlo risk engine', category: 'Navigation', icon: History, action: () => { onNavigate('backtest'); onClose(); } },
    { id: 'nav-options', title: 'Derivatives & Black-Scholes Dashboard', subtitle: 'Greeks, Option Chains & Volatility Surfaces', category: 'Navigation', icon: Calculator, action: () => { onNavigate('derivatives'); onClose(); } },
    { id: 'nav-copilot', title: 'AI Market Intelligence Hub', subtitle: 'Gemini Copilot, Correlation & Grid Search', category: 'Navigation', icon: BrainCircuit, action: () => { onNavigate('intelligence'); onClose(); } },
    { id: 'nav-paper', title: 'Paper Trading Simulator', subtitle: 'Execute simulated live orders with $100k cash', category: 'Navigation', icon: Zap, action: () => { onNavigate('paper'); onClose(); } },
    { id: 'nav-visual', title: 'Visual Strategy Builder', subtitle: 'Drag & drop block logic strategy creator', category: 'Navigation', icon: Layers, action: () => { onNavigate('visualbuilder'); onClose(); } },
    { id: 'nav-optimizer', title: 'Portfolio Optimizer', subtitle: 'Markowitz Efficient Frontier & Sharpe Ratio', category: 'Navigation', icon: Sliders, action: () => { onNavigate('optimizer'); onClose(); } },
    { id: 'nav-replay', title: 'Market Replay Simulator', subtitle: 'Historical tick playback & practice trades', category: 'Navigation', icon: Repeat, action: () => { onNavigate('replay'); onClose(); } },
    { id: 'nav-sentiment', title: 'Social & News Sentiment', subtitle: 'NLP sentiment scoring across Crypto & Stocks', category: 'Navigation', icon: Sparkles, action: () => { onNavigate('sentiment'); onClose(); } },
    { id: 'nav-alerts', title: 'Alerts & Signal Manager', subtitle: 'Telegram price crossing & alert rules', category: 'Navigation', icon: Bell, action: () => { onNavigate('alerts'); onClose(); } },
    { id: 'nav-settings', title: 'Settings & API Keys', subtitle: 'Gemini AI API Key, Telegram ID & Account', category: 'Navigation', icon: Settings, action: () => { onNavigate('settings'); onClose(); } },

    // Assets
    { id: 'asset-btc', title: 'BTC/USDT — Bitcoin', subtitle: 'Crypto • Spot / Derivatives', category: 'Assets', icon: TrendingUp, action: () => { onSelectAsset?.('BTC/USDT'); onNavigate('trading'); onClose(); } },
    { id: 'asset-eth', title: 'ETH/USDT — Ethereum', subtitle: 'Crypto • Spot / Derivatives', category: 'Assets', icon: TrendingUp, action: () => { onSelectAsset?.('ETH/USDT'); onNavigate('trading'); onClose(); } },
    { id: 'asset-sol', title: 'SOL/USDT — Solana', subtitle: 'Crypto • High Beta', category: 'Assets', icon: TrendingUp, action: () => { onSelectAsset?.('SOL/USDT'); onNavigate('trading'); onClose(); } },
    { id: 'asset-aapl', title: 'AAPL — Apple Inc.', subtitle: 'Equity • Nasdaq GS', category: 'Assets', icon: TrendingUp, action: () => { onSelectAsset?.('AAPL'); onNavigate('trading'); onClose(); } },
    { id: 'asset-nvda', title: 'NVDA — NVIDIA Corp.', subtitle: 'Equity • Semiconductor', category: 'Assets', icon: TrendingUp, action: () => { onSelectAsset?.('NVDA'); onNavigate('trading'); onClose(); } },
    { id: 'asset-gold', title: 'GOLD — Gold Spot', subtitle: 'Commodity • Metal Hedge', category: 'Assets', icon: TrendingUp, action: () => { onSelectAsset?.('GOLD'); onNavigate('trading'); onClose(); } },
  ];

  const filteredCommands = commands.filter(item => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] divide-y divide-slate-100"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header Input */}
        <div className="relative flex items-center px-4 py-3.5 bg-slate-50/80">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search views, assets (BTC, ETH, AAPL), or actions... (Esc to close)"
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm sm:text-base font-medium focus:outline-none"
          />
          <div className="flex items-center space-x-1 ml-2 shrink-0">
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-200/70 rounded">ESC</span>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 divide-y divide-slate-50">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No results found for <span className="font-semibold text-slate-600">"{query}"</span>
            </div>
          ) : (
            filteredCommands.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs sm:text-sm font-semibold truncate flex items-center space-x-2">
                        <span>{item.title}</span>
                      </div>
                      {item.subtitle && (
                        <div className={`text-[11px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.category}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-300'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2 bg-slate-50 flex items-center justify-between text-[11px] text-slate-400 font-medium border-t border-slate-100">
          <div className="flex items-center space-x-3">
            <span><strong className="text-slate-600">↑↓</strong> Navigate</span>
            <span><strong className="text-slate-600">↵</strong> Select</span>
          </div>
          <div className="flex items-center space-x-1">
            <Command className="w-3 h-3" />
            <span>+ K</span>
          </div>
        </div>
      </div>
    </div>
  );
}
