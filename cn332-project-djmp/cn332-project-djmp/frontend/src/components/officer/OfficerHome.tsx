import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import {
  ClipboardList,
  UserCheck,
  BarChart3,
  Clock,
  AlertTriangle,
  Columns,
  CalendarDays,
  ChevronRight,
  Headset
} from 'lucide-react';
import api from '../../utils/api';

interface DashboardStats {
  total: number;
  pending: number;
  in_progress: number;
  overdue: number;
  assigned: number;
  completed: number;
}

interface RequestItem {
  id: number;
  request_code: string;
  resident: string;
  unit: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
}

export default function OfficerHome() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({ total: 0, pending: 0, in_progress: 0, overdue: 0, assigned: 0, completed: 0 });
  const [pendingRequests, setPendingRequests] = useState<RequestItem[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, requestsRes, techRes] = await Promise.all([
          api.get('/dashboard-stats/'),
          api.get('/maintenance-requests/'),
          api.get('/technicians/'),
        ]);
        setStats(statsRes.data);
        const allRequests = Array.isArray(requestsRes.data) ? requestsRes.data : [];
        setPendingRequests(allRequests.filter((r: RequestItem) => r.status === 'pending').slice(0, 5));
        setTechnicians(Array.isArray(techRes.data) ? techRes.data : []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Requests', value: stats.total, icon: ClipboardList, color: 'bg-blue-500' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-yellow-500' },
    { label: 'In Progress', value: stats.in_progress, icon: UserCheck, color: 'bg-blue-600' },
    { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'bg-red-500' },
  ];

  return (
    <div className="pb-12">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8" style={{ position: 'relative', zIndex: 1 }}>
        <div className="mb-8 fade-in-up">
          <h1 className="text-3xl font-bold mb-2 tracking-wide" style={{ color: 'var(--djmp-text)' }}>Juristic Officer Dashboard</h1>
          <p style={{ color: 'var(--djmp-text-muted)' }}>Welcome back, {user?.name}! Here's your management overview</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Main Left Column (wider) */}
          <div className="lg:col-span-8 flex flex-col gap-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
            
            {/* Quick Actions (Wide Banners) */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => navigate('/officer/requests')} 
                className="w-full text-white p-5 rounded-xl hover:shadow-lg transition-all group flex items-center justify-between"
                style={{ background: 'var(--accent-gradient)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-sm">
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left min-w-0">
                    <h3 className="text-base font-bold tracking-wide">Manage Requests</h3>
                    <p className="text-white/80 text-xs mt-0.5">Review & approve requests</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                onClick={() => navigate('/officer/kanban')} 
                className="w-full p-5 rounded-xl transition-all group flex items-center justify-between cursor-pointer"
                style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--djmp-surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--djmp-surface)'}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-shimmer)' }}>
                    <Columns className="w-6 h-6" style={{ color: 'var(--accent-500)' }} />
                  </div>
                  <div className="text-left min-w-0">
                    <h3 className="text-base font-bold tracking-wide" style={{ color: 'var(--djmp-text)' }}>Kanban Board</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--djmp-text-muted)' }}>Drag & drop queue</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 transition-all group-hover:translate-x-1" style={{ color: 'var(--djmp-text-muted)' }} />
              </button>

              <button 
                onClick={() => navigate('/officer/dispatch')} 
                className="w-full p-5 rounded-xl transition-all group flex items-center justify-between cursor-pointer"
                style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--djmp-surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--djmp-surface)'}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-shimmer)' }}>
                    <UserCheck className="w-6 h-6" style={{ color: 'var(--accent-500)' }} />
                  </div>
                  <div className="text-left min-w-0">
                    <h3 className="text-base font-bold tracking-wide" style={{ color: 'var(--djmp-text)' }}>Dispatch Tasks</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--djmp-text-muted)' }}>Assign technicians</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 transition-all group-hover:translate-x-1" style={{ color: 'var(--djmp-text-muted)' }} />
              </button>

              <button 
                onClick={() => navigate('/officer/schedule')} 
                className="w-full p-5 rounded-xl transition-all group flex items-center justify-between cursor-pointer"
                style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--djmp-surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--djmp-surface)'}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-shimmer)' }}>
                    <CalendarDays className="w-6 h-6" style={{ color: 'var(--accent-500)' }} />
                  </div>
                  <div className="text-left min-w-0">
                    <h3 className="text-base font-bold tracking-wide" style={{ color: 'var(--djmp-text)' }}>Tech Schedule</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--djmp-text-muted)' }}>Work timetable</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 transition-all group-hover:translate-x-1" style={{ color: 'var(--djmp-text-muted)' }} />
              </button>

              <button 
                onClick={() => navigate('/officer/analytics')} 
                className="w-full p-5 rounded-xl transition-all group flex items-center justify-between cursor-pointer"
                style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--djmp-surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--djmp-surface)'}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-shimmer)' }}>
                    <BarChart3 className="w-6 h-6" style={{ color: 'var(--accent-500)' }} />
                  </div>
                  <div className="text-left min-w-0">
                    <h3 className="text-base font-bold tracking-wide" style={{ color: 'var(--djmp-text)' }}>Analytics</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--djmp-text-muted)' }}>Performance data</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 transition-all group-hover:translate-x-1" style={{ color: 'var(--djmp-text-muted)' }} />
              </button>
            </div>

            {/* Dashboard 4 Boxes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
              {statCards.map((stat, i) => {
                const Icon = stat.icon;
                const glows = ['stat-glow-blue','stat-glow-yellow','stat-glow-blue','stat-glow-red'];
                return (
                  <div key={stat.label} className={`glass-card p-5 ${glows[i]}`}>
                    {loading ? (
                      <><div className="shimmer-skeleton w-10 h-10 rounded-lg mb-3" /><div className="shimmer-skeleton h-6 w-12 mb-1" /><div className="shimmer-skeleton h-3 w-20" /></>
                    ) : (
                      <><div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}><Icon className="w-5 h-5 text-white" /></div>
                        <p className="text-2xl font-bold mb-0.5" style={{ color: 'var(--djmp-text)' }}>{stat.value}</p>
                        <p className="text-xs" style={{ color: 'var(--djmp-text-muted)' }}>{stat.label}</p></>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pending Requests */}
            <div className="glass-card overflow-hidden mt-2">
              <div className="p-6 flex justify-between items-center" style={{ borderBottom: '1px solid var(--djmp-border)' }}>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--djmp-text)' }}>Pending Review</h2>
                  <p className="text-xs mt-1" style={{ color: 'var(--djmp-text-muted)' }}>Requests awaiting your approval</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: '#b45309' }}>
                  {pendingRequests.length} Pending
                </span>
              </div>
              <div>
                {loading ? (
                  <div className="p-6 space-y-3">{[1,2,3].map(i=><div key={i} className="shimmer-skeleton h-12" />)}</div>
                ) : pendingRequests.length === 0 ? (
                  <div className="p-6 text-center text-sm" style={{ color: 'var(--djmp-text-muted)' }}>No pending requests</div>
                ) : (
                  pendingRequests.map((request, idx) => (
                    <div key={request.id} className="p-4 cursor-pointer transition-colors"
                      style={{ borderTop: idx > 0 ? '1px solid var(--djmp-border)' : 'none' }}
                      onClick={() => navigate('/officer/requests')}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-shimmer)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm" style={{ color: 'var(--djmp-text)' }}>{request.request_code}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: 'var(--accent-shimmer)', color: 'var(--accent-700)' }}>{request.priority}</span>
                          </div>
                          <p className="text-xs mb-1 truncate" style={{ color: 'var(--djmp-text-muted)' }}>{request.resident} • Unit {request.unit}</p>
                          <p className="text-xs truncate" style={{ color: 'var(--djmp-text-muted)' }}>{request.category}: {request.description}</p>
                        </div>
                        <div className="text-right text-[11px] whitespace-nowrap pl-4" style={{ color: 'var(--djmp-text-muted)' }}>{request.created_at}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right Sidebar - Technicians */}
          <div className="lg:col-span-4 fade-in-up flex flex-col gap-6" style={{ animationDelay: '0.2s' }}>
            
            <div className="glass-card flex flex-col h-[550px]">
              <div className="p-5 flex-shrink-0 flex items-center justify-between" style={{ borderBottom: '1px solid var(--djmp-border)' }}>
                <h2 className="text-lg font-bold" style={{ color: 'var(--djmp-text)' }}>Technicians</h2>
                <button 
                  onClick={() => navigate('/officer/schedule')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                  style={{ background: 'var(--accent-shimmer)', color: 'var(--accent-500)' }}
                >
                  View All
                </button>
              </div>
              
              {/* Scrollable list area */}
              <div className="p-4 space-y-2 overflow-y-auto custom-scrollbar flex-1">
                {loading ? (
                  <div className="space-y-3">{[1,2,3,4,5].map(i=><div key={i} className="shimmer-skeleton h-16 rounded-xl" />)}</div>
                ) : technicians.length === 0 ? (
                  <div className="text-center py-8 text-sm" style={{ color: 'var(--djmp-text-muted)' }}>No technicians found</div>
                ) : (
                  technicians.map((tech) => {
                    // Status logic matching mockup (Online, In Progress, On Site, Offline)
                    let statusLabel = 'Offline';
                    let statusColor = 'gray'; // bg-gray-500
                    if (tech.active_tasks > 0 && tech.active_tasks < 3) {
                      statusLabel = 'In Progress';
                      statusColor = 'blue'; // bg-blue-500
                    } else if (tech.active_tasks >= 3) {
                      statusLabel = 'On Site';
                      statusColor = 'purple'; // bg-purple-500
                    } else {
                      statusLabel = 'Online';
                      statusColor = 'green'; // bg-green-500
                    }

                    return (
                      <div key={tech.id} className="p-3 rounded-xl transition-colors flex items-center justify-between cursor-pointer group" 
                        style={{ border: '1px solid transparent' }}
                        onClick={() => navigate('/officer/schedule')}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'var(--djmp-surface-2)';
                          e.currentTarget.style.borderColor = 'var(--djmp-border)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = 'transparent';
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0" style={{ background: 'var(--accent-gradient)' }}>
                            {tech.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate" style={{ color: 'var(--djmp-text)' }}>{tech.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`w-2 h-2 rounded-full bg-${statusColor}-500 shadow-[0_0_6px_rgba(0,0,0,0.2)]`} />
                              <p className="text-[11px] font-medium" style={{ color: 'var(--djmp-text-muted)' }}>{statusLabel}</p>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" style={{ color: 'var(--djmp-text-muted)' }} />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Need Help Card */}
            <div className="rounded-2xl p-6 relative overflow-hidden shadow-lg" style={{ background: 'var(--accent-gradient)' }}>
               {/* Decorative background circle */}
               <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
               <div className="absolute right-4 bottom-4 opacity-20 transform -rotate-12">
                 <Headset className="w-20 h-20 text-white" />
               </div>
               
               <div className="relative z-10">
                 <h3 className="text-white font-bold text-lg mb-1">Need Help?</h3>
                 <p className="text-white/90 text-xs mb-5">Contact support team</p>
                 <button 
                    onClick={() => navigate('/support')}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors text-white text-sm font-semibold py-2.5 px-5 rounded-xl border border-white/20 cursor-pointer"
                 >
                    <Headset className="w-4 h-4" />
                    Contact Support
                 </button>
               </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
