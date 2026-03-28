import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, Clock, AlertCircle, Search } from 'lucide-react';
import api from '../../utils/api';

interface PendingRequest {
  id: number;
  request_code: string;
  resident: string;
  unit: string;
  category: string;
  description: string;
  priority: string;
  location: string;
}

interface Technician {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  active_tasks: number;
  completed_tasks: number;
}

export default function TaskDispatch() {
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<number | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [requestsRes, techRes] = await Promise.all([
          api.get('/maintenance-requests/'),
          api.get('/technicians/'),
        ]);
        const allReqs = Array.isArray(requestsRes.data) ? requestsRes.data : [];
        setPendingRequests(allReqs.filter((r: any) => r.status === 'pending'));
        setTechnicians(Array.isArray(techRes.data) ? techRes.data : []);
      } catch (error) {
        console.error('Error fetching dispatch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredTechnicians = technicians.filter(tech => {
    const search = searchTerm.toLowerCase();
    if (!search) return true;
    return tech.name.toLowerCase().includes(search) || tech.specialty.toLowerCase().includes(search);
  });

  const handleAssign = async () => {
    if (!selectedRequest || !selectedTechnician || !scheduledDate) return;

    setAssigning(true);
    try {
      const updates: Record<string, any> = {
        technician_id: selectedTechnician,
        status: 'assigned',
        scheduled_date: scheduledDate,
      };
      if (deadlineDate) {
        updates.deadline = `${deadlineDate}T23:59:59`;
      }

      await api.patch(`/maintenance-requests/${selectedRequest}/manage/`, updates);

      // Remove from pending list
      setPendingRequests(prev => prev.filter(r => r.id !== selectedRequest));
      setSelectedRequest(null);
      setSelectedTechnician(null);
      setScheduledDate('');
      setDeadlineDate('');
      alert('Task assigned successfully!');
    } catch (error: any) {
      console.error('Error assigning task:', error);
      alert(error?.response?.data?.error || 'Failed to assign task');
    } finally {
      setAssigning(false);
    }
  };

  const getAvailabilityColor = (activeTasks: number) => {
    return activeTasks < 4 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
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
        onClick={() => navigate('/officer')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Task Dispatch</h1>
        <p className="text-blue-600">Assign maintenance requests to available technicians</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-blue-600 font-medium">Loading dispatch data...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Pending Assignment */}
          <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
            <div className="p-6 border-b border-blue-100 bg-blue-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-blue-900">Pending Assignment</h2>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                  {pendingRequests.length} Tasks
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-blue-500">No pending requests</div>
              ) : (
                pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => setSelectedRequest(request.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedRequest === request.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-blue-100 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-blue-900">{request.request_code}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                        </div>
                        <p className="text-sm text-blue-700 mb-1">
                          {request.resident} • Unit {request.unit}
                        </p>
                      </div>
                      {request.priority === 'high' && (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-100 mb-2">
                      <p className="text-sm font-medium text-blue-900 mb-1">{request.category}</p>
                      <p className="text-sm text-blue-600">{request.description}</p>
                    </div>
                    <p className="text-xs text-blue-500">{request.location}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Available Technicians */}
          <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
            <div className="p-6 border-b border-blue-100 bg-blue-50">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">Available Technicians</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                <input
                  type="text"
                  placeholder="Search by name or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {filteredTechnicians.map((tech) => (
                <div
                  key={tech.id}
                  onClick={() => setSelectedTechnician(tech.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedTechnician === tech.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-blue-100 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium flex-shrink-0">
                      {tech.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-blue-900 truncate">{tech.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getAvailabilityColor(tech.active_tasks)}`}>
                          {tech.active_tasks < 4 ? 'Available' : 'Busy'}
                        </span>
                      </div>
                      <p className="text-sm text-blue-600 truncate">{tech.specialty}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-2 rounded text-center">
                      <p className="text-xs text-blue-600 mb-0.5">Active Tasks</p>
                      <p className="font-semibold text-blue-900">{tech.active_tasks}</p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded text-center">
                      <p className="text-xs text-blue-600 mb-0.5">Completed</p>
                      <p className="font-semibold text-blue-900">{tech.completed_tasks}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Assignment Panel */}
      {(selectedRequest || selectedTechnician) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-200 shadow-2xl p-6 z-40">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-6">
              <div className="flex-1 grid md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Selected Request</p>
                  <p className="font-medium text-blue-900">
                    {selectedRequest ? pendingRequests.find(r => r.id === selectedRequest)?.request_code || selectedRequest : 'None'}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Selected Technician</p>
                  <p className="font-medium text-blue-900">
                    {selectedTechnician ? technicians.find(t => t.id === selectedTechnician)?.name || 'None' : 'None'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-blue-600 mb-1">Schedule Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-blue-600 mb-1">Deadline (Optional)</label>
                  <input
                    type="date"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAssign}
                  disabled={!selectedRequest || !selectedTechnician || !scheduledDate || assigning}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserCheck className="w-5 h-5" />
                  {assigning ? 'Assigning...' : 'Assign Task'}
                </button>
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setSelectedTechnician(null);
                    setScheduledDate('');
                    setDeadlineDate('');
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
