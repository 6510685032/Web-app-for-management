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
  HelpCircle
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
  ];

  return (
    <div
      className="hidden md:flex flex-col w-64 flex-shrink-0"
      style={{
        borderRight: '1px solid var(--djmp-border)',
        background: 'var(--djmp-surface-2)',
      }}
    >
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                  ? 'text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`
              }
              style={({ isActive }) =>
                isActive ? { background: 'var(--accent-gradient)' } : {}
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.name}</span>
            </NavLink>
          );
        })}

        <div className="my-6 border-t border-white/10" />

        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                  ? 'text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`
              }
              style={({ isActive }) =>
                isActive ? { background: 'var(--accent-gradient)' } : {}
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
