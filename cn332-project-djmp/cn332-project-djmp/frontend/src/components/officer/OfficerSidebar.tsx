import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Columns,
  UserCheck,
  CalendarDays,
  BarChart3,
  Settings,
  HelpCircle,
  Building2,
} from 'lucide-react';

export default function OfficerSidebar() {
  const menuItems = [
    { name: 'Dashboard', path: '/officer', icon: LayoutDashboard, exact: true },
    { name: 'Manage Requests', path: '/officer/requests', icon: ClipboardList },
    { name: 'Kanban Board', path: '/officer/kanban', icon: Columns },
    { name: 'Dispatch Tasks', path: '/officer/dispatch', icon: UserCheck },
    { name: 'Tech Schedule', path: '/officer/schedule', icon: CalendarDays },
    { name: 'Analytics', path: '/officer/analytics', icon: BarChart3 },
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
      <div
        style={{
          padding: '16px 18px',
          borderBottom: '1px solid var(--rule-soft)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        <Building2 style={{ width: '16px', height: '16px', color: 'var(--accent)', flexShrink: 0 }} />
        <span
          style={{
            fontWeight: 600,
            fontSize: '13px',
            color: 'var(--ink)',
            letterSpacing: '-0.01em',
          }}
        >
          JuristicPro
        </span>
      </div>

      {/* Nav area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 8px 0',
        }}
      >
        {/* Main items */}
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
                      <span
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '2px',
                          height: '16px',
                          background: 'var(--accent)',
                          borderRadius: '2px',
                        }}
                      />
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
        <div
          style={{
            height: '1px',
            background: 'var(--rule-soft)',
            margin: '8px 0',
          }}
        />

        {/* Bottom items */}
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
                      <span
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '2px',
                          height: '16px',
                          background: 'var(--accent)',
                          borderRadius: '2px',
                        }}
                      />
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
