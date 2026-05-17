import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import StatusBadge, { Status } from '../shared/StatusBadge';
import {
  Plus,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Home,
} from 'lucide-react';
import api from '../../utils/api';

interface RequestItem {
  id: number | string;
  request_code?: string;
  category: string;
  description: string;
  status: Status;
  created_at?: string;
  technician?: string;
  priority: string;
  location: string;
}

export default function ResidentHome() {
  const { user } = useUser();
  const navigate = useNavigate();

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
        console.error('Error fetching resident requests:', error);
        setErrorMessage(
          error?.response?.data?.error || 'ไม่สามารถโหลดข้อมูลคำขอแจ้งซ่อมได้'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const stats = useMemo(
    () => [
      {
        label: 'Total Requests',
        value: String(requests.length),
        icon: FileText,
        color: 'bg-blue-500',
      },
      {
        label: 'Completed',
        value: String(requests.filter((r) => r.status === 'completed').length),
        icon: CheckCircle,
        color: 'bg-green-500',
      },
      {
        label: 'In Progress',
        value: String(requests.filter((r) => r.status === 'in-progress').length),
        icon: Clock,
        color: 'bg-yellow-500',
      },
      {
        label: 'Pending',
        value: String(requests.filter((r) => r.status === 'pending').length),
        icon: AlertTriangle,
        color: 'bg-orange-500',
      },
    ],
    [requests]
  );

  const recentRequests = useMemo(() => {
    return [...requests].slice(0, 4);
  }, [requests]);

  const statGlows = ['stat-glow-blue', 'stat-glow-green', 'stat-glow-yellow', 'stat-glow-red'];

  return (
    <div className="djmp-bg">
    <div className="max-w-7xl mx-auto p-6" style={{ position: 'relative', zIndex: 1 }}>
      {/* Welcome Section */}
      <div className="mb-8 fade-in-up">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--djmp-text)' }}>
          Welcome back,{' '}
          <span className="gradient-text">
            {user?.name ? user.name.split(' ')[0] : user?.username || 'User'}
          </span>!
        </h1>
        <p style={{ color: 'var(--djmp-text-muted)' }}>
          Manage your maintenance requests and track their progress
        </p>
        <div className="mt-2 flex items-center gap-2" style={{ color: 'var(--accent-600)' }}>
          <Home className="w-5 h-5" />
          <span className="font-medium">
            {user?.unit_number ? `Unit ${user.unit_number}` : 'No Unit'}
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
          {errorMessage}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => navigate('/resident/new-request')}
          className="btn-accent p-6 rounded-xl group overflow-hidden text-left"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-xl font-semibold mb-2 truncate">New Maintenance Request</h3>
              <p className="text-white/80 truncate text-sm">Submit a new maintenance or repair request</p>
            </div>
            <Plus className="w-12 h-12 flex-shrink-0 group-hover:scale-110 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => navigate('/resident/requests')}
          className="glass-card p-6 group overflow-hidden text-left w-full"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-xl font-semibold mb-2 truncate" style={{ color: 'var(--djmp-text)' }}>Track My Requests</h3>
              <p className="truncate text-sm" style={{ color: 'var(--djmp-text-muted)' }}>View all your maintenance requests</p>
            </div>
            <FileText className="w-12 h-12 flex-shrink-0 group-hover:scale-110 transition-transform" style={{ color: 'var(--accent-500)' }} />
          </div>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`glass-card p-6 ${statGlows[i]}`}>
              {loading ? (
                <>
                  <div className="shimmer-skeleton w-12 h-12 rounded-lg mb-4" />
                  <div className="shimmer-skeleton h-8 w-16 mb-2" />
                  <div className="shimmer-skeleton h-4 w-24" />
                </>
              ) : (
                <>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4 flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white flex-shrink-0" />
                  </div>
                  <p className="text-3xl font-bold mb-1 truncate" style={{ color: 'var(--djmp-text)' }}>{stat.value}</p>
                  <p className="text-sm truncate" style={{ color: 'var(--djmp-text-muted)' }}>{stat.label}</p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent Requests */}
      <div className="glass-card overflow-hidden mb-8">
        <div className="p-6 flex justify-between items-center" style={{ borderBottom: '1px solid var(--djmp-border)' }}>
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--djmp-text)' }}>Recent Maintenance Requests</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--djmp-text-muted)' }}>Track the status of your latest requests</p>
          </div>
          <button onClick={() => navigate('/resident/requests')} className="text-sm font-medium" style={{ color: 'var(--accent-600)' }}>
            View All →
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map(i => <div key={i} className="shimmer-skeleton h-12 w-full" />)}
            </div>
          ) : recentRequests.length === 0 ? (
            <div className="px-6 py-8 text-center" style={{ color: 'var(--djmp-text-muted)' }}>No maintenance requests found.</div>
          ) : (
            <table className="w-full">
              <thead style={{ borderBottom: '1px solid var(--djmp-border)', background: 'var(--djmp-surface-2)' }}>
                <tr>
                  {['Request ID','Category','Description','Status','Technician','Date'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--djmp-text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody style={{ '--divide-color': 'var(--djmp-border)' } as any}>
                {recentRequests.map((request) => (
                  <tr
                    key={request.id}
                    onClick={() => navigate(`/resident/requests/${request.id}`)}
                    className="cursor-pointer transition-colors"
                    style={{ borderTop: '1px solid var(--djmp-border)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-shimmer)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium" style={{ color: 'var(--djmp-text)' }}>{request.request_code || request.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap" style={{ color: 'var(--djmp-text-muted)' }}>{request.category}</td>
                    <td className="px-6 py-4" style={{ color: 'var(--djmp-text-muted)' }}>{request.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={request.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap" style={{ color: 'var(--djmp-text-muted)' }}>{request.technician || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap" style={{ color: 'var(--djmp-text-muted)' }}>
                      {request.created_at ? new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 rounded-xl p-6 text-white" style={{ background: 'var(--accent-gradient)', boxShadow: '0 8px 24px var(--accent-glow)' }}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Quick Tips</h3>
            <ul className="space-y-1 text-white/80 text-sm">
              <li>• Submit requests with detailed descriptions for faster processing</li>
              <li>• Check your notifications regularly for updates</li>
              <li>• Approve completed work promptly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}