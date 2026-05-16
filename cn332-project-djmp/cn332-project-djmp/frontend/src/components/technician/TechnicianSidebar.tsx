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
    </div>
  );
}
