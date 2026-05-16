import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { Bell, User, LogOut, Settings, Building2, ChevronDown, X, Sun, Moon } from 'lucide-react';

export default function TopNavigation() {
  const { user, logout } = useUser();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();
  const { theme, toggleMode } = useTheme();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => { setShowProfile(false); logout(); navigate('/'); };
  const handleOpenProfile = () => { navigate('/profile'); setShowProfile(false); };
  const handleOpenSettings = () => { navigate('/settings'); setShowProfile(false); };

  const getRoleLabel = (role: string) => {
    const map: Record<string, string> = {
      admin: 'System Admin', officer: 'Juristic Officer',
      technician: 'Technician', resident: 'Resident',
    };
    return map[role] || role;
  };

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    right: 0,
    top: '100%',
    marginTop: '4px',
    background: 'var(--paper-card)',
    border: '1px solid var(--rule)',
    borderRadius: '10px',
    boxShadow: 'var(--shadow-lift)',
    overflow: 'hidden',
    zIndex: 100,
  };

  const iconBtnStyle: React.CSSProperties = {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: 'var(--ink-3)',
    transition: 'background 0.15s',
    padding: 0,
    flexShrink: 0,
  };

  return (
    <nav
      style={{
        background: 'var(--paper)',
        borderBottom: '1px solid var(--rule-soft)',
        height: '48px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: '12px',
      }}
    >

      {/* Right actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginLeft: 'auto',
        }}
      >
        {/* Theme toggle */}
        <button
          onClick={toggleMode}
          style={iconBtnStyle}
          title={theme.mode === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--paper-2)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          {theme.mode === 'dark'
            ? <Sun style={{ width: '16px', height: '16px' }} />
            : <Moon style={{ width: '16px', height: '16px' }} />
          }
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ ...iconBtnStyle, position: 'relative' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--paper-2)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <Bell style={{ width: '16px', height: '16px' }} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '14px',
                  height: '14px',
                  background: 'var(--st-overdue)',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 700,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{ ...panelStyle, width: '360px' }}>
              {/* Header */}
              <div
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--rule-soft)',
                }}
              >
                <span
                  style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}
                >
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      fontSize: '11px',
                      color: 'var(--accent)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* List */}
              <div style={{ maxHeight: '384px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding: '32px 16px',
                      textAlign: 'center',
                      color: 'var(--ink-4)',
                    }}
                  >
                    <Bell
                      style={{
                        width: '40px',
                        height: '40px',
                        margin: '0 auto 8px',
                        opacity: 0.3,
                        color: 'var(--ink-4)',
                        display: 'block',
                      }}
                    />
                    <p style={{ fontSize: '12px' }}>No notifications</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--rule-soft)',
                        background: !notif.read ? 'var(--accent-soft)' : 'transparent',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: 500,
                                color: 'var(--ink)',
                              }}
                            >
                              {notif.title}
                            </span>
                            {!notif.read && (
                              <span
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  background: 'var(--accent)',
                                  flexShrink: 0,
                                }}
                              />
                            )}
                          </div>
                          <p
                            style={{
                              fontSize: '11px',
                              color: 'var(--ink-3)',
                              marginBottom: '4px',
                            }}
                          >
                            {notif.message}
                          </p>
                          <p style={{ fontSize: '10px', color: 'var(--ink-4)' }}>
                            {formatTime(notif.timestamp)}
                          </p>
                        </div>
                        <button
                          onClick={() => clearNotification(notif.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--ink-4)',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <X style={{ width: '14px', height: '14px' }} />
                        </button>
                      </div>
                      {!notif.read && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          style={{
                            fontSize: '11px',
                            color: 'var(--accent)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            marginTop: '6px',
                          }}
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 8px',
              borderRadius: '6px',
              background: showProfile ? 'var(--paper-2)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--paper-2)'; }}
            onMouseLeave={(e) => {
              if (!showProfile) {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }
            }}
          >
            {/* Avatar */}
            <span
              className="avatar"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {userInitial}
            </span>

            {/* Name + Role */}
            <div
              className="hidden md:block"
              style={{ textAlign: 'left' }}
            >
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)', lineHeight: 1.2 }}>
                {user?.name || 'User'}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--ink-3)', lineHeight: 1.2 }}>
                {getRoleLabel(user?.role || '')}
              </p>
            </div>

            <ChevronDown style={{ width: '12px', height: '12px', color: 'var(--ink-4)' }} />
          </button>

          {showProfile && (
            <div style={{ ...panelStyle, width: '240px' }}>
              {/* Profile header */}
              <div
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--rule-soft)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span
                    className="avatar lg"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--accent-soft)',
                      color: 'var(--accent)',
                      fontSize: '15px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {userInitial}
                  </span>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>
                      {user?.name || 'User'}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--ink-3)', lineHeight: 1.3 }}>
                      {user?.email || '-'}
                    </p>
                  </div>
                </div>
                <span
                  className="pill accent"
                  style={{ fontSize: '11px' }}
                >
                  {getRoleLabel(user?.role || '')}
                </span>
              </div>

              {/* Menu items */}
              <div style={{ padding: '6px' }}>
                {[
                  { icon: <User style={{ width: '14px', height: '14px' }} />, label: 'View Profile', action: handleOpenProfile },
                  { icon: <Settings style={{ width: '14px', height: '14px' }} />, label: 'Settings', action: handleOpenSettings },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '4px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: 'var(--ink-2)',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--paper-2)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}

                <div style={{ height: '1px', background: 'var(--rule-soft)', margin: '4px 0' }} />

                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '4px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: 'var(--st-overdue)',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--st-overdue-bg)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <LogOut style={{ width: '14px', height: '14px' }} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
