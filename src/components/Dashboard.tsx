import { useState, useEffect } from 'react';
import {
  Activity,
  Bell,
  Zap,
  TrendingUp,
  Search,
  Clock,
  ChevronRight,
  Star,
  Plus,
  Megaphone,
  BarChart2,
  ChevronDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Tooltip,
} from 'recharts';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  onNavigate?: (view: string) => void;
  onSelectAsset?: (symbol: string) => void;
  onOpenCommandPalette?: () => void;
}

interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  isStarred: boolean;
  color: string;
  sparkline: number[];
}

interface ActivityLogItem {
  id: string;
  type: 'alert' | 'trade' | 'price' | 'ai' | 'volume';
  title: string;
  subtitle: string;
  time: string;
}

const INITIAL_MOVERS: MarketMover[] = [
  {
    symbol: 'FTM/USDT',
    name: 'Fantom',
    price: 0.0278,
    change24h: 20.94,
    isStarred: true,
    color: '#0052ff',
    sparkline: [20, 22, 24, 23, 27, 31, 35, 38, 42, 45],
  },
  {
    symbol: 'UNI/USDT',
    name: 'Uniswap',
    price: 3.55,
    change24h: -9.76,
    isStarred: true,
    color: '#ff007a',
    sparkline: [50, 48, 45, 42, 40, 38, 35, 33, 31, 30],
  },
  {
    symbol: 'FLOW/USDT',
    name: 'Flow',
    price: 0.0325,
    change24h: 8.83,
    isStarred: true,
    color: '#00ef8b',
    sparkline: [25, 26, 28, 27, 30, 32, 34, 33, 36, 38],
  },
  {
    symbol: 'CRV/USDT',
    name: 'Curve',
    price: 0.2785,
    change24h: 7.44,
    isStarred: true,
    color: '#0052ff',
    sparkline: [18, 19, 21, 20, 23, 25, 26, 28, 29, 31],
  },
  {
    symbol: 'SNX/USDT',
    name: 'Synthetix',
    price: 0.1997,
    change24h: -4.20,
    isStarred: true,
    color: '#00d1ff',
    sparkline: [40, 39, 37, 36, 35, 33, 32, 31, 30, 29],
  },
  {
    symbol: 'ICP/USDT',
    name: 'Internet Computer',
    price: 2.22,
    change24h: -4.11,
    isStarred: true,
    color: '#292a2d',
    sparkline: [35, 34, 33, 32, 30, 29, 28, 27, 26, 25],
  },
  {
    symbol: 'THETA/USDT',
    name: 'Theta Network',
    price: 0.1334,
    change24h: -3.82,
    isStarred: true,
    color: '#2ab8e6',
    sparkline: [28, 27, 26, 25, 24, 23, 22, 21, 20, 19],
  },
  {
    symbol: 'BAT/USDT',
    name: 'Basic Attention',
    price: 0.0625,
    change24h: -3.64,
    isStarred: true,
    color: '#ff5000',
    sparkline: [15, 14, 14, 13, 13, 12, 12, 11, 11, 10],
  },
];

const TICKER_CARDS = [
  { symbol: 'BTC/USDT', price: 63245.12, change: 2.35, icon: '₿', sparkline: [40, 42, 45, 44, 48, 52, 55, 60] },
  { symbol: 'ETH/USDT', price: 3142.89, change: 1.25, icon: 'Ξ', sparkline: [30, 31, 33, 32, 35, 37, 39, 41] },
  { symbol: 'SOL/USDT', price: 145.32, change: -1.42, icon: '◎', sparkline: [45, 43, 41, 42, 40, 38, 37, 36] },
  { symbol: 'BNB/USDT', price: 582.14, change: 0.98, icon: '❖', sparkline: [20, 21, 22, 21, 23, 24, 25, 26] },
  { symbol: 'XRP/USDT', price: 0.5287, change: -0.65, icon: '✕', sparkline: [18, 17, 18, 17, 16, 16, 15, 15] },
];

