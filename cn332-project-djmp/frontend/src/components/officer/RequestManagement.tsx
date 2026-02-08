import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, CheckCircle, X, UserCheck, Eye } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';

export default function RequestManagement() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('pending');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const requests = [
    {
      id: 'REQ-2026-010',
      resident: 'Sarah Johnson',
      unit: 'A-205',
      category: 'Electrical',
      description: 'Circuit breaker keeps tripping',
      priority: 'high',
      status: 'pending',
      submittedAt: '2026-01-31 08:30 AM',
      location: 'Unit A-205',
    },
    {
      id: 'REQ-2026-011',
      resident: 'Michael Brown',
      unit: 'B-102',
      category: 'Plumbing',
      description: 'Slow drainage in bathroom',
      priority: 'medium',
      status: 'pending',
      submittedAt: '2026-01-31 07:45 AM',
      location: 'Unit B-102 - Bathroom',
    },
    {
      id: 'REQ-2026-009',
      resident: 'Emily Davis',
      unit: 'C-308',
      category: 'Air Conditioning',
      description: 'AC not cooling properly',
      priority: 'high',
      status: 'reviewed',
      submittedAt: '2026-01-30 14:20 PM',
      location: 'Unit C-308',
    },
    {
      id: 'REQ-2026-008',
      resident: 'James Wilson',
      unit: 'D-401',
      category: 'Common Area',
      description: 'Gym equipment needs maintenance',
      priority: 'low',
      status: 'assigned',
      submittedAt: '2026-01-30 10:15 AM',
      location: 'Common Area - Gym',
      technician: 'Robert Chen',
    },
  ];

  const filteredRequests = requests.filter((req) => {
    if (selectedTab === 'all') return true;
    return req.status === selectedTab;
  });

  const handleSelectRequest = (id: string) => {
    if (selectedRequests.includes(id)) {
      setSelectedRequests(selectedRequests.filter((r) => r !== id));
    } else {
      setSelectedRequests([...selectedRequests, id]);
    }
  };

  const handleBulkApprove = () => {
    setShowApproveModal(true);
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

  const statusCounts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    reviewed: requests.filter((r) => r.status === 'reviewed').length,
    assigned: requests.filter((r) => r.status === 'assigned').length,
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

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Request Management</h1>
          <p className="text-blue-100">Review, approve, and manage maintenance requests</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-blue-100 bg-blue-50 px-6">
          <div className="flex gap-4 overflow-x-auto">
            {[
              { key: 'pending', label: 'Pending Review' },
              { key: 'reviewed', label: 'Reviewed' },
              { key: 'assigned', label: 'Assigned' },
              { key: 'all', label: 'All Requests' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  selectedTab === tab.key
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

        {/* Bulk Actions */}
        {selectedRequests.length > 0 && (
          <div className="p-4 bg-blue-100 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-blue-900 font-medium">
                {selectedRequests.length} request(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkApprove}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve Selected
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Reject Selected
                </button>
                <button
                  onClick={() => setSelectedRequests([])}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="p-6 border-b border-blue-100">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
              <input
                type="text"
                placeholder="Search by ID, resident, category..."
                className="w-full pl-11 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="px-6 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-2 border border-blue-200">
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50 border-b border-blue-100">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRequests(filteredRequests.map((r) => r.id));
                      } else {
                        setSelectedRequests([]);
                      }
                    }}
                    checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                    className="w-4 h-4 text-blue-600 border-blue-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Resident / Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100 bg-white">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRequests.includes(request.id)}
                      onChange={() => handleSelectRequest(request.id)}
                      className="w-4 h-4 text-blue-600 border-blue-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-blue-900">{request.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-medium text-blue-900">{request.resident}</p>
                      <p className="text-sm text-blue-600">Unit {request.unit}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-blue-700">{request.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-blue-600">{request.description}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                        request.priority
                      )}`}
                    >
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={request.status as any} size="sm" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      {request.status === 'pending' && (
                        <>
                          <button className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors" title="Assign">
                            <UserCheck className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Approve Requests</h3>
            <p className="text-blue-700 mb-6">
              Are you sure you want to approve {selectedRequests.length} request(s)? They will be moved to reviewed status.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedRequests([]);
                }}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Approve
              </button>
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
