import React from 'react';
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
} from 'lucide-react';

export default function OfficerHome() {
  const { user } = useUser();
  const navigate = useNavigate();

  const stats = [
    {
      label: 'Pending Requests',
      value: '8',
      change: '+2 today',
      icon: Clock,
      color: 'bg-yellow-500',
      trend: 'up',
    },
    {
      label: 'In Progress',
      value: '15',
      change: 'On track',
      icon: UserCheck,
      color: 'bg-blue-500',
      trend: 'neutral',
    },
    {
      label: 'Completed (This Week)',
      value: '42',
      change: '+12% from last week',
      icon: CheckCircle,
      color: 'bg-green-500',
      trend: 'up',
    },
    {
      label: 'Overdue Tasks',
      value: '3',
      change: 'Needs attention',
      icon: AlertTriangle,
      color: 'bg-red-500',
      trend: 'down',
    },
  ];

  const pendingRequests = [
    {
      id: 'REQ-2026-010',
      resident: 'Sarah Johnson',
      unit: 'A-205',
      category: 'Electrical',
      description: 'Circuit breaker keeps tripping',
      priority: 'high',
      submittedAt: '2026-01-31 08:30 AM',
      waitTime: '2h 15m',
    },
    {
      id: 'REQ-2026-011',
      resident: 'Michael Brown',
      unit: 'B-102',
      category: 'Plumbing',
      description: 'Slow drainage in bathroom',
      priority: 'medium',
      submittedAt: '2026-01-31 07:45 AM',
      waitTime: '3h 00m',
    },
    {
      id: 'REQ-2026-012',
      resident: 'Emily Davis',
      unit: 'C-308',
      category: 'Air Conditioning',
      description: 'AC not cooling properly',
      priority: 'high',
      submittedAt: '2026-01-31 06:00 AM',
      waitTime: '4h 45m',
    },
  ];

  const activeTechnicians = [
    { name: 'John Smith', specialty: 'Plumbing', activeTasks: 3, status: 'active' },
    { name: 'Maria Garcia', specialty: 'Electrical', activeTasks: 2, status: 'active' },
    { name: 'David Lee', specialty: 'HVAC', activeTasks: 4, status: 'active' },
    { name: 'Robert Chen', specialty: 'General', activeTasks: 1, status: 'active' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Juristic Officer Dashboard</h1>
        <p className="text-blue-600">Welcome back, {user?.name}! Here's your management overview</p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => navigate('/officer/requests')}
          className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-colors shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-1">Manage Requests</h3>
              <p className="text-blue-100 text-sm">Review and approve requests</p>
            </div>
            <ClipboardList className="w-10 h-10 group-hover:scale-110 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => navigate('/officer/dispatch')}
          className="bg-white p-6 rounded-xl hover:bg-blue-50 transition-colors shadow-lg border border-blue-100 group"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-lg font-semibold text-blue-900 mb-1">Dispatch Tasks</h3>
              <p className="text-blue-600 text-sm">Assign to technicians</p>
            </div>
            <UserCheck className="w-10 h-10 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => navigate('/officer/analytics')}
          className="bg-white p-6 rounded-xl hover:bg-blue-50 transition-colors shadow-lg border border-blue-100 group"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-lg font-semibold text-blue-900 mb-1">View Analytics</h3>
              <p className="text-blue-600 text-sm">Performance insights</p>
            </div>
            <BarChart3 className="w-10 h-10 text-blue-600 group-hover:scale-110 transition-transform" />
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
              <p className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-blue-600'}`}>
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Pending Requests */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
            <div className="p-6 border-b border-blue-100 bg-blue-50">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-blue-900">Pending Review</h2>
                  <p className="text-sm text-blue-600 mt-1">Requests awaiting your approval</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                  {pendingRequests.length} Pending
                </span>
              </div>
            </div>
            <div className="divide-y divide-blue-100">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => navigate('/officer/requests')}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-blue-900">{request.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                            request.priority
                          )}`}
                        >
                          {request.priority}
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 mb-1">
                        {request.resident} • Unit {request.unit}
                      </p>
                      <p className="text-sm text-blue-600">
                        {request.category}: {request.description}
                      </p>
                    </div>
                    <div className="text-right text-xs text-blue-500">
                      <p className="mb-1">Wait: {request.waitTime}</p>
                      <p>{request.submittedAt}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                      Approve
                    </button>
                    <button className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                      Assign
                    </button>
                    <button className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Technicians */}
        <div>
          <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden mb-6">
            <div className="p-6 border-b border-blue-100 bg-blue-50">
              <h2 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Active Technicians
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {activeTechnicians.map((tech) => (
                <div key={tech.name} className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                      {tech.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">{tech.name}</p>
                      <p className="text-xs text-blue-600">{tech.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">Active Tasks: {tech.activeTasks}</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Available
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Highlight */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">This Week's Performance</h3>
                <p className="text-blue-100 text-sm">Above average</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-100">Avg. Response Time</span>
                <span className="font-medium">2.5 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-100">Completion Rate</span>
                <span className="font-medium">94%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-100">Satisfaction Score</span>
                <span className="font-medium">4.8/5.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
