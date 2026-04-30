import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  Briefcase,
  BarChart3,
  BookOpen,
  Bell,
  MessageSquare,
  Settings
} from 'lucide-react';

export default function TechnicianSidebar() {
  const menuItems = [
    { name: 'Dashboard', path: '/technician', icon: LayoutDashboard, exact: true },
    { name: 'My Tasks', path: '/technician/tasks', icon: ClipboardList },
    { name: 'Calendar', path: '/technician/calendar', icon: CalendarDays },
    { name: 'Work Orders', path: '/technician/work-orders', icon: Briefcase },
    { name: 'Reports', path: '/technician/reports', icon: BarChart3 },
    { name: 'Knowledge Base', path: '/technician/knowledge', icon: BookOpen },
  ];

  const secondaryItems = [
    { name: 'Notifications', path: '/technician/notifications', icon: Bell, badge: 2 },
    { name: 'Messages', path: '/technician/messages', icon: MessageSquare },
  ];

  const bottomItems = [
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div
      className="hidden md:flex flex-col w-64 flex-shrink-0 transition-all duration-300"
      style={{
        borderRight: '1px solid var(--djmp-border)',
        background: 'var(--djmp-nav-bg)',
        backdropFilter: 'blur(20px)',
        height: 'calc(100vh - 64px)',
        position: 'sticky',
        top: '64px'
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
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                  ? 'text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
              style={({ isActive }) =>
                isActive ? { background: 'var(--accent-gradient)' } : {}
              }
            >
              <Icon className={`w-5 h-5 transition-transform group-hover:scale-110`} />
              <span className="font-medium text-sm">{item.name}</span>
            </NavLink>
          );
        })}

        <div className="my-6 border-t" style={{ borderColor: 'var(--djmp-border)' }} />

        {secondaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                  ? 'text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
              style={({ isActive }) =>
                isActive ? { background: 'var(--accent-gradient)' } : {}
              }
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110`} />
                <span className="font-medium text-sm">{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded-md bg-red-500 text-[10px] font-bold text-white shadow-sm">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        <div className="my-6 border-t" style={{ borderColor: 'var(--djmp-border)' }} />

        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                  ? 'text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
              style={({ isActive }) =>
                isActive ? { background: 'var(--accent-gradient)' } : {}
              }
            >
              <Icon className={`w-5 h-5 transition-transform group-hover:scale-110`} />
              <span className="font-medium text-sm">{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 mt-auto">
         <div 
          className="p-4 rounded-2xl flex flex-col items-center text-center space-y-2 group cursor-pointer overflow-hidden relative"
          style={{ 
            background: 'var(--djmp-surface-2)',
            border: '1px solid var(--djmp-border)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 relative z-10">
             {/* Placeholder for small avatar in footer */}
             <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                TH
             </div>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold truncate w-full" style={{ color: 'var(--djmp-text)' }}>Technician Portal</p>
            <p className="text-[10px]" style={{ color: 'var(--djmp-text-muted)' }}>V2.4.0 Build 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
