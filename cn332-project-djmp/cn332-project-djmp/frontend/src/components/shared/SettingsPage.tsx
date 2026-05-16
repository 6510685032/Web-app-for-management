import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Shield,
  Lock,
  Palette,
  Globe,
  HelpCircle,
  Info,
  ChevronRight,
  Smartphone,
  Database,
  FileText,
  Sun,
  Moon,
  Check,
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useTheme, AccentColor } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';

// ── Accent colour catalogue ──────────────────────────────
const ACCENTS: { key: AccentColor; label: string; bg: string; gradient: string }[] = [
  { key: 'blue',    label: 'Ocean Blue',    bg: '#3b82f6', gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)' },
  { key: 'violet',  label: 'Deep Violet',   bg: '#8b5cf6', gradient: 'linear-gradient(135deg,#8b5cf6,#ec4899)' },
  { key: 'emerald', label: 'Forest Green',  bg: '#10b981', gradient: 'linear-gradient(135deg,#10b981,#06b6d4)' },
  { key: 'rose',    label: 'Cherry Rose',   bg: '#f43f5e', gradient: 'linear-gradient(135deg,#f43f5e,#fb923c)' },
  { key: 'amber',   label: 'Warm Amber',    bg: '#f59e0b', gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
  { key: 'cyan',    label: 'Crystal Cyan',  bg: '#06b6d4', gradient: 'linear-gradient(135deg,#06b6d4,#3b82f6)' },
  { key: 'indigo',  label: 'Midnight Indigo', bg: '#6366f1', gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
  { key: 'teal',    label: 'Pacific Teal',  bg: '#14b8a6', gradient: 'linear-gradient(135deg,#14b8a6,#3b82f6)' },
];

// ── Simple setting row (non-interactive) ─────────────────
type SettingRowProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  status?: string;
};
function SettingRow({ icon, title, description, status }: SettingRowProps) {
  return (
    <button
      className="w-full flex items-center justify-between rounded-2xl p-4 hover:bg-[var(--accent-shimmer)] transition-colors text-left"
      style={{
        background: 'var(--djmp-surface-2)',
        border: '1px solid var(--djmp-border)',
      }}
      type="button"
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--accent-shimmer)', color: 'var(--accent-600)' }}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-base font-semibold" style={{ color: 'var(--djmp-text)' }}>
            {title}
          </h3>
          <p className="text-sm mt-1" style={{ color: 'var(--djmp-text-muted)' }}>
            {description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        {status && (
          <span
            className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: 'var(--accent-100)', color: 'var(--accent-700)' }}
          >
            {status}
          </span>
        )}
        <ChevronRight className="w-5 h-5" style={{ color: 'var(--djmp-text-muted)' }} />
      </div>
    </button>
  );
}

