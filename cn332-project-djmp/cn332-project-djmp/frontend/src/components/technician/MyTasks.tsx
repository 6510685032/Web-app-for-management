import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Calendar, Timer } from 'lucide-react';
import StatusBadge, { Status } from '../shared/StatusBadge';
import api from '../../utils/api';

interface TaskItem {
  id: string | number;
  request_code?: string;
  resident?: string;
  unit?: string;
  category: string;
  description: string;
  priority: string;
  status: Status;
  scheduled_date?: string;
  scheduled_time?: string;
  deadline?: string | null;
  location?: string;
  specialty_required?: string;
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
      {days > 0 ? `${days}d ` : ''}{hours}h {minutes}m left
    </span>
  );
}

export default function MyTasks() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const response = await api.get('/tasks/my/');
        setTasks(Array.isArray(response.data) ? response.data : []);
      } catch (error: any) {
        console.error('Error fetching tasks:', error);
        setErrorMessage(error?.response?.data?.error || 'ไม่สามารถโหลดงานที่ได้รับมอบหมายได้');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          String(task.request_code || task.id).toLowerCase().includes(search) ||
          (task.resident || '').toLowerCase().includes(search) ||
          (task.description || '').toLowerCase().includes(search);
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        // Sort by priority (high first)
        const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      });
  }, [tasks, filterStatus, searchTerm]);

  const statusCounts = {
    all: tasks.length,
    assigned: tasks.filter((t) => t.status === 'assigned').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

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
      <button
        onClick={() => navigate('/technician')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">My Tasks</h1>
          <p className="text-blue-100">Manage and update your assigned maintenance tasks</p>
        </div>

        <div className="border-b border-blue-100 bg-blue-50 px-6">
          <div className="flex gap-4 overflow-x-auto">
            {[
              { key: 'all', label: 'All Tasks' },
              { key: 'assigned', label: 'Assigned' },
              { key: 'in-progress', label: 'In Progress' },
              { key: 'completed', label: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  filterStatus === tab.key
                    ? 'border-blue-600 text-blue-900'
                    : 'border-transparent text-blue-600 hover:text-blue-700'
                }`}
              >
                {tab.label}
                <span className="ml-2 px-2 py-0.5 bg-blue-200 text-blue-700 rounded-full text-xs">
                  {statusCounts[tab.key as keyof typeof statusCounts]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-b border-blue-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
            <input
              type="text"
              placeholder="Search by ID, resident, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-200 text-red-700">{errorMessage}</div>
        )}

        <div className="p-6 grid md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full p-8 text-center text-blue-600 font-medium">Loading tasks...</div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => navigate(`/technician/tasks/${task.id}`)}
                className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-medium text-blue-900">{task.request_code || task.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <StatusBadge status={task.status} size="sm" />
                  </div>
                </div>

                <div className="mb-3">
                  <p className="font-medium text-blue-900">{task.resident || '-'}</p>
                  <p className="text-sm text-blue-700">Unit {task.unit || '-'}</p>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <p className="text-sm font-medium text-blue-900 mb-1">{task.category}</p>
                  <p className="text-sm text-blue-600">{task.description}</p>
                </div>

                <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                  <div className="flex items-center gap-1 text-blue-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {task.scheduled_date
                        ? new Date(task.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : '-'}
                    </span>
                    <span className="mx-1">•</span>
                    <span>{task.scheduled_time || '-'}</span>
                  </div>

                  {task.deadline && task.status !== 'completed' && (
                    <DeadlineCountdown deadline={task.deadline} />
                  )}

                  {task.status === 'assigned' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/technician/tasks/${task.id}`);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Start Task
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {!loading && filteredTasks.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-blue-600 font-medium">No tasks found</p>
            <p className="text-blue-500 text-sm mt-1">Try adjusting your filter</p>
          </div>
        )}
      </div>
    </div>
  );
}