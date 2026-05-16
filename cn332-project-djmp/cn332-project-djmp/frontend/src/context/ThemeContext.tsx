import React, { createContext, useContext, useState, ReactNode, useLayoutEffect } from 'react';
import api from '../utils/api';

export type ThemeMode = 'light' | 'dark';

/** JuristicPro design accents (primary) + legacy accents for backward compat */
export type AccentColor =
  | 'slate'        // default — JuristicPro design
  | 'forest'       // JuristicPro design
  | 'terracotta'   // JuristicPro design
  | 'ink'          // JuristicPro design
  // Legacy accents (kept for backward compat)
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
  accent: 'slate',
};

const STORAGE_KEY = 'djmp_theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * New JuristicPro design accents — handled entirely by CSS via [data-accent] selector.
 * We just set the attribute; globals.css does the rest.
 */
const DESIGN_ACCENTS = new Set<AccentColor>(['slate', 'forest', 'terracotta', 'ink']);

/**
 * Legacy accent color CSS variable maps.
 * Used only when a non-design accent is selected (backward compat).
 */
const legacyAccentMap: Partial<Record<AccentColor, Record<string, string>>> = {
  blue: {
    '--accent-gradient': 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    '--accent-glow':     'rgba(59,130,246,0.35)',
    '--accent-shimmer':  'rgba(59,130,246,0.15)',
    '--accent-500': '#3b82f6',
    '--accent-600': '#2563eb',
    '--accent-700': '#1d4ed8',
  },
  violet: {
    '--accent-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    '--accent-glow':     'rgba(139,92,246,0.35)',
    '--accent-shimmer':  'rgba(139,92,246,0.15)',
    '--accent-500': '#8b5cf6',
    '--accent-600': '#7c3aed',
    '--accent-700': '#6d28d9',
  },
  emerald: {
    '--accent-gradient': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    '--accent-glow':     'rgba(16,185,129,0.35)',
    '--accent-shimmer':  'rgba(16,185,129,0.15)',
    '--accent-500': '#10b981',
    '--accent-600': '#059669',
    '--accent-700': '#047857',
  },
  rose: {
    '--accent-gradient': 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
    '--accent-glow':     'rgba(244,63,94,0.35)',
    '--accent-shimmer':  'rgba(244,63,94,0.15)',
    '--accent-500': '#f43f5e',
    '--accent-600': '#e11d48',
    '--accent-700': '#be123c',
  },
  amber: {
    '--accent-gradient': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    '--accent-glow':     'rgba(245,158,11,0.35)',
    '--accent-shimmer':  'rgba(245,158,11,0.15)',
    '--accent-500': '#f59e0b',
    '--accent-600': '#d97706',
    '--accent-700': '#b45309',
  },
  cyan: {
    '--accent-gradient': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    '--accent-glow':     'rgba(6,182,212,0.35)',
    '--accent-shimmer':  'rgba(6,182,212,0.15)',
    '--accent-500': '#06b6d4',
    '--accent-600': '#0891b2',
    '--accent-700': '#0e7490',
  },
  indigo: {
    '--accent-gradient': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    '--accent-glow':     'rgba(99,102,241,0.35)',
    '--accent-shimmer':  'rgba(99,102,241,0.15)',
    '--accent-500': '#6366f1',
    '--accent-600': '#4f46e5',
    '--accent-700': '#4338ca',
  },
  teal: {
    '--accent-gradient': 'linear-gradient(135deg, #14b8a6 0%, #3b82f6 100%)',
    '--accent-glow':     'rgba(20,184,166,0.35)',
    '--accent-shimmer':  'rgba(20,184,166,0.15)',
    '--accent-500': '#14b8a6',
    '--accent-600': '#0d9488',
    '--accent-700': '#0f766e',
  },
};

/** For legacy code that imports accentMap — keeps backward compat */
export const accentMap = legacyAccentMap as Record<AccentColor, Record<string, string>>;

function applyTheme(config: ThemeConfig) {
  const html = document.documentElement;

  // ── Set data-theme attribute (primary, used by CSS selectors in globals.css) ──
  html.setAttribute('data-theme', config.mode);

  // ── Keep class-based dark mode for backward compat with any existing Tailwind usage ──
  if (config.mode === 'dark') {
    html.classList.add('dark');
    html.classList.remove('light');
  } else {
    html.classList.remove('dark');
    html.classList.add('light');
  }

  // ── Accent: design accents use data-accent attribute; legacy use inline vars ──
  if (DESIGN_ACCENTS.has(config.accent)) {
    // Clear any lingering inline accent vars from a previous legacy accent
    ['--accent', '--accent-2', '--accent-soft', '--accent-on',
     '--accent-500', '--accent-600', '--accent-700',
     '--accent-gradient', '--accent-glow', '--accent-shimmer',
    ].forEach(v => html.style.removeProperty(v));

    html.setAttribute('data-accent', config.accent);
  } else {
    // Legacy accent: remove data-accent and set inline CSS vars
    html.removeAttribute('data-accent');
    const vars = legacyAccentMap[config.accent];
    if (vars) {
      Object.entries(vars).forEach(([key, value]) => {
        html.style.setProperty(key, value);
      });
    }
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultTheme, ...parsed };
      }
    } catch {
      // ignore
    }
    return defaultTheme;
  });

  useLayoutEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  }, [theme]);

  const syncTheme = async (mode: ThemeMode, accent: AccentColor) => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await api.patch('/me/', { theme_mode: mode, theme_accent: accent });
      }
    } catch (error) {
      console.error('Failed to sync theme with backend:', error);
    }
  };

  const setMode = (mode: ThemeMode) => {
    setTheme((t) => {
      syncTheme(mode, t.accent);
      return { ...t, mode };
    });
  };

  const setAccent = (accent: AccentColor) => {
    setTheme((t) => {
      syncTheme(t.mode, accent);
      return { ...t, accent };
    });
  };

  const toggleMode = () => {
    setTheme((t) => {
      const newMode = t.mode === 'light' ? 'dark' : 'light';
      syncTheme(newMode, t.accent);
      return { ...t, mode: newMode };
    });
  };

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
