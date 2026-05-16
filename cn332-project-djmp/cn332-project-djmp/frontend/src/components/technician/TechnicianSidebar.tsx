import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Settings,
  HelpCircle,
  User,
  Building2,
  LogOut,
} from 'lucide-react';
import { useUser } from '../../context/UserContext';

export default function TechnicianSidebar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const mainItems = [
    { name: 'Today', path: '/technician', icon: LayoutDashboard, exact: true },
    { name: 'My tasks', path: '/technician/tasks', icon: ClipboardList },
  ];

  const personalItems = [
    { name: 'Profile', path: '/technician/profile', icon: User },
    { name: 'Settings', path: '/technician/settings', icon: Settings },
    { name: 'Help & Support', path: '/support', icon: HelpCircle },
  ];

  const navItemBase: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 400,
    textDecoration: 'none',
    transition: 'background 0.15s, color 0.15s',
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    textAlign: 'left',
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'T';

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside
      style={{
        width: 232,
        flexShrink: 0,
        borderRight: '1px solid var(--rule)',
        background: 'var(--paper-soft)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* ── Wordmark ── */}
      <div style={{ padding: '20px 18px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <Building2 size={16} style={{ color: 'var(--accent)', alignSelf: 'center', flexShrink: 0 }} />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 17,
            color: 'var(--ink)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>
            Juristic<span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Pro</span>
          </span>
        </div>
        <div style={{ marginTop: 8, fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.35 }}>
          Estate Management
          <div style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>Technician Portal</div>
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--rule-soft)', margin: '0 18px' }} />

      {/* ── Nav ── */}
      <nav style={{ padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 1, flex: 1, overflowY: 'auto' }}>
        <div className="eyebrow" style={{ padding: '8px 8px 6px' }}>Workspace</div>
        {mainItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.exact}
              style={({ isActive }) => ({
                ...navItemBase,
                color: isActive ? 'var(--ink)' : 'var(--ink-2)',
                background: isActive ? 'var(--paper-2)' : 'transparent',
                fontWeight: isActive ? 500 : 400,
              })}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                if (!el.getAttribute('aria-current')) {
                  el.style.background = 'var(--paper-2)';
                  el.style.color = 'var(--ink)';
                }
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                if (!el.getAttribute('aria-current')) {
                  el.style.background = 'transparent';
                  el.style.color = 'var(--ink-2)';
                }
              }}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span style={{
                      position: 'absolute',
                      left: -12,
                      top: 6,
                      bottom: 6,
                      width: 2,
                      background: 'var(--accent)',
                      borderRadius: 2,
                    }} />
                  )}
                  <Icon size={15} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}

        <div className="eyebrow" style={{ padding: '16px 8px 6px' }}>Personal</div>
        {personalItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              style={({ isActive }) => ({
                ...navItemBase,
                color: isActive ? 'var(--ink)' : 'var(--ink-2)',
                background: isActive ? 'var(--paper-2)' : 'transparent',
                fontWeight: isActive ? 500 : 400,
              })}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                if (!el.getAttribute('aria-current')) {
                  el.style.background = 'var(--paper-2)';
                  el.style.color = 'var(--ink)';
                }
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                if (!el.getAttribute('aria-current')) {
                  el.style.background = 'transparent';
                  el.style.color = 'var(--ink-2)';
                }
              }}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span style={{
                      position: 'absolute',
                      left: -12,
                      top: 6,
                      bottom: 6,
                      width: 2,
                      background: 'var(--accent)',
                      borderRadius: 2,
                    }} />
                  )}
                  <Icon size={15} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── User card footer ── */}
      <div style={{ padding: 12, borderTop: '1px solid var(--rule-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px' }}>
          <div
            className="avatar"
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--accent-soft)', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 600, flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Technician'}
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--ink-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Crew B · {(user as any)?.specialty || 'General'}
            </div>
          </div>
          <button
            title="Sign out"
            onClick={handleLogout}
            style={{
              padding: 6, borderRadius: 6, border: 'none',
              background: 'transparent', color: 'var(--ink-4)',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              flexShrink: 0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--paper-2)'; (e.currentTarget as HTMLElement).style.color = 'var(--st-overdue)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--ink-4)'; }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
