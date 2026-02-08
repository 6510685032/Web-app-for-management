import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import {
  Users,
  Settings,
  FileText,
  Shield,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminHome() {
  const { user } = useUser();
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Users', value: '248', change: '+12 this month', icon: Users, color: 'bg-blue-500' },
    { label: 'Active Requests', value: '23', change: '8 pending', icon: Activity, color: 'bg-green-500' },
    { label: 'System Uptime', value: '99.9%', change: 'Last 30 days', icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Alerts', value: '3', change: 'Needs attention', icon: AlertTriangle, color: 'bg-red-500' },
  ];

  const activityData = [
    { day: 'Mon', requests: 12, users: 45 },
    { day: 'Tue', requests: 15, users: 52 },
    { day: 'Wed', requests: 18, users: 48 },
    { day: 'Thu', requests: 14, users: 51 },
    { day: 'Fri', requests: 16, users: 47 },
    { day: 'Sat', requests: 8, users: 38 },
    { day: 'Sun', requests: 6, users: 32 },
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'user',
      action: 'New resident registered',
      user: 'Emma Wilson',
      time: '5 minutes ago',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: '2',
      type: 'request',
      action: 'High priority request submitted',
      user: 'Sarah Johnson',
      time: '15 minutes ago',
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-600',
    },
    {
      id: '3',
      type: 'completion',
      action: 'Task completed',
      user: 'John Smith (Technician)',
      time: '1 hour ago',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: '4',
      type: 'system',
      action: 'System backup completed',
      user: 'System',
      time: '2 hours ago',
      icon: Shield,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const systemAlerts = [
    {
      id: '1',
      severity: 'warning',
      message: 'Database backup scheduled for tonight at 2:00 AM',
      time: '10 minutes ago',
    },
    {
      id: '2',
      severity: 'info',
      message: '3 technicians have requested time off next week',
      time: '2 hours ago',
    },
    {
      id: '3',
      severity: 'error',
      message: 'Failed login attempt detected from unknown IP',
      time: '3 hours ago',
    },
  ];

  const userStats = [
    { role: 'Residents', count: 185, percentage: 75 },
    { role: 'Officers', count: 8, percentage: 3 },
    { role: 'Technicians', count: 52, percentage: 21 },
    { role: 'Admins', count: 3, percentage: 1 },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">System Administration</h1>
        <p className="text-blue-600">Welcome back, {user?.name}! Here's your system overview</p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/users')}
          className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-colors shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-1">Manage Users</h3>
              <p className="text-blue-100 text-sm">Add, edit, or remove users</p>
            </div>
            <Users className="w-10 h-10 group-hover:scale-110 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => navigate('/admin/settings')}
          className="bg-white p-6 rounded-xl hover:bg-blue-50 transition-colors shadow-lg border border-blue-100 group"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-lg font-semibold text-blue-900 mb-1">System Settings</h3>
              <p className="text-blue-600 text-sm">Configure system parameters</p>
            </div>
            <Settings className="w-10 h-10 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => navigate('/admin/reports')}
          className="bg-white p-6 rounded-xl hover:bg-blue-50 transition-colors shadow-lg border border-blue-100 group"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-lg font-semibold text-blue-900 mb-1">Generate Reports</h3>
              <p className="text-blue-600 text-sm">Export system data</p>
            </div>
            <FileText className="w-10 h-10 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-blue-900 mb-1">{stat.value}</p>
              <p className="text-sm text-blue-600 mb-2">{stat.label}</p>
              <p className="text-xs text-blue-500">{stat.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Activity Chart */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-blue-100">
          <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            System Activity (Last 7 Days)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} name="Requests" />
              <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} name="Active Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* User Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">User Distribution</h2>
          <div className="space-y-4">
            {userStats.map((stat) => (
              <div key={stat.role}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-blue-900">{stat.role}</span>
                  <span className="text-sm text-blue-600">{stat.count}</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${stat.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-blue-100">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-blue-900">Total Users</span>
              <span className="text-2xl font-bold text-blue-900">248</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="p-6 border-b border-blue-100 bg-blue-50">
            <h2 className="text-xl font-semibold text-blue-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-blue-100 max-h-96 overflow-y-auto">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="p-4 hover:bg-blue-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-blue-900 font-medium">{activity.action}</p>
                      <p className="text-sm text-blue-600">{activity.user}</p>
                      <p className="text-xs text-blue-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="p-6 border-b border-blue-100 bg-blue-50">
            <h2 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              System Alerts
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {systemAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border-l-4 rounded ${getSeverityColor(alert.severity)}`}
              >
                <p className="text-sm font-medium text-blue-900 mb-1">{alert.message}</p>
                <p className="text-xs text-blue-500">{alert.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
