import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Globe,
  HelpCircle,
  Palette,
  Sun,
  Moon,
  Check,
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useTheme, AccentColor } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';

// ── Accent colour catalogue ──
const ACCENTS: { key: AccentColor; label: string; bg: string }[] = [
  { key: 'slate',      label: 'Slate',      bg: 'linear-gradient(135deg,#3B4A57,#222A33)' },
  { key: 'forest',     label: 'Forest',     bg: 'linear-gradient(135deg,#2D5A47,#1F3F31)' },
  { key: 'terracotta', label: 'Terracotta', bg: 'linear-gradient(135deg,#B85540,#963F2D)' },
  { key: 'ink',        label: 'Ink',        bg: 'linear-gradient(135deg,#111318,#000000)' },
  { key: 'blue',       label: 'Ocean Blue', bg: 'linear-gradient(135deg,#3b82f6,#6366f1)' },
  { key: 'violet',     label: 'Violet',     bg: 'linear-gradient(135deg,#8b5cf6,#ec4899)' },
  { key: 'emerald',    label: 'Emerald',    bg: 'linear-gradient(135deg,#10b981,#06b6d4)' },
  { key: 'rose',       label: 'Rose',       bg: 'linear-gradient(135deg,#f43f5e,#fb923c)' },
];

// ── Setting row ──
function SettingRow({ icon, title, description, right }: {
  icon: React.ReactNode; title: string; description: string; right?: React.ReactNode;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '14px 0',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
        background: 'var(--accent-soft)', color: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{description}</div>
      </div>
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
    </div>
  );
}

