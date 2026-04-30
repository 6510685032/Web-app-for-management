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
    { name: 'Help & Support', path: '/support', icon: HelpCircle },
  ];

  return (
    <div 
      className="hidden md:flex flex-col w-64 flex-shrink-0" 
      style={{ 
        borderRight: '1px solid var(--djmp-border)', 
        background: 'var(--djmp-surface-2)',
        height: 'calc(100vh - 64px)' // Assuming TopNavigation is ~64px
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
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
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
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
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

      <div className="p-4 border-t" style={{ borderColor: 'var(--djmp-border)' }}>
        <div className="p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--djmp-border)' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-white">System Status</span>
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
          </div>
          <p className="text-[10px]" style={{ color: 'var(--djmp-text-muted)' }}>All systems operational</p>
          
          <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center text-[10px]">
            <span style={{ color: 'var(--djmp-text-muted)' }}>Version</span>
            <span className="font-mono text-white">V2.4.0 STABLE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
