import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import StatusBadge from '../shared/StatusBadge';
import { ClipboardList, Clock, CheckCircle, TrendingUp, AlertCircle, Calendar, MapPin, Timer } from 'lucide-react';
import api from '../../utils/api';

interface TaskItem {
  id: number;
  request_code: string;
  resident: string;
  unit: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  deadline: string | null;
  location: string;
  specialty_required: string;
}

function DeadlineCountdown({ deadline }: { deadline: string }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - now.getTime();
  const isOverdue = diff < 0;
  const absDiff = Math.abs(diff);

  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absDiff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((absDiff / (1000 * 60)) % 60);

  if (isOverdue) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold animate-pulse">
        <Timer className="w-3 h-3" />
        OVERDUE: +{days > 0 ? `${days}d ` : ''}{hours}h {minutes}m
      </span>
    );
  }

  const urgencyColor = days < 1 ? 'bg-red-100 text-red-700' : days < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 ${urgencyColor} rounded-full text-xs font-bold`}>
      <Timer className="w-3 h-3" />
      {days > 0 ? `${days}d ` : ''}{hours}h {minutes}m
    </span>
  );
}

export default function TechnicianHome() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await api.get('/tasks/my/');
        setTasks(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Skill-based priority sort
  const sortedTodayTasks = useMemo(() => {
    const activeTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
    const userSpecialty = (user as any)?.specialty || '';

    return activeTasks.sort((a, b) => {
      // Emergency first
      const aEmergency = a.priority === 'high' && ['Electrical', 'Plumbing'].includes(a.category);
      const bEmergency = b.priority === 'high' && ['Electrical', 'Plumbing'].includes(b.category);
      if (aEmergency && !bEmergency) return -1;
      if (!aEmergency && bEmergency) return 1;

      // Skill match
      if (userSpecialty) {
        const aMatch = a.specialty_required === userSpecialty;
        const bMatch = b.specialty_required === userSpecialty;
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
      }

      // Priority
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
    });
  }, [tasks, user]);

  const stats = useMemo(() => {
    const activeTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const pendingStart = tasks.filter(t => t.status === 'assigned');
    return [
      { label: 'Active Tasks', value: String(activeTasks.length), icon: ClipboardList, color: 'bg-blue-500' },
      { label: 'Completed', value: String(completedTasks.length), icon: CheckCircle, color: 'bg-green-500' },
      { label: 'Pending Start', value: String(pendingStart.length), icon: Clock, color: 'bg-yellow-500' },
      { label: 'Total Assigned', value: String(tasks.length), icon: TrendingUp, color: 'bg-purple-500' },
    ];
  }, [tasks]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Welcome, {user?.name}!</h1>
        <p className="text-blue-600">Here's your task overview — sorted by priority and skill match</p>
      </div>

      {/* Quick Action */}
      <button
        onClick={() => navigate('/technician/tasks')}
        className="w-full bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-colors shadow-lg mb-8 group overflow-hidden"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="text-left min-w-0">
            <h3 className="text-xl font-semibold mb-2 truncate">View All My Tasks</h3>
            <p className="text-blue-100 truncate">Manage your assigned maintenance tasks</p>
          </div>
          <ClipboardList className="w-12 h-12 flex-shrink-0 group-hover:scale-110 transition-transform" />
        </div>
      </button>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4 flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white flex-shrink-0" />
              </div>
              <p className="text-3xl font-bold text-blue-900 mb-1 truncate">{loading ? '-' : stat.value}</p>
              <p className="text-sm text-blue-600 truncate">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Priority Queue */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-blue-100">
            <div className="p-6 border-b border-blue-100 bg-blue-50">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-blue-900">Priority Queue</h2>
                  <p className="text-sm text-blue-600 mt-1">Tasks sorted by skill match + priority</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {sortedTodayTasks.length} Tasks
                </span>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {loading ? (
                <div className="text-center py-8 text-blue-600">Loading tasks...</div>
              ) : sortedTodayTasks.length === 0 ? (
                <div className="text-center py-8 text-blue-500">No active tasks 🎉</div>
              ) : (
                sortedTodayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => navigate(`/technician/tasks/${task.id}`)}
                    className="p-4 border border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-medium text-blue-900">{task.request_code}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <StatusBadge status={task.status as any} size="sm" />
                          {task.deadline && <DeadlineCountdown deadline={task.deadline} />}
                        </div>
                        <p className="text-sm text-blue-700 mb-1">{task.resident} • Unit {task.unit}</p>
                        <p className="text-sm text-blue-600 mb-3">{task.category}: {task.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <MapPin className="w-4 h-4" />
                        <span>{task.location}</span>
                      </div>
                      {task.status === 'assigned' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/technician/tasks/${task.id}`);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                        >
                          Start Task
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Performance Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Summary</h3>
                <p className="text-blue-100 text-sm">Your Performance</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Total Tasks</span>
                <span className="text-2xl font-bold">{tasks.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Completed</span>
                <span className="text-2xl font-bold">{tasks.filter(t => t.status === 'completed').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Completion Rate</span>
                <span className="text-2xl font-bold">
                  {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%
                </span>
              </div>
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
                <span>Log materials used in your job report</span>
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
