import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Calendar } from 'lucide-react';
import StatusBadge, { Status } from '../shared/StatusBadge';

export default function RequestTracking() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const requests = [
    {
      id: 'REQ-2026-001',
      category: 'Plumbing',
      description: 'Kitchen sink faucet leaking',
      status: 'in-progress' as Status,
      date: '2026-01-28',
      technician: 'John Smith',
      priority: 'medium',
      location: 'My Unit',
    },
    {
      id: 'REQ-2026-002',
      category: 'Electrical',
      description: 'Living room light fixture not working',
      status: 'completed' as Status,
      date: '2026-01-25',
      technician: 'Maria Garcia',
      priority: 'low',
      location: 'My Unit',
    },
    {
      id: 'REQ-2026-003',
      category: 'Common Area',
      description: 'Elevator button stuck on 3rd floor',
      status: 'pending' as Status,
      date: '2026-01-30',
      technician: '-',
      priority: 'high',
      location: 'Common Area - Elevator',
    },
    {
      id: 'REQ-2026-004',
      category: 'Air Conditioning',
      description: 'AC unit making loud noise',
      status: 'in-progress' as Status,
      date: '2026-01-27',
      technician: 'David Lee',
      priority: 'medium',
      location: 'My Unit',
    },
    {
      id: 'REQ-2025-012',
      category: 'Structural',
      description: 'Ceiling paint peeling in bedroom',
      status: 'completed' as Status,
      date: '2025-12-15',
      technician: 'Robert Chen',
      priority: 'low',
      location: 'My Unit',
    },
    {
      id: 'REQ-2025-011',
      category: 'Plumbing',
      description: 'Bathroom drain clogged',
      status: 'completed' as Status,
      date: '2025-12-10',
      technician: 'John Smith',
      priority: 'medium',
      location: 'My Unit',
    },
  ];

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    'in-progress': requests.filter((r) => r.status === 'in-progress').length,
    completed: requests.filter((r) => r.status === 'completed').length,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <button
        onClick={() => navigate('/resident')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">My Maintenance Requests</h1>
          <p className="text-blue-100">Track all your submitted requests and their current status</p>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-blue-100 bg-blue-50 px-6">
          <div className="flex gap-4 overflow-x-auto">
            {[
              { key: 'all', label: 'All Requests' },
              { key: 'pending', label: 'Pending' },
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

        {/* Search and Filter */}
        <div className="p-6 border-b border-blue-100 bg-white">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
              <input
                type="text"
                placeholder="Search by ID, category, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="px-6 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-2 border border-blue-200">
              <Filter className="w-5 h-5" />
              More Filters
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50 border-b border-blue-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Technician
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100 bg-white">
              {filteredRequests.map((request) => (
                <tr
                  key={request.id}
                  onClick={() => navigate(`/resident/requests/${request.id}`)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-blue-900">{request.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-blue-700">{request.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-blue-600">{request.description}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-blue-600 text-sm">{request.location}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium capitalize ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-blue-700">{request.technician}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(request.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-blue-600 font-medium">No requests found</p>
            <p className="text-blue-500 text-sm mt-1">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
