import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Settings,
  HelpCircle,
  Building2,
} from 'lucide-react';

export default function TechnicianSidebar() {
  const menuItems = [
    { name: 'Today', path: '/technician', icon: LayoutDashboard, exact: true },
    { name: 'My Tasks', path: '/technician/tasks', icon: ClipboardList },
  ];

  const bottomItems = [
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Help & Support', path: '/support', icon: HelpCircle },
  ];

  const navItemBase: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'background 0.15s, color 0.15s',
    cursor: 'pointer',
  };

  return (
    <div
      className="hidden md:flex flex-col flex-shrink-0"
      style={{
        width: '232px',
        borderRight: '1px solid var(--rule)',
        background: 'var(--paper-soft)',
        height: '100%',
      }}
    >
      {/* Wordmark */}
      <div style={{
        padding: '16px 18px',
        borderBottom: '1px solid var(--rule-soft)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexShrink: 0,
      }}>
        <Building2 style={{ width: '16px', height: '16px', color: 'var(--accent)', flexShrink: 0 }} />
        <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)', letterSpacing: '-0.01em' }}>
          JuristicPro
        </span>
      </div>

      {/* Nav area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px 0' }}>
        <div className="eyebrow" style={{ padding: '8px 8px 6px', marginBottom: 2 }}>Workspace</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.exact}
                style={({ isActive }) => ({
                  ...navItemBase,
                  color: isActive ? 'var(--ink)' : 'var(--ink-3)',
                  background: isActive ? 'var(--accent-soft)' : 'transparent',
                })}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  if (!el.getAttribute('aria-current')) {
                    el.style.background = 'var(--paper-2)';
                    el.style.color = 'var(--ink-2)';
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  if (!el.getAttribute('aria-current')) {
                    el.style.background = 'transparent';
                    el.style.color = 'var(--ink-3)';
                  }
                }}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span style={{
                        position: 'absolute', left: 0, top: '50%',
                        transform: 'translateY(-50%)',
                        width: '2px', height: '16px',
                        background: 'var(--accent)', borderRadius: '2px',
                      }} />
                    )}
                    <Icon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--rule-soft)', margin: '8px 0' }} />

        <div className="eyebrow" style={{ padding: '8px 8px 6px', marginBottom: 2 }}>Personal</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                style={({ isActive }) => ({
                  ...navItemBase,
                  color: isActive ? 'var(--ink)' : 'var(--ink-3)',
                  background: isActive ? 'var(--accent-soft)' : 'transparent',
                })}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  if (!el.getAttribute('aria-current')) {
                    el.style.background = 'var(--paper-2)';
                    el.style.color = 'var(--ink-2)';
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  if (!el.getAttribute('aria-current')) {
                    el.style.background = 'transparent';
                    el.style.color = 'var(--ink-3)';
                  }
                }}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span style={{
                        position: 'absolute', left: 0, top: '50%',
                        transform: 'translateY(-50%)',
                        width: '2px', height: '16px',
                        background: 'var(--accent)', borderRadius: '2px',
                      }} />
                    )}
                    <Icon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}
