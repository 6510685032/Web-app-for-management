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

// JuristicPro design palette — hex equivalents of CSS tokens (used in SVG fills)
const CHART_FOREST     = '#2D5A47';
const CHART_OCHRE      = '#957A20';
const CHART_SLATE      = '#3B4A57';
const CHART_TERRACOTTA = '#B85540';
const CHART_INK3       = '#636878';
const CHART_OCHRE2     = '#7A6318';
const PIE_COLORS = [CHART_FOREST, CHART_SLATE, CHART_OCHRE, CHART_TERRACOTTA, CHART_INK3, CHART_OCHRE2];

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

  // 6 KPI Boxes — using JuristicPro design token colors
  const kpis = useMemo(() => [
    { label: 'Total Requests', value: String(stats.total), icon: ClipboardList,
      color: CHART_SLATE, bg: 'var(--slate-soft)', sub: `${stats.cancelled} cancelled` },
    { label: 'Pending', value: String(stats.pending), icon: Clock,
      color: CHART_OCHRE, bg: 'var(--ochre-soft)', sub: `${stats.assigned} assigned` },
    { label: 'In Progress', value: String(stats.in_progress), icon: TrendingUp,
      color: CHART_SLATE, bg: 'var(--slate-soft)', sub: 'active work' },
    { label: 'Completed', value: String(stats.completed), icon: CheckCircle,
      color: CHART_FOREST, bg: 'var(--forest-soft)', sub: `${stats.pending_approval} pending approval` },
    { label: 'Overdue', value: String(stats.overdue), icon: AlertTriangle,
      color: CHART_TERRACOTTA, bg: 'var(--terracotta-soft)', sub: stats.overdue > 0 ? 'needs attention' : 'on track' },
    { label: 'Approved', value: String(stats.approved), icon: ShieldCheck,
      color: CHART_FOREST, bg: 'var(--forest-soft)', sub: `${stats.rejected} rejected` },
  ], [stats]);

  // Status distribution for pie chart — JuristicPro palette
  const statusDistribution = useMemo(() => [
    { name: 'Pending',     value: stats.pending,     color: CHART_OCHRE      },
    { name: 'Assigned',    value: stats.assigned,    color: CHART_SLATE      },
    { name: 'In Progress', value: stats.in_progress, color: CHART_SLATE      },
    { name: 'Completed',   value: stats.completed,   color: CHART_FOREST     },
    { name: 'Cancelled',   value: stats.cancelled,   color: CHART_INK3       },
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

  // Chart tooltip style using design tokens (resolved at render time)
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'var(--paper-card)',
      border: '1px solid var(--rule)',
      borderRadius: '6px',
      color: 'var(--ink)',
      fontSize: '12px',
    },
    itemStyle: { color: 'var(--ink-2)' },
  };

  return (
    <div style={{ padding: '32px 40px', minHeight: '100vh', background: 'var(--paper)' }}>
      <button
        onClick={() => navigate('/officer')}
        className="flex items-center gap-2 transition-colors mb-6"
        style={{ color: 'var(--ink-3)', fontSize: '13px' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-3)')}
      >
        <ArrowLeft style={{ width: 16, height: 16 }} />
        Back to Dashboard
      </button>

      <div className="mb-8">
        <p className="eyebrow mb-1">Analytics</p>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 4 }}>
          Performance & Insights
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>
          Operational insights, SLA compliance, and performance metrics
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2" style={{
          background: 'var(--terracotta-soft)', border: '1px solid var(--terracotta)',
          borderRadius: 6, padding: '10px 14px', fontSize: 13, color: 'var(--terracotta)'
        }}>
          <AlertTriangle style={{ width: 16, height: 16 }} />
          {errorMessage}
        </div>
      )}

      {/* 6 KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}
        className="grid-cols-2-mobile">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="card lifted" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 6, background: kpi.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon style={{ width: 16, height: 16, color: kpi.color }} />
              </div>
              <div>
                <p className="numerals" style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>
                  {loading ? '—' : kpi.value}
                </p>
                <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{kpi.label}</p>
                <p style={{ fontSize: 11, color: kpi.color, marginTop: 4 }}>{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Chart 1: Overall Status Distribution */}
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>Status Distribution</h2>
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
                <Tooltip contentStyle={tooltipStyle.contentStyle} itemStyle={tooltipStyle.itemStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: SLA Compliance Trend */}
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>SLA Compliance Trend (%)</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--rule)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--ink-4)" tick={{ fill: 'var(--ink-4)', fontSize: 11 }} />
                <YAxis stroke="var(--ink-4)" tick={{ fill: 'var(--ink-4)', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle.contentStyle} itemStyle={tooltipStyle.itemStyle} />
                <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12 }} />
                <Line type="monotone" dataKey="sla" stroke={CHART_FOREST} strokeWidth={2} name="SLA %" dot={{ fill: CHART_FOREST, r: 4 }} />
                <Line type="monotone" dataKey="total" stroke={CHART_SLATE} strokeWidth={2} name="Total Requests" dot={{ fill: CHART_SLATE, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Weekly Performance */}
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>Weekly Performance</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--rule)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--ink-4)" tick={{ fill: 'var(--ink-4)', fontSize: 11 }} />
                <YAxis stroke="var(--ink-4)" tick={{ fill: 'var(--ink-4)', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle.contentStyle} itemStyle={tooltipStyle.itemStyle} />
                <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12 }} />
                <Bar dataKey="completed" fill={CHART_FOREST}     name="Completed" radius={[3, 3, 0, 0]} />
                <Bar dataKey="pending"   fill={CHART_OCHRE}      name="Pending"   radius={[3, 3, 0, 0]} />
                <Bar dataKey="overdue"   fill={CHART_TERRACOTTA} name="Overdue"   radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Request Categories */}
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>Request Categories</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle.contentStyle} itemStyle={tooltipStyle.itemStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Technician Performance */}
      <div className="card" style={{ overflow: 'hidden', marginBottom: 40 }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--rule-soft)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--paper-2)' }}>
          <Users style={{ width: 16, height: 16, color: 'var(--accent)' }} />
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Technician Performance</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', fontSize: 13, color: 'var(--ink-3)' }}>Loading…</div>
          ) : technicianPerformance.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', fontSize: 13, color: 'var(--ink-4)' }}>No technician data available.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--paper-2)' }}>
                  {['Technician', 'Completed', 'Active', 'Total', 'Performance'].map(h => (
                    <th key={h} style={{ padding: '10px 18px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'var(--ink-3)', borderBottom: '1px solid var(--rule)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {technicianPerformance.map((tech) => (
                  <tr key={tech.name} style={{ borderBottom: '1px solid var(--rule-soft)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--paper-2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '12px 18px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                          {tech.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{tech.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 18px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: CHART_FOREST }}>{tech.completed}</span>
                    </td>
                    <td style={{ padding: '12px 18px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: CHART_OCHRE }}>{tech.active}</span>
                    </td>
                    <td style={{ padding: '12px 18px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{tech.total}</span>
                    </td>
                    <td style={{ padding: '12px 18px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 96, height: 4, borderRadius: 999, background: 'var(--rule)', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${tech.completionPercent}%`,
                            borderRadius: 999,
                            background: tech.completionPercent > 80 ? CHART_FOREST : tech.completionPercent > 50 ? CHART_OCHRE : CHART_TERRACOTTA,
                            transition: 'width 0.3s ease',
                          }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)' }}>{tech.completionPercent}%</span>
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