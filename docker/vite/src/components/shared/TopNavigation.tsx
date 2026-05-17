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

  const dropdownStyle: React.CSSProperties = {
    background: 'var(--djmp-nav-bg)',
    border: '1px solid var(--djmp-border)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
  };

  return (
    <nav
      className="glass-nav sticky top-0 z-50"
      style={{ transition: 'background 0.3s' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--accent-gradient)', boxShadow: '0 4px 12px var(--accent-glow)' }}
            >
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold gradient-text text-lg leading-none">JuristicPro</h1>
              <p className="text-xs" style={{ color: 'var(--djmp-text-muted)' }}>
                Housing Estate Management
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">

            {/* Dark/Light toggle */}
            <button
              onClick={toggleMode}
              className="p-2 rounded-lg transition-colors"
              style={{
                color: 'var(--djmp-text-muted)',
                background: 'transparent',
              }}
              title={theme.mode === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            >
              {theme.mode === 'dark'
                ? <Sun className="w-5 h-5" />
                : <Moon className="w-5 h-5" />
              }
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg transition-colors"
                style={{ color: 'var(--djmp-text-muted)' }}
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-1 right-1 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center font-medium avatar-ring"
                    style={{ background: '#ef4444' }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  className="absolute right-0 mt-2 w-96 rounded-2xl overflow-hidden fade-in-up"
                  style={dropdownStyle}
                >
                  <div
                    className="p-4 flex justify-between items-center"
                    style={{ borderBottom: '1px solid var(--djmp-border)' }}
                  >
                    <h3 className="font-semibold" style={{ color: 'var(--djmp-text)' }}>
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs font-medium"
                        style={{ color: 'var(--accent-600)' }}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center" style={{ color: 'var(--djmp-text-muted)' }}>
                        <Bell className="w-12 h-12 mx-auto mb-2 opacity-40" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="p-4 transition-colors"
                          style={{
                            borderBottom: '1px solid var(--djmp-border)',
                            background: !notif.read ? 'var(--accent-shimmer)' : 'transparent',
                          }}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium" style={{ color: 'var(--djmp-text)' }}>
                                  {notif.title}
                                </h4>
                                {!notif.read && (
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ background: 'var(--accent-500)' }}
                                  />
                                )}
                              </div>
                              <p className="text-sm mb-2" style={{ color: 'var(--djmp-text-muted)' }}>
                                {notif.message}
                              </p>
                              <p className="text-xs" style={{ color: 'var(--djmp-text-muted)', opacity: 0.7 }}>
                                {formatTime(notif.timestamp)}
                              </p>
                            </div>
                            <button
                              onClick={() => clearNotification(notif.id)}
                              style={{ color: 'var(--djmp-text-muted)' }}
                              className="p-1 hover:opacity-70 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          {!notif.read && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="text-xs font-medium mt-2"
                              style={{ color: 'var(--accent-600)' }}
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
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-3 p-2 pr-3 rounded-xl transition-colors"
                style={{ background: showProfile ? 'var(--accent-shimmer)' : 'transparent' }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-white"
                  style={{ background: 'var(--accent-gradient)' }}
                >
                  {userInitial}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium" style={{ color: 'var(--djmp-text)' }}>
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--djmp-text-muted)' }}>
                    {getRoleLabel(user?.role || '')}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4" style={{ color: 'var(--djmp-text-muted)' }} />
              </button>

              {showProfile && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-2xl overflow-hidden fade-in-up"
                  style={dropdownStyle}
                >
                  <div className="p-4" style={{ borderBottom: '1px solid var(--djmp-border)' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white text-lg"
                        style={{ background: 'var(--accent-gradient)' }}
                      >
                        {userInitial}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--djmp-text)' }}>
                          {user?.name || 'User'}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--djmp-text-muted)' }}>
                          {user?.email || '-'}
                        </p>
                      </div>
                    </div>
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                      style={{ background: 'var(--accent-shimmer)', color: 'var(--accent-700)' }}
                    >
                      {getRoleLabel(user?.role || '')}
                    </span>
                  </div>

                  <div className="p-2">
                    {[
                      { icon: <User className="w-5 h-5" />, label: 'View Profile', action: handleOpenProfile },
                      { icon: <Settings className="w-5 h-5" />, label: 'Settings', action: handleOpenSettings },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left"
                        style={{ color: 'var(--djmp-text)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-shimmer)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    ))}

                    <div style={{ borderTop: '1px solid var(--djmp-border)', margin: '4px 0' }} />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left"
                      style={{ color: '#ef4444' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
