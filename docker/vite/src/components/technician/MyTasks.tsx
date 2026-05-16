import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Calendar, Timer, MapPin, ChevronRight, ClipboardList, AlertCircle } from 'lucide-react';
import StatusBadge, { Status } from '../shared/StatusBadge';
import api from '../../utils/api';

function formatScheduledDate(value?: string | null, opts?: Intl.DateTimeFormatOptions): string {
  if (!value) return '-';
  const [datePart] = value.split('T');
  const parts = datePart.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return value;
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', opts || { month: 'short', day: 'numeric' });
}

function formatScheduledTime(value?: string | null): string {
  if (!value) return '-';
  const match = value.match(/^(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : value;
}

interface TaskItem {
  id: string | number;
  request_code?: string;
  resident?: string;
  unit?: string;
  category: string;
  description: string;
  priority: string;
  status: Status;
  scheduled_date?: string;
  scheduled_time?: string;
  deadline?: string | null;
  location?: string;
  specialty_required?: string;
}

function DeadlineCountdown({ deadline }: { deadline: string }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - now.getTime();
  const isOverdue = diff < 0;
  const absDiff = Math.abs(diff);

  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absDiff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((absDiff / (1000 * 60)) % 60);

  if (isOverdue) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full text-[10px] font-bold border border-red-500/20">
        <Timer className="w-3 h-3" />
        OVERDUE: +{days > 0 ? `${days}d ` : ''}{hours}h {minutes}m
      </span>
    );
  }

  const urgencyColor = days < 1 ? 'text-red-400 bg-red-500/10 border-red-500/20' : days < 3 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${urgencyColor} rounded-full text-[10px] font-bold border`}>
      <Timer className="w-3 h-3" />
      {days > 0 ? `${days}d ` : ''}{hours}h {minutes}m left
    </span>
  );
}

export default function MyTasks() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [startingTaskId, setStartingTaskId] = useState<string | number | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const response = await api.get('/tasks/my/');
        setTasks(Array.isArray(response.data) ? response.data : []);
      } catch (error: any) {
        console.error('Error fetching tasks:', error);
        setErrorMessage(error?.response?.data?.error || 'ไม่สามารถโหลดงานที่ได้รับมอบหมายได้');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleStartTask = async (e: React.MouseEvent, taskId: string | number) => {
    e.stopPropagation();
    if (startingTaskId !== null) return;
    setStartingTaskId(taskId);
    try {
      const response = await api.patch(`/tasks/${taskId}/`, { status: 'in-progress' });
      const updatedStatus = (response.data?.task?.status || 'in-progress') as Status;
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: updatedStatus } : t))
      );
    } catch (error: any) {
      console.error('Error starting task:', error);
      alert(error?.response?.data?.error || 'ไม่สามารถเริ่มงานได้');
    } finally {
      setStartingTaskId(null);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          String(task.request_code || task.id).toLowerCase().includes(search) ||
          (task.resident || '').toLowerCase().includes(search) ||
          (task.description || '').toLowerCase().includes(search);
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      });
  }, [tasks, filterStatus, searchTerm]);

  const statusCounts = {
    all: tasks.length,
    assigned: tasks.filter((t) => t.status === 'assigned').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
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
    <div className="max-w-7xl mx-auto p-6 space-y-6 fade-in-up">
      <button
        onClick={() => navigate('/technician')}
        className="flex items-center gap-2 group transition-colors"
        style={{ color: 'var(--djmp-text-muted)' }}
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-semibold uppercase tracking-widest">Back to Dashboard</span>
      </button>

      <div className="glass-card overflow-hidden border-none shadow-2xl" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
        <div className="p-8 relative overflow-hidden" style={{ background: 'var(--accent-gradient)' }}>
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <ClipboardList className="w-32 h-32 text-white" />
           </div>
           <div className="relative z-10">
              <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">My Tasks</h1>
              <p className="text-white/80 font-medium">Manage and update your assigned maintenance tasks</p>
           </div>
        </div>

        <div className="border-b px-8" style={{ borderColor: 'var(--djmp-border)', background: 'var(--djmp-surface-2)' }}>
          <div className="flex gap-8 overflow-x-auto custom-scrollbar no-scrollbar">
            {[
              { key: 'all', label: 'All Tasks' },
              { key: 'assigned', label: 'Assigned' },
              { key: 'in-progress', label: 'In Progress' },
              { key: 'completed', label: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`py-5 font-bold text-xs uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${
                  filterStatus === tab.key
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 px-2 py-0.5 rounded-md text-[10px]" style={{ background: filterStatus === tab.key ? 'var(--accent-gradient)' : 'var(--djmp-border)', color: 'white' }}>
                  {statusCounts[tab.key as keyof typeof statusCounts]}
                </span>
                {filterStatus === tab.key && (
                   <div className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full shadow-[0_-4px_12px_var(--accent-glow)]" style={{ background: 'var(--accent-gradient)' }} />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-b" style={{ borderColor: 'var(--djmp-border)' }}>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors group-focus-within:text-white" style={{ color: 'var(--djmp-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by ID, resident, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-xl border transition-all outline-none text-sm font-medium"
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

        {errorMessage && (
          <div className="px-8 py-4 bg-red-500/10 border-b border-red-500/20 text-red-400 text-sm font-bold flex items-center gap-2">
             <AlertCircle className="w-4 h-4" />
             {errorMessage}
          </div>
        )}

        <div className="p-6 grid md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full py-20 flex flex-col items-center gap-4">
               <div className="w-10 h-10 border-4 border-t-transparent animate-spin rounded-full" style={{ borderColor: 'var(--accent-500) transparent transparent transparent' }}></div>
               <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--djmp-text-muted)' }}>Loading Workspace...</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => navigate(`/technician/tasks/${task.id}`)}
                className="group p-6 rounded-2xl border border-transparent transition-all cursor-pointer hover:scale-[1.01] flex flex-col justify-between"
                style={{ background: 'var(--djmp-surface-2)', border: '1px solid var(--djmp-border)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-500)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--djmp-border)'}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm" style={{ color: 'var(--djmp-text)' }}>{task.request_code || task.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <StatusBadge status={task.status} size="sm" />
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center opacity-20 group-hover:opacity-100 transition-opacity" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)', color: 'var(--accent-500)' }}>
                       <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="font-bold text-sm" style={{ color: 'var(--djmp-text)' }}>{task.resident || '-'}</p>
                    <p className="text-xs font-semibold" style={{ color: 'var(--djmp-text-muted)' }}>Unit {task.unit || '-'}</p>
                  </div>

                  <div className="p-4 rounded-xl space-y-2" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
                    <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--accent-500)' }}>{task.category}</p>
                    <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: 'var(--djmp-text)' }}>{task.description}</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: 'var(--djmp-border)' }}>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--djmp-text-muted)' }}>
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatScheduledDate(task.scheduled_date)}</span>
                      <span className="opacity-30">•</span>
                      <span>{formatScheduledTime(task.scheduled_time)}</span>
                    </div>
                    {task.location && (
                       <div className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--djmp-text-muted)' }}>
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{task.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {task.deadline && task.status !== 'completed' && (
                      <DeadlineCountdown deadline={task.deadline} />
                    )}

                    {task.status === 'assigned' && (
                      <button
                        onClick={(e) => handleStartTask(e, task.id)}
                        disabled={startingTaskId === task.id}
                        className="px-4 py-2 rounded-lg text-white text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ background: 'var(--accent-gradient)' }}
                      >
                        {startingTaskId === task.id ? 'Starting...' : 'Start Task'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!loading && filteredTasks.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-500/10 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-10 h-10 opacity-20" style={{ color: 'var(--djmp-text)' }} />
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: 'var(--djmp-text)' }}>No tasks found</p>
              <p className="text-sm" style={{ color: 'var(--djmp-text-muted)' }}>Try adjusting your search or filter</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}