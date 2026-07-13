import { useState } from 'react';
import { LayoutDashboard, TrendingUp, Bell, Settings, User, Zap, Wallet } from 'lucide-react';
import { MarketDashboard } from './components/MarketDashboard';
import { AlertsManager } from './components/AlertsManager';
import { Dashboard } from './components/Dashboard';
import { ManualTrades } from './components/ManualTrades';
import { AIStrategyBuilder } from './components/AIStrategyBuilder';
import { UserDashboard } from './components/UserDashboard';
import { PaperTrading } from './components/PaperTrading';

type View = 'dashboard' | 'trading' | 'alerts' | 'manual' | 'ai' | 'settings' | 'userfeed' | 'paper';

function App() {
  const [currentView, setCurrentView] = useState<View>('userfeed');

  // Login is removed as a whole; user is always authenticated as the administrator
  const user = { email: 'crypto@crypto.com', id: 'mock-admin-id' };
  const isAdmin = true;

  // Menu items based on user role
  const userMenuItems = [
    { id: 'userfeed' as View, label: 'Trading Feed', icon: Zap },
    { id: 'trading' as View, label: 'Trading', icon: TrendingUp },
    { id: 'paper' as View, label: 'Paper Trading', icon: Wallet },
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
  ];

  const adminMenuItems = [
    { id: 'alerts' as View, label: 'Alerts', icon: Bell },
    { id: 'manual' as View, label: 'Manual Trades', icon: LayoutDashboard },
    { id: 'ai' as View, label: 'AI Strategy', icon: LayoutDashboard },
  ];

  const menuItems = isAdmin 
    ? [...userMenuItems, ...adminMenuItems]
    : userMenuItems;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CryptoAgent</h1>
                <p className="text-xs text-gray-500">Trading Platform</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              // Prevent non-admin from accessing admin pages
              const isAdminPage = ['alerts', 'manual', 'ai'].includes(item.id);
              if (isAdminPage && !isAdmin) {
                return null; // Don't render admin menu items for non-admin users
              }
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('settings')}
              className="w-full flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-all"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </button>

          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden bg-gray-50">
          {currentView === 'userfeed' && (
            <div className="h-full overflow-y-auto">
              <UserDashboard />
            </div>
          )}
          {currentView === 'trading' && <MarketDashboard />}
          {currentView === 'paper' && (
            <div className="h-full overflow-y-auto">
              <div className="p-8">
                <PaperTrading />
              </div>
            </div>
          )}
          {currentView === 'dashboard' && (
            <div className="h-full overflow-y-auto">
              <div className="p-8">
                <Dashboard />
              </div>
            </div>
          )}
          {currentView === 'alerts' && isAdmin && <AlertsManager />}
          {currentView === 'manual' && isAdmin && (
            <div className="h-full overflow-y-auto">
              <div className="p-8">
                <ManualTrades />
              </div>
            </div>
          )}
          {currentView === 'ai' && isAdmin && (
            <div className="h-full overflow-y-auto">
              <div className="p-8">
                <AIStrategyBuilder />
              </div>
            </div>
          )}
          {/* Redirect non-admin users away from admin pages */}
          {!isAdmin && (currentView === 'alerts' || currentView === 'manual' || currentView === 'ai') && (
            <div className="h-full overflow-y-auto flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600 text-lg">Access Denied</p>
                <p className="text-gray-500 mt-2">You don't have permission to access this page.</p>
                <button
                  onClick={() => setCurrentView('userfeed')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Go to Trading Feed
                </button>
              </div>
            </div>
          )}
          {currentView === 'settings' && (
            <div className="h-full overflow-y-auto">
              <div className="p-8">
                <div className="max-w-4xl">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Settings</h2>
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Account Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={user.email || ''}
                          disabled
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telegram Chat ID (for alerts)
                        </label>
                        <input
                          type="text"
                          placeholder="Enter your Telegram chat ID"
                          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Get your chat ID from @userinfobot on Telegram
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        Save Settings
                      </button>
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
