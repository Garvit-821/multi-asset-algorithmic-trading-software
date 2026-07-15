import { useState } from 'react';
import { LayoutDashboard, TrendingUp, Bell, Settings, User, Zap, Wallet, Menu, X, Home, Sparkles, Target, History, MessageSquare } from 'lucide-react';
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
  | 'sentiment';

function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

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
    return <LandingPage onLaunch={() => setCurrentView('userfeed')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col h-screen overflow-hidden">
      {/* Mobile Top Header (hidden on desktop) */}
      <header className="flex md:hidden items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-30">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg text-gray-900 tracking-tight">CryptoAgent</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        {/* Mobile menu backdrop overlay */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden transition-opacity"
          />
        )}

        {/* Sidebar Navigation Drawer */}
        <aside className={`w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-40 fixed inset-y-0 left-0 transform ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:relative transition-transform duration-300 ease-in-out h-full`}>
          
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/10">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CryptoAgent</h1>
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

          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            {/* Core Workspace */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 mb-2">Core Workspace</p>
              <div className="space-y-1">
                {coreMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border border-blue-200 font-bold'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium text-sm'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantitative Labs */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 mb-2">Quantitative Labs</p>
              <div className="space-y-1">
                {labMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border border-blue-200 font-bold'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium text-sm'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* System Administration */}
            {isAdmin && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 mb-2">System Administration</p>
                <div className="space-y-1">
                  {adminMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentView(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 border border-blue-200 font-bold'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium text-sm'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>

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
        <main className="flex-1 overflow-hidden bg-gray-50 h-full">
          {currentView === 'userfeed' && (
            <div className="h-full overflow-y-auto">
              <UserDashboard />
            </div>
          )}
          {currentView === 'trading' && <MarketDashboard />}
          {currentView === 'paper' && (
            <div className="h-full overflow-y-auto">
              <div className="p-4 sm:p-8">
                <PaperTrading />
              </div>
            </div>
          )}
          {currentView === 'dashboard' && (
            <div className="h-full overflow-y-auto">
              <div className="p-4 sm:p-8">
                <Dashboard />
              </div>
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
              <div className="p-4 sm:p-8">
                <ManualTrades />
              </div>
            </div>
          )}
          {currentView === 'ai' && isAdmin && (
            <div className="h-full overflow-y-auto">
              <div className="p-4 sm:p-8">
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
            <div className="h-full overflow-y-auto">
              <div className="p-4 sm:p-8">
                <div className="max-w-3xl">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Settings</h2>
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Account Configuration</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Primary Email Address
                        </label>
                        <input
                          type="email"
                          value={user.email || ''}
                          disabled
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-mono text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Telegram Chat ID (Alert Notifications)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 582910482"
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                          Enter your Telegram chat identifier to receive background price crossing and strategy signals. Get your ID instantly by messaging <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">@userinfobot</span>.
                        </p>
                      </div>
                      <div className="pt-2">
                        <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold text-sm shadow-md shadow-blue-500/10">
                          Save Configurations
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
