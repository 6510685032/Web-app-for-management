import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, CheckCircle, X, UserCheck, Eye, Clock, AlertTriangle } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import api from '../../utils/api';

interface RequestItem {
  id: number;
  request_code: string;
  resident: string;
  unit: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  location: string;
  technician: string;
  technician_id: number | null;
  deadline: string | null;
  approved_completion: string;
}

export default function RequestManagement() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [newPriority, setNewPriority] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/maintenance-requests/');
      setRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesTab = selectedTab === 'all' ? true :
        selectedTab === 'pending_approval' ? req.approved_completion === 'pending_approval' :
        req.status === selectedTab;

      const search = searchTerm.toLowerCase();
      const matchesSearch = !search ||
        req.request_code.toLowerCase().includes(search) ||
        req.resident.toLowerCase().includes(search) ||
        req.category.toLowerCase().includes(search) ||
        req.description.toLowerCase().includes(search);

      return matchesTab && matchesSearch;
    });
  }, [requests, selectedTab, searchTerm]);

  const statusCounts = useMemo(() => ({
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    assigned: requests.filter(r => r.status === 'assigned').length,
    'in-progress': requests.filter(r => r.status === 'in-progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
    pending_approval: requests.filter(r => r.approved_completion === 'pending_approval').length,
  }), [requests]);

  const handleManageRequest = async (requestId: number, updates: Record<string, any>) => {
    setActionLoading(true);
    try {
      await api.patch(`/maintenance-requests/${requestId}/manage/`, updates);
      await fetchRequests();
      setShowDetailModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Failed to update request');
    } finally {
      setActionLoading(false);
    }
  };

  const openDetail = (req: RequestItem) => {
    setSelectedRequest(req);
    setNewPriority(req.priority);
    setNewDeadline(req.deadline ? req.deadline.split('T')[0] : '');
    setShowDetailModal(true);
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

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Request Management</h1>
          <p className="text-blue-100">Review, approve, set priority/deadline, and manage maintenance requests</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-blue-100 bg-blue-50 px-6">
          <div className="flex gap-4 overflow-x-auto">
            {[
              { key: 'pending', label: 'Pending' },
              { key: 'assigned', label: 'Assigned' },
              { key: 'in-progress', label: 'In Progress' },
              { key: 'completed', label: 'Completed' },
              { key: 'pending_approval', label: 'รออนุมัติ' },
              { key: 'all', label: 'All' },
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
                  {statusCounts[tab.key as keyof typeof statusCounts] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-blue-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
            <input
              type="text"
              placeholder="Search by ID, resident, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-blue-600 font-medium">Loading requests...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center text-blue-500">No requests found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-blue-50 border-b border-blue-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">Resident / Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">Approval</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">Deadline</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100 bg-white">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-blue-900">{request.request_code}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-blue-900">{request.resident}</p>
                        <p className="text-sm text-blue-600">Unit {request.unit}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-blue-700">{request.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={request.status as any} size="sm" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.approved_completion ? (
                        <StatusBadge status={request.approved_completion as any} size="sm" />
                      ) : (
                        <span className="text-blue-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.deadline ? (
                        <span className="text-sm text-blue-700">
                          {new Date(request.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      ) : (
                        <span className="text-blue-400 text-sm">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openDetail(request)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Manage"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {request.approved_completion === 'pending_approval' && (
                          <>
                            <button
                              onClick={() => handleManageRequest(request.id, { approved_completion: 'approved' })}
                              className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors"
                              title="Approve Completion"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleManageRequest(request.id, { approved_completion: 'rejected' })}
                              className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                              title="Reject Completion"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail/Manage Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-blue-900">{selectedRequest.request_code}</h3>
              <button onClick={() => setShowDetailModal(false)} className="p-1 hover:bg-blue-100 rounded">
                <X className="w-5 h-5 text-blue-600" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">Resident</p>
                  <p className="font-medium text-blue-900">{selectedRequest.resident}</p>
                  <p className="text-sm text-blue-600">Unit {selectedRequest.unit}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">Category</p>
                  <p className="font-medium text-blue-900">{selectedRequest.category}</p>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-600 mb-1">Description</p>
                <p className="text-sm text-blue-900">{selectedRequest.description}</p>
              </div>

              {/* Priority Setting */}
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'medium', 'high'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewPriority(p)}
                      className={`px-3 py-2 rounded-lg border-2 transition-all capitalize font-medium text-sm ${
                        newPriority === p
                          ? p === 'high' ? 'border-red-500 bg-red-50 text-red-700' :
                            p === 'medium' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' :
                            'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-blue-200 bg-white text-blue-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deadline Setting */}
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Deadline
                </label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const updates: Record<string, any> = {};
                  if (newPriority !== selectedRequest.priority) updates.priority = newPriority;
                  if (newDeadline) updates.deadline = `${newDeadline}T23:59:59`;
                  if (Object.keys(updates).length > 0) {
                    handleManageRequest(selectedRequest.id, updates);
                  } else {
                    setShowDetailModal(false);
                  }
                }}
                disabled={actionLoading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-60"
              >
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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
