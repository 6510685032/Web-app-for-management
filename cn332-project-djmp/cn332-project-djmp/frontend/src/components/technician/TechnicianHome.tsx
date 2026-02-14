import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import StatusBadge from '../shared/StatusBadge';
import { ClipboardList, Clock, CheckCircle, TrendingUp, AlertCircle, Calendar, MapPin } from 'lucide-react';

export default function TechnicianHome() {
  const { user } = useUser();
  const navigate = useNavigate();

  const stats = [
    { label: 'Active Tasks', value: '4', icon: ClipboardList, color: 'bg-blue-500' },
    { label: 'Completed Today', value: '2', icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Pending Start', value: '1', icon: Clock, color: 'bg-yellow-500' },
    { label: 'This Week', value: '12', icon: TrendingUp, color: 'bg-purple-500' },
  ];

  const todayTasks = [
    {
      id: 'REQ-2026-001',
      resident: 'Sarah Johnson',
      unit: 'A-205',
      category: 'Plumbing',
      description: 'Kitchen sink faucet leaking',
      priority: 'high',
      scheduledTime: '10:00 AM',
      status: 'in-progress',
      location: 'Building A, Floor 2',
    },
    {
      id: 'REQ-2026-004',
      resident: 'Michael Brown',
      unit: 'B-102',
      category: 'Electrical',
      description: 'Power outlet not working in bedroom',
      priority: 'medium',
      scheduledTime: '2:00 PM',
      status: 'pending',
      location: 'Building B, Floor 1',
    },
  ];

  const upcomingTasks = [
    {
      id: 'REQ-2026-015',
      resident: 'Emily Davis',
      unit: 'C-308',
      category: 'Air Conditioning',
      description: 'AC unit not cooling properly',
      scheduledDate: '2026-02-01',
      priority: 'high',
    },
    {
      id: 'REQ-2026-016',
      resident: 'James Wilson',
      unit: 'D-401',
      category: 'Plumbing',
      description: 'Shower drain clogged',
      scheduledDate: '2026-02-02',
      priority: 'medium',
    },
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
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          Welcome, {user?.name}!
        </h1>
        <p className="text-blue-600">Here's your task overview for today</p>
      </div>

      {/* Quick Action */}
      <button
        onClick={() => navigate('/technician/tasks')}
        className="w-full bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-colors shadow-lg mb-8 group"
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h3 className="text-xl font-semibold mb-2">View All My Tasks</h3>
            <p className="text-blue-100">Manage your assigned maintenance tasks</p>
          </div>
          <ClipboardList className="w-12 h-12 group-hover:scale-110 transition-transform" />
        </div>
      </button>

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
              <p className="text-sm text-blue-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
            <div className="p-6 border-b border-blue-100 bg-blue-50">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-blue-900">Today's Schedule</h2>
                  <p className="text-sm text-blue-600 mt-1">Saturday, January 31, 2026</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {todayTasks.length} Tasks
                </span>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => navigate(`/technician/tasks/${task.id}`)}
                  className="p-4 border border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-blue-900">{task.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                        <StatusBadge status={task.status as any} size="sm" />
                      </div>
                      <p className="text-sm text-blue-700 mb-1">
                        {task.resident} • Unit {task.unit}
                      </p>
                      <p className="text-sm text-blue-600 mb-3">
                        {task.category}: {task.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-blue-700 font-medium mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{task.scheduledTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <MapPin className="w-4 h-4" />
                    <span>{task.location}</span>
                  </div>
                  {task.status === 'pending' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/technician/tasks/${task.id}`);
                      }}
                      className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Start Task
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Tasks */}
          <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
            <div className="p-6 border-b border-blue-100 bg-blue-50">
              <h2 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Tasks
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-blue-900 text-sm">{task.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 mb-1">{task.resident}</p>
                  <p className="text-xs text-blue-600 mb-2">{task.description}</p>
                  <div className="flex items-center gap-1 text-xs text-blue-500">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(task.scheduledDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">This Month</h3>
                <p className="text-blue-100 text-sm">Your Performance</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Completed Tasks</span>
                <span className="text-2xl font-bold">38</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Avg Rating</span>
                <span className="text-2xl font-bold">4.8 ⭐</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">On-Time Rate</span>
                <span className="text-2xl font-bold">96%</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-500">
              <p className="text-sm text-blue-100">
                Great job! You're performing above average this month.
              </p>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Quick Reminders
            </h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Upload before/after photos for all completed tasks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Update task status regularly to keep residents informed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Request deadline extensions early if needed</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
