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
    { label: 'Total Requests', value: String(stats.total), icon: ClipboardList, color: 'bg-blue-500', sub: `${stats.cancelled} cancelled` },
    { label: 'Pending', value: String(stats.pending), icon: Clock, color: 'bg-yellow-500', sub: `${stats.assigned} assigned` },
    { label: 'In Progress', value: String(stats.in_progress), icon: TrendingUp, color: 'bg-indigo-500', sub: 'active work' },
    { label: 'Completed', value: String(stats.completed), icon: CheckCircle, color: 'bg-green-500', sub: `${stats.pending_approval} pending approval` },
    { label: 'Overdue', value: String(stats.overdue), icon: AlertTriangle, color: 'bg-red-500', sub: stats.overdue > 0 ? 'needs attention' : 'on track' },
    { label: 'Approved', value: String(stats.approved), icon: ShieldCheck, color: 'bg-emerald-500', sub: `${stats.rejected} rejected` },
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
    <div className="max-w-7xl mx-auto p-6">
      <button
        onClick={() => navigate('/officer')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Analytics & Performance</h1>
        <p className="text-blue-600">Operational insights, SLA compliance, and performance metrics</p>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {errorMessage}
        </div>
      )}

      {/* 6 KPI Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
              <div className={`w-11 h-11 ${kpi.color} rounded-lg flex items-center justify-center mb-3 flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white flex-shrink-0" />
              </div>
              <p className="text-2xl font-bold text-blue-900 mb-1">{loading ? '-' : kpi.value}</p>
              <p className="text-sm text-blue-600 font-medium mb-1">{kpi.label}</p>
              <p className="text-xs text-blue-500">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Chart 1: Overall Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: SLA Compliance Trend */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">SLA Compliance Trend (%)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="sla" stroke="#10b981" strokeWidth={3} name="SLA %" dot={{ fill: '#10b981', r: 5 }} />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total Requests" dot={{ fill: '#3b82f6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Weekly Performance */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Weekly Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="completed" fill="#10b981" name="Completed" />
              <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
              <Bar dataKey="overdue" fill="#ef4444" name="Overdue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Request Categories */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Request Categories</h2>
          <ResponsiveContainer width="100%" height={300}>
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Technician Performance */}
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="p-6 border-b border-blue-100 bg-blue-50">
          <h2 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Technician Performance
          </h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-blue-600 font-medium">Loading technician performance...</div>
          ) : technicianPerformance.length === 0 ? (
            <div className="p-8 text-center text-blue-600">No technician performance data available.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-blue-50 border-b border-blue-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Technician</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Completed Tasks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Active Tasks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Total Tasks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100 bg-white">
                {technicianPerformance.map((tech) => (
                  <tr key={tech.name} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                          {tech.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                        </div>
                        <span className="font-medium text-blue-900">{tech.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-blue-900 font-semibold">{tech.completed}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-blue-700">{tech.active}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-blue-700">{tech.total}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-blue-100 rounded-full h-2 w-24">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${tech.completionPercent}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-blue-700 font-medium">{tech.completionPercent}%</span>
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