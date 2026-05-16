import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import {
  ClipboardList,
  UserCheck,
  Clock,
  AlertTriangle,
  ChevronRight,
  Headset
} from 'lucide-react';
import api from '../../utils/api';

interface DashboardStats {
  total: number;
  pending: number;
  in_progress: number;
  overdue: number;
  assigned: number;
  completed: number;
}

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
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function getPriorityPillClass(priority: string): string {
  switch (priority) {
    case 'high': return 'pill overdue';
    case 'medium': return 'pill pending';
    case 'low': return 'pill done';
    default: return 'pill';
  }
}

export default function OfficerHome() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({ total: 0, pending: 0, in_progress: 0, overdue: 0, assigned: 0, completed: 0 });
  const [pendingRequests, setPendingRequests] = useState<RequestItem[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, requestsRes, techRes] = await Promise.all([
          api.get('/dashboard-stats/'),
          api.get('/maintenance-requests/'),
          api.get('/technicians/'),
        ]);
        setStats(statsRes.data);
        const allRequests = Array.isArray(requestsRes.data) ? requestsRes.data : [];
        setPendingRequests(allRequests.filter((r: RequestItem) => r.status === 'pending').slice(0, 5));
        setTechnicians(Array.isArray(techRes.data) ? techRes.data : []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      label: 'Total Requests',
      value: stats.total,
      icon: ClipboardList,
      iconBg: 'var(--forest-soft)',
      iconColor: 'var(--forest)',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      iconBg: 'var(--ochre-soft)',
      iconColor: 'var(--ochre)',
    },
    {
      label: 'In Progress',
      value: stats.in_progress,
      icon: UserCheck,
      iconBg: 'var(--slate-soft)',
      iconColor: 'var(--slate)',
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      icon: AlertTriangle,
      iconBg: 'var(--terracotta-soft)',
      iconColor: 'var(--terracotta)',
    },
  ];

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const timeOfDay = getTimeOfDay();

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>
      <div style={{ padding: '32px 40px' }} className="officer-home-content">
        <style>{`
          @media (max-width: 640px) {
            .officer-home-content { padding: 16px 20px !important; }
            .officer-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
            .officer-main-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* Page Header */}
        <div style={{ marginBottom: 32 }}>
          <p className="eyebrow">Officer Dashboard</p>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            margin: '4px 0 6px',
          }}>
            Good {timeOfDay}, {firstName}!
          </h1>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>
            Here's your management overview
          </p>
        </div>

        {/* Stats Grid */}
        <div
          className="officer-stats-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            marginBottom: 32,
          }}
        >
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="card lifted" style={{ padding: 20 }}>
                {loading ? (
                  <>
                    <div className="shimmer-skeleton" style={{ width: 32, height: 32, borderRadius: 6, marginBottom: 12 }} />
                    <div className="shimmer-skeleton" style={{ height: 28, width: 48, marginBottom: 4 }} />
                    <div className="shimmer-skeleton" style={{ height: 12, width: 80 }} />
                  </>
                ) : (
                  <>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      background: stat.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                    }}>
                      <Icon size={16} style={{ color: stat.iconColor }} />
                    </div>
                    <p className="numerals" style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: 'var(--ink)',
                      margin: '0 0 2px',
                    }}>
                      {stat.value}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0 }}>{stat.label}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Two-column layout */}
        <div
          className="officer-main-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.6fr 1fr',
            gap: 32,
            alignItems: 'start',
          }}
        >
          {/* LEFT column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Quick action banner */}
            <button
              onClick={() => navigate('/officer/requests')}
              style={{
                background: 'var(--accent)',
                padding: '14px 18px',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                textAlign: 'left',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.92')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <ClipboardList size={16} style={{ color: 'white' }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'white', margin: '0 0 2px' }}>
                    Manage Requests
                  </p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', margin: 0 }}>
                    Review &amp; approve
                  </p>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: 'white', opacity: 0.6 }} />
            </button>

            {/* Pending Requests card */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{
                padding: '16px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--rule-soft)',
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
                  Pending Review
                </span>
                <span className="pill pending">{pendingRequests.length}</span>
              </div>

              <div>
                {loading ? (
                  <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} className="shimmer-skeleton" style={{ height: 48, borderRadius: 6 }} />
                    ))}
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div style={{
                    padding: 24,
                    textAlign: 'center',
                    fontSize: 12,
                    color: 'var(--ink-4)',
                  }}>
                    No pending requests
                  </div>
                ) : (
                  pendingRequests.map((request, idx) => (
                    <div
                      key={request.id}
                      onClick={() => navigate('/officer/requests')}
                      style={{
                        padding: '12px 18px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                        borderTop: idx > 0 ? '1px solid var(--rule-soft)' : 'none',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--paper-2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>
                            {request.request_code}
                          </span>
                          <span className={getPriorityPillClass(request.priority)}>
                            {request.priority}
                          </span>
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {request.resident} &bull; Unit {request.unit}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--ink-4)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {request.category}: {request.description}
                        </p>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink-4)', whiteSpace: 'nowrap', paddingLeft: 12 }}>
                        {request.created_at}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Technicians card */}
            <div className="card" style={{ height: 460, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{
                padding: '14px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--rule-soft)',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Team</span>
                <button
                  onClick={() => navigate('/officer/schedule')}
                  style={{
                    fontSize: 11,
                    color: 'var(--accent)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                >
                  View All
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="shimmer-skeleton" style={{ height: 44, borderRadius: 6 }} />
                    ))}
                  </div>
                ) : technicians.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', fontSize: 12, color: 'var(--ink-4)' }}>
                    No technicians found
                  </div>
                ) : (
                  technicians.map((tech) => {
                    let statusLabel: string;
                    let dotColor: string;
                    let labelColor: string;
                    if (tech.active_tasks === 0) {
                      statusLabel = 'Available';
                      dotColor = 'var(--st-done)';
                      labelColor = 'var(--st-done)';
                    } else if (tech.active_tasks <= 2) {
                      statusLabel = 'Busy';
                      dotColor = 'var(--st-progress)';
                      labelColor = 'var(--st-progress)';
                    } else {
                      statusLabel = 'On Site';
                      dotColor = 'var(--st-overdue)';
                      labelColor = 'var(--st-overdue)';
                    }

                    const initials = tech.name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase();

                    return (
                      <div
                        key={tech.id}
                        onClick={() => navigate('/officer/schedule')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 8,
                          borderRadius: 6,
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--paper-2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="avatar" style={{ flexShrink: 0 }}>{initials}</span>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', margin: 0 }}>{tech.name}</p>
                            <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: 0 }}>{tech.specialty}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: dotColor,
                            display: 'inline-block',
                            flexShrink: 0,
                          }} />
                          <span style={{ fontSize: 11, fontWeight: 500, color: labelColor }}>
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Need Help banner */}
            <div style={{
              background: 'var(--accent)',
              borderRadius: 'var(--radius-lg)',
              padding: 20,
            }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'white', margin: '0 0 4px' }}>
                Need Help?
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: '0 0 14px' }}>
                Contact our support team for assistance
              </p>
              <button
                onClick={() => navigate('/support')}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  padding: '8px 14px',
                  borderRadius: 6,
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              >
                <Headset size={14} />
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
