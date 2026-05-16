import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  ClipboardList,
  ShieldCheck,
  ShieldX,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../../utils/api';

interface RequestItem {
  id: number | string;
  request_code?: string;
  category: string;
  description: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  priority: string;
  location: string;
  created_at?: string;
  technician?: string;
  scheduled_date?: string | null;
  deadline?: string | null;
  approved_completion?: string;
}

interface DashboardStats {
  total: number;
  pending: number;
  assigned: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  overdue: number;
  pending_approval: number;
  approved: number;
  rejected: number;
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#6b7280'];

export default function AnalyticsDashboard() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0, pending: 0, assigned: 0, in_progress: 0, completed: 0, cancelled: 0, overdue: 0,
    pending_approval: 0, approved: 0, rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const [requestsRes, statsRes] = await Promise.all([
          api.get('/maintenance-requests/'),
          api.get('/dashboard-stats/'),
        ]);
        setRequests(Array.isArray(requestsRes.data) ? requestsRes.data : []);
        setStats(statsRes.data);
      } catch (error: any) {
        console.error('Error fetching analytics data:', error);
        setErrorMessage(error?.response?.data?.error || 'ไม่สามารถโหลดข้อมูล analytics ได้');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 6 KPI Boxes
  const kpis = useMemo(() => [
    { label: 'Total Requests', value: String(stats.total), icon: ClipboardList, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', sub: `${stats.cancelled} cancelled` },
    { label: 'Pending', value: String(stats.pending), icon: Clock, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', sub: `${stats.assigned} assigned` },
    { label: 'In Progress', value: String(stats.in_progress), icon: TrendingUp, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', sub: 'active work' },
    { label: 'Completed', value: String(stats.completed), icon: CheckCircle, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', sub: `${stats.pending_approval} pending approval` },
    { label: 'Overdue', value: String(stats.overdue), icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', sub: stats.overdue > 0 ? 'needs attention' : 'on track' },
    { label: 'Approved', value: String(stats.approved), icon: ShieldCheck, color: '#059669', bg: 'rgba(5, 150, 105, 0.1)', sub: `${stats.rejected} rejected` },
  ], [stats]);

  // Status distribution for pie chart
  const statusDistribution = useMemo(() => [
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Assigned', value: stats.assigned, color: '#8b5cf6' },
    { name: 'In Progress', value: stats.in_progress, color: '#3b82f6' },
    { name: 'Completed', value: stats.completed, color: '#10b981' },
    { name: 'Cancelled', value: stats.cancelled, color: '#6b7280' },
  ].filter(s => s.value > 0), [stats]);

  // Weekly data
  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    return days.map((day) => {
      const dayRequests = requests.filter((r) => {
        if (!r.created_at) return false;
        return days[new Date(r.created_at).getDay()] === day;
      });
      return {
        day,
        completed: dayRequests.filter((r) => r.status === 'completed').length,
        pending: dayRequests.filter((r) => r.status === 'pending').length,
        overdue: dayRequests.filter((r) => {
          if (!r.deadline) return false;
          if (r.status === 'completed' || r.status === 'cancelled') return false;
          return new Date(r.deadline) < now;
        }).length,
      };
    });
  }, [requests]);

  // Category distribution
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    requests.forEach((r) => map.set(r.category, (map.get(r.category) || 0) + 1));
    return Array.from(map.entries()).map(([name, value], index) => ({
      name, value, color: PIE_COLORS[index % PIE_COLORS.length],
    }));
  }, [requests]);

  // Monthly trend (SLA chart)
  const monthlyData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames.map((month, index) => {
      const monthRequests = requests.filter((r) => {
        if (!r.created_at) return false;
        return new Date(r.created_at).getMonth() === index;
      });
      const completed = monthRequests.filter(r => r.status === 'completed').length;
      const total = monthRequests.length;
      return {
        month,
        total,
        completed,
        sla: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    }).filter((m) => m.total > 0);
  }, [requests]);

  // Technician performance
  const technicianPerformance = useMemo(() => {
    const techMap = new Map<string, { name: string; completed: number; active: number; total: number }>();
    requests.forEach((r) => {
      if (!r.technician || r.technician === '-') return;
      if (!techMap.has(r.technician)) {
        techMap.set(r.technician, { name: r.technician, completed: 0, active: 0, total: 0 });
      }
      const tech = techMap.get(r.technician)!;
      tech.total += 1;
      if (r.status === 'completed') tech.completed += 1;
      if (r.status === 'assigned' || r.status === 'in-progress' || r.status === 'pending') {
        tech.active += 1;
      }
    });
    return Array.from(techMap.values()).map((tech) => ({
      ...tech,
      completionPercent: tech.total > 0 ? Math.round((tech.completed / tech.total) * 100) : 0,
    }));
  }, [requests]);

  return (
    <div className="max-w-7xl mx-auto p-6 fade-in-up pb-20">
      <button
        onClick={() => navigate('/officer')}
        className="flex items-center gap-2 group transition-colors mb-6"
        style={{ color: 'var(--djmp-text-muted)' }}
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-semibold uppercase tracking-widest">Back to Dashboard</span>
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2" style={{ color: 'var(--djmp-text)' }}>Analytics & Performance</h1>
        <p className="text-sm font-medium" style={{ color: 'var(--djmp-text-muted)' }}>Operational insights, SLA compliance, and performance metrics</p>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-xl border px-4 py-3 text-sm font-bold flex items-center gap-2" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
          <AlertTriangle className="w-5 h-5" />
          {errorMessage}
        </div>
      )}

      {/* 6 KPI Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={kpi.label} 
              className="glass-card p-6 border-none flex flex-col justify-between"
              style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: kpi.bg, color: kpi.color }}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black tracking-tight" style={{ color: 'var(--djmp-text)' }}>{loading ? '-' : kpi.value}</p>
                <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--djmp-text-muted)' }}>{kpi.label}</p>
                <p className="text-[10px] font-semibold mt-1" style={{ color: kpi.color }}>{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Chart 1: Overall Status Distribution */}
        <div className="glass-card p-6 border-none" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
          <h2 className="text-xl font-bold uppercase tracking-tight mb-6" style={{ color: 'var(--djmp-text)' }}>Status Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--djmp-surface-2)', border: '1px solid var(--djmp-border)', borderRadius: '12px', color: 'var(--djmp-text)' }}
                  itemStyle={{ color: 'var(--djmp-text)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: SLA Compliance Trend */}
        <div className="glass-card p-6 border-none" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
          <h2 className="text-xl font-bold uppercase tracking-tight mb-6" style={{ color: 'var(--djmp-text)' }}>SLA Compliance Trend (%)</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--djmp-border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--djmp-text-muted)" tick={{ fill: 'var(--djmp-text-muted)' }} />
                <YAxis stroke="var(--djmp-text-muted)" tick={{ fill: 'var(--djmp-text-muted)' }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--djmp-surface-2)', border: '1px solid var(--djmp-border)', borderRadius: '12px', color: 'var(--djmp-text)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="sla" stroke="#10b981" strokeWidth={3} name="SLA %" dot={{ fill: '#10b981', r: 5 }} />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total Requests" dot={{ fill: '#3b82f6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Weekly Performance */}
        <div className="glass-card p-6 border-none" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
          <h2 className="text-xl font-bold uppercase tracking-tight mb-6" style={{ color: 'var(--djmp-text)' }}>Weekly Performance</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--djmp-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--djmp-text-muted)" tick={{ fill: 'var(--djmp-text-muted)' }} />
                <YAxis stroke="var(--djmp-text-muted)" tick={{ fill: 'var(--djmp-text-muted)' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--djmp-surface-2)', border: '1px solid var(--djmp-border)', borderRadius: '12px', color: 'var(--djmp-text)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[4, 4, 0, 0]} />
                <Bar dataKey="overdue" fill="#ef4444" name="Overdue" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Request Categories */}
        <div className="glass-card p-6 border-none" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
          <h2 className="text-xl font-bold uppercase tracking-tight mb-6" style={{ color: 'var(--djmp-text)' }}>Request Categories</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--djmp-surface-2)', border: '1px solid var(--djmp-border)', borderRadius: '12px', color: 'var(--djmp-text)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Technician Performance */}
      <div className="glass-card overflow-hidden border-none shadow-2xl" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--djmp-border)', background: 'var(--djmp-surface-2)' }}>
          <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-3" style={{ color: 'var(--djmp-text)' }}>
            <Users className="w-5 h-5" style={{ color: 'var(--accent-500)' }} />
            Technician Performance
          </h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--djmp-text-muted)' }}>Loading technician performance...</div>
          ) : technicianPerformance.length === 0 ? (
            <div className="p-12 text-center text-sm font-medium" style={{ color: 'var(--djmp-text-muted)' }}>No technician performance data available.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ background: 'var(--djmp-surface-2)' }}>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest" style={{ color: 'var(--djmp-text-muted)', borderBottom: '1px solid var(--djmp-border)' }}>Technician</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest" style={{ color: 'var(--djmp-text-muted)', borderBottom: '1px solid var(--djmp-border)' }}>Completed Tasks</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest" style={{ color: 'var(--djmp-text-muted)', borderBottom: '1px solid var(--djmp-border)' }}>Active Tasks</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest" style={{ color: 'var(--djmp-text-muted)', borderBottom: '1px solid var(--djmp-border)' }}>Total Tasks</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest" style={{ color: 'var(--djmp-text-muted)', borderBottom: '1px solid var(--djmp-border)' }}>Performance</th>
                </tr>
              </thead>
              <tbody>
                {technicianPerformance.map((tech) => (
                  <tr key={tech.name} className="group transition-colors hover:bg-white/5" style={{ borderBottom: '1px solid var(--djmp-border)' }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-lg text-white" style={{ background: 'var(--accent-gradient)' }}>
                          {tech.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                        </div>
                        <span className="font-bold text-sm" style={{ color: 'var(--djmp-text)' }}>{tech.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-black text-emerald-500">{tech.completed}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-amber-500">{tech.active}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold" style={{ color: 'var(--djmp-text)' }}>{tech.total}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 rounded-full h-1.5 w-32 overflow-hidden" style={{ background: 'var(--djmp-surface-2)' }}>
                          <div
                            className="h-full transition-all"
                            style={{ 
                              width: `${tech.completionPercent}%`,
                              background: tech.completionPercent > 80 ? '#10b981' : tech.completionPercent > 50 ? '#f59e0b' : '#ef4444'
                            }}
                          ></div>
                        </div>
                        <span className="text-xs font-black" style={{ color: 'var(--djmp-text)' }}>{tech.completionPercent}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}