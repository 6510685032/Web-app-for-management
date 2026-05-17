import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Clock,
  Image as ImageIcon,
  Timer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import api from '../../utils/api';

function formatScheduledDate(value?: string | null, opts?: Intl.DateTimeFormatOptions): string {
  if (!value) return '-';
  const [datePart] = value.split('T');
  const parts = datePart.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return value;
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', opts || { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatScheduledTime(value?: string | null): string {
  if (!value) return '-';
  const match = value.match(/^(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : value;
}

interface TechnicianInfo {
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
}

interface RequestDetailData {
  id: number | string;
  request_code?: string;
  category: string;
  description: string;
  status: string;
  created_at?: string;
  priority: string;
  location: string;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  technician?: string;
  technician_phone?: string;
  technician_email?: string;
  images?: string[];
  extension_status?: 'none' | 'pending' | 'approved' | 'rejected' | string;
  extension_requested_days?: number | null;
  extension_reason?: string;
  extension_requested_at?: string | null;
}

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState<RequestDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [extensionSubmitting, setExtensionSubmitting] = useState(false);

  useEffect(() => {
    const fetchRequestDetail = async () => {
      if (!id) {
        setErrorMessage('ไม่พบรหัสรายการแจ้งซ่อม');
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage('');

      try {
        const response = await api.get(`/maintenance-requests/${id}/`);
        setRequest(response.data);
      } catch (error: any) {
        console.error('Error fetching request detail:', error);
        setErrorMessage(
          error?.response?.data?.error || 'ไม่สามารถโหลดรายละเอียดรายการแจ้งซ่อมได้'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetail();
  }, [id]);

  const handleExtensionResponse = async (decision: 'approved' | 'rejected') => {
    if (!request) return;

    const confirmMessage =
      decision === 'approved'
        ? `ต้องการอนุมัติให้ช่างขยายเวลาเพิ่ม ${request.extension_requested_days} วันใช่หรือไม่?`
        : `ต้องการปฏิเสธคำขอขยายเวลา ${request.extension_requested_days} วันใช่หรือไม่?`;

    if (!window.confirm(confirmMessage)) return;

    setExtensionSubmitting(true);
    try {
      const response = await api.post(
        `/maintenance-requests/${request.id}/respond-extension/`,
        { decision }
      );
      const updatedRequest = response.data?.request || {};
      setRequest((prev) => (prev ? { ...prev, ...updatedRequest } : prev));
      alert(decision === 'approved' ? 'อนุมัติคำขอขยายเวลาเรียบร้อย' : 'ปฏิเสธคำขอขยายเวลาเรียบร้อย');
    } catch (error: any) {
      console.error('Error responding to extension:', error);
      alert(error?.response?.data?.error || 'ไม่สามารถบันทึกการตอบกลับได้');
    } finally {
      setExtensionSubmitting(false);
    }
  };

  const extensionRequestedAtLabel = useMemo(() => {
    if (!request?.extension_requested_at) return null;
    try {
      return new Date(request.extension_requested_at).toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return null;
    }
  }, [request?.extension_requested_at]);

  const technicianInfo: TechnicianInfo | null = useMemo(() => {
    if (!request?.technician || request.technician === '-') return null;

    const initials = request.technician
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    return {
      name: request.technician,
      phone: request.technician_phone || '-',
      email: request.technician_email || '-',
      avatar: initials || 'T',
    };
  }, [request]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="glass-card rounded-xl shadow-lg p-10 text-center font-medium" style={{ background: 'var(--djmp-surface)', color: 'var(--accent-600)' }}>
          Loading request details...
        </div>
      </div>
    );
  }

  if (errorMessage || !request) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <button
          onClick={() => navigate('/resident/requests')}
          className="flex items-center gap-2 mb-6 font-medium hover:opacity-80 transition-opacity"
          style={{ color: 'var(--accent-600)' }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Requests
        </button>

        <div className="glass-card rounded-xl shadow-lg p-10 text-center" style={{ background: 'var(--djmp-surface)' }}>
          <p className="font-medium text-red-500">
            {errorMessage || 'ไม่พบข้อมูลรายการแจ้งซ่อม'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <button
        onClick={() => navigate('/resident/requests')}
        className="flex items-center gap-2 mb-6 font-medium hover:opacity-80 transition-opacity"
        style={{ color: 'var(--accent-600)' }}
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Requests
      </button>

      <div className="glass-card rounded-xl shadow-lg overflow-hidden" style={{ background: 'var(--djmp-surface)' }}>
        <div className="p-6 text-white" style={{ background: 'var(--accent-gradient)' }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">
                  {request.request_code || request.id}
                </h1>
                <StatusBadge status={request.status as any} />
              </div>
              <p className="opacity-90">
                {request.category} - {request.description}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm opacity-80 mb-1">Submitted on</p>
              <p className="font-medium">
                {request.created_at
                  ? new Date(request.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--djmp-text)' }}>
                Request Information
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border" style={{ background: 'var(--djmp-surface-2)', borderColor: 'var(--djmp-border)' }}>
                  <p className="text-sm mb-1" style={{ color: 'var(--djmp-text-muted)' }}>Category</p>
                  <p className="font-medium" style={{ color: 'var(--djmp-text)' }}>{request.category}</p>
                </div>

                <div className="p-4 rounded-lg border" style={{ background: 'var(--djmp-surface-2)', borderColor: 'var(--djmp-border)' }}>
                  <p className="text-sm mb-1" style={{ color: 'var(--djmp-text-muted)' }}>Priority</p>
                  <p className="font-medium capitalize" style={{ color: 'var(--djmp-text)' }}>
                    {request.priority}
                  </p>
                </div>

                <div className="p-4 rounded-lg border flex items-center gap-2" style={{ background: 'var(--djmp-surface-2)', borderColor: 'var(--djmp-border)' }}>
                  <MapPin className="w-5 h-5" style={{ color: 'var(--accent-500)' }} />
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--djmp-text-muted)' }}>Location</p>
                    <p className="font-medium" style={{ color: 'var(--djmp-text)' }}>{request.location}</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg border flex items-center gap-2" style={{ background: 'var(--djmp-surface-2)', borderColor: 'var(--djmp-border)' }}>
                  <Calendar className="w-5 h-5" style={{ color: 'var(--accent-500)' }} />
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'var(--djmp-text-muted)' }}>Scheduled Date</p>
                    <p className="font-medium" style={{ color: 'var(--djmp-text)' }}>
                      {formatScheduledDate(request.scheduled_date)}
                    </p>
                    {request.scheduled_time && (
                      <p className="text-xs" style={{ color: 'var(--djmp-text-muted)' }}>
                        {formatScheduledTime(request.scheduled_time)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--djmp-text)' }}>Description</h3>
              <p className="p-4 rounded-lg border" style={{ background: 'var(--djmp-surface-2)', borderColor: 'var(--djmp-border)', color: 'var(--djmp-text-muted)' }}>
                {request.description}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--djmp-text)' }}>
                <ImageIcon className="w-5 h-5" />
                Uploaded Images
              </h3>

              {request.images && request.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {request.images.map((img, index) => (
                    <img
                      key={index}
                      src={
                        img.startsWith('http')
                          ? img
                          : `http://127.0.0.1:8000${img}`
                      }
                      alt={`Request image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border"
                      style={{ borderColor: 'var(--djmp-border)' }}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg border" style={{ background: 'var(--djmp-surface-2)', borderColor: 'var(--djmp-border)', color: 'var(--djmp-text-muted)' }}>
                  No uploaded images
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg p-6 border" style={{ background: 'var(--djmp-surface-2)', borderColor: 'var(--djmp-border)' }}>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--djmp-text)' }}>
                Assigned Technician
              </h3>

              {technicianInfo ? (
                <>
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3" style={{ background: 'var(--accent-500)' }}>
                      {technicianInfo.avatar}
                    </div>
                    <h4 className="font-semibold" style={{ color: 'var(--djmp-text)' }}>
                      {technicianInfo.name}
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--djmp-text-muted)' }}>Assigned Technician</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3" style={{ color: 'var(--djmp-text-muted)' }}>
                      <Phone className="w-5 h-5" />
                      <span className="text-sm">{technicianInfo.phone}</span>
                    </div>

                    <div className="flex items-center gap-3" style={{ color: 'var(--djmp-text-muted)' }}>
                      <Mail className="w-5 h-5" />
                      <span className="text-sm">{technicianInfo.email}</span>
                    </div>
                  </div>

                </>
              ) : (
                <p style={{ color: 'var(--djmp-text-muted)' }}>No technician assigned yet</p>
              )}
            </div>

            {request.extension_status === 'pending' && (
              <div className="rounded-lg p-6 border" style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.35)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold" style={{ color: 'var(--djmp-text)' }}>
                    คำขอขยายเวลาจากช่าง
                  </h3>
                </div>

                <div className="p-4 rounded-lg border mb-3" style={{ background: 'var(--djmp-surface)', borderColor: 'var(--djmp-border)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                      <Timer className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: 'var(--djmp-text-muted)' }}>ช่างขอขยายเวลาเพิ่ม</p>
                      <p className="text-2xl font-bold text-amber-500">
                        {request.extension_requested_days ?? '-'} วัน
                      </p>
                    </div>
                  </div>

                  {request.extension_reason && (
                    <div className="pt-3 border-t" style={{ borderColor: 'var(--djmp-border)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--djmp-text-muted)' }}>
                        เหตุผล
                      </p>
                      <p className="text-sm" style={{ color: 'var(--djmp-text)' }}>
                        {request.extension_reason}
                      </p>
                    </div>
                  )}

                  {extensionRequestedAtLabel && (
                    <p className="text-xs mt-2" style={{ color: 'var(--djmp-text-muted)' }}>
                      ยื่นคำขอเมื่อ {extensionRequestedAtLabel}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleExtensionResponse('approved')}
                    disabled={extensionSubmitting}
                    className="py-3 rounded-lg font-semibold text-sm text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    อนุมัติ
                  </button>
                  <button
                    onClick={() => handleExtensionResponse('rejected')}
                    disabled={extensionSubmitting}
                    className="py-3 rounded-lg font-semibold text-sm text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
                  >
                    <XCircle className="w-4 h-4" />
                    ปฏิเสธ
                  </button>
                </div>
              </div>
            )}

            {request.extension_status === 'approved' && (
              <div className="rounded-lg p-6 border" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-semibold" style={{ color: 'var(--djmp-text)' }}>
                    อนุมัติขยายเวลาแล้ว
                  </h3>
                </div>
                <p className="text-sm" style={{ color: 'var(--djmp-text-muted)' }}>
                  คุณได้อนุมัติให้ช่างขยายเวลาเพิ่ม{' '}
                  <span className="font-semibold text-emerald-500">
                    {request.extension_requested_days} วัน
                  </span>
                </p>
                {request.extension_reason && (
                  <div className="mt-3 p-3 rounded-lg border" style={{ background: 'var(--djmp-surface)', borderColor: 'var(--djmp-border)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--djmp-text-muted)' }}>เหตุผล</p>
                    <p className="text-sm" style={{ color: 'var(--djmp-text)' }}>{request.extension_reason}</p>
                  </div>
                )}
              </div>
            )}

            {request.extension_status === 'rejected' && (
              <div className="rounded-lg p-6 border" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold" style={{ color: 'var(--djmp-text)' }}>
                    ปฏิเสธคำขอขยายเวลา
                  </h3>
                </div>
                <p className="text-sm" style={{ color: 'var(--djmp-text-muted)' }}>
                  คุณได้ปฏิเสธคำขอขยายเวลา {request.extension_requested_days} วันจากช่าง
                </p>
              </div>
            )}

            {request.status === 'in-progress' && (
              <div className="rounded-lg p-6 border" style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--djmp-text)' }}>
                  Work in Progress
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--djmp-text-muted)' }}>
                  The technician is currently working on your request. You will
                  be notified when the work is completed.
                </p>

                <div className="p-3 rounded-lg border" style={{ background: 'var(--djmp-surface)', borderColor: 'var(--djmp-border)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--djmp-text-muted)' }}>
                    Scheduled Time
                  </p>
                  <p className="font-medium" style={{ color: 'var(--djmp-text)' }}>
                    {formatScheduledTime(request.scheduled_time)}
                  </p>
                </div>
              </div>
            )}

            {request.status === 'pending' && (
              <div className="rounded-lg p-6 border" style={{ background: 'rgba(234, 179, 8, 0.1)', borderColor: 'rgba(234, 179, 8, 0.2)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--djmp-text)' }}>
                  Waiting for Review
                </h3>
                <p className="text-sm" style={{ color: 'var(--djmp-text-muted)' }}>
                  Your request has been submitted and is waiting for officer
                  review/assignment.
                </p>
              </div>
            )}

            {request.status === 'completed' && (
              <div className="rounded-lg p-6 border" style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--djmp-text)' }}>
                  Work Completed
                </h3>
                <p className="text-sm" style={{ color: 'var(--djmp-text-muted)' }}>
                  This maintenance request has been completed.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}