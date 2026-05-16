import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Upload,
  X,
  CheckCircle,
  Mail,
  Timer,
  Package,
  AlertCircle,
  ClipboardList,
  User,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import api from '../../utils/api';

interface TaskDetailData {
  id: number | string;
  request_code?: string;
  resident?: string;
  resident_phone?: string;
  resident_email?: string;
  unit?: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  deadline?: string | null;
  location?: string;
  images?: string[];
  technician_notes?: string;
  materials_used?: string;
}

function DeadlineTimer({ deadline }: { deadline: string }) {
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
  const seconds = Math.floor((absDiff / 1000) % 60);

  if (isOverdue) {
    return (
      <div className="glass-card overflow-hidden border-none shadow-2xl animate-pulse mb-8" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <div className="flex items-center gap-4 p-6">
          <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/40">
            <Timer className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-red-400 font-black uppercase tracking-[0.2em] text-xs">⚠️ OVERDUE</p>
            <p className="text-red-500 text-3xl font-black font-mono tracking-tighter">
              +{days > 0 ? `${days}d ` : ''}{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const urgencyGradient = days < 1 ? 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)' : days < 3 ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
  const urgencyGlow = days < 1 ? 'rgba(239, 68, 68, 0.3)' : days < 3 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)';

  return (
    <div className="glass-card overflow-hidden border-none shadow-2xl mb-8" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
      <div className="flex items-center gap-4 p-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: urgencyGradient, boxShadow: `0 8px 20px ${urgencyGlow}`, color: 'white' }}>
          <Timer className="w-7 h-7" />
        </div>
        <div>
          <p className="font-bold text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--djmp-text-muted)' }}>Time Remaining</p>
          <p className="text-3xl font-black font-mono tracking-tighter" style={{ color: 'var(--djmp-text)' }}>
            {days > 0 ? `${days}d ` : ''}{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState<TaskDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [taskStatus, setTaskStatus] = useState<string>('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [afterImages, setAfterImages] = useState<File[]>([]);
  const [extensionDays, setExtensionDays] = useState('2');
  const [extensionReason, setExtensionReason] = useState('');
  const [notes, setNotes] = useState('');
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTaskDetail = async () => {
      if (!id) {
        setErrorMessage('ไม่พบรหัสงาน');
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage('');

      try {
        const response = await api.get(`/tasks/${id}/`);
        const data = response.data;
        setTask(data);
        setTaskStatus(data.status || '');
        setNotes(data.technician_notes || '');
        setMaterialsUsed(data.materials_used || '');
      } catch (error: any) {
        console.error('Error fetching task detail:', error);
        setErrorMessage(error?.response?.data?.error || 'ไม่สามารถโหลดรายละเอียดงานได้');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetail();
  }, [id]);

  const residentInitials = useMemo(() => {
    if (!task?.resident) return 'R';
    return task.resident.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  }, [task]);

  const afterImagePreviews = useMemo(
    () => afterImages.map((image) => ({ file: image, url: URL.createObjectURL(image) })),
    [afterImages]
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setAfterImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setAfterImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartTask = async () => {
    if (!task) return;
    setSubmitting(true);
    try {
      const response = await api.patch(`/tasks/${task.id}/`, { status: 'in-progress' });
      const updatedTask = response.data?.task || {};
      const newStatus = updatedTask.status || 'in-progress';
      setTask((prev) => (prev ? { ...prev, ...updatedTask, status: newStatus } : prev));
      setTaskStatus(newStatus);
    } catch (error: any) {
      console.error('Error starting task:', error);
      alert(error?.response?.data?.error || 'ไม่สามารถเริ่มงานได้');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteTask = async () => {
    if (!task) return;
    if (afterImages.length === 0) {
      alert('Please upload at least one after image');
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('status', 'completed');
      payload.append('technician_notes', notes);
      payload.append('materials_used', materialsUsed);

      afterImages.forEach((image) => {
        payload.append('after_images', image);
      });

      const response = await api.patch(`/tasks/${task.id}/`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedTask = response.data?.task || {};
      const newStatus = updatedTask.status || 'completed';

      setShowCompletionModal(false);
      setTask((prev) =>
        prev
          ? {
              ...prev,
              ...updatedTask,
              status: newStatus,
              technician_notes: updatedTask.technician_notes ?? notes,
              materials_used: updatedTask.materials_used ?? materialsUsed,
            }
          : prev
      );
      setTaskStatus(newStatus);

      setTimeout(() => {
        navigate('/technician/tasks');
      }, 1200);
    } catch (error: any) {
      console.error('Error completing task:', error);
      alert(error?.response?.data?.error || 'ไม่สามารถปิดงานได้');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestExtension = async () => {
    if (!task) return;
    if (!extensionReason.trim()) {
      alert('Please provide a reason for the extension');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/tasks/${task.id}/request-extension/`, {
        days: extensionDays,
        reason: extensionReason,
      });
      setShowExtensionModal(false);
      alert('Extension request submitted successfully');
    } catch (error: any) {
      console.error('Error requesting extension:', error);
      alert(error?.response?.data?.error || 'ไม่สามารถส่งคำขอขยายเวลาได้');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="glass-card p-20 flex flex-col items-center gap-4 text-center">
           <div className="w-10 h-10 border-4 border-t-transparent animate-spin rounded-full" style={{ borderColor: 'var(--accent-500) transparent transparent transparent' }}></div>
           <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--djmp-text-muted)' }}>Synchronizing Task Data...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !task) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <button
          onClick={() => navigate('/technician/tasks')}
          className="flex items-center gap-2 group transition-colors"
          style={{ color: 'var(--djmp-text-muted)' }}
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold uppercase tracking-widest">Back to Tasks</span>
        </button>
        <div className="glass-card p-20 text-center">
          <p className="text-red-400 font-bold uppercase tracking-widest">{errorMessage || 'ไม่พบข้อมูลงาน'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 fade-in-up">
      <button
        onClick={() => navigate('/technician/tasks')}
        className="flex items-center gap-2 group transition-colors"
        style={{ color: 'var(--djmp-text-muted)' }}
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-semibold uppercase tracking-widest">Back to Tasks</span>
      </button>

      {/* Deadline Timer */}
      {task.deadline && taskStatus !== 'completed' && (
        <DeadlineTimer deadline={task.deadline} />
      )}

      <div className="glass-card overflow-hidden border-none shadow-2xl" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
        <div className="p-8 relative overflow-hidden" style={{ background: 'var(--accent-gradient)' }}>
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <ClipboardList className="w-32 h-32 text-white" />
           </div>
           <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">{task.request_code || task.id}</h1>
                    <StatusBadge status={taskStatus as any} />
                 </div>
                 <div className="flex flex-wrap gap-4 text-xs font-bold text-white/80 uppercase tracking-widest">
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md">
                      <Calendar className="w-3.5 h-3.5" />
                      {task.scheduled_date
                        ? new Date(task.scheduled_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                        : '-'}
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md">
                      <Clock className="w-3.5 h-3.5" />
                      {task.scheduled_time || '-'}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="p-8 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {/* Task Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase tracking-tight" style={{ color: 'var(--djmp-text)' }}>Job Specifications</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                 <div className="p-5 rounded-2xl space-y-1" style={{ background: 'var(--djmp-surface-2)', border: '1px solid var(--djmp-border)' }}>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--djmp-text-muted)' }}>Category</p>
                    <p className="font-bold text-sm" style={{ color: 'var(--accent-500)' }}>{task.category}</p>
                 </div>
                 <div className="p-5 rounded-2xl space-y-1" style={{ background: 'var(--djmp-surface-2)', border: '1px solid var(--djmp-border)' }}>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--djmp-text-muted)' }}>Priority Level</p>
                    <p className="font-bold text-sm uppercase" style={{ color: 'var(--djmp-text)' }}>{task.priority}</p>
                 </div>
                 <div className="sm:col-span-2 p-5 rounded-2xl flex items-center gap-3" style={{ background: 'var(--djmp-surface-2)', border: '1px solid var(--djmp-border)' }}>
                    <MapPin className="w-5 h-5" style={{ color: 'var(--accent-500)' }} />
                    <span className="font-bold text-sm" style={{ color: 'var(--djmp-text)' }}>{task.location || '-'}</span>
                 </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-widest px-1" style={{ color: 'var(--djmp-text-muted)' }}>Resident Description</h3>
                <div className="p-6 rounded-2xl leading-relaxed text-sm shadow-inner" style={{ background: 'var(--djmp-surface-2)', color: 'var(--djmp-text)' }}>
                  {task.description}
                </div>
              </div>
            </div>

            {/* Before Images */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest px-1" style={{ color: 'var(--djmp-text-muted)' }}>Initial Site Images</h3>
              {task.images && task.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {task.images.map((img, index) => (
                    <div key={index} className="group relative overflow-hidden rounded-2xl border aspect-square" style={{ borderColor: 'var(--djmp-border)' }}>
                      <img
                        src={img.startsWith('http') ? img : `http://127.0.0.1:8000${img}`}
                        alt={`Before ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <span className="text-white text-[10px] font-black uppercase tracking-widest border border-white/40 px-3 py-1 rounded-full backdrop-blur-sm">View Initial</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 rounded-2xl text-center border-2 border-dashed flex flex-col items-center gap-3" style={{ borderColor: 'var(--djmp-border)', color: 'var(--djmp-text-muted)' }}>
                  <ClipboardList className="w-8 h-8 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest">No documentation found</p>
                </div>
              )}
            </div>

            {/* Job Report Fields */}
            {(taskStatus === 'assigned' || taskStatus === 'in-progress') && (
              <div className="space-y-8 pt-8 border-t" style={{ borderColor: 'var(--djmp-border)' }}>
                <h2 className="text-xl font-black uppercase tracking-tight" style={{ color: 'var(--djmp-text)' }}>Execution Report</h2>
                
                {/* After Images */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest px-1" style={{ color: 'var(--djmp-text-muted)' }}>Final Documentation</h3>
                  <div 
                    className="border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer group" 
                    style={{ borderColor: 'var(--djmp-border)' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-500)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--djmp-border)'}
                  >
                    <input
                      type="file"
                      id="after-image-upload"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={submitting}
                    />
                    <label htmlFor="after-image-upload" className="cursor-pointer space-y-4 block">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                        <Upload className="w-8 h-8" style={{ color: 'var(--accent-500)' }} />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--djmp-text)' }}>Upload After Images</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--djmp-text-muted)' }}>Required to authorize task completion</p>
                      </div>
                    </label>
                  </div>

                  {afterImagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {afterImagePreviews.map((image, index) => (
                        <div key={index} className="relative group rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--djmp-border)' }}>
                          <img
                            src={image.url}
                            alt={`After ${index + 1}`}
                            className="w-full aspect-square object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Materials Used */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest px-1 flex items-center gap-2" style={{ color: 'var(--djmp-text-muted)' }}>
                    <Package className="w-3.5 h-3.5" />
                    Bill of Materials
                  </h3>
                  <textarea
                    value={materialsUsed}
                    onChange={(e) => setMaterialsUsed(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl outline-none text-sm font-medium transition-all h-32 leading-relaxed"
                    style={{ background: 'var(--djmp-input-bg)', borderColor: 'var(--djmp-input-border)', border: '1px solid var(--djmp-input-border)', color: 'var(--djmp-text)' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-500)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--djmp-input-border)'}
                    placeholder="List all assets and materials consumed for this request..."
                    disabled={submitting}
                  />
                </div>

                {/* Work Notes */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest px-1" style={{ color: 'var(--djmp-text-muted)' }}>Technician Logs</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl outline-none text-sm font-medium transition-all h-40 leading-relaxed"
                    style={{ background: 'var(--djmp-input-bg)', borderColor: 'var(--djmp-input-border)', border: '1px solid var(--djmp-input-border)', color: 'var(--djmp-text)' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-500)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--djmp-input-border)'}
                    placeholder="Provide technical details regarding the resolution process..."
                    disabled={submitting}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Resident Card */}
            <div className="glass-card p-6 border-none shadow-2xl space-y-6" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black shadow-xl mx-auto" style={{ background: 'var(--accent-gradient)', color: 'white' }}>
                  {residentInitials}
                </div>
                <div>
                  <h4 className="text-lg font-black uppercase tracking-tight" style={{ color: 'var(--djmp-text)' }}>{task.resident || '-'}</h4>
                  <p className="text-xs font-bold" style={{ color: 'var(--djmp-text-muted)' }}>UNIT {task.unit || '-'}</p>
                </div>
              </div>
              
              <div className="space-y-3 pt-6 border-t" style={{ borderColor: 'var(--djmp-border)' }}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--djmp-surface-2)' }}>
                  <Phone className="w-4 h-4" style={{ color: 'var(--accent-500)' }} />
                  <span className="text-xs font-bold" style={{ color: 'var(--djmp-text)' }}>{task.resident_phone || '-'}</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--djmp-surface-2)' }}>
                  <Mail className="w-4 h-4" style={{ color: 'var(--accent-500)' }} />
                  <span className="text-xs font-bold truncate" style={{ color: 'var(--djmp-text)' }}>{task.resident_email || '-'}</span>
                </div>
              </div>
            </div>

            {/* Action Cards */}
            <div className="space-y-4">
              {taskStatus === 'assigned' && (
                <button
                  onClick={handleStartTask}
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{ background: 'var(--accent-gradient)' }}
                >
                  Authorize Start
                </button>
              )}

              {taskStatus === 'in-progress' && (
                <div className="grid gap-3">
                  <button
                    onClick={() => setShowCompletionModal(true)}
                    disabled={submitting}
                    className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Confirm Resolution
                  </button>
                  <button
                    onClick={() => setShowExtensionModal(true)}
                    disabled={submitting}
                    className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                    style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
                  >
                    <Timer className="w-5 h-5" />
                    Request Extension
                  </button>
                </div>
              )}

              {taskStatus === 'completed' && (
                <div className="glass-card p-8 text-center space-y-4 shadow-2xl border-none" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-tight text-emerald-500">Operation Successful</h3>
                    <p className="text-[10px] font-bold text-emerald-400/80 mt-1">This maintenance protocol is finalized</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="glass-card shadow-2xl max-w-md w-full p-8 border-none space-y-8" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
            <div className="space-y-2">
               <h3 className="text-2xl font-black uppercase tracking-tight" style={{ color: 'var(--djmp-text)' }}>Finalize Protocol</h3>
               <p className="text-sm font-medium" style={{ color: 'var(--djmp-text-muted)' }}>Verify the following criteria before submission:</p>
            </div>
            
            <div className="space-y-3">
              {[
                { label: `Documentation Uploaded (${afterImages.length})`, active: afterImages.length > 0 },
                { label: 'Materials Logged', active: materialsUsed.trim() !== '' },
                { label: 'Technical Notes Added', active: notes.trim() !== '' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--djmp-surface-2)', border: '1px solid var(--djmp-border)' }}>
                  <CheckCircle2 className={`w-5 h-5 ${item.active ? 'text-emerald-500' : 'opacity-20'}`} style={{ color: item.active ? 'var(--accent-500)' : 'inherit' }} />
                  <span className={`text-xs font-bold ${item.active ? 'text-white' : 'opacity-40'}`}>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleCompleteTask}
                disabled={submitting}
                className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
                style={{ background: 'var(--accent-gradient)' }}
              >
                {submitting ? 'Processing...' : 'Authorize Completion'}
              </button>
              <button
                onClick={() => setShowCompletionModal(false)}
                disabled={submitting}
                className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-[0.98]"
                style={{ background: 'var(--djmp-surface-2)', border: '1px solid var(--djmp-border)', color: 'var(--djmp-text)' }}
              >
                Abort
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extension Modal */}
      {showExtensionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="glass-card shadow-2xl max-w-md w-full p-8 border-none space-y-8" style={{ background: 'var(--djmp-surface)', border: '1px solid var(--djmp-border)' }}>
            <div className="space-y-2">
               <h3 className="text-2xl font-black uppercase tracking-tight" style={{ color: 'var(--djmp-text)' }}>Deadline Extension</h3>
               <p className="text-sm font-medium" style={{ color: 'var(--djmp-text-muted)' }}>Propose a schedule adjustment for this task.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest px-1" style={{ color: 'var(--djmp-text-muted)' }}>Duration (Days)</label>
                <input
                  type="number"
                  value={extensionDays}
                  onChange={(e) => setExtensionDays(e.target.value)}
                  min="1"
                  max="14"
                  className="w-full px-6 py-4 rounded-xl outline-none font-bold text-sm"
                  style={{ background: 'var(--djmp-input-bg)', border: '1px solid var(--djmp-input-border)', color: 'var(--djmp-text)' }}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest px-1" style={{ color: 'var(--djmp-text-muted)' }}>Justification</label>
                <textarea
                  value={extensionReason}
                  onChange={(e) => setExtensionReason(e.target.value)}
                  className="w-full px-6 py-4 rounded-xl outline-none font-medium text-sm h-32 leading-relaxed"
                  style={{ background: 'var(--djmp-input-bg)', border: '1px solid var(--djmp-input-border)', color: 'var(--djmp-text)' }}
                  placeholder="State the technical or operational constraints requiring this extension..."
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleRequestExtension}
                disabled={submitting}
                className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
                style={{ background: 'var(--accent-gradient)' }}
              >
                {submitting ? 'Transmitting...' : 'Submit Proposal'}
              </button>
              <button
                onClick={() => setShowExtensionModal(false)}
                disabled={submitting}
                className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-[0.98]"
                style={{ background: 'var(--djmp-surface-2)', border: '1px solid var(--djmp-border)', color: 'var(--djmp-text)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}