import React from 'react';
import { Sun, Moon, Bell, Globe } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';

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
        position: 'absolute', top: 3,
        left: enabled ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%',
        background: 'white', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

function SettingRow({ icon, title, description, right }: {
  icon: React.ReactNode; title: string; description: string; right?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0' }}>
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

function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div className="eyebrow" style={{ marginBottom: 4 }}>{title.toUpperCase()}</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>
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
  const { theme, toggleMode } = useTheme();
  const { isEnabled, toggleEnabled } = useNotifications();

  return (
    <div style={{ overflowY: 'auto', height: '100%' }}>
      {/* ── JP editorial page header ── */}
      <header style={{ padding: '32px 40px 24px', borderBottom: '1px solid var(--rule-soft)' }}>
        <div style={{ minWidth: 0 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>PREFERENCES</div>
          <h1 className="display" style={{ margin: 0, fontSize: 38, lineHeight: 1.06 }}>
            Your
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, color: 'var(--ink-3)', letterSpacing: '-0.01em' }}> settings.</span>
          </h1>
          <p style={{ margin: '10px 0 0', color: 'var(--ink-3)', fontSize: 13.5, maxWidth: 640 }}>
            Control your interface appearance and notification preferences.
          </p>
        </div>
      </header>

      <div style={{ padding: '32px 40px 48px', maxWidth: 720 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Appearance */}
          <Section title="Appearance" sub="Choose your preferred interface colour mode.">
            <SettingRow
              icon={theme.mode === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              title="Colour mode"
              description="Switch between light and dark interface."
              right={
                <div style={{ display: 'flex', gap: 4, background: 'var(--paper-2)', borderRadius: 8, padding: 3 }}>
                  {(['light', 'dark'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => { if (theme.mode !== m) toggleMode(); }}
                      style={{
                        padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
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
      </div>
    </div>
  );
}
