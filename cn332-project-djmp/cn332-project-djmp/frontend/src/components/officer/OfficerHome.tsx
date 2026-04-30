import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import StatusBadge from '../shared/StatusBadge';
import {
  ClipboardList,
  UserCheck,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  Columns,
  CalendarDays,
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="djmp-bg">
    <div className="max-w-7xl mx-auto p-6" style={{ position: 'relative', zIndex: 1 }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--djmp-text)' }}>Juristic Officer Dashboard</h1>
        <p style={{ color: 'var(--djmp-text-muted)' }}>Welcome back, {user?.name}! Here's your management overview</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <button onClick={() => navigate('/officer/requests')} className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-colors shadow-lg group">
          <div className="flex items-center justify-between gap-4">
            <div className="text-left min-w-0">
              <h3 className="text-base font-semibold mb-1">Manage Requests</h3>
              <p className="text-blue-100 text-sm">Review & approve</p>
            </div>
            <ClipboardList className="w-8 h-8 flex-shrink-0 group-hover:scale-110 transition-transform" />
          </div>
        </button>

        <button onClick={() => navigate('/officer/kanban')} className="bg-white p-6 rounded-xl hover:bg-blue-50 transition-colors shadow-lg border border-blue-100 group">
          <div className="flex items-center justify-between gap-4">
            <div className="text-left min-w-0">
              <h3 className="text-base font-semibold text-blue-900 mb-1">Kanban Board</h3>
              <p className="text-blue-600 text-sm">Drag & drop queue</p>
            </div>
            <Columns className="w-8 h-8 text-blue-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
          </div>
        </button>

        <button onClick={() => navigate('/officer/dispatch')} className="bg-white p-6 rounded-xl hover:bg-blue-50 transition-colors shadow-lg border border-blue-100 group">
          <div className="flex items-center justify-between gap-4">
            <div className="text-left min-w-0">
              <h3 className="text-base font-semibold text-blue-900 mb-1">Dispatch Tasks</h3>
              <p className="text-blue-600 text-sm">Assign technicians</p>
            </div>
            <UserCheck className="w-8 h-8 text-blue-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
          </div>
        </button>

        <button onClick={() => navigate('/officer/schedule')} className="bg-white p-6 rounded-xl hover:bg-blue-50 transition-colors shadow-lg border border-blue-100 group">
          <div className="flex items-center justify-between gap-4">
            <div className="text-left min-w-0">
              <h3 className="text-base font-semibold text-blue-900 mb-1">Tech Schedule</h3>
              <p className="text-blue-600 text-sm">Work timetable</p>
            </div>
            <CalendarDays className="w-8 h-8 text-blue-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
          </div>
        </button>

        <button onClick={() => navigate('/officer/analytics')} className="bg-white p-6 rounded-xl hover:bg-blue-50 transition-colors shadow-lg border border-blue-100 group">
          <div className="flex items-center justify-between gap-4">
            <div className="text-left min-w-0">
              <h3 className="text-base font-semibold text-blue-900 mb-1">Analytics</h3>
              <p className="text-blue-600 text-sm">Performance data</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
          </div>
        </button>
      </div>

      {/* Dashboard 4 Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          const glows = ['stat-glow-blue','stat-glow-yellow','stat-glow-blue','stat-glow-red'];
          return (
            <div key={stat.label} className={`glass-card p-6 ${glows[i]}`}>
              {loading ? (
                <><div className="shimmer-skeleton w-12 h-12 rounded-lg mb-4" /><div className="shimmer-skeleton h-8 w-16 mb-2" /><div className="shimmer-skeleton h-4 w-24" /></>
              ) : (
                <><div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}><Icon className="w-6 h-6 text-white" /></div>
                  <p className="text-3xl font-bold mb-1" style={{ color: 'var(--djmp-text)' }}>{stat.value}</p>
                  <p className="text-sm" style={{ color: 'var(--djmp-text-muted)' }}>{stat.label}</p></>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Pending Requests */}
        <div className="md:col-span-2">
          <div className="glass-card overflow-hidden">
            <div className="p-6 flex justify-between items-center" style={{ borderBottom: '1px solid var(--djmp-border)' }}>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--djmp-text)' }}>Pending Review</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--djmp-text-muted)' }}>Requests awaiting your approval</p>
              </div>
              <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: 'rgba(245,158,11,0.15)', color: '#b45309' }}>
                {pendingRequests.length} Pending
              </span>
            </div>
            <div style={{ borderBottom: '1px solid var(--djmp-border)' }}>
              {loading ? (
                <div className="p-6 space-y-3">{[1,2,3].map(i=><div key={i} className="shimmer-skeleton h-12" />)}</div>
              ) : pendingRequests.length === 0 ? (
                <div className="p-6 text-center" style={{ color: 'var(--djmp-text-muted)' }}>No pending requests</div>
              ) : (
                pendingRequests.map((request) => (
                  <div key={request.id} className="p-4 cursor-pointer transition-colors"
                    style={{ borderTop: '1px solid var(--djmp-border)' }}
                    onClick={() => navigate('/officer/requests')}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-shimmer)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium" style={{ color: 'var(--djmp-text)' }}>{request.request_code}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'var(--accent-shimmer)', color: 'var(--accent-700)' }}>{request.priority}</span>
                        </div>
                        <p className="text-sm mb-1" style={{ color: 'var(--djmp-text-muted)' }}>{request.resident} • Unit {request.unit}</p>
                        <p className="text-sm" style={{ color: 'var(--djmp-text-muted)' }}>{request.category}: {request.description}</p>
                      </div>
                      <div className="text-right text-xs" style={{ color: 'var(--djmp-text-muted)' }}><p>{request.created_at}</p></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Active Technicians */}
        <div>
          <div className="glass-card overflow-hidden">
            <div className="p-6" style={{ borderBottom: '1px solid var(--djmp-border)' }}>
              <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: 'var(--djmp-text)' }}>
                <Users className="w-5 h-5" />Technicians
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="shimmer-skeleton h-16 rounded-xl" />)}</div>
              ) : technicians.length === 0 ? (
                <div className="text-center py-4" style={{ color: 'var(--djmp-text-muted)' }}>No technicians found</div>
              ) : (
                technicians.map((tech) => (
                  <div key={tech.id} className="p-3 rounded-xl" style={{ background: 'var(--djmp-surface-2)', border: '1px solid var(--djmp-border)' }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white" style={{ background: 'var(--accent-gradient)' }}>
                        {tech.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium" style={{ color: 'var(--djmp-text)' }}>{tech.name}</p>
                        <p className="text-xs" style={{ color: 'var(--djmp-text-muted)' }}>{tech.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--djmp-text-muted)' }}>Active: {tech.active_tasks} | Done: {tech.completed_tasks}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={tech.active_tasks < 4 ? { background: 'rgba(16,185,129,0.15)', color: '#047857' } : { background: 'rgba(245,158,11,0.15)', color: '#b45309' }}>
                        {tech.active_tasks < 4 ? 'Available' : 'Busy'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
