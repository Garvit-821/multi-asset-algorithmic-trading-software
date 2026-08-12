import React from 'react';
import { Lock, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PlanId, PLANS } from '../../services/subscriptionService';

interface LockedFeatureGuardProps {
  viewName: string;
  requiredPlanId: PlanId;
  currentPlanId: PlanId;
  onOpenCheckout: (planId: PlanId) => void;
  onNavigateHome: () => void;
}

const VIEW_FEATURE_DESCRIPTIONS: Record<string, { title: string; subtitle: string; bullets: string[] }> = {
  intelligence: {
    title: 'AI Market Intelligence Hub',
    subtitle: 'Real-time contextual market analysis and automated strategy synthesis powered by Google Gemini 3.5 / 2.5 API.',
    bullets: [
      'Natural language technical indicator explanation & signal breakdown',
      'Automated momentum, support, and resistance analysis',
      'Persistent floating AI Copilot drawer across all screens',
      'Custom LLM prompt sandbox for algorithmic trade validation',
    ],
  },
  derivatives: {
    title: 'Options & Derivatives Matrix',
    subtitle: 'Black-Scholes analytical options pricing engine and full 5-Greek risk sensitivity matrix.',
    bullets: [
      'Call & Put theoretical fair value calculation (Abramowitz & Stegun polynomial)',
      'Real-time Delta (Δ), Gamma (Γ), Theta (Θ), Vega (ν), and Rho (ρ) matrix',
      'Strike price chain matrix across multiple DTE expirations',
      'Options strategy payout simulator & breakeven calculator',
    ],
  },
  backtest: {
    title: 'Advanced Strategy Backtester & Replay',
    subtitle: 'Test quantitative technical indicator rules against historical OHLCV kline datasets.',
    bullets: [
      'Sharpe Ratio, Sortino Ratio, and Max Drawdown calculation',
      'Tick-by-tick visual market replay engine at 1x to 10x speeds',
      'Equity curve generation and trade execution logs',
      'Parametric parameter optimization grid',
    ],
  },
  visualbuilder: {
    title: 'No-Code Visual Strategy Builder',
    subtitle: 'Construct complex quantitative entry/exit pipelines with interactive drag-and-drop node blocks.',
    bullets: [
      'RSI, MACD, Bollinger Bands, and Moving Crossover trigger nodes',
      'Risk management blocks: Dynamic Stop Loss & Take Profit targets',
      'Automated strategy code generation & export',
      'Visual pipeline execution simulator',
    ],
  },
  optimizer: {
    title: 'Markowitz Efficient Frontier & Monte Carlo Risk',
    subtitle: 'Stochastic portfolio capital allocation & Parametric Value at Risk (VaR 95% & 99%) engine.',
    bullets: [
      'Markowitz modern portfolio theory efficient frontier optimization',
      '1,000+ stochastic path Monte Carlo asset price simulations',
      'Parametric Value at Risk (VaR 95% & 99%) stress testing',
      'Multi-asset covariance & correlation matrix',
    ],
  },
  replay: {
    title: 'Tick-by-Tick Market Replay Engine',
    subtitle: 'Play back past market volatility tick-by-tick to refine quantitative discretionary decisions.',
    bullets: [
      'Historical candle speed controls (1x, 2x, 5x, 10x)',
      'Simulated order placement against historical order books',
      'Detailed PnL timeline tracking',
    ],
  },
  sentiment: {
    title: 'Social Sentiment & Pulse Engine',
    subtitle: 'Track crypto and market social sentiment indicators and volume momentum.',
    bullets: [
      'Social sentiment score aggregation',
      'Fear & Greed index real-time feed',
      'Trending ticker volume spikes',
    ],
  },
};

export const LockedFeatureGuard: React.FC<LockedFeatureGuardProps> = ({
  viewName,
  requiredPlanId,
  currentPlanId,
  onOpenCheckout,
  onNavigateHome,
}) => {
  const plan = PLANS[requiredPlanId] || PLANS.pro;
  const featureInfo = VIEW_FEATURE_DESCRIPTIONS[viewName] || {
    title: 'Quantitative Alpha Module',
    subtitle: `Access to this high-performance analytical feature requires an active ${plan.name} subscription.`,
    bullets: [
      'Sub-second real-time streaming data feeds',
      'Advanced risk metrics and strategy simulation',
      'Full export capabilities and dedicated support',
    ],
  };

  return (
    <div className="h-full overflow-y-auto flex items-center justify-center p-4 sm:p-8 bg-[#f7f7f7]">
      <div className="bg-white border border-[#dee1e6] rounded-3xl max-w-2xl w-full p-8 sm:p-10 shadow-2xl space-y-8 text-center animate-in zoom-in-95 duration-200 my-auto">

        {/* Lock Icon Header */}
        <div className="space-y-4">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-blue-50 text-[#0052ff] rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-blue-500/10 border border-blue-100">
              <Lock className="w-10 h-10 stroke-[2.2]" />
            </div>
            <span className="absolute -top-2 -right-2 bg-[#0052ff] text-white text-[10px] font-extrabold font-mono px-2.5 py-1 rounded-full shadow-md flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{plan.name.toUpperCase()}</span>
            </span>
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a0b0d] tracking-tight">
              {featureInfo.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#5b616e] leading-relaxed">
              {featureInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Feature Capability Highlights Card */}
        <div className="bg-[#f7f7f7] border border-[#dee1e6] rounded-2xl p-6 text-left space-y-3">
          <span className="text-xs font-extrabold text-[#0a0b0d] uppercase tracking-wider block border-b border-[#dee1e6] pb-2">
            What You'll Unlock with {plan.name}:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {featureInfo.bullets.map((bullet, idx) => (
              <div key={idx} className="flex items-start space-x-2.5 text-xs text-[#0a0b0d]">
                <CheckCircle2 className="w-4 h-4 text-[#05b169] shrink-0 mt-0.5" />
                <span className="font-medium leading-snug">{bullet}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-3 pt-2 max-w-md mx-auto">
          <button
            onClick={() => onOpenCheckout(requiredPlanId)}
            className="w-full py-4 bg-[#0052ff] hover:bg-[#003ecc] text-white rounded-full font-extrabold text-sm transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center space-x-2 group"
          >
            <span>Upgrade to {plan.name} (${plan.annualPrice}/mo)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onNavigateHome}
            className="w-full py-3 bg-white hover:bg-[#f7f7f7] text-[#5b616e] hover:text-[#0a0b0d] rounded-full font-bold text-xs transition-colors border border-[#dee1e6]"
          >
            Return to Free Workspace Feed
          </button>
        </div>

        <p className="text-[11px] text-[#7c828a] font-mono">
          Demo Card Payment Available • Instant Activation • Current Plan: {currentPlanId.toUpperCase()}
        </p>

      </div>
    </div>
  );
};
