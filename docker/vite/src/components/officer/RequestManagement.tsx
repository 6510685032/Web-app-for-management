import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, CheckCircle, X, UserCheck, Eye, Clock, AlertTriangle, Calendar, Send } from 'lucide-react';
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
  scheduled_date: string | null;
  scheduled_time: string | null;
  approved_completion: string;
  technician_notes?: string;
  materials_used?: string;
  images?: string[];
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
  const [newScheduledDate, setNewScheduledDate] = useState('');
  const [newScheduledTime, setNewScheduledTime] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
    setNewScheduledDate(req.scheduled_date || '');
    setNewScheduledTime(req.scheduled_time ? req.scheduled_time.substring(0, 5) : '');
    setShowDetailModal(true);
  };

  const handleDeadlineChange = (value: string) => {
    setNewDeadline(value);
    if (value) {
      setNewScheduledDate(value);
      if (!newScheduledTime) {
        setNewScheduledTime('09:00');
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' };
      case 'medium': return { bg: 'rgba(234, 179, 8, 0.1)', text: '#eab308', border: 'rgba(234, 179, 8, 0.2)' };
      case 'low': return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' };
      default: return { bg: 'var(--djmp-surface-2)', text: 'var(--djmp-text-muted)', border: 'var(--djmp-border)' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <button
        onClick={() => navigate('/officer')}
        className="flex items-center gap-2 mb-6 font-medium transition-opacity hover:opacity-80"
        style={{ color: 'var(--accent-600)' }}
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="glass-card rounded-xl shadow-lg overflow-hidden" style={{ background: 'var(--djmp-surface)' }}>
        <div className="p-6 text-white" style={{ background: 'var(--accent-gradient)' }}>
          <h1 className="text-2xl font-bold mb-2">Request Management</h1>
          <p className="opacity-90">Review, approve, set priority/deadline, and manage maintenance requests</p>
        </div>

        {/* Tabs */}
        <div className="border-b px-6" style={{ background: 'var(--djmp-surface-2)', borderColor: 'var(--djmp-border)' }}>
          <div className="flex gap-4 overflow-x-auto">
            {[
              { key: 'pending', label: 'Pending' },
              { key: 'assigned', label: 'Assigned' },
              { key: 'in-progress', label: 'In Progress' },
              { key: 'completed', label: 'Completed' },
              { key: 'pending_approval', label: 'Pending Approval' },
              { key: 'all', label: 'All' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap`}
                style={{
                  borderBottomColor: selectedTab === tab.key ? 'var(--accent-500)' : 'transparent',
                  color: selectedTab === tab.key ? 'var(--djmp-text)' : 'var(--djmp-text-muted)'
                }}
              >
                {tab.label}
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--accent-100)', color: 'var(--accent-700)' }}>
                  {statusCounts[tab.key as keyof typeof statusCounts] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--djmp-border)' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--djmp-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by ID, resident, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              style={{ background: 'var(--djmp-input-bg)', borderColor: 'var(--djmp-input-border)', borderStyle: 'solid', borderWidth: '1px', color: 'var(--djmp-text)' }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center font-medium" style={{ color: 'var(--accent-600)' }}>Loading requests...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center" style={{ color: 'var(--djmp-text-muted)' }}>No requests found</div>
          ) : (
            <table className="w-full">
              <thead className="border-b" style={{ background: 'var(--djmp-surface-2)', borderColor: 'var(--djmp-border)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--djmp-text-muted)' }}>ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--djmp-text-muted)' }}>Resident / Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--djmp-text-muted)' }}>Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--djmp-text-muted)' }}>Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--djmp-text-muted)' }}>Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--djmp-text-muted)' }}>Approval</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--djmp-text-muted)' }}>Deadline</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--djmp-text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ background: 'var(--djmp-surface)' }}>
                {filteredRequests.map((request) => {
                  const priColor = getPriorityColor(request.priority);
                  return (
                    <tr key={request.id} className="transition-opacity hover:opacity-80 border-b" style={{ borderColor: 'var(--djmp-border)' }}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium" style={{ color: 'var(--djmp-text)' }}>{request.request_code}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium" style={{ color: 'var(--djmp-text)' }}>{request.resident}</p>
                          <p className="text-sm" style={{ color: 'var(--djmp-text-muted)' }}>Unit {request.unit}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" style={{ color: 'var(--djmp-text)' }}>{request.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-medium border`}
                          style={{ background: priColor.bg, color: priColor.text, borderColor: priColor.border }}
                        >
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
                          <span className="text-sm" style={{ color: 'var(--djmp-text-muted)' }}>-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.deadline ? (
                          <span className="text-sm" style={{ color: 'var(--djmp-text)' }}>
                            {new Date(request.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        ) : (
                          <span className="text-sm" style={{ color: 'var(--djmp-text-muted)' }}>Not set</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-1">
                          <button
                            onClick={() => openDetail(request)}
                            className="p-2 rounded transition-colors"
                            title="Manage"
                            style={{ color: 'var(--accent-500)', background: 'var(--djmp-surface-2)' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {request.approved_completion === 'pending_approval' && (
                            <>
                              <button
                                onClick={() => handleManageRequest(request.id, { approved_completion: 'approved' })}
                                className="p-2 rounded transition-colors"
                                title="Approve Completion"
                                style={{ color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)' }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleManageRequest(request.id, { approved_completion: 'rejected' })}
                                className="p-2 rounded transition-colors"
                                title="Reject Completion"
                                style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail/Manage Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold" style={{ color: 'var(--djmp-text)' }}>{selectedRequest.request_code}</h3>
              <button 
                onClick={() => setShowDetailModal(false)} 
                className="p-1 rounded transition-colors"
                style={{ background: 'var(--djmp-surface-2)', color: 'var(--djmp-text)' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border" style={{ background: 'var(--djmp-surface-2)', borderColor: 'var(--djmp-border)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--djmp-text-muted)' }}>Resident</p>
                  <p className="font-medium" style={{ color: 'var(--djmp-text)' }}>{selectedRequest.resident}</p>
                  <p className="text-sm" style={{ color: 'var(--djmp-text-muted)' }}>Unit {selectedRequest.unit}</p>
                </div>
                <div className="p-3 rounded-lg border" style={{ background: 'var(--djmp-surface-2)', borderColor: 'var(--djmp-border)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--djmp-text-muted)' }}>Category</p>
                  <p className="font-medium" style={{ color: 'var(--djmp-text)' }}>{selectedRequest.category}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg border" style={{ background: 'var(--djmp-surface-2)', borderColor: 'var(--djmp-border)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--djmp-text-muted)' }}>Description</p>
                <p className="text-sm" style={{ color: 'var(--djmp-text)' }}>{selectedRequest.description}</p>
              </div>

              {/* Resident Images — always visible */}
              {selectedRequest.images && selectedRequest.images.length > 0 && (
                <div className="p-3 rounded-lg border" style={{ background: 'var(--djmp-surface-2)', borderColor: 'var(--djmp-border)' }}>
                  <p className="text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: 'var(--djmp-text-muted)' }}>
                    📎 รูปที่ลูกบ้านแนบมา ({selectedRequest.images.length} รูป)
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedRequest.images.map((img, idx) => (
                      <div key={idx} onClick={() => setPreviewImage(img)}>
                        <img
                          src={img}
                          alt={`Resident image ${idx + 1}`}
                          className="w-full h-20 object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ borderColor: 'var(--djmp-border)' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.approved_completion === 'pending_approval' || selectedRequest.status === 'completed' ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border" style={{ background: 'var(--djmp-surface-2)', borderColor: 'var(--djmp-border)' }}>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--djmp-text)' }}>
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Work Evidence
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs mb-1" style={{ color: 'var(--djmp-text-muted)' }}>Technician Notes</p>
                        <p className="text-sm font-medium whitespace-pre-wrap" style={{ color: 'var(--djmp-text)' }}>{selectedRequest.technician_notes || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs mb-1" style={{ color: 'var(--djmp-text-muted)' }}>Materials Used</p>
                        <p className="text-sm font-medium whitespace-pre-wrap" style={{ color: 'var(--djmp-text)' }}>{selectedRequest.materials_used || '-'}</p>
                      </div>
                      {selectedRequest.images && selectedRequest.images.length > 0 && (
                        <div>
                          <p className="text-xs mb-2" style={{ color: 'var(--djmp-text-muted)' }}>Attached Images</p>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedRequest.images.map((img, idx) => (
                              <div key={idx} onClick={() => setPreviewImage(img)}>
                                <img src={img} alt={`Evidence ${idx + 1}`} className="w-full h-24 object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity" style={{ borderColor: 'var(--djmp-border)' }} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : selectedRequest.status === 'pending' ? (
                /* ── Pending: Read-only view (editing moved to Dispatch Tasks) ── */
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border" style={{ background: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.2)' }}>
                    <p className="text-xs font-semibold" style={{ color: '#3b82f6' }}>💡 กำหนด Priority / Deadline / วันนัด ได้ที่หน้า Dispatch Tasks</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border" style={{ background: 'var(--djmp-surface-2)', borderColor: 'var(--djmp-border)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--djmp-text-muted)' }}>Priority</p>
                      <p className="font-semibold capitalize" style={{ color: 'var(--djmp-text)' }}>{selectedRequest.priority || '-'}</p>
                    </div>
                    <div className="p-3 rounded-lg border" style={{ background: 'var(--djmp-surface-2)', borderColor: 'var(--djmp-border)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--djmp-text-muted)' }}>Deadline</p>
                      <p className="font-semibold" style={{ color: 'var(--djmp-text)' }}>
                        {selectedRequest.deadline ? new Date(selectedRequest.deadline).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not set'}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border" style={{ background: 'var(--djmp-surface-2)', borderColor: 'var(--djmp-border)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--djmp-text-muted)' }}>Scheduled Date</p>
                      <p className="font-semibold" style={{ color: 'var(--djmp-text)' }}>{selectedRequest.scheduled_date || 'Not set'}</p>
                    </div>
                    <div className="p-3 rounded-lg border" style={{ background: 'var(--djmp-surface-2)', borderColor: 'var(--djmp-border)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--djmp-text-muted)' }}>Scheduled Time</p>
                      <p className="font-semibold" style={{ color: 'var(--djmp-text)' }}>{selectedRequest.scheduled_time ? selectedRequest.scheduled_time.substring(0, 5) : 'Not set'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* assigned / in-progress → edit form */
                <>
                  {/* Priority Setting */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--djmp-text)' }}>
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      Priority Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['low', 'medium', 'high'].map((p) => {
                        const isActive = newPriority === p;
                        const activeBg = p === 'high' ? 'rgba(239, 68, 68, 0.1)' : p === 'medium' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(59, 130, 246, 0.1)';
                        const activeText = p === 'high' ? '#ef4444' : p === 'medium' ? '#eab308' : '#3b82f6';
                        return (
                          <button
                            key={p}
                            onClick={() => setNewPriority(p)}
                            className="px-3 py-2 rounded-lg border-2 transition-all capitalize font-medium text-sm"
                            style={{
                              background: isActive ? activeBg : 'var(--djmp-input-bg)',
                              borderColor: isActive ? activeText : 'var(--djmp-border)',
                              color: isActive ? activeText : 'var(--djmp-text)'
                            }}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Deadline Setting */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--djmp-text)' }}>
                      <Clock className="w-4 h-4 inline mr-1" />
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={newDeadline}
                      onChange={(e) => handleDeadlineChange(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 rounded-lg focus:outline-none transition-colors"
                      style={{ background: 'var(--djmp-input-bg)', border: '1px solid var(--djmp-input-border)', color: 'var(--djmp-text)' }}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--djmp-text-muted)' }}>
                      กำหนดส่งงาน — เปลี่ยนค่านี้จะ sync วันนัดทำงานและเวลา (09:00) ให้อัตโนมัติ
                    </p>
                  </div>

                  {/* Scheduled Date & Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--djmp-text)' }}>
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Scheduled Date
                      </label>
                      <input
                        type="date"
                        value={newScheduledDate}
                        onChange={(e) => setNewScheduledDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        max={newDeadline || undefined}
                        className="w-full px-4 py-2 rounded-lg focus:outline-none transition-colors"
                        style={{ background: 'var(--djmp-input-bg)', border: '1px solid var(--djmp-input-border)', color: 'var(--djmp-text)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--djmp-text)' }}>
                        <Clock className="w-4 h-4 inline mr-1" />
                        Scheduled Time
                      </label>
                      <input
                        type="time"
                        value={newScheduledTime}
                        onChange={(e) => setNewScheduledTime(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg focus:outline-none transition-colors"
                        style={{ background: 'var(--djmp-input-bg)', border: '1px solid var(--djmp-input-border)', color: 'var(--djmp-text)' }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>


            <div className="flex gap-3">
              {selectedRequest.approved_completion === 'pending_approval' ? (
                <>
                  <button
                    onClick={() => handleManageRequest(selectedRequest.id, { approved_completion: 'approved' })}
                    disabled={actionLoading}
                    className="flex-1 text-white py-3 rounded-lg transition-all font-medium disabled:opacity-60 hover:brightness-110 shadow-sm flex items-center justify-center gap-2"
                    style={{ background: '#22c55e' }}
                  >
                    <CheckCircle className="w-5 h-5" />
                    {actionLoading ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleManageRequest(selectedRequest.id, { approved_completion: 'rejected' })}
                    disabled={actionLoading}
                    className="flex-1 text-white py-3 rounded-lg transition-all font-medium disabled:opacity-60 hover:brightness-110 shadow-sm flex items-center justify-center gap-2"
                    style={{ background: '#ef4444' }}
                  >
                    <X className="w-5 h-5" />
                    Reject
                  </button>
                </>
              ) : selectedRequest.status === 'pending' ? (
                /* Pending → Go to Dispatch Tasks + Close */
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => { setShowDetailModal(false); navigate('/officer/dispatch'); }}
                    className="flex-1 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:brightness-110 shadow-sm transition-all"
                    style={{ background: 'var(--accent-gradient)' }}
                  >
                    <Send className="w-4 h-4" />
                    Go to Dispatch Tasks
                  </button>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-5 py-3 rounded-lg font-medium border hover:opacity-80 transition-all"
                    style={{ background: 'var(--djmp-surface-2)', color: 'var(--djmp-text)', borderColor: 'var(--djmp-border)' }}
                  >
                    Close
                  </button>
                </div>
              ) : selectedRequest.status !== 'completed' && selectedRequest.status !== 'cancelled' ? (
                <>
                  <button
                    onClick={() => {
                      const updates: Record<string, any> = {};
                      if (newPriority !== selectedRequest.priority) updates.priority = newPriority;

                      const originalDeadlineDate = selectedRequest.deadline ? selectedRequest.deadline.split('T')[0] : '';
                      if (newDeadline !== originalDeadlineDate) {
                        updates.deadline = newDeadline ? `${newDeadline}T23:59:59` : '';
                      }

                      const originalScheduledDate = selectedRequest.scheduled_date || '';
                      if (newScheduledDate !== originalScheduledDate) {
                        updates.scheduled_date = newScheduledDate;
                      }

                      const originalScheduledTime = selectedRequest.scheduled_time
                        ? selectedRequest.scheduled_time.substring(0, 5)
                        : '';
                      if (newScheduledTime !== originalScheduledTime) {
                        updates.scheduled_time = newScheduledTime;
                      }

                      if (Object.keys(updates).length > 0) {
                        handleManageRequest(selectedRequest.id, updates);
                      } else {
                        setShowDetailModal(false);
                      }
                    }}
                    disabled={actionLoading}
                    className="flex-1 text-white py-3 rounded-lg transition-all font-medium disabled:opacity-60 hover:brightness-110 shadow-sm"
                    style={{ background: 'var(--accent-gradient)' }}
                  >
                    {actionLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-6 py-3 rounded-lg transition-colors font-medium border hover:opacity-80"
                    style={{ background: 'var(--djmp-surface-2)', color: 'var(--djmp-text)', borderColor: 'var(--djmp-border)' }}
                  >
                    Cancel
                  </button>
                </>
              ) : selectedRequest.status === 'pending' ? (
                /* Pending: Go to Dispatch + Close */
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => { setShowDetailModal(false); navigate('/officer/dispatch', { state: { selectRequestId: selectedRequest.id } }); }}
                    className="flex-1 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:brightness-110 shadow-sm transition-all"
                    style={{ background: 'var(--accent-gradient)' }}
                  >
                    <Send className="w-4 h-4" />
                    Go to Dispatch Tasks
                  </button>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-5 py-3 rounded-lg font-medium border hover:opacity-80 transition-all"
                    style={{ background: 'var(--djmp-surface-2)', color: 'var(--djmp-text)', borderColor: 'var(--djmp-border)' }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                /* completed/cancelled: close only */
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full px-6 py-3 rounded-lg font-medium border hover:opacity-80 transition-all"
                  style={{ background: 'var(--djmp-surface-2)', color: 'var(--djmp-text)', borderColor: 'var(--djmp-border)' }}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <img 
            src={previewImage} 
            alt="Preview" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
          />
          <button 
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all"
            onClick={() => setPreviewImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
