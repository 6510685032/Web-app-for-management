import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Calendar } from 'lucide-react';
import StatusBadge, { Status } from '../shared/StatusBadge';

export default function MyTasks() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const tasks = [
    {
      id: 'REQ-2026-001',
      resident: 'Sarah Johnson',
      unit: 'A-205',
      category: 'Plumbing',
      description: 'Kitchen sink faucet leaking',
      priority: 'high',
      status: 'in-progress' as Status,
      scheduledDate: '2026-01-31',
      scheduledTime: '10:00 AM',
      location: 'Building A, Floor 2',
    },
    {
      id: 'REQ-2026-004',
      resident: 'Michael Brown',
      unit: 'B-102',
      category: 'Electrical',
      description: 'Power outlet not working',
      priority: 'medium',
      status: 'assigned' as Status,
      scheduledDate: '2026-01-31',
      scheduledTime: '2:00 PM',
      location: 'Building B, Floor 1',
    },
    {
      id: 'REQ-2026-002',
      resident: 'Emily Davis',
      unit: 'C-308',
      category: 'Plumbing',
      description: 'Bathroom drain clogged',
      priority: 'medium',
      status: 'completed' as Status,
      scheduledDate: '2026-01-28',
      scheduledTime: '9:00 AM',
      location: 'Building C, Floor 3',
    },
    {
      id: 'REQ-2026-015',
      resident: 'James Wilson',
      unit: 'D-401',
      category: 'Plumbing',
      description: 'Water heater not heating',
      priority: 'high',
      status: 'assigned' as Status,
      scheduledDate: '2026-02-01',
      scheduledTime: '10:30 AM',
      location: 'Building D, Floor 4',
    },
  ];

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus === 'all') return true;
    return task.status === filterStatus;
  });

  const statusCounts = {
    all: tasks.length,
    assigned: tasks.filter((t) => t.status === 'assigned').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

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
      <button
        onClick={() => navigate('/technician')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">My Tasks</h1>
          <p className="text-blue-100">Manage and update your assigned maintenance tasks</p>
        </div>

        {/* Filter Tabs */}
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

        {/* Search */}
        <div className="p-6 border-b border-blue-100">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
              <input
                type="text"
                placeholder="Search by ID, resident, or description..."
                className="w-full pl-11 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="px-6 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-2 border border-blue-200">
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="p-6 grid md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => navigate(`/technician/tasks/${task.id}`)}
              className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:shadow-md cursor-pointer transition-all"
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
                  </div>
                  <StatusBadge status={task.status} size="sm" />
                </div>
              </div>

              <div className="mb-3">
                <p className="font-medium text-blue-900 mb-1">{task.resident}</p>
                <p className="text-sm text-blue-700">Unit {task.unit}</p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg mb-3">
                <p className="text-sm font-medium text-blue-900 mb-1">{task.category}</p>
                <p className="text-sm text-blue-600">{task.description}</p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-blue-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(task.scheduledDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="mx-1">•</span>
                  <span>{task.scheduledTime}</span>
                </div>
                {task.status === 'assigned' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Start Task
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
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