const DONUT_DATA = [
  { name: 'Price Changes', value: 62, percentage: '48.4%', color: '#0052ff' },
  { name: 'Alerts', value: 32, percentage: '25.0%', color: '#05b169' },
  { name: 'Trades', value: 18, percentage: '14.1%', color: '#7c3aed' },
  { name: 'Updates', value: 16, percentage: '12.5%', color: '#f59e0b' },
];

const ACTIVITY_TIMELINE_DATA = [
  { time: '00:00', value: 12 },
  { time: '06:00', value: 45 },
  { time: '12:00', value: 118 },
  { time: '18:00', value: 85 },
  { time: '24:00', value: 32 },
];

export function Dashboard({ onNavigate, onSelectAsset, onOpenCommandPalette }: DashboardProps) {
  const [stats, setStats] = useState({
    activeAlerts: 0,
    manualTrades: 0,
    avgAccuracy: 91.4,
    totalScanned: 50,
  });

  const [movers, setMovers] = useState<MarketMover[]>(INITIAL_MOVERS);
  const [activities] = useState<ActivityLogItem[]>([
    {
      id: '1',
      type: 'alert',
      title: 'New alert generated',
      subtitle: 'FTM/USDT crossed above 0.027',
      time: '2m ago',
    },
    {
      id: '2',
      type: 'trade',
      title: 'Manual trade broadcasted',
      subtitle: 'ETH/USDT',
      time: '15m ago',
    },
    {
      id: '3',
      type: 'price',
      title: 'Price change',
      subtitle: 'BTC/USDT is up +2.35%',
      time: '1h ago',
    },
    {
      id: '4',
      type: 'ai',
      title: 'AI model update',
      subtitle: 'Accuracy improved to 91.4%',
      time: '3h ago',
    },
    {
      id: '5',
      type: 'alert',
      title: 'New alert generated',
      subtitle: 'SNX/USDT volume spike detected',
      time: '5h ago',
    },
  ]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [alerts, trades, strategies] = await Promise.all([
        supabase.from('strategy_alerts').select('id', { count: 'exact' }),
        supabase.from('manual_trades').select('id', { count: 'exact' }),
        supabase.from('ai_strategies').select('accuracy'),
      ]);

      let avgAcc = 91.4;
      if (strategies.data && strategies.data.length > 0) {
        const validAccuracies = strategies.data
          .map((s: { accuracy: number }) => Number(s.accuracy))
          .filter((a: number) => !isNaN(a) && a > 0);
        if (validAccuracies.length > 0) {
          avgAcc = validAccuracies.reduce((sum: number, val: number) => sum + val, 0) / validAccuracies.length;
        }
      }

      setStats({
        activeAlerts: alerts.count || 0,
        manualTrades: trades.count || 0,
        avgAccuracy: Number(avgAcc.toFixed(1)),
        totalScanned: 50,
      });
    } catch {
      setStats({
        activeAlerts: 0,
        manualTrades: 0,
        avgAccuracy: 91.4,
        totalScanned: 50,
      });
    }
  };

  const toggleStar = (sym: string) => {
    setMovers((prev) =>
      prev.map((m) => (m.symbol === sym ? { ...m, isStarred: !m.isStarred } : m))
    );
  };

  const formatPrice = (val: number) => {
    if (val >= 1000) {
      return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (val >= 1) {
      return `$${val.toFixed(2)}`;
    } else {
      return `$${val.toFixed(4)}`;
    }
  };

  // Inline SVG Micro Sparkline Renderer
  const renderSparkline = (points: number[], color: string) => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 64;
    const height = 24;

    const pathData = points
      .map((p, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const y = height - ((p - min) / range) * (height - 4) - 2;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible shrink-0">
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-8 max-w-7xl mx-auto bg-[#fafbfc] min-h-screen text-[#0a0b0d] font-sans pb-28 md:pb-12">
      {/* ── Top Header Bar with Search & Bell Icon (Profile removed) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0a0b0d]">Dashboard</h1>
          <p className="text-xs sm:text-sm text-[#5b616e] mt-0.5 font-medium">Real-time trading insights and analytics</p>
        </div>

        <div className="flex items-center space-x-3 self-end sm:self-auto">
          {/* Search Markets Command Trigger */}
          <button
            onClick={() => onOpenCommandPalette?.()}
            className="flex items-center space-x-3 px-3.5 py-2 bg-white border border-[#dee1e6] hover:border-blue-500 rounded-2xl shadow-2xs transition-all text-xs text-[#5b616e] hover:text-[#0a0b0d] group min-w-[200px] sm:min-w-[260px]"
          >
            <Search className="w-4 h-4 text-[#7c828a] group-hover:text-[#0052ff] transition-colors" />
            <span className="flex-1 text-left font-medium">Search markets, coins...</span>
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold bg-[#f2f4f7] text-[#5b616e] rounded-md border border-[#dee1e6]">
              ⌘ K
            </kbd>
          </button>

          {/* Notification Bell Badge */}
          <div className="relative">
            <button className="p-2.5 bg-white border border-[#dee1e6] hover:bg-gray-50 rounded-2xl shadow-2xs text-[#5b616e] hover:text-[#0a0b0d] transition-all relative">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#0052ff] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                3
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Top Metric Cards Row (4 Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Monitored Coins */}
        <div className="bg-white border border-[#dee1e6] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-50 text-[#0052ff] rounded-xl border border-blue-100">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs font-semibold text-[#5b616e]">Coins Monitored</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0a0b0d] pt-1 font-mono">
              {stats.totalScanned}
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-bold text-[#0052ff] pt-0.5">
              <Plus className="w-3 h-3" />
              <span>Live scanning</span>
            </div>
          </div>
          <div className="pl-2">
            {renderSparkline([20, 24, 22, 28, 32, 38, 45], '#0052ff')}
          </div>
        </div>

        {/* Card 2: Active Alerts */}
        <div className="bg-white border border-[#dee1e6] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-emerald-50 text-[#05b169] rounded-xl border border-emerald-100">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs font-semibold text-[#5b616e]">Active Alerts</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0a0b0d] pt-1 font-mono">
              {stats.activeAlerts}
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-[#05b169] pt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#05b169]" />
              <span>Auto-generated</span>
            </div>
          </div>
          <div className="pl-2">
            {renderSparkline([15, 18, 22, 20, 26, 30, 35], '#05b169')}
          </div>
        </div>

        {/* Card 3: Manual Trades */}
        <div className="bg-white border border-[#dee1e6] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-50 text-[#7c3aed] rounded-xl border border-purple-100">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs font-semibold text-[#5b616e]">Manual Trades</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0a0b0d] pt-1 font-mono">
              {stats.manualTrades}
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-[#7c3aed] pt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
              <span>Broadcasted</span>
            </div>
          </div>
          <div className="pl-2">
            {renderSparkline([10, 14, 12, 18, 22, 25, 30], '#7c3aed')}
          </div>
        </div>

        {/* Card 4: AI Accuracy */}
        <div className="bg-white border border-[#dee1e6] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-amber-50 text-[#f59e0b] rounded-xl border border-amber-100">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs font-semibold text-[#5b616e]">AI Accuracy</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0a0b0d] pt-1 font-mono">
              {stats.avgAccuracy}%
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-[#f59e0b] pt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
              <span>Strategy average</span>
            </div>
          </div>
          <div className="pl-2">
            {renderSparkline([60, 65, 70, 75, 82, 88, 91], '#f59e0b')}
          </div>
        </div>
      </div>

      {/* ── Main Content Grid: Top Market Movers & Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Top Market Movers */}
        <div className="lg:col-span-6 bg-white border border-[#dee1e6] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-[#dee1e6] pb-3.5">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-[#0052ff]" />
              <h2 className="text-base sm:text-lg font-extrabold text-[#0a0b0d]">Top Market Movers</h2>
            </div>
            <button
              onClick={() => onNavigate?.('trading')}
              className="px-3 py-1.5 bg-[#f2f4f7] hover:bg-[#e4e7ec] text-[#5b616e] hover:text-[#0a0b0d] text-xs font-extrabold rounded-xl transition-all border border-[#dee1e6]"
            >
              View All
            </button>
          </div>

          {/* Movers Table Header */}
          <div className="grid grid-cols-12 gap-2 text-[10px] font-extrabold font-mono text-[#7c828a] uppercase tracking-wider px-2 py-1">
            <div className="col-span-5 flex items-center space-x-4">
              <span>PAIR</span>
            </div>
            <div className="col-span-3 text-right">PRICE</div>
            <div className="col-span-2 text-right">24H CHANGE</div>
            <div className="col-span-2 text-right pr-2">TREND</div>
          </div>

          {/* Movers Table Rows */}
          <div className="space-y-1.5">
            {movers.map((item) => {
              const isPos = item.change24h >= 0;
              return (
                <div
                  key={item.symbol}
                  onClick={() => {
                    onSelectAsset?.(item.symbol);
                    onNavigate?.('trading');
                  }}
                  className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-2xl hover:bg-[#f7f8fa] transition-all cursor-pointer border border-transparent hover:border-[#dee1e6] group"
                >
                  {/* Pair Name & Star */}
                  <div className="col-span-5 flex items-center space-x-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(item.symbol);
                      }}
                      className="text-amber-400 hover:scale-110 transition-transform shrink-0"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          item.isStarred ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                        }`}
                      />
                    </button>

                    {/* Icon Badge */}
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.symbol.charAt(0)}
                    </div>

                    <div className="truncate">
                      <span className="font-extrabold text-xs sm:text-sm text-[#0a0b0d] group-hover:text-[#0052ff] transition-colors block truncate">
                        {item.symbol}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-3 text-right font-mono text-xs sm:text-sm font-bold text-[#0a0b0d]">
                    {formatPrice(item.price)}
                  </div>

                  {/* 24h Change */}
                  <div className="col-span-2 text-right font-mono text-xs font-extrabold">
                    <span className={isPos ? 'text-[#05b169]' : 'text-[#cf202f]'}>
                      {isPos ? '+' : ''}{item.change24h.toFixed(2)}%
                    </span>
                  </div>

                  {/* Micro Sparkline Trend */}
                  <div className="col-span-2 flex justify-end pr-1">
                    {renderSparkline(item.sparkline, isPos ? '#05b169' : '#cf202f')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Recent Activity + Market Activity 24H */}
        <div className="lg:col-span-6 bg-white border border-[#dee1e6] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xs flex flex-col justify-start space-y-4">
          <div className="flex items-center justify-between border-b border-[#dee1e6] pb-3.5">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-[#0052ff]" />
              <h2 className="text-base sm:text-lg font-extrabold text-[#0a0b0d]">Recent Activity</h2>
            </div>
            <button
              onClick={() => onNavigate?.('alerts')}
              className="px-3 py-1.5 bg-[#f2f4f7] hover:bg-[#e4e7ec] text-[#5b616e] hover:text-[#0a0b0d] text-xs font-extrabold rounded-xl transition-all border border-[#dee1e6]"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Activity Stream List */}
            <div className="md:col-span-6 space-y-3">
              {activities.map((act) => (
                <div key={act.id} className="flex items-start space-x-3 text-xs group p-1.5 hover:bg-[#f7f8fa] rounded-xl transition-colors">
                  <div className="mt-0.5 shrink-0">
                    {act.type === 'alert' && (
                      <div className="p-1.5 bg-emerald-50 text-[#05b169] rounded-xl border border-emerald-100">
                        <Bell className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {act.type === 'trade' && (
                      <div className="p-1.5 bg-purple-50 text-[#7c3aed] rounded-xl border border-purple-100">
                        <Megaphone className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {act.type === 'price' && (
                      <div className="p-1.5 bg-emerald-50 text-[#05b169] rounded-xl border border-emerald-100">
                        <TrendingUp className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {act.type === 'ai' && (
                      <div className="p-1.5 bg-amber-50 text-[#f59e0b] rounded-xl border border-amber-100">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-[#0a0b0d] truncate leading-snug">{act.title}</div>
                    <div className="text-[11px] text-[#5b616e] font-medium truncate">{act.subtitle}</div>
                  </div>

                  <div className="text-[10px] font-mono text-[#7c828a] shrink-0 pt-0.5">{act.time}</div>
                </div>
              ))}
            </div>

            {/* Market Activity 24H Donut & Area Chart Card */}
            <div className="md:col-span-6 bg-[#f7f8fa] border border-[#dee1e6] rounded-2xl p-4 space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-[#0a0b0d]">Market Activity (24H)</span>
                <button className="flex items-center space-x-1 text-[11px] font-bold text-[#5b616e] bg-white px-2 py-0.5 rounded-lg border border-[#dee1e6]">
                  <span>24H</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {/* Donut Chart with Center 128 Events Text */}
              <div className="w-28 h-28 relative mx-auto my-1 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={DONUT_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={32}
                      outerRadius={48}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {DONUT_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-base font-extrabold font-mono text-[#0a0b0d] leading-none">128</span>
                  <span className="text-[8px] font-bold text-[#7c828a] uppercase tracking-wider mt-0.5">Total Events</span>
                </div>
              </div>

              {/* Clean Donut Legend List */}
              <div className="space-y-1.5 text-[11px] bg-white p-2.5 rounded-xl border border-[#dee1e6]">
                {DONUT_DATA.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-[#5b616e]">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate font-medium text-[10px]">{item.name}</span>
                    </div>
                    <span className="font-mono font-extrabold text-[#0a0b0d] text-[10px] ml-1">
                      {item.value} <span className="text-[#7c828a] font-normal">({item.percentage})</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Timeline Area Chart below donut */}
              <div className="h-14 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ACTIVITY_TIMELINE_DATA}>
                    <defs>
                      <linearGradient id="dashboardActivityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0052ff" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0052ff" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0a0b0d', color: '#fff', borderRadius: '8px', fontSize: '10px' }}
                      itemStyle={{ color: '#60a5fa' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#0052ff"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#dashboardActivityGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Asset Ticker Slider Bar ── */}
      <div className="bg-white border border-[#dee1e6] rounded-2xl p-3 sm:p-4 shadow-2xs flex items-center justify-between space-x-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-max flex-1">
          {TICKER_CARDS.map((card) => {
            const isPos = card.change >= 0;
            return (
              <button
                key={card.symbol}
                onClick={() => {
                  onSelectAsset?.(card.symbol);
                  onNavigate?.('trading');
                }}
                className="flex items-center space-x-3 bg-[#f7f8fa] hover:bg-blue-50/50 border border-[#dee1e6] hover:border-blue-200 rounded-2xl p-2.5 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-[#dee1e6] flex items-center justify-center text-sm font-bold text-[#0a0b0d] shadow-2xs group-hover:scale-105 transition-transform">
                  {card.icon}
                </div>
                <div>
                  <div className="font-extrabold text-xs text-[#0a0b0d] group-hover:text-[#0052ff] transition-colors">
                    {card.symbol}
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] font-mono">
                    <span className="font-bold text-[#0a0b0d]">${card.price.toLocaleString()}</span>
                    <span className={`font-extrabold ${isPos ? 'text-[#05b169]' : 'text-[#cf202f]'}`}>
                      {isPos ? '+' : ''}{card.change}%
                    </span>
                  </div>
                </div>
                <div className="pl-1">
                  {renderSparkline(card.sparkline, isPos ? '#05b169' : '#cf202f')}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onNavigate?.('trading')}
          className="p-2.5 bg-[#f2f4f7] hover:bg-blue-600 hover:text-white rounded-2xl border border-[#dee1e6] text-[#5b616e] transition-all shrink-0"
          title="Open Trading Terminal"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
