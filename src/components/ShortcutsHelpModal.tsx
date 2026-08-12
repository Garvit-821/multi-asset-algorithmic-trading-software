import React from 'react';
import { X, Command, Sparkles, Zap, TrendingUp, Wallet, LayoutDashboard, BrainCircuit, Bot, ShoppingCart, RefreshCw } from 'lucide-react';

interface ShortcutsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  icon: React.ElementType;
}

interface ShortcutGroup {
  title: string;
  shortcuts: ShortcutItem[];
}

export const ShortcutsHelpModal: React.FC<ShortcutsHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const groups: ShortcutGroup[] = [
    {
      title: 'Global Search & Overlays',
      shortcuts: [
        { keys: ['Ctrl', 'K'], description: 'Open Search Command Palette', icon: Sparkles },
        { keys: ['Shift', '?'], description: 'Toggle Keyboard Shortcuts Cheat Sheet', icon: Command },
        { keys: ['Esc'], description: 'Close active modal, drawer, or overlay', icon: X },
      ],
    },
    {
      title: 'Workspace Navigation',
      shortcuts: [
        { keys: ['Ctrl', '1'], description: 'Jump to Trading Feed', icon: Zap },
        { keys: ['Ctrl', '2'], description: 'Jump to Live Trading Chart & Order Book', icon: TrendingUp },
        { keys: ['Ctrl', '3'], description: 'Jump to Paper Trading Ledger', icon: Wallet },
        { keys: ['Ctrl', '4'], description: 'Jump to Institutional Dashboard', icon: LayoutDashboard },
        { keys: ['Ctrl', '5'], description: 'Jump to AI Market Intelligence Hub', icon: BrainCircuit },
      ],
    },
    {
      title: 'AI Copilot & Fast Execution',
      shortcuts: [
        { keys: ['Ctrl', 'Shift', 'A'], description: 'Toggle Floating AI Copilot Drawer', icon: Bot },
        { keys: ['Ctrl', 'Shift', 'B'], description: 'Quick Buy Order Dialog', icon: ShoppingCart },
        { keys: ['Ctrl', 'Shift', 'S'], description: 'Quick Sell Order Dialog', icon: ShoppingCart },
      ],
    },
    {
      title: 'Terminal Utilities',
      shortcuts: [
        { keys: ['Alt', 'R'], description: 'Refresh Live Market Data Stream', icon: RefreshCw },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn select-none">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Command className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <span>Keyboard Shortcuts</span>
                <span className="text-[10px] bg-blue-500/30 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-bold">Pro Terminal</span>
              </h3>
              <p className="text-xs text-slate-300">Workstation hotkeys for fast execution & navigation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {groups.map((group, idx) => (
            <div key={idx} className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                {group.title}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {group.shortcuts.map((sc, scIdx) => {
                  const Icon = sc.icon;
                  return (
                    <div
                      key={scIdx}
                      className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between hover:border-blue-300 hover:bg-blue-50/40 transition-all"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 shadow-2xs">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {sc.description}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        {sc.keys.map((k, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="px-2 py-1 text-[11px] font-extrabold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-2xs font-mono"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] font-bold">Esc</kbd> anytime to close</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
