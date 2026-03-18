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
  scheduled_time?: string | null;
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'];

export default function AnalyticsDashboard() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const response = await api.get('/maintenance-requests/');
        setRequests(Array.isArray(response.data) ? response.data : []);
      } catch (error: any) {
        console.error('Error fetching analytics data:', error);
        setErrorMessage(
          error?.response?.data?.error || 'ไม่สามารถโหลดข้อมูล analytics ได้'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const today = new Date();

  const overdueCount = useMemo(() => {
    return requests.filter((r) => {
      if (!r.scheduled_date) return false;
      if (r.status === 'completed' || r.status === 'cancelled') return false;

      const scheduled = new Date(r.scheduled_date);
      scheduled.setHours(23, 59, 59, 999);

      return scheduled < today;
    }).length;
  }, [requests, today]);

  const completedCount = useMemo(
    () => requests.filter((r) => r.status === 'completed').length,
    [requests]
  );

  const openCount = useMemo(
    () => requests.filter((r) => r.status !== 'completed' && r.status !== 'cancelled').length,
    [requests]
  );

  const completionRate = useMemo(() => {
    if (requests.length === 0) return 0;
    return Math.round((completedCount / requests.length) * 100);
  }, [requests, completedCount]);

  const avgOpenTasksPerDay = useMemo(() => {
    if (requests.length === 0) return 0;
    const createdDates = requests
      .map((r) => r.created_at)
      .filter(Boolean)
      .map((d) => new Date(d as string).getTime());

    if (createdDates.length === 0) return 0;

    const minDate = new Date(Math.min(...createdDates));
    const diffDays = Math.max(
      1,
      Math.ceil((today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
    );

    return Number((openCount / diffDays).toFixed(1));
  }, [requests, openCount, today]);

  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
          if (!r.scheduled_date) return false;
          if (r.status === 'completed' || r.status === 'cancelled') return false;

          const scheduled = new Date(r.scheduled_date);
          scheduled.setHours(23, 59, 59, 999);
          return scheduled < today;
        }).length,
      };
    });
  }, [requests, today]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();

    requests.forEach((r) => {
      map.set(r.category, (map.get(r.category) || 0) + 1);
    });

    return Array.from(map.entries()).map(([name, value], index) => ({
      name,
      value,
      color: PIE_COLORS[index % PIE_COLORS.length],
    }));
  }, [requests]);

  const monthlyData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return monthNames.map((month, index) => {
      const monthRequests = requests.filter((r) => {
        if (!r.created_at) return false;
        return new Date(r.created_at).getMonth() === index;
      });

      return {
        month,
        total: monthRequests.length,
      };
    }).filter((m) => m.total > 0);
  }, [requests]);

  const technicianPerformance = useMemo(() => {
    const techMap = new Map<
      string,
      { name: string; completed: number; active: number; total: number }
    >();

    requests.forEach((r) => {
      if (!r.technician || r.technician === '-') return;

      if (!techMap.has(r.technician)) {
        techMap.set(r.technician, {
          name: r.technician,
          completed: 0,
          active: 0,
          total: 0,
        });
      }

      const tech = techMap.get(r.technician)!;
      tech.total += 1;

      if (r.status === 'completed') tech.completed += 1;
      if (r.status === 'assigned' || r.status === 'in-progress' || r.status === 'pending') {
        tech.active += 1;
      }
    });

    return Array.from(techMap.values()).map((tech) => {
      const completionPercent =
        tech.total > 0 ? Math.round((tech.completed / tech.total) * 100) : 0;

      return {
        ...tech,
        completionPercent,
      };
    });
  }, [requests]);

  const kpis = useMemo(
    () => [
      {
        label: 'Open Requests',
        value: String(openCount),
        change: `${requests.length} total`,
        trend: 'up',
        icon: Clock,
        color: 'bg-blue-500',
      },
      {
        label: 'Completion Rate',
        value: `${completionRate}%`,
        change: `${completedCount} completed`,
        trend: 'up',
        icon: CheckCircle,
        color: 'bg-green-500',
      },
      {
        label: 'Avg Open / Day',
        value: `${avgOpenTasksPerDay}`,
        change: 'based on current data',
        trend: 'up',
        icon: TrendingUp,
        color: 'bg-purple-500',
      },
      {
        label: 'Overdue Tasks',
        value: String(overdueCount),
        change: overdueCount > 0 ? 'needs attention' : 'on track',
        trend: overdueCount > 0 ? 'down' : 'up',
        icon: AlertTriangle,
        color: 'bg-red-500',
      },
    ],
    [openCount, requests.length, completionRate, completedCount, avgOpenTasksPerDay, overdueCount]
  );

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
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Analytics Dashboard</h1>
        <p className="text-blue-600">Operational insights and performance metrics</p>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {errorMessage}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
              <div className={`w-12 h-12 ${kpi.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-blue-900 mb-1">
                {loading ? '-' : kpi.value}
              </p>
              <p className="text-sm text-blue-600 mb-2">{kpi.label}</p>
              <div className="flex items-center gap-1">
                {kpi.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span
                  className={`text-sm font-medium ${
                    kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {kpi.change}
                </span>
              </div>
            </div>
          );
        })}
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
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
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
                label={({ name, percent }) =>
                  `${name} ${((percent || 0) * 100).toFixed(0)}%`
                }
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

      {/* SLA / Trend */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 mb-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">
          SLA / Request Volume Trend
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#3b82f6"
              strokeWidth={3}
              name="Requests"
              dot={{ fill: '#3b82f6', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
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
            <div className="p-8 text-center text-blue-600 font-medium">
              Loading technician performance...
            </div>
          ) : technicianPerformance.length === 0 ? (
            <div className="p-8 text-center text-blue-600">
              No technician performance data available.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-blue-50 border-b border-blue-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                    Technician
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                    Completed Tasks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                    Active Tasks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                    Total Tasks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100 bg-white">
                {technicianPerformance.map((tech) => (
                  <tr key={tech.name} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                          {tech.name.split(' ').map((n) => n[0]).join('')}
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
                        <div className="flex-1 bg-blue-100 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${tech.completionPercent}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-blue-700 font-medium">
                          {tech.completionPercent}%
                        </span>
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