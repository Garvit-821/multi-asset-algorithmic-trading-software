import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, TrendingUp, Bell, Settings, User, Zap, Wallet, Menu, X, Home, Sparkles, Target, History, MessageSquare, Github, Star, BrainCircuit, BarChart2, Calculator } from 'lucide-react';
import { MarketDashboard } from './components/MarketDashboard';
import { AlertsManager } from './components/AlertsManager';
import { Dashboard } from './components/Dashboard';
import { ManualTrades } from './components/ManualTrades';
import { AIStrategyBuilder } from './components/AIStrategyBuilder';
import { UserDashboard } from './components/UserDashboard';
import { PaperTrading } from './components/PaperTrading';
import { LandingPage } from './components/LandingPage';
import { VisualStrategyBuilder } from './components/VisualStrategyBuilder';
import { PortfolioOptimizer } from './components/PortfolioOptimizer';
import { MarketReplay } from './components/MarketReplay';
import { SocialSentiment } from './components/SocialSentiment';
import { AdvancedBacktester } from './components/AdvancedBacktester';
import { AIMarketIntelligence } from './components/AIMarketIntelligence';
import { DerivativesOptionsDashboard } from './components/DerivativesOptionsDashboard';
import { CommandPalette } from './components/CommandPalette';
import { FloatingAICopilotDrawer } from './components/FloatingAICopilotDrawer';
import { HeaderTickerBar } from './components/HeaderTickerBar';
import { paperTradingService } from './services/paperTradingService';
import {
  subscriptionService,
  SubscriptionState,
  PlanId,
  PaymentReceipt,
} from './services/subscriptionService';
import { CheckoutModal } from './components/payment/CheckoutModal';
import { PaymentConfirmationModal } from './components/payment/PaymentConfirmationModal';
import { LockedFeatureGuard } from './components/payment/LockedFeatureGuard';
import { SettingsView } from './components/SettingsView';
import { Lock, CreditCard } from 'lucide-react';


import {
  UserDashboardSkeleton,
  DashboardSkeleton,
  MarketDashboardSkeleton,
  SocialSentimentSkeleton,
  MarketReplaySkeleton,
  BacktesterSkeleton,
  AIMarketIntelligenceSkeleton,
  GenericPageSkeleton,
} from './components/Skeleton';

/** Returns true while the skeleton should be shown after a view change */
function useViewSkeleton(view: string, delayMs = 600) {
  const [showSkeleton, setShowSkeleton] = useState(true);
  const prevView = useRef(view);

  useEffect(() => {
    // Only retrigger when view actually changes
    if (prevView.current !== view) {
      prevView.current = view;
      setShowSkeleton(true);
    }
    const t = setTimeout(() => setShowSkeleton(false), delayMs);
    return () => clearTimeout(t);
  }, [view, delayMs]);

  return showSkeleton;
}

/** Pick the right skeleton for the current view */
function ViewSkeleton({ view }: { view: string }) {
  switch (view) {
    case 'userfeed': return <UserDashboardSkeleton />;
    case 'trading': return <MarketDashboardSkeleton />;
    case 'dashboard': return <DashboardSkeleton />;
    case 'sentiment': return <SocialSentimentSkeleton />;
    case 'replay': return <MarketReplaySkeleton />;
    case 'backtest': return <BacktesterSkeleton />;
    case 'intelligence': return <AIMarketIntelligenceSkeleton />;
    default: return <div className="p-4 sm:p-8"><GenericPageSkeleton /></div>;
  }
}





type View =
  | 'dashboard'
  | 'trading'
  | 'alerts'
  | 'manual'
  | 'ai'
  | 'settings'
  | 'userfeed'
  | 'paper'
  | 'landing'
  | 'visualbuilder'
  | 'optimizer'
  | 'replay'
  | 'sentiment'
  | 'backtest'
  | 'intelligence'
  | 'derivatives';

