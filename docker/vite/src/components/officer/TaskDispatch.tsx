import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, Clock, AlertCircle, Search, ClipboardList, MapPin } from 'lucide-react';
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

  const getAvailabilityColor = (activeTasks: number) => {
    return activeTasks < 4 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 pb-40 fade-in-up">
      <button
        onClick={() => navigate('/officer')}
        className="flex items-center gap-2 group transition-colors mb-6"
        style={{ color: 'var(--djmp-text-muted)' }}
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-semibold uppercase tracking-widest">Back to Dashboard</span>
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2" style={{ color: 'var(--djmp-text)' }}>Task Dispatch</h1>
        <p className="text-sm font-medium" style={{ color: 'var(--djmp-text-muted)' }}>Assign maintenance requests to available technicians</p>
      </div>

      {loading ? (
        <div className="glass-card p-20 flex flex-col items-center gap-4 text-center">
           <div className="w-10 h-10 border-4 border-t-transparent animate-spin rounded-full" style={{ borderColor: 'var(--accent-500) transparent transparent transparent' }}></div>
           <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--djmp-text-muted)' }}>Loading Dispatch Data...</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Pending Assignment */}
          <div className="glass-card overflow-hidden border-none shadow-2xl" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--djmp-border)', background: 'var(--djmp-surface-2)' }}>
              <h2 className="text-xl font-bold uppercase tracking-tight" style={{ color: 'var(--djmp-text)' }}>Pending Assignment</h2>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" style={{ background: 'var(--accent-100)', color: 'var(--accent-700)' }}>
                {pendingRequests.length} Tasks
              </span>
            </div>
            
            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <ClipboardList className="w-12 h-12 mx-auto opacity-20" style={{ color: 'var(--djmp-text)' }} />
                  <div style={{ color: 'var(--djmp-text-muted)' }}>No pending requests</div>
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => setSelectedRequest(request.id)}
                    className="group p-5 rounded-xl border border-transparent transition-all cursor-pointer hover:scale-[1.01]"
                    style={{ 
                      background: selectedRequest === request.id ? 'var(--djmp-surface)' : 'var(--djmp-surface-2)', 
                      border: `1px solid ${selectedRequest === request.id ? 'var(--accent-500)' : 'var(--djmp-border)'}`,
                      boxShadow: selectedRequest === request.id ? '0 0 0 1px var(--accent-500)' : 'none'
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-sm" style={{ color: 'var(--djmp-text)' }}>{request.request_code}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                        </div>
                        <p className="text-xs font-semibold" style={{ color: 'var(--djmp-text-muted)' }}>
                          {request.resident} • Unit {request.unit}
                        </p>
                      </div>
                      {request.priority === 'high' && (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    
                    <div className="p-3 rounded-xl mb-3 space-y-1" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
                      <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--accent-500)' }}>{request.category}</p>
                      <p className="text-sm line-clamp-2" style={{ color: 'var(--djmp-text)' }}>{request.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--djmp-text-muted)' }}>
                      <MapPin className="w-3.5 h-3.5" />
                      {request.location}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Available Technicians */}
          <div className="glass-card overflow-hidden border-none shadow-2xl" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
            <div className="p-6 border-b space-y-4" style={{ borderColor: 'var(--djmp-border)', background: 'var(--djmp-surface-2)' }}>
              <h2 className="text-xl font-bold uppercase tracking-tight" style={{ color: 'var(--djmp-text)' }}>Available Technicians</h2>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors group-focus-within:text-white" style={{ color: 'var(--djmp-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by name or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-3 rounded-xl border transition-all outline-none text-sm font-medium"
                  style={{ 
                    background: 'var(--djmp-input-bg)', 
                    borderColor: 'var(--djmp-input-border)',
                    color: 'var(--djmp-text)'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-500)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--djmp-input-border)'}
                />
              </div>
            </div>
            
            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
              {filteredTechnicians.map((tech) => (
                <div
                  key={tech.id}
                  onClick={() => setSelectedTechnician(tech.id)}
                  className="group p-5 rounded-xl border border-transparent transition-all cursor-pointer hover:scale-[1.01]"
                  style={{ 
                    background: selectedTechnician === tech.id ? 'var(--djmp-surface)' : 'var(--djmp-surface-2)', 
                    border: `1px solid ${selectedTechnician === tech.id ? 'var(--accent-500)' : 'var(--djmp-border)'}`,
                    boxShadow: selectedTechnician === tech.id ? '0 0 0 1px var(--accent-500)' : 'none'
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shadow-lg" style={{ background: 'var(--accent-gradient)', color: 'white' }}>
                      {tech.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold truncate" style={{ color: 'var(--djmp-text)' }}>{tech.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getAvailabilityColor(tech.active_tasks)}`}>
                          {tech.active_tasks < 4 ? 'Available' : 'Busy'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--djmp-text-muted)' }}>{tech.specialty}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl text-center" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--djmp-text-muted)' }}>Active Tasks</p>
                      <p className="text-lg font-black" style={{ color: 'var(--djmp-text)' }}>{tech.active_tasks}</p>
                    </div>
                    <div className="p-3 rounded-xl text-center" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--djmp-text-muted)' }}>Completed</p>
                      <p className="text-lg font-black" style={{ color: 'var(--djmp-text)' }}>{tech.completed_tasks}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Assignment Panel */}
      {(selectedRequest || selectedTechnician) && (
        <div className="fixed bottom-0 left-0 right-0 p-6 z-40 fade-in-up">
          <div className="max-w-7xl mx-auto glass-card shadow-2xl p-6 border-none" style={{ background: 'var(--djmp-nav-bg)', borderTop: '1px solid var(--djmp-border)' }}>
            <div className="flex flex-col md:flex-row items-end gap-6">
              <div className="flex-1 grid sm:grid-cols-3 gap-4 w-full">
                <div className="p-4 rounded-xl" style={{ background: 'var(--djmp-surface-2)', border: '1px solid var(--djmp-border)' }}>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--djmp-text-muted)' }}>Selected Request</p>
                  <p className="font-bold text-sm" style={{ color: 'var(--djmp-text)' }}>
                    {selectedRequest ? pendingRequests.find(r => r.id === selectedRequest)?.request_code || selectedRequest : 'None'}
                  </p>
                </div>
                
                <div className="p-4 rounded-xl" style={{ background: 'var(--djmp-surface-2)', border: '1px solid var(--djmp-border)' }}>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--djmp-text-muted)' }}>Selected Technician</p>
                  <p className="font-bold text-sm" style={{ color: 'var(--djmp-text)' }}>
                    {selectedTechnician ? technicians.find(t => t.id === selectedTechnician)?.name || 'None' : 'None'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--djmp-text-muted)' }}>Schedule Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl outline-none text-sm font-medium transition-all"
                    style={{ background: 'var(--djmp-input-bg)', border: '1px solid var(--djmp-input-border)', color: 'var(--djmp-text)' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-500)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--djmp-input-border)'}
                  />
                </div>
                
              </div>
              
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setSelectedTechnician(null);
                    setScheduledDate('');
                  }}
                  className="px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                  style={{ background: 'var(--djmp-surface-2)', border: '1px solid var(--djmp-border)', color: 'var(--djmp-text)' }}
                >
                  Clear
                </button>
                <button
                  onClick={handleAssign}
                  disabled={!selectedRequest || !selectedTechnician || !scheduledDate || assigning}
                  className="px-8 py-4 rounded-xl text-white text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: 'var(--accent-gradient)' }}
                >
                  <UserCheck className="w-5 h-5" />
                  {assigning ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

