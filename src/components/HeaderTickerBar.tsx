import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
}

export function HeaderTickerBar({ onSelectAsset }: HeaderTickerBarProps) {
  const [tickers, setTickers] = useState<TickerItem[]>(INITIAL_TICKERS);

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

  return (
    <div className="w-full bg-slate-950 text-slate-300 text-xs border-b border-slate-800/80 px-3 py-1.5 overflow-x-auto no-scrollbar flex items-center space-x-6 shrink-0 select-none">
      <div className="flex items-center space-x-1.5 shrink-0 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-r border-slate-800 pr-3">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Live Markets</span>
      </div>

      <div className="flex items-center space-x-6 min-w-max">
        {tickers.map(t => {
          const isPos = t.change24h >= 0;
          return (
            <button
              key={t.symbol}
              onClick={() => onSelectAsset?.(t.symbol)}
              className="flex items-center space-x-2 hover:bg-slate-900 px-2 py-0.5 rounded-lg transition-colors group cursor-pointer"
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
  );
}
