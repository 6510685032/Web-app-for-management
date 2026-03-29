import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, User, LogOut, Settings, Building2, ChevronDown, X } from 'lucide-react';

export default function TopNavigation() {
  const { user, logout } = useUser();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();
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

  const handleLogout = () => {
    setShowProfile(false);
    logout();
    navigate('/');
  };

  const handleOpenProfile = () => {
    navigate('/profile');
    setShowProfile(false);
  };

  const handleOpenSettings = () => {
    navigate('/settings');
    setShowProfile(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'officer':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'technician':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'resident':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'System Administrator';
      case 'officer':
        return 'Juristic Officer';
      case 'technician':
        return 'Technician';
      case 'resident':
        return 'Resident';
      default:
        return role;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <nav className="bg-white border-b border-blue-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-blue-900">JuristicPro</h1>
              <p className="text-xs text-blue-600">Housing Estate Management</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-blue-100 overflow-hidden">
                  <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                    <h3 className="font-semibold text-blue-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-blue-400">
                        <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b border-blue-50 hover:bg-blue-50/50 transition-colors ${
                            !notif.read ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-blue-900">{notif.title}</h4>
                                {!notif.read && (
                                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                )}
                              </div>
                              <p className="text-sm text-blue-600 mb-2">{notif.message}</p>
                              <p className="text-xs text-blue-400">{formatTime(notif.timestamp)}</p>
                            </div>

                            <button
                              onClick={() => clearNotification(notif.id)}
                              className="text-blue-400 hover:text-blue-600 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {!notif.read && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="text-xs text-blue-600 hover:text-blue-700 mt-2 font-medium"
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

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-3 p-2 pr-3 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                  {userInitial}
                </div>

                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-blue-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-blue-500">{getRoleLabel(user?.role || '')}</p>
                </div>

                <ChevronDown className="w-4 h-4 text-blue-600" />
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-blue-100 overflow-hidden">
                  <div className="p-4 bg-blue-50 border-b border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium text-lg">
                        {userInitial}
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">{user?.name || 'User'}</p>
                        <p className="text-sm text-blue-600">{user?.email || '-'}</p>
                      </div>
                    </div>

                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                        user?.role || ''
                      )}`}
                    >
                      {getRoleLabel(user?.role || '')}
                    </span>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={handleOpenProfile}
                      className="w-full flex items-center gap-3 px-4 py-3 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <User className="w-5 h-5" />
                      <span>View Profile</span>
                    </button>

                    <button
                      onClick={handleOpenSettings}
                      className="w-full flex items-center gap-3 px-4 py-3 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                      <span>Settings</span>
                    </button>

                    <div className="border-t border-blue-100 my-2"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