// ── Toggle setting row (interactive) ─────────────────────
type ToggleRowProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
};
function ToggleRow({ icon, title, description, enabled, onToggle }: ToggleRowProps) {
  return (
    <div
      className="w-full flex items-center justify-between rounded-2xl p-4 transition-colors text-left"
      style={{
        background: 'var(--djmp-surface-2)',
        border: '1px solid var(--djmp-border)',
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--accent-shimmer)', color: 'var(--accent-600)' }}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-base font-semibold" style={{ color: 'var(--djmp-text)' }}>
            {title}
          </h3>
          <p className="text-sm mt-1" style={{ color: 'var(--djmp-text-muted)' }}>
            {description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <button
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
          style={enabled ? { background: 'var(--accent-gradient)' } : { background: 'rgba(150, 150, 150, 0.3)' }}
          type="button"
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
    </div>
  );
}

// ── Section card wrapper ─────────────────────────────────
function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="glass-card p-6"
      style={{ background: 'var(--djmp-surface)' }}
    >
      <div className="mb-5">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--djmp-text)' }}>
          {title}
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--djmp-text-muted)' }}>
          {subtitle}
        </p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function AppearancePanel() {
  const { theme, setMode, setAccent } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAccent = (accent: AccentColor) => {
    setAccent(accent);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleMode = (mode: 'light' | 'dark') => {
    setMode(mode);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    /* No overflow:hidden here — lets the accordion grow freely */
    <div
      className="glass-card"
      style={{ overflow: isOpen ? 'visible' : 'hidden' }}
    >
      {/* ── Header / Toggle ── */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full p-6 flex items-center justify-between text-left transition-colors"
        style={{ borderRadius: 'inherit' }}
        type="button"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--accent-shimmer)', color: 'var(--accent-600)' }}
          >
            <Palette size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--djmp-text)' }}>
              Appearance
            </h2>
            <p className="text-sm" style={{ color: 'var(--djmp-text-muted)' }}>
              Theme &amp; accent colour
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {saved && (
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-lg"
              style={{ background: 'var(--accent-shimmer)', color: 'var(--accent-700)' }}
            >
              ✓ Applied
            </span>
          )}
          <ChevronRight
            className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
            style={{ color: 'var(--djmp-text-muted)' }}
          />
        </div>
      </button>

      {/* ── Expandable Content ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.4s ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div className="px-6 pb-8 space-y-8" style={{ borderTop: '1px solid var(--djmp-border)' }}>

            {/* ── Colour Mode ── */}
            <div className="pt-6">
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--djmp-text-muted)' }}>
                Colour Mode
              </p>

              {/* Toggle pill */}
              <div className="mode-toggle-pill w-fit mb-5">
                <button
                  className={`mode-toggle-option flex items-center gap-2 ${theme.mode === 'light' ? 'active' : ''}`}
                  onClick={() => handleMode('light')}
                  type="button"
                >
                  <Sun size={14} /> Light
                </button>
                <button
                  className={`mode-toggle-option flex items-center gap-2 ${theme.mode === 'dark' ? 'active' : ''}`}
                  onClick={() => handleMode('dark')}
                  type="button"
                >
                  <Moon size={14} /> Dark
                </button>
              </div>

              {/* Mini preview cards */}
              <div className="grid grid-cols-2 gap-3">
                {(['light', 'dark'] as const).map((m) => (
                  <div
                    key={m}
                    onClick={() => handleMode(m)}
                    className="cursor-pointer rounded-xl p-3 transition-all"
                    style={{
                      background: m === 'light' ? '#f1f5f9' : '#0f172a',
                      border: `2px solid ${theme.mode === m ? 'var(--accent-500)' : 'transparent'}`,
                      boxShadow: theme.mode === m ? '0 0 0 3px var(--accent-shimmer)' : 'none',
                    }}
                  >
                    <div className="space-y-2">
                      <div className={`h-1.5 w-10 rounded-full ${m === 'light' ? 'bg-slate-300' : 'bg-slate-600'}`} />
                      <div
                        className="h-5 w-full rounded-lg"
                        style={{ background: m === 'light' ? 'white' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}
                      />
                      <div className="h-3 w-full rounded" style={{ background: 'var(--accent-gradient)' }} />
                    </div>
                    <p
                      className="text-center text-[11px] font-semibold mt-2"
                      style={{ color: m === 'light' ? '#64748b' : '#94a3b8' }}
                    >
                      {m === 'light' ? '☀️ Light' : '🌙 Dark'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Accent Palette (4×2 grid) ── */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--djmp-text-muted)' }}>
                Accent Colour
              </p>

              {/* 4×2 checkerboard palette */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '10px',
                }}
              >
                {ACCENTS.map((ac) => (
                  <button
                    key={ac.key}
                    type="button"
                    title={ac.label}
                    onClick={() => handleAccent(ac.key)}
                    style={{
                      background: ac.gradient,
                      aspectRatio: '1 / 1',
                      borderRadius: '12px',
                      border: theme.accent === ac.key
                        ? '3px solid white'
                        : '3px solid transparent',
                      outline: theme.accent === ac.key
                        ? '2px solid var(--accent-500)'
                        : '2px solid transparent',
                      outlineOffset: '2px',
                      cursor: 'pointer',
                      transition: 'transform 0.15s, outline 0.15s',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    {theme.accent === ac.key && (
                      <Check size={18} style={{ color: 'white', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} strokeWidth={3} />
                    )}
                  </button>
                ))}
              </div>

              {/* Label row below palette */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '10px',
                  marginTop: '6px',
                }}
              >
                {ACCENTS.map((ac) => (
                  <p
                    key={ac.key}
                    className="text-[10px] text-center font-medium truncate"
                    style={{ color: theme.accent === ac.key ? 'var(--accent-600)' : 'var(--djmp-text-muted)' }}
                  >
                    {ac.label}
                  </p>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main SettingsPage ────────────────────────────────────
export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const role = user?.role || 'resident';
  
  // Notification Preferences from Global Context
  const { isEnabled, toggleEnabled } = useNotifications();

  const handleBackToDashboard = () => navigate(`/${role}`);

  const getRoleBadgeColor = (r: string) => {
    const map: Record<string, string> = {
      admin:      'var(--accent-100)',
      officer:    'var(--accent-100)',
      technician: 'var(--accent-100)',
      resident:   'var(--accent-100)',
    };
    return map[r] || 'var(--accent-100)';
  };

  return (
    <div className="djmp-bg">
      <div
        className="max-w-7xl mx-auto p-6"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <button
          onClick={handleBackToDashboard}
          className="inline-flex items-center gap-2 mb-6 font-medium transition-colors"
          style={{ color: 'var(--accent-600)' }}
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        {/* Header banner */}
        <div
          className="rounded-3xl p-6 md:p-8 mb-6 text-white"
          style={{ background: 'var(--accent-gradient)', boxShadow: '0 8px 32px var(--accent-glow)' }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-white/70 text-sm font-medium mb-2">Preferences Center</p>
              <h1 className="text-3xl md:text-4xl font-bold">Application Settings</h1>
              <p className="text-white/80 mt-2 max-w-2xl">
                Manage notification preferences, privacy controls, app behavior, and appearance.
              </p>
            </div>
            <div
              className="inline-flex px-4 py-2 rounded-full text-sm font-semibold bg-white/20 border border-white/30 backdrop-blur-sm self-start"
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left column — main sections */}
          <div className="xl:col-span-2 space-y-6">

            {/* ── APPEARANCE — interactive ── */}
            <AppearancePanel />

            <SectionCard
              title="Notifications & Alerts"
              subtitle="Control how the system informs you about requests, updates, and announcements."
            >
              <ToggleRow
                icon={<Bell size={22} />}
                title="Push Notifications"
                description="Receive instant updates for maintenance progress, approvals, and important alerts."
                enabled={isEnabled}
                onToggle={() => toggleEnabled(!isEnabled)}
              />
            </SectionCard>

            <SectionCard
              title="Language & Region"
              subtitle="Set language, region, and date format preferences."
            >
              <SettingRow
                icon={<Globe size={22} />}
                title="Language & Region"
                description="Set language, region, and formatting preferences for dates and content display."
                status="English"
              />
            </SectionCard>

          </div>
        </div>
      </div>
    </div>
  );
}
