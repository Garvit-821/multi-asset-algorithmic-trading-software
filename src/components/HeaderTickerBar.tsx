import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Volume2, VolumeX, Palette, Download } from 'lucide-react';
import { getTerminalTheme, setTerminalTheme, THEME_OPTIONS, TerminalTheme } from '../services/themeService';
import { audioHapticsService } from '../services/audioHapticsService';
import { WorkspacePresetsBar } from './WorkspacePresetsBar';

interface TickerItem {
  symbol: string;
  price: number;
  change24h: number;
  assetType: 'crypto' | 'stock' | 'forex' | 'commodity';
}

const INITIAL_TICKERS: TickerItem[] = [
  { symbol: 'BTC/USDT', price: 64520.50, change24h: +3.42, assetType: 'crypto' },
  { symbol: 'ETH/USDT', price: 3452.10, change24h: +1.85, assetType: 'crypto' },
  { symbol: 'SOL/USDT', price: 154.80, change24h: -0.65, assetType: 'crypto' },
  { symbol: 'AAPL', price: 224.30, change24h: +0.94, assetType: 'stock' },
  { symbol: 'NVDA', price: 121.50, change24h: +4.12, assetType: 'stock' },
  { symbol: 'EUR/USD', price: 1.0854, change24h: -0.12, assetType: 'forex' },
  { symbol: 'GOLD', price: 2412.00, change24h: +0.78, assetType: 'commodity' },
];

interface HeaderTickerBarProps {
  onSelectAsset?: (symbol: string) => void;
  currentView?: string;
  onSelectPreset?: (viewName: string) => void;
}

export function HeaderTickerBar({ onSelectAsset, currentView, onSelectPreset }: HeaderTickerBarProps) {
  const [tickers, setTickers] = useState<TickerItem[]>(INITIAL_TICKERS);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(audioHapticsService.isAudioEnabled());
  const [currentTheme, setCurrentTheme] = useState<TerminalTheme>(getTerminalTheme());
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  // Listen for PWA install prompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      (deferredPrompt as unknown as { prompt: () => void }).prompt();
    } else {
      alert('Stratrade Desktop PWA is ready for installation from your browser address bar.');
    }
  };

  // Subtle real-time tick fluctuation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTickers(prev =>
        prev.map(t => {
          const deltaPct = (Math.random() - 0.49) * 0.15;
          const newPrice = t.price * (1 + deltaPct / 100);
          return {
            ...t,
            price: Number(newPrice.toFixed(t.symbol.includes('USD') && !t.symbol.includes('USDT') ? 4 : 2)),
            change24h: Number((t.change24h + deltaPct * 0.2).toFixed(2))
          };
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    audioHapticsService.setAudioEnabled(next);
    if (next) audioHapticsService.playClickSound();
  };

  const handleThemeChange = (theme: TerminalTheme) => {
    setCurrentTheme(theme);
    setTerminalTheme(theme);
    audioHapticsService.playClickSound();
  };

  return (
    <div className="w-full bg-slate-950 text-slate-300 text-xs border-b border-slate-800/80 px-3 py-1 overflow-x-auto no-scrollbar flex items-center justify-between space-x-4 shrink-0 select-none">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5 shrink-0 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-r border-slate-800 pr-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Markets</span>
        </div>

        <div className="flex items-center space-x-4 min-w-max">
          {tickers.map(t => {
            const isPos = t.change24h >= 0;
            return (
              <button
                key={t.symbol}
                onClick={() => onSelectAsset?.(t.symbol)}
                className="flex items-center space-x-1.5 hover:bg-slate-900 px-2 py-0.5 rounded-lg transition-colors group cursor-pointer"
              >
                <span className="font-bold text-slate-200 text-[11px] group-hover:text-blue-400 transition-colors">
                  {t.symbol}
                </span>
                <span className="font-mono text-[11px] text-slate-300">
                  ${t.price.toLocaleString(undefined, { minimumFractionDigits: t.symbol.includes('USD') && !t.symbol.includes('USDT') ? 4 : 2 })}
                </span>
                <span className={`inline-flex items-center space-x-0.5 font-semibold text-[10px] ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{isPos ? '+' : ''}{t.change24h}%</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Actions: Workspace Layout Presets, Audio Toggle & Theme Selector */}
      <div className="flex items-center space-x-2 shrink-0">
        {currentView && onSelectPreset && (
          <WorkspacePresetsBar currentView={currentView} onSelectPreset={onSelectPreset} />
        )}

        {/* Audio Toggle */}
        <button
          onClick={toggleAudio}
          title={audioEnabled ? 'Audio Feedback Enabled (Click to Mute)' : 'Audio Feedback Muted (Click to Unmute)'}
          className={`p-1.5 rounded-lg border transition-all ${
            audioEnabled
              ? 'bg-blue-600/30 text-blue-300 border-blue-500/40 hover:bg-blue-600/50'
              : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
          }`}
        >
          {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Theme Dropdown Selector */}
        <div className="relative flex items-center">
          <Palette className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
          <select
            value={currentTheme}
            onChange={(e) => handleThemeChange(e.target.value as TerminalTheme)}
            className="pl-7 pr-2 py-1 bg-slate-900 text-slate-200 border border-slate-800 rounded-lg text-xs font-semibold focus:outline-none hover:bg-slate-850 cursor-pointer"
          >
            {THEME_OPTIONS.map(opt => (
              <option key={opt.id} value={opt.id} className="bg-slate-900 text-slate-100">
                {opt.name}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop PWA Install Button */}
        <button
          onClick={handleInstallPWA}
          title="Install Stratrade as Desktop App (PWA)"
          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
        >
          <Download className="w-3 h-3 text-blue-400" />
          <span className="hidden xl:inline">App</span>
        </button>
      </div>
    </div>
  );
}

