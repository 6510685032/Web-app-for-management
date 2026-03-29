import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, MapPin, Calendar, Wrench } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import api from '../../utils/api';

interface TaskInfo {
  id: number;
  request_code: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  location: string;
  resident: string;
  unit: string;
  scheduled_date: string | null;
  deadline: string | null;
}

interface TechnicianData {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  active_tasks: number;
  tasks: TaskInfo[];
}

export default function TechnicianSchedule() {
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState<TechnicianData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const response = await api.get('/technician-schedule/');
        setTechnicians(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching technician schedule:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

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
        onClick={() => navigate('/officer')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Technician Management</h1>
        <p className="text-blue-600">View technician work schedules and current assignments</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-blue-600 font-medium">Loading schedule...</div>
      ) : technicians.length === 0 ? (
        <div className="text-center py-12 text-blue-500">No technicians found</div>
      ) : (
        <div className="space-y-6">
          {technicians.map((tech) => (
            <div key={tech.id} className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
              {/* Technician Header */}
              <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                    {tech.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold truncate">{tech.name}</h2>
                    <div className="flex items-center gap-4 text-blue-100 text-sm mt-1 truncate">
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <Wrench className="w-4 h-4" />
                        <span className="truncate">{tech.specialty}</span>
                      </span>
                      {tech.phone && (
                        <span className="flex-shrink-0">📞 {tech.phone}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-3xl font-bold">{tech.active_tasks}</p>
                    <p className="text-blue-100 text-sm">Active Tasks</p>
                  </div>
                </div>
              </div>

              {/* Tasks Table */}
              {tech.tasks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-blue-50 border-b border-blue-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">Request</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">Resident / Unit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">Scheduled</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-100">
                      {tech.tasks.map((task) => (
                        <tr key={task.id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-medium text-blue-900">{task.request_code}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="font-medium text-blue-900">{task.resident}</p>
                              <p className="text-sm text-blue-600">Unit {task.unit}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-blue-700">{task.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="flex items-center gap-1 text-blue-600 text-sm">
                              <MapPin className="w-4 h-4" />
                              {task.location}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={task.status as any} size="sm" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {task.scheduled_date ? (
                              <span className="flex items-center gap-1 text-blue-600 text-sm">
                                <Calendar className="w-4 h-4" />
                                {new Date(task.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            ) : (
                              <span className="text-blue-400 text-sm">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-blue-500">No active tasks assigned</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
