import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { OptionPayoffPoint, OptionStrategy } from '../../services/blackScholesEngine';

interface StrategyPayoffTabProps {
  strategyType: OptionStrategy;
  setStrategyType: (val: OptionStrategy) => void;
  payoffData: {
    points: OptionPayoffPoint[];
    maxProfit: string;
    maxLoss: string;
    breakEven: string;
  };
  currentSpot: number;
}

export function StrategyPayoffTab({
  strategyType,
  setStrategyType,
  payoffData,
  currentSpot,
}: StrategyPayoffTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900">Multi-Leg Strategy Payoff Profile</h3>
            <p className="text-xs text-gray-500">Visualize net P&L at expiration across multi-leg options combinations.</p>
          </div>

          {/* Strategy Selector */}
          <select
            value={strategyType}
            onChange={(e) => setStrategyType(e.target.value as OptionStrategy)}
            className="px-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:bg-white"
          >
            <option value="long_call">Long Call</option>
            <option value="long_put">Long Put</option>
            <option value="bull_call_spread">Bull Call Spread</option>
            <option value="bear_put_spread">Bear Put Spread</option>
            <option value="straddle">Long Straddle</option>
            <option value="iron_condor">Iron Condor</option>
          </select>
        </div>

        {/* Metrics Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <span className="text-[11px] font-bold text-emerald-700 uppercase block">Max Profit Potential</span>
            <span className="text-base font-extrabold text-emerald-900 font-mono">{payoffData.maxProfit}</span>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
            <span className="text-[11px] font-bold text-rose-700 uppercase block">Max Loss Risk</span>
            <span className="text-base font-extrabold text-rose-900 font-mono">{payoffData.maxLoss}</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <span className="text-[11px] font-bold text-blue-700 uppercase block">Break-Even Threshold</span>
            <span className="text-base font-extrabold text-blue-900 font-mono">{payoffData.breakEven}</span>
          </div>
        </div>

        {/* Recharts Payoff Curve */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={payoffData.points}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis
                dataKey="underlyingPrice"
                tickFormatter={(val) => `$${val}`}
                tick={{ fontSize: 11, fill: '#6b7280' }}
              />
              <YAxis
                tickFormatter={(val) => `$${val}`}
                tick={{ fontSize: 11, fill: '#6b7280' }}
              />
              <Tooltip
                formatter={(value: unknown) => [`$${value}`, 'Net PnL at Expiry']}
                labelFormatter={(label) => `Underlying: $${label}`}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
              />
              <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
              <ReferenceLine x={currentSpot} stroke="#2563eb" strokeDasharray="4 4" label={{ value: 'Current Spot', fill: '#2563eb', fontSize: 10 }} />
              <Area
                type="monotone"
                dataKey="payoffNet"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#profitGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
