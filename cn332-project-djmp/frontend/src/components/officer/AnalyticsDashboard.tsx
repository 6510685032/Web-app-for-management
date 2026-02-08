import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalyticsDashboard() {
  const navigate = useNavigate();

  const weeklyData = [
    { day: 'Mon', completed: 12, pending: 5, overdue: 1 },
    { day: 'Tue', completed: 15, pending: 3, overdue: 2 },
    { day: 'Wed', completed: 18, pending: 4, overdue: 1 },
    { day: 'Thu', completed: 14, pending: 6, overdue: 0 },
    { day: 'Fri', completed: 16, pending: 4, overdue: 1 },
    { day: 'Sat', completed: 8, pending: 2, overdue: 0 },
    { day: 'Sun', completed: 6, pending: 1, overdue: 0 },
  ];

  const categoryData = [
    { name: 'Plumbing', value: 35, color: '#3b82f6' },
    { name: 'Electrical', value: 28, color: '#10b981' },
    { name: 'HVAC', value: 22, color: '#f59e0b' },
    { name: 'Structural', value: 10, color: '#8b5cf6' },
    { name: 'Other', value: 5, color: '#6b7280' },
  ];

  const responseTimeData = [
    { month: 'Aug', avgTime: 3.2 },
    { month: 'Sep', avgTime: 2.8 },
    { month: 'Oct', avgTime: 2.5 },
    { month: 'Nov', avgTime: 2.3 },
    { month: 'Dec', avgTime: 2.4 },
    { month: 'Jan', avgTime: 2.5 },
  ];

  const technicianPerformance = [
    { name: 'John Smith', completed: 45, rating: 4.8, avgTime: 2.3 },
    { name: 'Maria Garcia', completed: 52, rating: 4.9, avgTime: 2.1 },
    { name: 'David Lee', completed: 38, rating: 4.7, avgTime: 2.6 },
    { name: 'Robert Chen', completed: 41, rating: 4.6, avgTime: 2.8 },
    { name: 'Lisa Wong', completed: 48, rating: 4.9, avgTime: 2.2 },
  ];

  const kpis = [
    {
      label: 'Avg Response Time',
      value: '2.5 hours',
      change: '-8%',
      trend: 'down',
      icon: Clock,
      color: 'bg-blue-500',
    },
    {
      label: 'Completion Rate',
      value: '94%',
      change: '+3%',
      trend: 'up',
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      label: 'Customer Satisfaction',
      value: '4.8/5.0',
      change: '+0.2',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      label: 'Overdue Tasks',
      value: '3',
      change: '-2',
      trend: 'down',
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
  ];

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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
              <div className={`w-12 h-12 ${kpi.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-blue-900 mb-1">{kpi.value}</p>
              <p className="text-sm text-blue-600 mb-2">{kpi.label}</p>
              <div className="flex items-center gap-1">
                {kpi.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-600" />
                )}
                <span className="text-sm text-green-600 font-medium">{kpi.change}</span>
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
              <YAxis stroke="#6b7280" />
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
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
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

      {/* Response Time Trend */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 mb-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">Average Response Time Trend (Hours)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={responseTimeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
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
              dataKey="avgTime"
              stroke="#3b82f6"
              strokeWidth={3}
              name="Avg Response Time"
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
            Technician Performance (This Month)
          </h2>
        </div>
        <div className="overflow-x-auto">
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
                  Avg Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Avg Completion Time (hours)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100 bg-white">
              {technicianPerformance.map((tech, index) => (
                <tr key={tech.name} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                        {tech.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-blue-900">{tech.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-blue-900 font-semibold">{tech.completed}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-medium text-blue-900">{tech.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-blue-700">{tech.avgTime}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-blue-100 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(tech.completed / 60) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-blue-700 font-medium">
                        {Math.round((tech.completed / 60) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
