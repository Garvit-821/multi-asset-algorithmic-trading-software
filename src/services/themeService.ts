export type TerminalTheme = 'obsidian' | 'bloomberg' | 'emerald' | 'slate';

export interface ThemeOption {
  id: TerminalTheme;
  name: string;
  description: string;
  primaryColor: string;
  bgClass: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'obsidian',
    name: 'Obsidian Cyber',
    description: 'Default Dark Slate Terminal Theme',
    primaryColor: '#3b82f6',
    bgClass: 'bg-slate-950 text-slate-100',
  },
  {
    id: 'bloomberg',
    name: 'Bloomberg Amber',
    description: 'Classic High-Contrast Amber on Pitch Black',
    primaryColor: '#f59e0b',
    bgClass: 'bg-black text-amber-500',
  },
  {
    id: 'emerald',
    name: 'Emerald Quant',
    description: 'Institutional Dark Green & Gold Palette',
    primaryColor: '#10b981',
    bgClass: 'bg-emerald-950 text-emerald-100',
  },
  {
    id: 'slate',
    name: 'Slate Pro',
    description: 'Ultra-Clean Crisp Light/Dark Contrast Theme',
    primaryColor: '#6366f1',
    bgClass: 'bg-slate-900 text-slate-100',
  },
];

const THEME_STORAGE_KEY = 'stratrade_terminal_theme';

export function getTerminalTheme(): TerminalTheme {
  const saved = localStorage.getItem(THEME_STORAGE_KEY) as TerminalTheme;
  return saved && THEME_OPTIONS.some(t => t.id === saved) ? saved : 'obsidian';
}

export function setTerminalTheme(theme: TerminalTheme): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTerminalTheme(theme);
}

export function applyTerminalTheme(theme?: TerminalTheme): void {
  const activeTheme = theme || getTerminalTheme();
  const root = document.documentElement;

  // Remove existing theme attributes / classes
  root.classList.remove('theme-obsidian', 'theme-bloomberg', 'theme-emerald', 'theme-slate');
  root.classList.add(`theme-${activeTheme}`);
  root.setAttribute('data-theme', activeTheme);
}
