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
} from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import api from '../../utils/api';

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
}

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState<RequestDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

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
        <div className="bg-white rounded-xl shadow-lg p-10 text-center text-blue-600 font-medium">
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
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Requests
        </button>

        <div className="bg-white rounded-xl shadow-lg p-10 text-center">
          <p className="text-red-600 font-medium">
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
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Requests
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">
                  {request.request_code || request.id}
                </h1>
                <StatusBadge status={request.status as any} />
              </div>
              <p className="text-blue-100">
                {request.category} - {request.description}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-blue-100 mb-1">Submitted on</p>
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
              <h2 className="text-xl font-semibold text-blue-900 mb-4">
                Request Information
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Category</p>
                  <p className="font-medium text-blue-900">{request.category}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Priority</p>
                  <p className="font-medium text-blue-900 capitalize">
                    {request.priority}
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600 mb-1">Location</p>
                    <p className="font-medium text-blue-900">{request.location}</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600 mb-1">Scheduled Date</p>
                    <p className="font-medium text-blue-900">
                      {request.scheduled_date
                        ? new Date(request.scheduled_date).toLocaleDateString(
                            'en-US',
                            { month: 'short', day: 'numeric', year: 'numeric' }
                          )
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Description</h3>
              <p className="text-blue-700 bg-blue-50 p-4 rounded-lg">
                {request.description}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
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
                      className="w-full h-48 object-cover rounded-lg border border-blue-200"
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-blue-50 p-4 rounded-lg text-blue-600">
                  No uploaded images
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-4">
                Assigned Technician
              </h3>

              {technicianInfo ? (
                <>
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                      {technicianInfo.avatar}
                    </div>
                    <h4 className="font-semibold text-blue-900">
                      {technicianInfo.name}
                    </h4>
                    <p className="text-sm text-blue-600">Assigned Technician</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-blue-700">
                      <Phone className="w-5 h-5" />
                      <span className="text-sm">{technicianInfo.phone}</span>
                    </div>

                    <div className="flex items-center gap-3 text-blue-700">
                      <Mail className="w-5 h-5" />
                      <span className="text-sm">{technicianInfo.email}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Contact Technician
                  </button>
                </>
              ) : (
                <p className="text-blue-600">No technician assigned yet</p>
              )}
            </div>

            {request.status === 'in-progress' && (
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">
                  Work in Progress
                </h3>
                <p className="text-sm text-green-700 mb-4">
                  The technician is currently working on your request. You will
                  be notified when the work is completed.
                </p>

                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs text-green-600 mb-1">
                    Scheduled Time
                  </p>
                  <p className="font-medium text-green-900">
                    {request.scheduled_time || '-'}
                  </p>
                </div>
              </div>
            )}

            {request.status === 'pending' && (
              <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <h3 className="font-semibold text-yellow-900 mb-2">
                  Waiting for Review
                </h3>
                <p className="text-sm text-yellow-700">
                  Your request has been submitted and is waiting for officer
                  review/assignment.
                </p>
              </div>
            )}

            {request.status === 'completed' && (
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">
                  Work Completed
                </h3>
                <p className="text-sm text-green-700">
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