// ── JP-style toggle switch ──
function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      type="button"
      style={{
        position: 'relative', display: 'inline-flex',
        width: 40, height: 22, borderRadius: 999,
        background: enabled ? 'var(--accent)' : 'var(--rule)',
        border: 'none', cursor: 'pointer', transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute',
        top: 3, left: enabled ? 21 : 3,
        width: 16, height: 16,
        borderRadius: '50%',
        background: 'white',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

// ── Section wrapper ──
function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div className="eyebrow" style={{ marginBottom: 4 }}>{title.toUpperCase()}</div>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 22, margin: 0,
          fontWeight: 700, letterSpacing: '-0.02em',
        }}>
          {title}
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-3)' }}>{sub}</p>
      </div>
      <div className="card" style={{ padding: '0 20px' }}>
        {React.Children.map(children, (child, i) => (
          <>
            {i > 0 && <div style={{ height: 1, background: 'var(--rule-soft)' }} />}
            {child}
          </>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useUser();
  const { theme, setMode, setAccent } = useTheme();
  const { isEnabled, toggleEnabled } = useNotifications();
  const [saved, setSaved] = useState(false);

  const handleAccent = (ac: AccentColor) => {
    setAccent(ac);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleMode = (m: 'light' | 'dark') => {
    setMode(m);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const role = user?.role || 'resident';
  const roleLabel: Record<string, string> = {
    admin: 'System Admin', officer: 'Juristic Officer',
    technician: 'Technician', resident: 'Resident',
  };

  return (
    <div style={{ overflowY: 'auto', height: '100%' }}>
      {/* ── JP editorial page header ── */}
      <header style={{ padding: '32px 40px 24px', borderBottom: '1px solid var(--rule-soft)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>PREFERENCES · {roleLabel[role]?.toUpperCase()}</div>
            <h1 className="display" style={{ margin: 0, fontSize: 38, lineHeight: 1.06 }}>
              Application
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, color: 'var(--ink-3)', letterSpacing: '-0.01em' }}> settings.</span>
            </h1>
            <p style={{ margin: '10px 0 0', color: 'var(--ink-3)', fontSize: 13.5, maxWidth: 640 }}>
              Manage appearance, notifications, and account preferences.
            </p>
          </div>
          {saved && (
            <span className="pill done" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Check size={11} /> Saved
            </span>
          )}
        </div>
      </header>

      <div style={{ padding: '32px 40px 48px', display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: 40, alignItems: 'start' }}>

        {/* ── LEFT column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Appearance */}
          <Section title="Appearance" sub="Theme mode and accent colour for the interface.">
            {/* Mode row */}
            <SettingRow
              icon={theme.mode === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              title="Colour mode"
              description="Switch between light and dark interface."
              right={
                <div style={{ display: 'flex', gap: 4, background: 'var(--paper-2)', borderRadius: 8, padding: 3 }}>
                  {(['light', 'dark'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => handleMode(m)}
                      style={{
                        padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                        fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5,
                        background: theme.mode === m ? 'var(--paper-card)' : 'transparent',
                        color: theme.mode === m ? 'var(--ink)' : 'var(--ink-3)',
                        boxShadow: theme.mode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.15s',
                      }}
                    >
                      {m === 'light' ? <Sun size={12} /> : <Moon size={12} />}
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              }
            />

            {/* Accent picker */}
            <div style={{ paddingBottom: 16 }}>
              <div className="eyebrow" style={{ marginBottom: 10, marginTop: 4 }}>ACCENT COLOUR</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
                {ACCENTS.map(ac => (
                  <button
                    key={ac.key}
                    title={ac.label}
                    onClick={() => handleAccent(ac.key)}
                    style={{
                      aspectRatio: '1', borderRadius: 8, background: ac.bg,
                      border: theme.accent === ac.key ? '2px solid var(--paper)' : '2px solid transparent',
                      outline: theme.accent === ac.key ? '2px solid var(--accent)' : '2px solid transparent',
                      outlineOffset: 2, cursor: 'pointer',
                      position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'transform 0.12s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    {theme.accent === ac.key && (
                      <Check size={14} style={{ color: 'white', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} strokeWidth={3} />
                    )}
                  </button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8, marginTop: 5 }}>
                {ACCENTS.map(ac => (
                  <p key={ac.key} style={{ fontSize: 9.5, textAlign: 'center', color: theme.accent === ac.key ? 'var(--accent)' : 'var(--ink-4)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ac.label}
                  </p>
                ))}
              </div>
            </div>
          </Section>

          {/* Notifications */}
          <Section title="Notifications" sub="Control how and when you receive alerts.">
            <SettingRow
              icon={<Bell size={16} />}
              title="Push notifications"
              description="Receive instant updates for maintenance progress and approvals."
              right={<Toggle enabled={isEnabled} onToggle={() => toggleEnabled(!isEnabled)} />}
            />
          </Section>

          {/* Language */}
          <Section title="Language & Region" sub="Language and formatting preferences.">
            <SettingRow
              icon={<Globe size={16} />}
              title="Language"
              description="Interface language and regional date formats."
              right={<span className="pill" style={{ background: 'var(--paper-2)', color: 'var(--ink-3)', fontSize: 11 }}>English</span>}
            />
          </Section>

        </div>

        {/* ── RIGHT aside ── */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Account card */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>YOUR ACCOUNT</div>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div
                  className="avatar lg"
                  style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'var(--accent-soft)', color: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 600, flexShrink: 0,
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{user?.name || 'User'}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{user?.email || '—'}</div>
                </div>
              </div>
              <div style={{ height: 1, background: 'var(--rule-soft)', marginBottom: 12 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Role', value: roleLabel[role] || role },
                  { label: 'Status', value: 'Active' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{row.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick notes */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>NOTES</div>
            <div className="card" style={{ padding: '4px 0' }}>
              {[
                { title: 'Theme applies instantly', body: 'Colour mode and accent changes take effect immediately — no reload needed.' },
                { title: 'Role-based access', body: 'Your account is protected by role-based access controls.' },
                { title: 'Notifications', body: 'Push notifications require browser permission to be enabled.' },
              ].map((note, i, arr) => (
                <div key={note.title} style={{ padding: '12px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--rule-soft)' : 'none' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink)', marginBottom: 3 }}>{note.title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.45 }}>{note.body}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Help */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>SUPPORT</div>
            <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <HelpCircle size={16} style={{ color: 'var(--ink-3)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>Support Center</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>Available — Mon–Fri 08:00–17:00</div>
              </div>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}