function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC/USDT');

  // Subscription & Payment Workflow State
  const [subscription, setSubscription] = useState<SubscriptionState>(() => subscriptionService.getSubscription());
  const [checkoutPlanId, setCheckoutPlanId] = useState<PlanId | null>(null);
  const [paymentReceipt, setPaymentReceipt] = useState<PaymentReceipt | null>(null);

  const showSkeleton = useViewSkeleton(currentView);

  // Global hotkeys for Search Command Palette (Ctrl+K / Cmd+K and Esc)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K' || e.code === 'KeyK')) {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if ((e.key === 'Escape' || e.key === 'Esc') && commandPaletteOpen) {
        e.preventDefault();
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [commandPaletteOpen]);


  const handleResetAccount = () => {
    if (window.confirm('Are you sure you want to reset your paper portfolio to $100,000 USD? All trade history and positions will be cleared.')) {
      paperTradingService.resetPortfolio();
      alert('Portfolio successfully reset to $100,000 USD.');
    }
  };

  // Login is removed as a whole; user is always authenticated as the administrator
  const user = { email: 'crypto@crypto.com', id: 'mock-admin-id' };
  const isAdmin = true;

  // Categorized Sidebar Navigation Items
  const coreMenuItems = [
    { id: 'userfeed' as View, label: 'Trading Feed', icon: Zap },
    { id: 'trading' as View, label: 'Trading', icon: TrendingUp },
    { id: 'paper' as View, label: 'Paper Trading', icon: Wallet },
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
  ];

  const labMenuItems = [
    { id: 'intelligence' as View, label: 'AI Intelligence Hub', icon: BrainCircuit },
    { id: 'derivatives' as View, label: 'Options & Derivatives', icon: Calculator },
    { id: 'backtest' as View, label: 'Advanced Backtester', icon: BarChart2 },
    { id: 'optimizer' as View, label: 'Portfolio Optimizer', icon: Target },
    { id: 'replay' as View, label: 'Market Replay', icon: History },
    { id: 'sentiment' as View, label: 'Social Sentiment', icon: MessageSquare },
  ];

  const adminMenuItems = [
    { id: 'visualbuilder' as View, label: 'Visual Builder', icon: Sparkles },
    { id: 'ai' as View, label: 'AI Strategy', icon: LayoutDashboard },
    { id: 'alerts' as View, label: 'Alerts', icon: Bell },
    { id: 'manual' as View, label: 'Manual Trades', icon: LayoutDashboard },
  ];

  // If the view is the Landing Page, render full width outside the dashboard shell
  if (currentView === 'landing') {
    return (
      <LandingPage
        onLaunch={() => setCurrentView('userfeed')}
        onOpenCheckout={(planId) => setCheckoutPlanId(planId)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col h-screen overflow-hidden">
      {/* Top Header Ticker Tape Bar */}
      <HeaderTickerBar onSelectAsset={(sym) => { setSelectedSymbol(sym); setCurrentView('trading'); }} />

      {/* Mobile Top Header (hidden on desktop) */}
      <header className="flex md:hidden items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm z-30">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg text-gray-900 tracking-tight">Stratrade</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-xs font-bold flex items-center space-x-1"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
          </button>
          <a
            href="https://github.com/Garvit-821/multi-asset-algorithmic-trading-software"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg"
          >
            <Github className="w-3.5 h-3.5 text-amber-400" />
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        {/* Mobile menu backdrop overlay */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          />
        )}

        {/* Sidebar Navigation Drawer */}
        <aside className={`w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-50 fixed inset-y-0 left-0 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 md:relative transition-transform duration-300 ease-in-out h-full`}>

          <div className="p-4 border-b border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/10">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Stratrade</h1>
                  <p className="text-xs text-gray-500">Trading Platform</p>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 md:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Command Palette Trigger Button */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full px-3 py-2 bg-slate-100 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl text-slate-600 hover:text-blue-700 font-semibold text-xs transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <span>Search / Commands</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 rounded font-mono shadow-2xs">Ctrl K</kbd>
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            {/* Core Workspace */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Core Workspace</p>
              <div className="space-y-1">
                {coreMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  const isUnlocked = subscriptionService.isFeatureUnlocked(item.id, subscription.planId);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border border-blue-200 font-bold'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate text-xs sm:text-[13px]">{item.label}</span>
                      </div>
                      {!isUnlocked && <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantitative Labs */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Quantitative Labs</p>
              <div className="space-y-1">
                {labMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  const isUnlocked = subscriptionService.isFeatureUnlocked(item.id, subscription.planId);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border border-blue-200 font-bold'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate text-xs sm:text-[13px]">{item.label}</span>
                      </div>
                      {!isUnlocked && <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* System Administration */}
            {isAdmin && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">System Administration</p>
                <div className="space-y-1">
                  {adminMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    const isUnlocked = subscriptionService.isFeatureUnlocked(item.id, subscription.planId);
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentView(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 border border-blue-200 font-bold'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate text-xs sm:text-[13px]">{item.label}</span>
                        </div>
                        {!isUnlocked && <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>

          {/* Subscription Tier Status Badge Card */}
          <div className="px-4 py-2 border-t border-gray-200 bg-white">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between shadow-2xs">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-[#0052ff]" />
                <div>
                  <div className="text-[10px] font-extrabold text-[#0052ff] uppercase tracking-wider">
                    {subscription.planName}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    {subscription.planId === 'free' ? 'Basic Sandbox' : 'Unlocked Active'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCheckoutPlanId(subscription.planId === 'pro' ? 'institutional' : 'pro')}
                className="px-2.5 py-1 bg-[#0052ff] hover:bg-[#003ecc] text-white text-[10px] font-extrabold rounded-lg shadow-xs transition-colors"
              >
                {subscription.planId === 'free' ? 'Upgrade' : 'Manage'}
              </button>
            </div>
          </div>

          {/* User & Settings Panel */}
          <div className="p-4 border-t border-gray-200 space-y-2 bg-white">
            <button
              onClick={() => {
                setCurrentView('landing');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-2.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-all border border-dashed border-gray-300"
            >
              <Home className="w-5 h-5 text-gray-500" />
              <span className="font-semibold text-sm">Exit to Home</span>
            </button>

            <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate font-mono">{user.email}</p>
              </div>
            </div>

            <a
              href="https://github.com/Garvit-821/multi-asset-algorithmic-trading-software"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg transition-all text-sm font-semibold shadow-sm group"
            >
              <div className="flex items-center space-x-2.5">
                <Github className="w-4 h-4 text-amber-400" />
                <span>Star on GitHub</span>
              </div>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
            </a>

            <button
              onClick={() => {
                setCurrentView('settings');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-all text-sm font-semibold"
            >
              <Settings className="w-5 h-5 text-gray-500" />
              <span>Settings</span>
            </button>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-hidden bg-gray-50 h-full relative pb-16 md:pb-0">
          {/* ── Skeleton overlay: shown immediately on view change ── */}
          {showSkeleton ? (
            <div key={`skeleton-${currentView}`} className="h-full overflow-y-auto">
              <ViewSkeleton view={currentView} />
            </div>
          ) : (
            /* ── Real content: fades in after skeleton delay ── */
            <div key={`content-${currentView}`} className="h-full overflow-hidden skeleton-content-in">
              {!subscriptionService.isFeatureUnlocked(currentView, subscription.planId) ? (
                <LockedFeatureGuard
                  viewName={currentView}
                  requiredPlanId={subscriptionService.getRequiredPlan(currentView)}
                  currentPlanId={subscription.planId}
                  onOpenCheckout={(planId) => setCheckoutPlanId(planId)}
                  onNavigateHome={() => setCurrentView('userfeed')}
                />
              ) : (
                <>
                  {currentView === 'userfeed' && (
                    <div className="h-full overflow-y-auto">
                      <UserDashboard />
                    </div>
                  )}
                  {currentView === 'trading' && (
                    <div className="h-full overflow-y-auto lg:overflow-hidden">
                      <MarketDashboard initialSymbol={selectedSymbol} />
                    </div>
                  )}
                  {currentView === 'paper' && (
                    <div className="h-full overflow-y-auto">
                      <div className="p-3 sm:p-8">
                        <PaperTrading />
                      </div>
                    </div>
                  )}
                  {currentView === 'dashboard' && (
                    <div className="h-full overflow-y-auto">
                      <div className="p-3 sm:p-8">
                        <Dashboard />
                      </div>
                    </div>
                  )}
                  {currentView === 'intelligence' && (
                    <div className="h-full overflow-y-auto">
                      <AIMarketIntelligence />
                    </div>
                  )}
                  {currentView === 'derivatives' && (
                    <div className="h-full overflow-y-auto p-3 sm:p-8">
                      <DerivativesOptionsDashboard />
                    </div>
                  )}
                  {currentView === 'backtest' && (
                    <div className="h-full overflow-y-auto">
                      <AdvancedBacktester />
                    </div>
                  )}
                  {currentView === 'optimizer' && (
                    <div className="h-full overflow-y-auto">
                      <PortfolioOptimizer />
                    </div>
                  )}
                  {currentView === 'replay' && (
                    <div className="h-full overflow-y-auto">
                      <MarketReplay />
                    </div>
                  )}
                  {currentView === 'sentiment' && (
                    <div className="h-full overflow-y-auto">
                      <SocialSentiment />
                    </div>
                  )}
                  {currentView === 'visualbuilder' && isAdmin && (
                    <div className="h-full overflow-y-auto">
                      <VisualStrategyBuilder />
                    </div>
                  )}
                  {currentView === 'alerts' && isAdmin && <AlertsManager />}
                  {currentView === 'manual' && isAdmin && (
                    <div className="h-full overflow-y-auto">
                      <div className="p-3 sm:p-8">
                        <ManualTrades />
                      </div>
                    </div>
                  )}
                  {currentView === 'ai' && isAdmin && (
                    <div className="h-full overflow-y-auto">
                      <div className="p-3 sm:p-8">
                        <AIStrategyBuilder />
                      </div>
                    </div>
                  )}

                  {/* Redirect unauthorized requests */}
                  {!isAdmin && (currentView === 'alerts' || currentView === 'manual' || currentView === 'ai' || currentView === 'visualbuilder') && (
                    <div className="h-full overflow-y-auto flex items-center justify-center p-6">
                      <div className="text-center max-w-sm">
                        <p className="text-red-500 text-lg font-bold">Access Denied</p>
                        <p className="text-gray-500 mt-2 text-sm">You don't have permission to access administrator components.</p>
                        <button
                          onClick={() => setCurrentView('userfeed')}
                          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold text-sm"
                        >
                          Return to Dashboard
                        </button>
                      </div>
                    </div>
                  )}

                  {currentView === 'settings' && (
                    <SettingsView
                      user={user}
                      subscription={subscription}
                      onOpenCheckout={(planId) => setCheckoutPlanId(planId)}
                      onUpdateSubscription={(newState) => setSubscription(newState)}
                      onResetAccount={handleResetAccount}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Global Mobile Bottom Navigation Bar (Hidden on md+ screens) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-1.5 flex items-center justify-around md:hidden shadow-lg select-none">
        <button
          onClick={() => setCurrentView('userfeed')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl transition-all ${currentView === 'userfeed' ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-500 hover:text-gray-900'
            }`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Feed</span>
        </button>

        <button
          onClick={() => setCurrentView('trading')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl transition-all ${currentView === 'trading' ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-500 hover:text-gray-900'
            }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Trading</span>
        </button>

        <button
          onClick={() => setCurrentView('paper')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl transition-all ${currentView === 'paper' ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-500 hover:text-gray-900'
            }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Paper</span>
        </button>

        <button
          onClick={() => setCurrentView('intelligence')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl transition-all ${currentView === 'intelligence' ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-500 hover:text-gray-900'
            }`}
        >
          <BrainCircuit className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">AI Hub</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl transition-all ${mobileMenuOpen ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-500 hover:text-gray-900'
            }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Menu</span>
        </button>
      </nav>

      {/* Global Command Palette (Ctrl+K / Cmd+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onToggle={() => setCommandPaletteOpen((prev) => !prev)}
        onNavigate={(v) => setCurrentView(v as View)}
        onSelectAsset={(sym) => setSelectedSymbol(sym)}
      />

      {/* Global Floating AI Copilot Drawer (Bottom Right) */}
      <FloatingAICopilotDrawer />

      {/* Demo Checkout Modal */}
      {checkoutPlanId && (
        <CheckoutModal
          isOpen={true}
          selectedPlanId={checkoutPlanId}
          onClose={() => setCheckoutPlanId(null)}
          onSuccess={(receipt) => {
            setCheckoutPlanId(null);
            setPaymentReceipt(receipt);
            setSubscription(subscriptionService.getSubscription());
          }}
        />
      )}

      {/* Payment Confirmation & Receipt Modal */}
      {paymentReceipt && (
        <PaymentConfirmationModal
          isOpen={true}
          receipt={paymentReceipt}
          onClose={() => setPaymentReceipt(null)}
          onLaunchWorkstation={() => {
            const planId = paymentReceipt.planId;
            setPaymentReceipt(null);
            if (planId === 'institutional') {
              setCurrentView('optimizer');
            } else if (planId === 'pro') {
              setCurrentView('intelligence');
            }
          }}
        />
      )}
    </div>
  );
}

export default App;
