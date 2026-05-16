import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, AlertCircle, Search, ClipboardList, MapPin } from 'lucide-react';
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

function getPriorityStyle(priority: string): React.CSSProperties {
  switch (priority) {
    case 'high':
      return { background: 'var(--st-overdue-bg)', color: 'var(--st-overdue)', border: '1px solid var(--st-overdue)' };
    case 'medium':
      return { background: 'var(--st-pending-bg)', color: 'var(--st-pending)', border: '1px solid var(--st-pending)' };
    case 'low':
      return { background: 'var(--st-done-bg)', color: 'var(--st-done)', border: '1px solid var(--st-done)' };
    default:
      return { background: 'var(--paper-2)', color: 'var(--ink-3)', border: '1px solid var(--rule)' };
  }
}

function getAvailabilityStyle(activeTasks: number): React.CSSProperties {
  if (activeTasks < 4) {
    return { background: 'var(--st-done-bg)', color: 'var(--st-done)', border: '1px solid var(--st-done)' };
  }
  return { background: 'var(--st-pending-bg)', color: 'var(--st-pending)', border: '1px solid var(--st-pending)' };
}

export default function TaskDispatch() {
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<number | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
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

      await api.patch(`/maintenance-requests/${selectedRequest}/manage/`, updates);

      // Remove from pending list
      setPendingRequests(prev => prev.filter(r => r.id !== selectedRequest));
      setSelectedRequest(null);
      setSelectedTechnician(null);
      setScheduledDate('');
      alert('Task assigned successfully!');
    } catch (error: any) {
      console.error('Error assigning task:', error);
      alert(error?.response?.data?.error || 'Failed to assign task');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 32px 160px' }} className="task-dispatch-content">
        <style>{`
          @media (max-width: 640px) {
            .task-dispatch-content { padding: 16px 16px 160px !important; }
            .dispatch-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* Back button */}
        <button
          onClick={() => navigate('/officer')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--ink-3)',
            fontSize: 13,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            marginBottom: 24,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-3)')}
        >
          <ArrowLeft size={16} style={{ transition: 'transform 0.15s' }}
            onMouseEnter={e => ((e.currentTarget as SVGElement).style.transform = 'translateX(-2px)')}
            onMouseLeave={e => ((e.currentTarget as SVGElement).style.transform = '')}
          />
          <span>Back to Dashboard</span>
        </button>

        {/* Page header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            margin: '0 0 6px',
          }}>
            Task Dispatch
          </h1>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>
            Assign maintenance requests to available technicians
          </p>
        </div>

        {loading ? (
          <div className="card" style={{ padding: '80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
            <div style={{
              width: 40,
              height: 40,
              border: '3px solid var(--rule)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>Loading dispatch data...</p>
          </div>
        ) : (
          <div
            className="dispatch-grid"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}
          >
            {/* Left: Pending Assignment */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--rule-soft)',
                background: 'var(--paper-2)',
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Pending Assignment</span>
                <span className="pill pending">{pendingRequests.length} Tasks</span>
              </div>

              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 600, overflowY: 'auto' }}>
                {pendingRequests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <ClipboardList size={40} style={{ color: 'var(--ink-4)', opacity: 0.4 }} />
                    <span style={{ color: 'var(--ink-3)', fontSize: 13 }}>No pending requests</span>
                  </div>
                ) : (
                  pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      onClick={() => setSelectedRequest(request.id)}
                      style={{
                        padding: 16,
                        borderRadius: 'var(--radius-lg)',
                        cursor: 'pointer',
                        transition: 'transform 0.1s, box-shadow 0.1s',
                        background: selectedRequest === request.id ? 'var(--accent-soft)' : 'var(--paper-2)',
                        border: selectedRequest === request.id
                          ? '1px solid var(--accent)'
                          : '1px solid var(--rule)',
                        boxShadow: selectedRequest === request.id ? '0 0 0 1px var(--accent)' : 'none',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.01)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>
                              {request.request_code}
                            </span>
                            <span
                              className="pill"
                              style={{
                                ...getPriorityStyle(request.priority),
                                fontSize: 10,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}
                            >
                              {request.priority}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0 }}>
                            {request.resident} &bull; Unit {request.unit}
                          </p>
                        </div>
                        {request.priority === 'high' && (
                          <AlertCircle size={18} style={{ color: 'var(--st-overdue)', flexShrink: 0 }} />
                        )}
                      </div>

                      <div style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius)',
                        marginBottom: 10,
                        background: 'var(--paper)',
                        border: '1px solid var(--rule-soft)',
                      }}>
                        <p style={{
                          fontSize: 10,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: 'var(--ink-3)',
                          margin: '0 0 4px',
                        }}>
                          {request.category}
                        </p>
                        <p style={{ fontSize: 13, color: 'var(--ink)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {request.description}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--ink-3)' }}>
                        <MapPin size={12} />
                        {request.location}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Available Technicians */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{
                padding: '16px 18px',
                borderBottom: '1px solid var(--rule-soft)',
                background: 'var(--paper-2)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Available Technicians</span>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }} />
                  <input
                    type="text"
                    placeholder="Search by name or specialty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      paddingLeft: 36,
                      paddingRight: 12,
                      paddingTop: 9,
                      paddingBottom: 9,
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--rule)',
                      background: 'var(--paper)',
                      color: 'var(--ink)',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--rule)')}
                  />
                </div>
              </div>

              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 600, overflowY: 'auto' }}>
                {filteredTechnicians.map((tech) => {
                  const initials = tech.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                  const availStyle = getAvailabilityStyle(tech.active_tasks);

                  return (
                    <div
                      key={tech.id}
                      onClick={() => setSelectedTechnician(tech.id)}
                      style={{
                        padding: 16,
                        borderRadius: 'var(--radius-lg)',
                        cursor: 'pointer',
                        transition: 'transform 0.1s',
                        background: selectedTechnician === tech.id ? 'var(--accent-soft)' : 'var(--paper-2)',
                        border: selectedTechnician === tech.id
                          ? '1px solid var(--accent)'
                          : '1px solid var(--rule)',
                        boxShadow: selectedTechnician === tech.id ? '0 0 0 1px var(--accent)' : 'none',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.01)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                        <span className="avatar lg" style={{ flexShrink: 0 }}>{initials}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {tech.name}
                            </span>
                            <span
                              className="pill"
                              style={{
                                ...availStyle,
                                fontSize: 10,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                flexShrink: 0,
                              }}
                            >
                              {tech.active_tasks < 4 ? 'Available' : 'Busy'}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0 }}>{tech.specialty}</p>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--radius)',
                          textAlign: 'center',
                          background: 'var(--paper)',
                          border: '1px solid var(--rule-soft)',
                        }}>
                          <p className="eyebrow" style={{ marginBottom: 4 }}>Active Tasks</p>
                          <p className="numerals" style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                            {tech.active_tasks}
                          </p>
                        </div>
                        <div style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--radius)',
                          textAlign: 'center',
                          background: 'var(--paper)',
                          border: '1px solid var(--rule-soft)',
                        }}>
                          <p className="eyebrow" style={{ marginBottom: 4 }}>Completed</p>
                          <p className="numerals" style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                            {tech.completed_tasks}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Assignment bottom panel */}
        {(selectedRequest || selectedTechnician) && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 40,
            padding: '16px 24px',
            background: 'var(--paper-card)',
            borderTop: '1px solid var(--rule)',
            boxShadow: 'var(--shadow-lift)',
          }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, minWidth: 0 }}>
                {/* Selected Request */}
                <div style={{ padding: '12px 14px', borderRadius: 'var(--radius)', background: 'var(--paper-2)', border: '1px solid var(--rule)' }}>
                  <p className="eyebrow" style={{ marginBottom: 4 }}>Selected Request</p>
                  <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)', margin: 0 }}>
                    {selectedRequest
                      ? pendingRequests.find(r => r.id === selectedRequest)?.request_code ?? selectedRequest
                      : 'None'}
                  </p>
                </div>

                {/* Selected Technician */}
                <div style={{ padding: '12px 14px', borderRadius: 'var(--radius)', background: 'var(--paper-2)', border: '1px solid var(--rule)' }}>
                  <p className="eyebrow" style={{ marginBottom: 4 }}>Selected Technician</p>
                  <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)', margin: 0 }}>
                    {selectedTechnician
                      ? technicians.find(t => t.id === selectedTechnician)?.name ?? 'None'
                      : 'None'}
                  </p>
                </div>

                {/* Schedule Date */}
                <div>
                  <label className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Schedule Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--rule)',
                      background: 'var(--paper)',
                      color: 'var(--ink)',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--rule)')}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setSelectedTechnician(null);
                    setScheduledDate('');
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--rule)',
                    background: 'var(--paper-2)',
                    color: 'var(--ink)',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
                <button
                  onClick={handleAssign}
                  disabled={!selectedRequest || !selectedTechnician || !scheduledDate || assigning}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 'var(--radius)',
                    border: 'none',
                    background: 'var(--accent)',
                    color: 'var(--accent-on)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: (!selectedRequest || !selectedTechnician || !scheduledDate || assigning) ? 'not-allowed' : 'pointer',
                    opacity: (!selectedRequest || !selectedTechnician || !scheduledDate || assigning) ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'opacity 0.15s, transform 0.1s',
                  }}
                  onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.opacity = '0.9'; }}
                  onMouseLeave={e => { if (!e.currentTarget.disabled) e.currentTarget.style.opacity = '1'; }}
                  onMouseDown={e => { if (!e.currentTarget.disabled) e.currentTarget.style.transform = 'scale(0.98)'; }}
                  onMouseUp={e => { e.currentTarget.style.transform = ''; }}
                >
                  <UserCheck size={16} />
                  {assigning ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
