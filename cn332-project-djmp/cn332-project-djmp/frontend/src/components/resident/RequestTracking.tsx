import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Calendar } from 'lucide-react';
import StatusBadge, { Status } from '../shared/StatusBadge';
import api from '../../utils/api';

interface RequestItem {
  id: string | number;
  request_code?: string;
  category: string;
  description: string;
  status: Status;
  created_at?: string;
  date?: string;
  technician?: string;
  priority: string;
  location: string;
}

export default function RequestTracking() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const response = await api.get('/maintenance-requests/');
        setRequests(Array.isArray(response.data) ? response.data : []);
      } catch (error: any) {
        console.error('Error fetching requests:', error);
        setErrorMessage(
          error?.response?.data?.error || 'ไม่สามารถโหลดรายการแจ้งซ่อมได้'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const displayId = String(req.request_code || req.id).toLowerCase();
      const matchesSearch =
        displayId.includes(searchTerm.toLowerCase()) ||
        req.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [requests, searchTerm, filterStatus]);

  const statusCounts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    'in-progress': requests.filter((r) => r.status === 'in-progress').length,
    completed: requests.filter((r) => r.status === 'completed').length,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'var(--djmp-text-muted)';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <button
        onClick={() => navigate('/resident')}
        className="flex items-center gap-2 mb-6 font-medium hover:opacity-80 transition-opacity"
        style={{ color: 'var(--accent-600)' }}
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="glass-card rounded-xl shadow-lg overflow-hidden" style={{ background: 'var(--djmp-surface)' }}>
        <div className="p-6 text-white" style={{ background: 'var(--accent-gradient)' }}>
          <h1 className="text-2xl font-bold mb-2">My Maintenance Requests</h1>
          <p className="opacity-90">Track all your submitted requests and their current status</p>
        </div>

        <div className="border-b px-6" style={{ background: 'var(--djmp-surface-2)', borderColor: 'var(--djmp-border)' }}>
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
                className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap`}
                style={{
                  borderBottomColor: filterStatus === tab.key ? 'var(--accent-500)' : 'transparent',
                  color: filterStatus === tab.key ? 'var(--djmp-text)' : 'var(--djmp-text-muted)',
                }}
              >
                {tab.label}
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--accent-100)', color: 'var(--accent-700)' }}>
                  {statusCounts[tab.key as keyof typeof statusCounts]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-b" style={{ background: 'var(--djmp-surface)', borderColor: 'var(--djmp-border)' }}>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--djmp-text-muted)' }} />
              <input
                type="text"
                placeholder="Search by ID, category, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                style={{ background: 'var(--djmp-input-bg)', borderColor: 'var(--djmp-input-border)', borderStyle: 'solid', borderWidth: '1px', color: 'var(--djmp-text)' }}
              />
            </div>
            <button className="px-6 py-3 rounded-lg transition-colors font-medium flex items-center gap-2 border hover:opacity-80"
              style={{ background: 'var(--djmp-surface-2)', color: 'var(--djmp-text)', borderColor: 'var(--djmp-border)' }}
            >
              <Filter className="w-5 h-5" />
              More Filters
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="px-6 py-4" style={{ background: 'rgba(239, 68, 68, 0.1)', borderBottom: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>
            {errorMessage}
          </div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center font-medium" style={{ color: 'var(--accent-600)' }}>
              Loading requests...
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b" style={{ background: 'var(--djmp-surface-2)', borderColor: 'var(--djmp-border)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--djmp-text-muted)' }}>
                    Request ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--djmp-text-muted)' }}>
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--djmp-text-muted)' }}>
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--djmp-text-muted)' }}>
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--djmp-text-muted)' }}>
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--djmp-text-muted)' }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--djmp-text-muted)' }}>
                    Technician
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--djmp-text-muted)' }}>
                    Date
                  </th>
                </tr>
              </thead>
              <tbody style={{ background: 'var(--djmp-surface)' }}>
                {filteredRequests.map((request) => (
                  <tr
                    key={request.id}
                    onClick={() => navigate(`/resident/requests/${request.id}`)}
                    className="cursor-pointer transition-opacity hover:opacity-80 border-b"
                    style={{ borderColor: 'var(--djmp-border)' }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium" style={{ color: 'var(--djmp-text)' }}>
                        {request.request_code || request.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span style={{ color: 'var(--djmp-text)' }}>{request.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span style={{ color: 'var(--djmp-text-muted)' }}>{request.description}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm" style={{ color: 'var(--djmp-text-muted)' }}>{request.location}</span>
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
                      <span style={{ color: 'var(--djmp-text)' }}>{request.technician || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2" style={{ color: 'var(--djmp-text-muted)' }}>
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(request.created_at || request.date || '').toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filteredRequests.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--djmp-surface-2)' }}>
              <Search className="w-8 h-8" style={{ color: 'var(--djmp-text-muted)' }} />
            </div>
            <p className="font-medium" style={{ color: 'var(--djmp-text)' }}>No requests found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--djmp-text-muted)' }}>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}