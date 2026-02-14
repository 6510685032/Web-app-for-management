import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, Clock, AlertCircle, Search } from 'lucide-react';

export default function TaskDispatch() {
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');

  const pendingAssignment = [
    {
      id: 'REQ-2026-009',
      resident: 'Emily Davis',
      unit: 'C-308',
      category: 'Air Conditioning',
      description: 'AC not cooling properly',
      priority: 'high',
      location: 'Unit C-308',
    },
    {
      id: 'REQ-2026-013',
      resident: 'John Anderson',
      unit: 'A-101',
      category: 'Plumbing',
      description: 'Water heater not working',
      priority: 'high',
      location: 'Unit A-101',
    },
    {
      id: 'REQ-2026-014',
      resident: 'Linda Martinez',
      unit: 'B-205',
      category: 'Electrical',
      description: 'Power outlet not working',
      priority: 'medium',
      location: 'Unit B-205 - Living Room',
    },
  ];

  const technicians = [
    {
      id: 'tech-1',
      name: 'John Smith',
      specialty: 'Plumbing',
      availability: 'Available',
      currentTasks: 3,
      rating: 4.8,
      completedToday: 2,
    },
    {
      id: 'tech-2',
      name: 'Maria Garcia',
      specialty: 'Electrical',
      availability: 'Available',
      currentTasks: 2,
      rating: 4.9,
      completedToday: 3,
    },
    {
      id: 'tech-3',
      name: 'David Lee',
      specialty: 'HVAC',
      availability: 'Available',
      currentTasks: 4,
      rating: 4.7,
      completedToday: 1,
    },
    {
      id: 'tech-4',
      name: 'Robert Chen',
      specialty: 'General Maintenance',
      availability: 'Busy',
      currentTasks: 5,
      rating: 4.6,
      completedToday: 2,
    },
    {
      id: 'tech-5',
      name: 'Lisa Wong',
      specialty: 'Plumbing',
      availability: 'Available',
      currentTasks: 1,
      rating: 4.9,
      completedToday: 4,
    },
  ];

  const handleAssign = () => {
    if (selectedRequest && selectedTechnician && scheduledDate) {
      // Handle assignment logic
      alert('Task assigned successfully!');
      setSelectedRequest(null);
      setSelectedTechnician(null);
      setScheduledDate('');
    }
  };

  const getAvailabilityColor = (availability: string) => {
    return availability === 'Available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Pending Assignment */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="p-6 border-b border-blue-100 bg-blue-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-blue-900">Pending Assignment</h2>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                {pendingAssignment.length} Tasks
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {pendingAssignment.map((request) => (
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
            ))}
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
                className="w-full pl-11 pr-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {technicians.map((tech) => (
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
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                    {tech.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-blue-900">{tech.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getAvailabilityColor(
                          tech.availability
                        )}`}
                      >
                        {tech.availability}
                      </span>
                    </div>
                    <p className="text-sm text-blue-600">{tech.specialty}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <p className="text-xs text-blue-600 mb-0.5">Active Tasks</p>
                    <p className="font-semibold text-blue-900">{tech.currentTasks}</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <p className="text-xs text-blue-600 mb-0.5">Rating</p>
                    <p className="font-semibold text-blue-900">⭐ {tech.rating}</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <p className="text-xs text-blue-600 mb-0.5">Done Today</p>
                    <p className="font-semibold text-blue-900">{tech.completedToday}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assignment Panel */}
      {(selectedRequest || selectedTechnician) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-200 shadow-2xl p-6 z-40">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-6">
              <div className="flex-1 grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Selected Request</p>
                  <p className="font-medium text-blue-900">
                    {selectedRequest || 'None selected'}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Selected Technician</p>
                  <p className="font-medium text-blue-900">
                    {selectedTechnician
                      ? technicians.find((t) => t.id === selectedTechnician)?.name
                      : 'None selected'}
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
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAssign}
                  disabled={!selectedRequest || !selectedTechnician || !scheduledDate}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserCheck className="w-5 h-5" />
                  Assign Task
                </button>
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setSelectedTechnician(null);
                    setScheduledDate('');
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
