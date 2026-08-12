import React, { useEffect } from 'react';
import { LayoutGrid, TrendingUp, Calculator, BrainCircuit } from 'lucide-react';
import { audioHapticsService } from '../services/audioHapticsService';

export type WorkspacePresetId = 'quant' | 'scalper' | 'derivatives' | 'ai';

export interface WorkspacePreset {
  id: WorkspacePresetId;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  targetView: string;
  hotkey: string;
  description: string;
}

export const WORKSPACE_PRESETS: WorkspacePreset[] = [
  {
    id: 'quant',
    label: 'Quant Risk View',
    shortLabel: 'Quant Risk',
    icon: LayoutGrid,
    targetView: 'optimizer',
    hotkey: 'Alt+1',
    description: 'Portfolio Optimizer, Risk Heatmaps & Correlations',
  },
  {
    id: 'scalper',
    label: 'Scalper Execution',
    shortLabel: 'Scalper',
    icon: TrendingUp,
    targetView: 'trading',
    hotkey: 'Alt+2',
    description: 'Order Book DOM, Quick Trade Buttons & Live Ticker',
  },
  {
    id: 'derivatives',
    label: 'Options & Derivatives',
    shortLabel: 'Options',
    icon: Calculator,
    targetView: 'derivatives',
    hotkey: 'Alt+3',
    description: 'Black-Scholes Surface, Options Chain & Volatility',
  },
  {
    id: 'ai',
    label: 'AI Intelligence View',
    shortLabel: 'AI Hub',
    icon: BrainCircuit,
    targetView: 'intelligence',
    hotkey: 'Alt+4',
    description: 'Copilot Hub, AI Strategy Builder & Monte Carlo',
  },
];

interface WorkspacePresetsBarProps {
  currentView: string;
  onSelectPreset: (viewName: string) => void;
}

export const WorkspacePresetsBar: React.FC<WorkspacePresetsBarProps> = ({
  currentView,
  onSelectPreset,
}) => {
  // Global Hotkey Handler for Alt + 1/2/3/4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key === '1') {
          e.preventDefault();
          audioHapticsService.playClickSound();
          onSelectPreset('optimizer');
        } else if (e.key === '2') {
          e.preventDefault();
          audioHapticsService.playClickSound();
          onSelectPreset('trading');
        } else if (e.key === '3') {
          e.preventDefault();
          audioHapticsService.playClickSound();
          onSelectPreset('derivatives');
        } else if (e.key === '4') {
          e.preventDefault();
          audioHapticsService.playClickSound();
          onSelectPreset('intelligence');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectPreset]);

  return (
    <div className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
      {WORKSPACE_PRESETS.map((preset) => {
        const Icon = preset.icon;
        const isActive = currentView === preset.targetView;

        return (
          <button
            key={preset.id}
            onClick={() => {
              audioHapticsService.playClickSound();
              onSelectPreset(preset.targetView);
            }}
            title={`${preset.description} (${preset.hotkey})`}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 border ${
              isActive
                ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                : 'bg-white/80 hover:bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{preset.label}</span>
            <span className="lg:hidden">{preset.shortLabel}</span>
            <span className={`text-[9px] font-mono px-1 py-0.2 rounded hidden sm:inline ${
              isActive ? 'bg-blue-700 text-blue-100' : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}>
              {preset.hotkey}
            </span>
          </button>
        );
      })}
    </div>
  );
};
