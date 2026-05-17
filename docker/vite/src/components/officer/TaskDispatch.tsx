import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, UserCheck, AlertCircle, Search, ClipboardList,
  MapPin, Calendar, Clock, AlertTriangle, XCircle, User,
} from 'lucide-react';
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
  deadline: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  images?: string[];
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

interface AssignedRequest {
  id: number;
  request_code: string;
  resident: string;
  unit: string;
  category: string;
  priority: string;
  technician: string;
  technician_id: number | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  deadline: string | null;
}

export default function TaskDispatch() {
  const navigate = useNavigate();

  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Config form
  const [newPriority, setNewPriority] = useState('medium');
  const [newDeadline, setNewDeadline] = useState('');
  const [newScheduledDate, setNewScheduledDate] = useState('');
  const [newScheduledTime, setNewScheduledTime] = useState('');

  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [assignedRequests, setAssignedRequests] = useState<AssignedRequest[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [unassigning, setUnassigning] = useState<number | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const location = useLocation();
  // Capture the target request ID immediately (before any state clears it)
  const autoSelectIdRef = useRef<number | null>(
    location.state?.selectRequestId ?? null
  );

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, techRes] = await Promise.all([
        api.get('/maintenance-requests/'),
        api.get('/technicians/'),
      ]);
    const all = Array.isArray(reqRes.data) ? reqRes.data : [];
      const pending = all.filter((r: any) => r.status === 'pending');
      setPendingRequests(pending);
      setAssignedRequests(all.filter((r: any) => r.status === 'assigned'));
      setTechnicians(Array.isArray(techRes.data) ? techRes.data : []);

      // Auto-select if navigated from Manage Requests
      if (autoSelectIdRef.current !== null) {
        const target = pending.find((r: any) => r.id === autoSelectIdRef.current);
        if (target) {
          setSelectedRequest(target.id);
          setNewPriority(target.priority || 'medium');
          setNewDeadline(target.deadline ? target.deadline.split('T')[0] : '');
          setNewScheduledDate(target.scheduled_date || '');
          setNewScheduledTime(target.scheduled_time ? target.scheduled_time.substring(0, 5) : '');
          setSelectedTechnician(null);
          setShowConfigModal(true);
        }
        autoSelectIdRef.current = null;
        window.history.replaceState({}, '');
      }
    } catch (e) {
      console.error('Error fetching dispatch data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRequest = (req: PendingRequest) => {
    setSelectedRequest(req.id);
    setNewPriority(req.priority || 'medium');
    setNewDeadline(req.deadline ? req.deadline.split('T')[0] : '');
    setNewScheduledDate(req.scheduled_date || '');
    setNewScheduledTime(req.scheduled_time ? req.scheduled_time.substring(0, 5) : '');
    setSelectedTechnician(null);
  };

  const handleDeadlineChange = (value: string) => {
    setNewDeadline(value);
    if (value) {
      setNewScheduledDate(value);
      if (!newScheduledTime) setNewScheduledTime('09:00');
    }
  };

  const handleAssign = async () => {
    if (!selectedRequest || !selectedTechnician) return;
    setAssigning(true);
    try {
      const updates: Record<string, any> = {
        technician_id: selectedTechnician,
        status: 'assigned',
        priority: newPriority,
      };
      if (newDeadline) updates.deadline = `${newDeadline}T23:59:59`;
      if (newScheduledDate) updates.scheduled_date = newScheduledDate;
      if (newScheduledTime) updates.scheduled_time = newScheduledTime;

      await api.patch(`/maintenance-requests/${selectedRequest}/manage/`, updates);

      setPendingRequests(prev => prev.filter(r => r.id !== selectedRequest));
      setSelectedRequest(null);
      setSelectedTechnician(null);
      setNewPriority('medium');
      setNewDeadline('');
      setNewScheduledDate('');
      setNewScheduledTime('');
      alert('Task assigned successfully!');
      fetchData();
    } catch (error: any) {
      alert(error?.response?.data?.error || 'Failed to assign task');
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async (reqId: number) => {
    if (!window.confirm('ยืนยันการยกเลิกมอบหมายงาน? งานจะกลับสู่สถานะ Pending')) return;
    setUnassigning(reqId);
    try {
      await api.patch(`/maintenance-requests/${reqId}/manage/`, { status: 'pending' });
      await fetchData();
    } catch (error: any) {
      alert(error?.response?.data?.error || 'Failed to unassign task');
    } finally {
      setUnassigning(null);
    }
  };

  const getAvailColor = (n: number) =>
    n < 4 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20';

  const getPriColor = (p: string) => {
    if (p === 'high') return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (p === 'medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  };

  const priActiveStyle = (p: string, active: boolean) => {
    const colors: Record<string, [string, string]> = {
      high: ['rgba(239,68,68,0.1)', '#ef4444'],
      medium: ['rgba(234,179,8,0.1)', '#eab308'],
      low: ['rgba(59,130,246,0.1)', '#3b82f6'],
    };
    const [bg, text] = colors[p] || ['transparent', 'var(--djmp-text)'];
    return {
      background: active ? bg : 'var(--djmp-input-bg)',
      borderColor: active ? text : 'var(--djmp-border)',
      color: active ? text : 'var(--djmp-text)',
    };
  };

  const selReq = pendingRequests.find(r => r.id === selectedRequest);
  const selTech = technicians.find(t => t.id === selectedTechnician);
  const filteredTechs = technicians.filter(t => {
    const s = searchTerm.toLowerCase();
    return !s || t.name.toLowerCase().includes(s) || t.specialty.toLowerCase().includes(s);
  });


  // Open modal when a request is selected
  const openConfig = (req: PendingRequest) => {
    handleSelectRequest(req);
    setShowConfigModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 pb-20 fade-in-up transition-all">
      <button onClick={() => navigate('/officer')} className="flex items-center gap-2 group mb-6" style={{ color: 'var(--djmp-text-muted)' }}>
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-semibold uppercase tracking-widest">Back to Dashboard</span>
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-1" style={{ color: 'var(--djmp-text)' }}>Task Dispatch</h1>
        <p className="text-sm font-medium" style={{ color: 'var(--djmp-text-muted)' }}>เลือก Request → กำหนดค่าและเลือกช่าง → Assign</p>
      </div>

      {loading ? (
        <div className="glass-card p-20 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-t-transparent animate-spin rounded-full" style={{ borderColor: 'var(--accent-500) transparent transparent transparent' }} />
          <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--djmp-text-muted)' }}>Loading...</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* COL 1: Pending */}
          <div className="glass-card overflow-hidden" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--djmp-border)', background: 'var(--djmp-surface-2)' }}>
              <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--djmp-text)' }}>Pending</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase" style={{ background: 'var(--accent-100)', color: 'var(--accent-700)' }}>{pendingRequests.length} Tasks</span>
            </div>
            <div className="p-4 space-y-3 max-h-[680px] overflow-y-auto custom-scrollbar">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <ClipboardList className="w-10 h-10 mx-auto opacity-20" style={{ color: 'var(--djmp-text)' }} />
                  <p className="text-sm" style={{ color: 'var(--djmp-text-muted)' }}>No pending requests</p>
                </div>
              ) : pendingRequests.map(req => (
                <div
                  key={req.id}
                  onClick={() => handleSelectRequest(req)}
                  className="p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                  style={{
                    background: selectedRequest === req.id ? 'var(--djmp-surface)' : 'var(--djmp-surface-2)',
                    border: `1px solid ${selectedRequest === req.id ? 'var(--accent-500)' : 'var(--djmp-border)'}`,
                    boxShadow: selectedRequest === req.id ? '0 0 0 1px var(--accent-500)' : 'none',
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-sm" style={{ color: 'var(--djmp-text)' }}>{req.request_code}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${getPriColor(req.priority)}`}>{req.priority}</span>
                      </div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--djmp-text-muted)' }}>{req.resident} • Unit {req.unit}</p>
                    </div>
                    {req.priority === 'high' && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                  </div>
                  <div className="p-2 rounded-lg mb-2" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: 'var(--accent-500)' }}>{req.category}</p>
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--djmp-text)' }}>{req.description}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--djmp-text-muted)' }}>
                      <MapPin className="w-3 h-3" />{req.location}
                    </div>
                    {selectedRequest === req.id && (
                      <button
                        onClick={e => { e.stopPropagation(); setShowConfigModal(true); }}
                        className="px-3 py-1 rounded-lg text-[10px] font-black uppercase text-white"
                        style={{ background: 'var(--accent-gradient)' }}
                      >⚙️ Set Config</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COL 2+3: Config hint + Technicians */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Config hint */}
            <div className="glass-card p-4 flex items-center justify-between" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
              {selReq ? (
                <>
                  <div>
                    <p className="font-bold text-sm" style={{ color: 'var(--djmp-text)' }}>⚙️ {selReq.request_code} — {selReq.category}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--djmp-text-muted)' }}>
                      Priority: <span className="capitalize font-bold">{newPriority}</span>
                      {newDeadline && <> · Deadline: {newDeadline}</>}
                      {newScheduledDate && <> · Sched: {newScheduledDate}</>}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowConfigModal(true)}
                    className="px-4 py-2 rounded-lg text-xs font-black uppercase text-white"
                    style={{ background: 'var(--accent-gradient)' }}
                  >Edit Config</button>
                </>
              ) : (
                <div className="flex items-center">
                  <ClipboardList className="w-8 h-8 opacity-20 flex-shrink-0" style={{ color: 'var(--djmp-text)' }} />
                  <div className="ml-4">
                    <p className="font-bold text-sm" style={{ color: 'var(--djmp-text)' }}>เลือก Request เพื่อกำหนดค่า</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--djmp-text-muted)' }}>เลือกจากรายการทางซ้าย เพื่อตั้ง Priority, Deadline และวันนัดหมาย</p>
                  </div>
                </div>
              )}
            </div>

            {/* Technicians */}
            <div className="glass-card overflow-hidden flex-1" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
              <div className="p-4 border-b space-y-3" style={{ borderColor: 'var(--djmp-border)', background: 'var(--djmp-surface-2)' }}>
                <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--djmp-text)' }}>Available Technicians</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--djmp-text-muted)' }} />
                  <input type="text" placeholder="Search by name or specialty..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none text-sm font-medium"
                    style={{ background: 'var(--djmp-input-bg)', borderColor: 'var(--djmp-input-border)', color: 'var(--djmp-text)' }} />
                </div>
              </div>
              <div className="p-4 grid sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto custom-scrollbar">
                {filteredTechs.map(tech => (
                  <div key={tech.id} onClick={() => setSelectedTechnician(tech.id)}
                    className="p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                    style={{
                      background: selectedTechnician === tech.id ? 'var(--djmp-surface)' : 'var(--djmp-surface-2)',
                      border: `1px solid ${selectedTechnician === tech.id ? 'var(--accent-500)' : 'var(--djmp-border)'}`,
                      boxShadow: selectedTechnician === tech.id ? '0 0 0 1px var(--accent-500)' : 'none',
                    }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm" style={{ background: 'var(--accent-gradient)', color: 'white' }}>
                        {tech.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-bold text-sm truncate" style={{ color: 'var(--djmp-text)' }}>{tech.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border flex-shrink-0 ${getAvailColor(tech.active_tasks)}`}>{tech.active_tasks < 4 ? 'Free' : 'Busy'}</span>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--djmp-text-muted)' }}>{tech.specialty}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg text-center" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
                        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--djmp-text-muted)' }}>Active</p>
                        <p className="text-base font-black" style={{ color: 'var(--djmp-text)' }}>{tech.active_tasks}</p>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
                        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--djmp-text-muted)' }}>Done</p>
                        <p className="text-base font-black" style={{ color: 'var(--djmp-text)' }}>{tech.completed_tasks}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Action Bar (Moved above Assigned Tasks) ===== */}
      {(selectedRequest || selectedTechnician) && (
        <div className="mt-8 fade-in-up">
          <div className="glass-card p-5 shadow-2xl" style={{ background: 'var(--djmp-nav-bg)', border: '1px solid var(--djmp-border)' }}>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                {[
                  { label: 'Request', val: selReq?.request_code || '—' },
                  { label: 'Technician', val: selTech?.name || '—' },
                  { label: 'Priority', val: newPriority },
                  { label: 'Deadline', val: newDeadline || 'Not set' },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-xl" style={{ background: 'var(--djmp-surface-2)', border: '1px solid var(--djmp-border)' }}>
                    <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: 'var(--djmp-text-muted)' }}>{item.label}</p>
                    <p className="font-bold text-sm truncate capitalize" style={{ color: 'var(--djmp-text)' }}>{item.val}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button onClick={() => { setSelectedRequest(null); setSelectedTechnician(null); }}
                  className="px-5 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-opacity hover:opacity-80"
                  style={{ background: 'var(--djmp-surface-2)', border: '1px solid var(--djmp-border)', color: 'var(--djmp-text)' }}
                >Clear</button>
                <button
                  onClick={handleAssign}
                  disabled={!selectedRequest || !selectedTechnician || !newScheduledDate || !newDeadline || assigning}
                  title={(!newScheduledDate || !newDeadline) ? 'กรุณากำหนด Deadline และ Scheduled Date ก่อน Assign' : ''}
                  className="px-8 py-3.5 rounded-xl text-white text-xs font-black uppercase tracking-widest shadow-xl flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
                  style={{ background: 'var(--accent-gradient)' }}
                >
                  <UserCheck className="w-5 h-5" />
                  {assigning ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </div>
            {(!newScheduledDate || !newDeadline) && (selectedRequest || selectedTechnician) && (
              <p className="mt-3 text-[11px] font-semibold flex items-center gap-1.5" style={{ color: '#f59e0b' }}>
                <span>⚠️</span> กรุณากดปุ่ม Config เพื่อกำหนด {(!newDeadline && !newScheduledDate) ? 'Deadline และ Scheduled Date' : !newDeadline ? 'Deadline' : 'Scheduled Date'} ก่อนกด Assign Task
              </p>
            )}
          </div>
        </div>
      )}

      {/* ===== Assigned Tasks ===== */}
      {!loading && assignedRequests.length > 0 && (
        <div className="mt-8 glass-card overflow-hidden" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--djmp-border)', background: 'var(--djmp-surface-2)' }}>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--djmp-text)' }}>Assigned Tasks</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--djmp-text-muted)' }}>งานที่มอบหมายให้ช่างแล้ว — กด Unassign เพื่อยกเลิกหากส่งผิดคน</p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
              {assignedRequests.length} Tasks
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b" style={{ background: 'var(--djmp-surface-2)', borderColor: 'var(--djmp-border)' }}>
                <tr>
                  {['Request', 'Resident / Unit', 'Category', 'Priority', 'Technician', 'Scheduled', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--djmp-text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ background: 'var(--djmp-surface)' }}>
                {assignedRequests.map(req => {
                  const priStyle = req.priority === 'high'
                    ? { color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }
                    : req.priority === 'medium'
                    ? { color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }
                    : { color: '#3b82f6', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' };
                  return (
                    <tr key={req.id} className="border-b transition-opacity hover:opacity-80" style={{ borderColor: 'var(--djmp-border)' }}>
                      <td className="px-5 py-4 whitespace-nowrap font-bold text-sm" style={{ color: 'var(--djmp-text)' }}>{req.request_code}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-medium text-sm" style={{ color: 'var(--djmp-text)' }}>{req.resident}</p>
                        <p className="text-xs" style={{ color: 'var(--djmp-text-muted)' }}>Unit {req.unit}</p>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--djmp-text)' }}>{req.category}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold capitalize" style={priStyle}>{req.priority}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: 'var(--accent-gradient)', color: 'white' }}>
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-sm" style={{ color: 'var(--djmp-text)' }}>{req.technician || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm" style={{ color: req.scheduled_date ? 'var(--djmp-text)' : 'var(--djmp-text-muted)' }}>
                        {req.scheduled_date ? `${req.scheduled_date}${req.scheduled_time ? ' · ' + req.scheduled_time.substring(0, 5) : ''}` : 'Not set'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleUnassign(req.id)}
                          disabled={unassigning === req.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all hover:opacity-80 disabled:opacity-50"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {unassigning === req.id ? 'Cancelling...' : 'Unassign'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== Task Config Modal ===== */}
      {showConfigModal && selReq && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md"
          onClick={() => setShowConfigModal(false)}
        >
          <div
            className="w-full max-w-2xl glass-card overflow-hidden shadow-2xl rounded-[1.25rem]"
            style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b flex items-start justify-between sticky top-0 z-10" style={{ borderColor: 'var(--djmp-border)', background: 'var(--djmp-surface-2)' }}>
              <div>
                <h2 className="text-base font-black uppercase tracking-widest" style={{ color: 'var(--djmp-text)' }}>
                  ⚙️ Task Config — {selReq.request_code}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--djmp-text-muted)' }}>
                  {selReq.resident} · Unit {selReq.unit} · {selReq.category}
                </p>
                <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--djmp-text)' }}>{selReq.description}</p>
              </div>
              <button onClick={() => setShowConfigModal(false)} className="ml-4 p-1 rounded-lg hover:opacity-70 transition-opacity flex-shrink-0" style={{ color: 'var(--djmp-text-muted)' }}>
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Priority */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--djmp-text-muted)' }}>
                  <AlertTriangle className="w-3 h-3 inline mr-1" />Priority Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'medium', 'high'].map(p => (
                    <button key={p} onClick={() => setNewPriority(p)}
                      className="py-2.5 rounded-lg border-2 capitalize font-bold text-sm transition-all"
                      style={priActiveStyle(p, newPriority === p)}
                    >{p}</button>
                  ))}
                </div>
              </div>
              {/* Deadline + Scheduled */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--djmp-text-muted)' }}>
                    <Clock className="w-3 h-3 inline mr-1" />Deadline
                  </label>
                  <input type="date" value={newDeadline} onChange={e => handleDeadlineChange(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2.5 rounded-lg outline-none text-sm font-medium"
                    style={{ background: 'var(--djmp-input-bg)', border: '1px solid var(--djmp-input-border)', color: 'var(--djmp-text)' }} />
                  <p className="text-[9px] mt-1" style={{ color: 'var(--djmp-text-muted)' }}>Auto-sync วันนัด + เวลา 09:00</p>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--djmp-text-muted)' }}>
                    <Calendar className="w-3 h-3 inline mr-1" />Scheduled Date
                  </label>
                  <input type="date" value={newScheduledDate} onChange={e => setNewScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]} max={newDeadline || undefined}
                    className="w-full px-3 py-2.5 rounded-lg outline-none text-sm font-medium"
                    style={{ background: 'var(--djmp-input-bg)', border: '1px solid var(--djmp-input-border)', color: 'var(--djmp-text)' }} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--djmp-text-muted)' }}>
                    <Clock className="w-3 h-3 inline mr-1" />Scheduled Time
                  </label>
                  <input type="time" value={newScheduledTime} onChange={e => setNewScheduledTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg outline-none text-sm font-medium"
                    style={{ background: 'var(--djmp-input-bg)', border: '1px solid var(--djmp-input-border)', color: 'var(--djmp-text)' }} />
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="p-4 border-t flex gap-3" style={{ borderColor: 'var(--djmp-border)', background: 'var(--djmp-surface-2)' }}>
              <button onClick={() => setShowConfigModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest"
                style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)', color: 'var(--djmp-text)' }}
              >Close</button>
              <button onClick={() => setShowConfigModal(false)}
                className="flex-1 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-widest"
                style={{ background: 'var(--accent-gradient)' }}
              >Save Config</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
