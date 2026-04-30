import React, { createContext, useContext, useEffect, useState, ReactNode, useLayoutEffect } from 'react';

export type ThemeMode = 'light' | 'dark';

export type AccentColor =
  | 'blue'
  | 'violet'
  | 'emerald'
  | 'rose'
  | 'amber'
  | 'cyan'
  | 'indigo'
  | 'teal';

export interface ThemeConfig {
  mode: ThemeMode;
  accent: AccentColor;
}

interface ThemeContextType {
  theme: ThemeConfig;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
  toggleMode: () => void;
}

const defaultTheme: ThemeConfig = {
  mode: 'light',
  accent: 'blue',
};

const STORAGE_KEY = 'djmp_theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Accent color CSS variable maps
const accentMap: Record<AccentColor, Record<string, string>> = {
  blue: {
    '--accent-50':  '#eff6ff',
    '--accent-100': '#dbeafe',
    '--accent-200': '#bfdbfe',
    '--accent-400': '#60a5fa',
    '--accent-500': '#3b82f6',
    '--accent-600': '#2563eb',
    '--accent-700': '#1d4ed8',
    '--accent-900': '#1e3a8a',
    '--accent-gradient': 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    '--accent-glow':     'rgba(59,130,246,0.35)',
    '--accent-shimmer':  'rgba(59,130,246,0.15)',
  },
  violet: {
    '--accent-50':  '#f5f3ff',
    '--accent-100': '#ede9fe',
    '--accent-200': '#ddd6fe',
    '--accent-400': '#a78bfa',
    '--accent-500': '#8b5cf6',
    '--accent-600': '#7c3aed',
    '--accent-700': '#6d28d9',
    '--accent-900': '#2e1065',
    '--accent-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    '--accent-glow':     'rgba(139,92,246,0.35)',
    '--accent-shimmer':  'rgba(139,92,246,0.15)',
  },
  emerald: {
    '--accent-50':  '#ecfdf5',
    '--accent-100': '#d1fae5',
    '--accent-200': '#a7f3d0',
    '--accent-400': '#34d399',
    '--accent-500': '#10b981',
    '--accent-600': '#059669',
    '--accent-700': '#047857',
    '--accent-900': '#064e3b',
    '--accent-gradient': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    '--accent-glow':     'rgba(16,185,129,0.35)',
    '--accent-shimmer':  'rgba(16,185,129,0.15)',
  },
  rose: {
    '--accent-50':  '#fff1f2',
    '--accent-100': '#ffe4e6',
    '--accent-200': '#fecdd3',
    '--accent-400': '#fb7185',
    '--accent-500': '#f43f5e',
    '--accent-600': '#e11d48',
    '--accent-700': '#be123c',
    '--accent-900': '#881337',
    '--accent-gradient': 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
    '--accent-glow':     'rgba(244,63,94,0.35)',
    '--accent-shimmer':  'rgba(244,63,94,0.15)',
  },
  amber: {
    '--accent-50':  '#fffbeb',
    '--accent-100': '#fef3c7',
    '--accent-200': '#fde68a',
    '--accent-400': '#fbbf24',
    '--accent-500': '#f59e0b',
    '--accent-600': '#d97706',
    '--accent-700': '#b45309',
    '--accent-900': '#78350f',
    '--accent-gradient': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    '--accent-glow':     'rgba(245,158,11,0.35)',
    '--accent-shimmer':  'rgba(245,158,11,0.15)',
  },
  cyan: {
    '--accent-50':  '#ecfeff',
    '--accent-100': '#cffafe',
    '--accent-200': '#a5f3fc',
    '--accent-400': '#22d3ee',
    '--accent-500': '#06b6d4',
    '--accent-600': '#0891b2',
    '--accent-700': '#0e7490',
    '--accent-900': '#164e63',
    '--accent-gradient': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    '--accent-glow':     'rgba(6,182,212,0.35)',
    '--accent-shimmer':  'rgba(6,182,212,0.15)',
  },
  indigo: {
    '--accent-50':  '#eef2ff',
    '--accent-100': '#e0e7ff',
    '--accent-200': '#c7d2fe',
    '--accent-400': '#818cf8',
    '--accent-500': '#6366f1',
    '--accent-600': '#4f46e5',
    '--accent-700': '#4338ca',
    '--accent-900': '#1e1b4b',
    '--accent-gradient': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    '--accent-glow':     'rgba(99,102,241,0.35)',
    '--accent-shimmer':  'rgba(99,102,241,0.15)',
  },
  teal: {
    '--accent-50':  '#f0fdfa',
    '--accent-100': '#ccfbf1',
    '--accent-200': '#99f6e4',
    '--accent-400': '#2dd4bf',
    '--accent-500': '#14b8a6',
    '--accent-600': '#0d9488',
    '--accent-700': '#0f766e',
    '--accent-900': '#134e4a',
    '--accent-gradient': 'linear-gradient(135deg, #14b8a6 0%, #3b82f6 100%)',
    '--accent-glow':     'rgba(20,184,166,0.35)',
    '--accent-shimmer':  'rgba(20,184,166,0.15)',
  },
};

function applyTheme(config: ThemeConfig) {
  const html = document.documentElement;
  const body = document.body;

  if (config.mode === 'dark') {
    html.classList.add('dark');
    html.classList.remove('light');
    body.classList.add('dark');
    body.classList.remove('light');
  } else {
    html.classList.remove('dark');
    html.classList.add('light');
    body.classList.remove('dark');
    body.classList.add('light');
  }

  const vars = accentMap[config.accent];
  Object.entries(vars).forEach(([key, value]) => {
    html.style.setProperty(key, value);
  });
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultTheme, ...JSON.parse(saved) } : defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  useLayoutEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  }, [theme]);

  const setMode = (mode: ThemeMode) => setTheme((t) => ({ ...t, mode }));
  const setAccent = (accent: AccentColor) => setTheme((t) => ({ ...t, accent }));
  const toggleMode = () =>
    setTheme((t) => ({ ...t, mode: t.mode === 'light' ? 'dark' : 'light' }));

  return (
    <ThemeContext.Provider value={{ theme, setMode, setAccent, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export { accentMap };
