import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import StatusBadge from '../shared/StatusBadge';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Timer,
  ChevronRight,
  Filter,
  BarChart3,
  Bell,
  CheckCircle2
} from 'lucide-react';
import api from '../../utils/api';

interface TaskItem {
  id: number;
  request_code: string;
  resident: string;
  unit: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  deadline: string | null;
  location: string;
  specialty_required: string;
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
      {days > 0 ? `${days}d ` : ''}{hours}h {minutes}m
    </span>
  );
}

export default function TechnicianHome() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await api.get('/tasks/my/');
        setTasks(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const sortedTodayTasks = useMemo(() => {
    const activeTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
    const userSpecialty = (user as any)?.specialty || '';

    return activeTasks.sort((a, b) => {
      const aEmergency = a.priority === 'high' && ['Electrical', 'Plumbing'].includes(a.category);
      const bEmergency = b.priority === 'high' && ['Electrical', 'Plumbing'].includes(b.category);
      if (aEmergency && !bEmergency) return -1;
      if (!aEmergency && bEmergency) return 1;

      if (userSpecialty) {
        const aMatch = a.specialty_required === userSpecialty;
        const bMatch = b.specialty_required === userSpecialty;
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
      }

      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
    });
  }, [tasks, user]);

  const stats = useMemo(() => {
    const activeTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const pendingStart = tasks.filter(t => t.status === 'assigned');
    return [
      { label: 'Active Tasks', value: String(activeTasks.length), icon: ClipboardList, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
      { label: 'Completed', value: String(completedTasks.length), icon: CheckCircle2, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
      { label: 'Pending Start', value: String(pendingStart.length), icon: Clock, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
      { label: 'Total Assigned', value: String(tasks.length), icon: BarChart3, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    ];
  }, [tasks]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Welcome */}
      <div className="fade-in-up">
        <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--djmp-text)' }}>
          Welcome, {user?.name}!
        </h1>
        <p className="text-sm" style={{ color: 'var(--djmp-text-muted)' }}>
          Here's your task overview — sorted by priority and skill match
        </p>
      </div>

      {/* Main Banner */}
      <div 
        onClick={() => navigate('/technician/tasks')}
        className="relative group cursor-pointer overflow-hidden rounded-2xl p-8 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-2xl"
        style={{ background: 'var(--accent-gradient)' }}
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <ClipboardList className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">View All My Tasks</h2>
            <p className="text-white/80">Manage your assigned maintenance tasks and updates</p>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white group-hover:translate-x-2 transition-transform">
            <ChevronRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.label} 
              className="glass-card p-6 border-none fade-in-up" 
              style={{ 
                background: 'var(--djmp-surface)', 
                animationDelay: `${idx * 0.1}s`,
                border: '1px solid var(--djmp-border)'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg"
                  style={{ background: stat.bg, color: stat.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="h-8 w-16 opacity-30">
                  {/* Simplified mini graph placeholder */}
                  <svg viewBox="0 0 100 40" className="w-full h-full">
                    <path 
                      d="M0 35 Q 25 15, 50 25 T 100 10" 
                      fill="none" 
                      stroke={stat.color} 
                      strokeWidth="3" 
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold" style={{ color: 'var(--djmp-text)' }}>
                  {loading ? '-' : stat.value}
                </p>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--djmp-text-muted)' }}>
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Priority Queue */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-card overflow-hidden border-none" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
            <div className="p-6 border-b" style={{ borderColor: 'var(--djmp-border)', background: 'var(--djmp-surface-2)' }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--djmp-text)' }}>Priority Queue</h2>
                  <p className="text-xs mt-1" style={{ color: 'var(--djmp-text-muted)' }}>Tasks sorted by skill match + priority</p>
                </div>
                <div className="flex items-center gap-2">
                   <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'var(--accent-100)', color: 'var(--accent-700)' }}>
                    <ClipboardList className="w-3.5 h-3.5" />
                    {sortedTodayTasks.length} Tasks
                  </div>
                  <button className="p-2 rounded-lg transition-colors" style={{ background: 'var(--djmp-surface-2)', color: 'var(--djmp-text-muted)' }}>
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Priority Filters UI mockup */}
              <div className="flex items-center gap-2 mt-6">
                 <button className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight" style={{ background: 'var(--accent-gradient)', color: 'white' }}>All</button>
                 <button className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border" style={{ borderColor: 'var(--djmp-border)', color: 'var(--djmp-text-muted)' }}>High</button>
                 <button className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border" style={{ borderColor: 'var(--djmp-border)', color: 'var(--djmp-text-muted)' }}>Medium</button>
                 <button className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border" style={{ borderColor: 'var(--djmp-border)', color: 'var(--djmp-text-muted)' }}>Low</button>
              </div>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-8 h-8 border-4 border-t-transparent animate-spin rounded-full" style={{ borderColor: 'var(--accent-500) transparent transparent transparent' }}></div>
                  <p className="text-sm font-medium" style={{ color: 'var(--djmp-text-muted)' }}>Scanning database...</p>
                </div>
              ) : sortedTodayTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--djmp-surface-2)' }}>
                    <CheckCircle2 className="w-8 h-8 opacity-20" style={{ color: 'var(--djmp-text)' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--djmp-text)' }}>No active tasks</h3>
                    <p className="text-sm" style={{ color: 'var(--djmp-text-muted)' }}>You're all caught up! Great job! 🥳</p>
                  </div>
                  <button 
                    onClick={() => navigate('/technician/tasks')}
                    className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
                    style={{ color: 'var(--accent-500)' }}
                  >
                    View History <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {sortedTodayTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => navigate(`/technician/tasks/${task.id}`)}
                      className="group p-5 rounded-xl border border-transparent transition-all cursor-pointer hover:scale-[1.01]"
                      style={{ background: 'var(--djmp-surface-2)', border: '1px solid var(--djmp-border)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-500)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--djmp-border)'}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm" style={{ color: 'var(--djmp-text)' }}>{task.request_code}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <StatusBadge status={task.status as any} size="sm" />
                            {task.deadline && <DeadlineCountdown deadline={task.deadline} />}
                          </div>
                          <p className="text-xs font-medium" style={{ color: 'var(--djmp-text-muted)' }}>
                            <span style={{ color: 'var(--djmp-text)' }}>{task.resident}</span> • Unit {task.unit}
                          </p>
                          <p className="text-sm line-clamp-1" style={{ color: 'var(--djmp-text)' }}>
                            <span className="font-bold" style={{ color: 'var(--accent-500)' }}>{task.category}</span>: {task.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between md:flex-col md:items-end gap-3">
                          <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--djmp-text-muted)' }}>
                            <MapPin className="w-3.5 h-3.5" />
                            {task.location}
                          </div>
                          {task.status === 'assigned' && (
                            <button
                              className="px-4 py-2 rounded-lg text-white text-xs font-bold uppercase tracking-wider shadow-lg transition-transform active:scale-95"
                              style={{ background: 'var(--accent-gradient)' }}
                            >
                              Start Task
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => navigate('/technician/tasks')}
                    className="py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--djmp-text)' }}
                  >
                    View All Tasks <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="lg:col-span-4 space-y-6">
          {/* Performance Card */}
          <div className="glass-card overflow-hidden border-none shadow-2xl" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
             <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-xl" style={{ background: 'var(--accent-gradient)', color: 'white' }}>
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: 'var(--djmp-text)' }}>Summary</h3>
                    <p className="text-xs" style={{ color: 'var(--djmp-text-muted)' }}>Your Performance</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--djmp-text-muted)' }}>Total Tasks</span>
                    <span className="text-2xl font-black" style={{ color: 'var(--djmp-text)' }}>{tasks.length}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--djmp-text-muted)' }}>Completed</span>
                    <span className="text-2xl font-black" style={{ color: 'var(--djmp-text)' }}>{tasks.filter(t => t.status === 'completed').length}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--djmp-text-muted)' }}>Completion Rate</span>
                      <span className="text-2xl font-black" style={{ color: 'var(--accent-500)' }}>
                        {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--djmp-surface-2)' }}>
                      <div 
                        className="h-full transition-all duration-1000" 
                        style={{ 
                          width: `${tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0}%`,
                          background: 'var(--accent-gradient)'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
             </div>
          </div>

          {/* Quick Reminders */}
          <div className="glass-card overflow-hidden border-none" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
             <div className="p-6 space-y-4">
                <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--djmp-text)' }}>
                  <Bell className="w-4 h-4" style={{ color: 'var(--accent-500)' }} />
                  Quick Reminders
                </h3>
                <ul className="space-y-3">
                  {[
                    'Upload before/after photos for all completed tasks',
                    'Log materials used in your job report',
                    'Request deadline extensions early if needed'
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-3 text-xs leading-relaxed" style={{ color: 'var(--djmp-text)' }}>
                      <div className="mt-1 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center border" style={{ borderColor: 'var(--djmp-border)', color: 'var(--accent-500)' }}>
                        <CheckCircle2 className="w-2.5 h-2.5" />
                      </div>
                      {tip}
                    </li>
                  ))}
                </ul>
                <button 
                  className="w-full py-3 mt-4 text-[10px] font-black uppercase tracking-[0.2em] border-t flex items-center justify-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
                  style={{ borderColor: 'var(--djmp-border)', color: 'var(--djmp-text)' }}
                >
                  View All Reminders <ChevronRight className="w-3 h-3" />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
