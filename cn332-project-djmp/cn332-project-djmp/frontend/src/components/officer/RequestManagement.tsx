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
      case 'high': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' };
      case 'medium': return { bg: 'rgba(234, 179, 8, 0.1)', text: '#eab308', border: 'rgba(234, 179, 8, 0.2)' };
      case 'low': return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' };
      default: return { bg: 'var(--djmp-surface-2)', text: 'var(--djmp-text-muted)', border: 'var(--djmp-border)' };
    }
  };

  return (
    <div style={{ overflowY: 'auto', height: '100%' }}>
      <header style={{ padding: '32px 40px 24px', borderBottom: '1px solid var(--rule-soft)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>REQUESTS</div>
            <h1 className="display" style={{ margin: 0, fontSize: 38, lineHeight: 1.06 }}>
              All
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, color: 'var(--ink-3)', letterSpacing: '-0.01em' }}> requests.</span>
            </h1>
            <p style={{ margin: '10px 0 0', color: 'var(--ink-3)', fontSize: 13.5 }}>
              {requests.length} total · {statusCounts.pending} awaiting review · {statusCounts['in-progress']} in flight.
            </p>
          </div>
        </div>
      </header>

      <div style={{ padding: '20px 40px 48px' }}>
        {/* Filter chips */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[
              { key: 'pending', label: 'Pending' },
              { key: 'assigned', label: 'Assigned' },
              { key: 'in-progress', label: 'In Progress' },
              { key: 'completed', label: 'Completed' },
              { key: 'pending_approval', label: 'Awaiting approval' },
              { key: 'all', label: 'All' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className="chip"
                style={{
                  background: selectedTab === tab.key ? 'var(--ink)' : 'transparent',
                  color: selectedTab === tab.key ? 'var(--paper)' : 'var(--ink-2)',
                  borderColor: selectedTab === tab.key ? 'var(--ink)' : 'var(--rule)',
                }}
              >
                {tab.label}
                <span className="numerals" style={{ opacity: 0.6, fontSize: 11, marginLeft: 2 }}>
                  {statusCounts[tab.key as keyof typeof statusCounts] ?? 0}
                </span>
              </button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: 9, color: 'var(--ink-4)' }} />
            <input
              className="in"
              placeholder="Search by ID, resident, category…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 30, width: 260 }}
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
            <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--paper-soft)', borderBottom: '1px solid var(--rule-soft)' }}>
                  <th style={{ padding: '10px 18px' }} className="eyebrow">ID</th>
                  <th style={{ padding: '10px 18px' }} className="eyebrow">RESIDENT</th>
                  <th style={{ padding: '10px 18px' }} className="eyebrow">CATEGORY</th>
                  <th style={{ padding: '10px 18px' }} className="eyebrow">PRIORITY</th>
                  <th style={{ padding: '10px 18px' }} className="eyebrow">STATUS</th>
                  <th style={{ padding: '10px 18px' }} className="eyebrow">APPROVAL</th>
                  <th style={{ padding: '10px 18px' }} className="eyebrow">DEADLINE</th>
                  <th style={{ padding: '10px 18px' }} className="eyebrow">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
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
            </div>
          )}
        </div>
      </div>

      {/* Detail/Manage Modal */}
      {showDetailModal && selectedRequest && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(21,20,15,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(2px)' }}>
          <div className="card" style={{ background: 'var(--paper-card)', width: '100%', maxWidth: 520, boxShadow: 'var(--shadow-lift)', maxHeight: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
                              <a href={img} target="_blank" rel="noopener noreferrer" key={idx}>
                                <img src={img} alt={`Evidence ${idx + 1}`} className="w-full h-24 object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity" style={{ borderColor: 'var(--djmp-border)' }} />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
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
                        const pColor = p === 'high' ? 'rgba(239, 68, 68, 0.2)' : p === 'medium' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(59, 130, 246, 0.2)';
                        const activeBg = p === 'high' ? 'rgba(239, 68, 68, 0.1)' : p === 'medium' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(59, 130, 246, 0.1)';
                        const activeText = p === 'high' ? '#ef4444' : p === 'medium' ? '#eab308' : '#3b82f6';
                        
                        return (
                          <button
                            key={p}
                            onClick={() => setNewPriority(p)}
                            className={`px-3 py-2 rounded-lg border-2 transition-all capitalize font-medium text-sm`}
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
                      onChange={(e) => setNewDeadline(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 rounded-lg focus:outline-none transition-colors"
                      style={{ background: 'var(--djmp-input-bg)', border: '1px solid var(--djmp-input-border)', color: 'var(--djmp-text)' }}
                    />
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
              ) : selectedRequest.status !== 'completed' && selectedRequest.status !== 'cancelled' ? (
                <>
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
              ) : (
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full px-6 py-3 rounded-lg transition-colors font-medium border hover:opacity-80"
                  style={{ background: 'var(--djmp-surface-2)', color: 'var(--djmp-text)', borderColor: 'var(--djmp-border)' }}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
