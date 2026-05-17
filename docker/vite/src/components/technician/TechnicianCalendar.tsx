import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown, CheckCircle2, ClipboardList, Timer, AlertCircle, XCircle } from 'lucide-react';
import api from '../../utils/api';

interface TaskItem {
  id: string | number;
  request_code?: string;
  resident?: string;
  unit?: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  scheduled_date?: string;
  scheduled_time?: string;
  deadline?: string | null;
  location?: string;
  approved_completion?: string;
}

const statusConfig: Record<string, { label: string, color: string, bg: string, border: string, icon: any }> = {
  'in-progress': { label: 'กำลังทำ', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', icon: Timer },
  'assigned': { label: 'ยังไม่ได้เริ่มงาน', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)', icon: ClipboardList },
  'pending_approval': { label: 'รออนุมัติ', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)', icon: AlertCircle },
  'completed': { label: 'อนุมัติแล้ว', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', icon: CheckCircle2 },
  'canceled': { label: 'ยกเลิก', color: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)', icon: XCircle },
};

function getTaskStatus(task: TaskItem): string {
  if (task.status === 'completed') {
    if (task.approved_completion === 'pending_approval') return 'pending_approval';
    return 'completed';
  }
  if (task.status === 'canceled') return 'canceled';
  if (task.status === 'in-progress') return 'in-progress';
  return 'assigned';
}

function formatTime(timeStr?: string) {
  if (!timeStr) return '';
  const match = timeStr.match(/^(\d{2}):(\d{2})/);
  if (!match) return timeStr;
  let h = parseInt(match[1]);
  const m = match[2];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
}

export default function TechnicianCalendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'Month' | 'Week'>('Month');
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
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

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const result = [];
    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      result.push({ date: new Date(year, month - 1, prevMonthDays - i), isCurrentMonth: false });
    }
    // Current month
    for (let i = 1; i <= days; i++) {
      result.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    // Next month padding
    const remainingDays = 42 - result.length;
    for (let i = 1; i <= remainingDays; i++) {
      result.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return result;
  }, [currentDate]);

  const daysInWeek = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day; // adjust when day is sunday
    const sunday = new Date(d.setDate(diff));
    
    const result = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(sunday);
      nextDay.setDate(sunday.getDate() + i);
      result.push({ date: nextDay, isCurrentMonth: nextDay.getMonth() === currentDate.getMonth() });
    }
    return result;
  }, [currentDate]);

  const daysToRender = viewMode === 'Week' ? daysInWeek : daysInMonth;

  const tasksByDate = useMemo(() => {
    const map = new Map<string, TaskItem[]>();
    tasks.forEach(task => {
      if (!task.scheduled_date) return;
      const dateStr = task.scheduled_date; // YYYY-MM-DD
      if (!map.has(dateStr)) map.set(dateStr, []);
      map.get(dateStr)!.push(task);
    });
    return map;
  }, [tasks]);

  const handlePrev = () => {
    if (viewMode === 'Week') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7));
    } else {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'Week') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7));
    } else {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const formatLocalDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const selectedDateStr = formatLocalDate(selectedDate);
  const selectedDateTasks = tasksByDate.get(selectedDateStr) || [];

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6 fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2 tracking-tight" style={{ color: 'var(--djmp-text)' }}>Calendar</h1>
        <p className="font-medium" style={{ color: 'var(--djmp-text-muted)' }}>View your tasks and schedule</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Calendar */}
        <div className="lg:col-span-8 glass-card border-none shadow-2xl overflow-hidden" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
          {/* Header */}
          <div className="p-6 border-b flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--djmp-border)' }}>
            <div className="flex items-center gap-4">
              <button onClick={handleToday} className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors" style={{ background: 'var(--djmp-surface-2)', color: 'var(--djmp-text)', border: '1px solid var(--djmp-border)' }}>
                Today
              </button>
              <div className="flex items-center gap-1">
                <button onClick={handlePrev} className="p-2 rounded-lg transition-colors" style={{ border: '1px solid var(--djmp-border)', background: 'var(--djmp-surface-2)' }}>
                  <ChevronLeft className="w-4 h-4" style={{ color: 'var(--djmp-text)' }} />
                </button>
                <button onClick={handleNext} className="p-2 rounded-lg transition-colors" style={{ border: '1px solid var(--djmp-border)', background: 'var(--djmp-surface-2)' }}>
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--djmp-text)' }} />
                </button>
              </div>
              <div className="relative flex items-center">
                <button 
                  onClick={() => {
                    setPickerYear(currentDate.getFullYear());
                    setShowMonthPicker(!showMonthPicker);
                  }}
                  className="text-lg font-bold flex items-center gap-2 hover:opacity-80 transition-opacity" 
                  style={{ color: 'var(--djmp-text)' }}
                >
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  <ChevronDown className={`w-4 h-4 opacity-50 transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} />
                </button>
                
                {showMonthPicker && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMonthPicker(false)} />
                    <div className="absolute top-full left-0 mt-2 p-4 rounded-2xl shadow-2xl z-50 min-w-[280px] fade-in-up" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)', backdropFilter: 'blur(20px)' }}>
                      <div className="flex items-center justify-between mb-4">
                        <button onClick={() => setPickerYear(y => y - 1)} className="p-1.5 rounded-lg transition-colors" style={{ background: 'var(--djmp-surface-2)', border: '1px solid var(--djmp-border)' }}>
                          <ChevronLeft className="w-4 h-4" style={{ color: 'var(--djmp-text)' }}/>
                        </button>
                        <span className="font-black text-lg" style={{ color: 'var(--djmp-text)' }}>{pickerYear}</span>
                        <button onClick={() => setPickerYear(y => y + 1)} className="p-1.5 rounded-lg transition-colors" style={{ background: 'var(--djmp-surface-2)', border: '1px solid var(--djmp-border)' }}>
                          <ChevronRight className="w-4 h-4" style={{ color: 'var(--djmp-text)' }}/>
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => {
                          const isSelected = currentDate.getMonth() === i && currentDate.getFullYear() === pickerYear;
                          return (
                            <button 
                              key={m}
                              onClick={() => {
                                setCurrentDate(new Date(pickerYear, i, 1));
                                setShowMonthPicker(false);
                              }}
                              className={`py-2 text-xs font-bold rounded-xl transition-all ${isSelected ? 'text-white shadow-lg' : 'hover:opacity-80'}`}
                              style={{
                                background: isSelected ? 'var(--accent-gradient)' : 'var(--djmp-surface-2)',
                                color: isSelected ? 'white' : 'var(--djmp-text)',
                                border: `1px solid ${isSelected ? 'transparent' : 'var(--djmp-border)'}`
                              }}
                            >
                              {m}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center rounded-lg p-1" style={{ border: '1px solid var(--djmp-border)', background: 'var(--djmp-surface-2)' }}>
              {(['Month', 'Week'] as const).map(view => (
                <button 
                  key={view} 
                  onClick={() => setViewMode(view)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === view ? 'text-white' : ''}`} 
                  style={viewMode === view ? { background: 'var(--accent-gradient)' } : { color: 'var(--djmp-text-muted)' }}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            <div className="grid grid-cols-7 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-semibold" style={{ color: 'var(--djmp-text-muted)' }}>{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 border-t border-l" style={{ borderColor: 'var(--djmp-border)' }}>
              {daysToRender.map((dayObj, i) => {
                const dateStr = formatLocalDate(dayObj.date);
                const dayTasks = tasksByDate.get(dateStr) || [];
                const isSelected = selectedDateStr === dateStr;
                const isToday = formatLocalDate(new Date()) === dateStr;

                // Find the most prominent status for border color
                let primaryColor = 'transparent';
                if (dayTasks.length > 0) {
                  const statuses = dayTasks.map(t => getTaskStatus(t));
                  if (statuses.includes('in-progress')) primaryColor = statusConfig['in-progress'].border;
                  else if (statuses.includes('pending_approval')) primaryColor = statusConfig['pending_approval'].border;
                  else if (statuses.includes('assigned')) primaryColor = statusConfig['assigned'].border;
                  else if (statuses.includes('completed')) primaryColor = statusConfig['completed'].border;
                  else primaryColor = statusConfig['canceled'].border;
                }

                return (
                  <div 
                    key={i} 
                    onClick={() => setSelectedDate(dayObj.date)}
                    className="min-h-[100px] p-2 border-r border-b cursor-pointer transition-colors relative flex flex-col items-center"
                    style={{ 
                      borderColor: 'var(--djmp-border)',
                      background: isSelected ? 'var(--djmp-surface-2)' : 'transparent',
                      opacity: dayObj.isCurrentMonth ? 1 : 0.3
                    }}
                  >
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold mb-2 transition-all ${isSelected ? 'text-white' : ''}`} style={isSelected ? { background: 'var(--accent-gradient)' } : { color: isToday ? 'var(--accent-500)' : 'var(--djmp-text)' }}>
                      {dayObj.date.getDate()}
                    </div>
                    {isSelected && dayTasks.length > 0 && (
                      <div className="absolute top-[40px] w-1 h-1 rounded-full shadow-md" style={{ background: 'var(--accent-500)' }} />
                    )}
                    <div className="w-full flex flex-col gap-1 mt-1 overflow-hidden">
                      {dayTasks.slice(0, 3).map((task, idx) => {
                        const sConf = statusConfig[getTaskStatus(task)];
                        return (
                          <div 
                            key={idx} 
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold truncate w-full" 
                            style={{ borderLeft: `2px solid ${sConf.color}`, background: sConf.bg, color: 'var(--djmp-text)' }}
                            title={task.description || task.category}
                          >
                            {task.description || task.category}
                          </div>
                        );
                      })}
                      {dayTasks.length > 3 && (
                        <div className="text-[9px] font-bold text-center mt-0.5" style={{ color: 'var(--djmp-text-muted)' }}>
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="p-4 border-t flex flex-wrap items-center justify-center gap-6" style={{ borderColor: 'var(--djmp-border)', background: 'var(--djmp-surface-2)' }}>
            {Object.entries(statusConfig).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: config.color }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--djmp-text-muted)' }}>{config.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Task List */}
        <div className="lg:col-span-4 glass-card border-none shadow-2xl flex flex-col" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)', maxHeight: '800px' }}>
          <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--djmp-border)', background: 'var(--djmp-surface-2)' }}>
            <h2 className="text-xl font-black" style={{ color: 'var(--djmp-text)' }}>All Tasks</h2>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" style={{ background: 'var(--djmp-surface)', color: 'var(--djmp-text-muted)', border: '1px solid var(--djmp-border)' }}>
              {selectedDateTasks.length} Tasks
            </span>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            <h3 className="text-sm font-bold mb-6" style={{ color: 'var(--djmp-text)' }}>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h3>
            
            <div className="space-y-4">
              {selectedDateTasks.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                  <ClipboardList className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--djmp-text-muted)' }} />
                  <p className="text-sm font-medium" style={{ color: 'var(--djmp-text-muted)' }}>No tasks scheduled for this date</p>
                </div>
              ) : (
                selectedDateTasks.map((task, idx) => {
                  const statusKey = getTaskStatus(task);
                  const sConf = statusConfig[statusKey];
                  const Icon = sConf.icon;
                  
                  return (
                    <div key={task.id || idx} className="p-4 rounded-xl flex gap-4 transition-transform hover:scale-[1.02] cursor-pointer" style={{ background: 'var(--djmp-surface-2)', border: '1px solid var(--djmp-border)' }} onClick={() => navigate(`/technician/tasks/${task.id}`)}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: sConf.color, color: 'white' }}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-bold text-sm truncate" style={{ color: 'var(--djmp-text)' }}>{task.description || task.category}</h4>
                          <span className="text-[10px] font-bold text-blue-400 flex-shrink-0 whitespace-nowrap">{formatTime(task.scheduled_time)}</span>
                        </div>
                        <p className="text-xs mb-3 truncate" style={{ color: 'var(--djmp-text-muted)' }}>
                          {task.location || (task.resident ? `${task.resident} - Unit ${task.unit}` : 'No location specified')}
                        </p>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ color: sConf.color, border: `1px solid ${sConf.border}` }}>
                          {sConf.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          <div className="p-4 border-t text-center" style={{ borderColor: 'var(--djmp-border)' }}>
            <button onClick={() => navigate('/technician/tasks')} className="text-xs font-bold text-blue-400 hover:text-white transition-colors">
              View All Tasks &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
