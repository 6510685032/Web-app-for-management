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
  location?: string;
  images?: string[];
  technician_notes?: string;
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
      } catch (error: any) {
        console.error('Error fetching task detail:', error);
        setErrorMessage(
          error?.response?.data?.error || 'ไม่สามารถโหลดรายละเอียดงานได้'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetail();
  }, [id]);

  const residentInitials = useMemo(() => {
    if (!task?.resident) return 'R';
    return task.resident
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
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
      const response = await api.patch(`/tasks/${task.id}/`, {
        status: 'in-progress',
      });

      setTask((prev) => (prev ? { ...prev, status: response.data.status || 'in-progress' } : prev));
      setTaskStatus(response.data.status || 'in-progress');
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

      afterImages.forEach((image) => {
        payload.append('after_images', image);
      });

      const response = await api.patch(`/tasks/${task.id}/`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowCompletionModal(false);
      setTask((prev) =>
        prev
          ? {
              ...prev,
              status: response.data.status || 'completed',
              technician_notes: response.data.technician_notes || notes,
            }
          : prev
      );
      setTaskStatus(response.data.status || 'completed');

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
        <div className="bg-white rounded-xl shadow-lg p-10 text-center text-blue-600 font-medium">
          Loading task details...
        </div>
      </div>
    );
  }

  if (errorMessage || !task) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <button
          onClick={() => navigate('/technician/tasks')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Tasks
        </button>

        <div className="bg-white rounded-xl shadow-lg p-10 text-center">
          <p className="text-red-600 font-medium">
            {errorMessage || 'ไม่พบข้อมูลงาน'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <button
        onClick={() => navigate('/technician/tasks')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Tasks
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">
                  {task.request_code || task.id}
                </h1>
                <StatusBadge status={taskStatus as any} />
              </div>
              <p className="text-blue-100">
                {task.category} - {task.description}
              </p>
            </div>
          </div>

          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {task.scheduled_date
                  ? new Date(task.scheduled_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '-'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{task.scheduled_time || '-'}</span>
            </div>
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-blue-900 mb-4">
                Task Details
              </h2>

              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-blue-600 mb-1">Category</p>
                    <p className="font-medium text-blue-900">{task.category}</p>
                  </div>

                  <div>
                    <p className="text-sm text-blue-600 mb-1">Priority</p>
                    <p className="font-medium text-blue-900 capitalize">{task.priority}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-blue-700">
                  <MapPin className="w-5 h-5" />
                  <span>{task.location || '-'}</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Description</h3>
                <p className="text-blue-700 bg-white p-4 rounded-lg border border-blue-200">
                  {task.description}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-blue-900 mb-3">Before Images</h3>
              {task.images && task.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {task.images.map((img, index) => (
                    <img
                      key={index}
                      src={img.startsWith('http') ? img : `http://127.0.0.1:8000${img}`}
                      alt={`Before ${index + 1}`}
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

            {taskStatus === 'assigned' || taskStatus === 'in-progress' ? (
              <>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-3">Upload After Images</h3>
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      id="after-image-upload"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={submitting}
                    />
                    <label htmlFor="after-image-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                      <p className="text-blue-700 font-medium mb-1">Click to upload after images</p>
                      <p className="text-sm text-blue-500">Required before marking task as complete</p>
                    </label>
                  </div>

                  {afterImagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {afterImagePreviews.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.url}
                            alt={`After ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg border border-blue-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-blue-900 mb-3">Work Notes</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                    placeholder="Add notes about the work performed, parts used, etc..."
                    disabled={submitting}
                  />
                </div>
              </>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-4">Resident Information</h3>

              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                  {residentInitials}
                </div>
                <h4 className="font-semibold text-blue-900">{task.resident || '-'}</h4>
                <p className="text-sm text-blue-600">Unit {task.unit || '-'}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-blue-700">
                  <Phone className="w-5 h-5" />
                  <span className="text-sm">{task.resident_phone || '-'}</span>
                </div>

                <div className="flex items-center gap-3 text-blue-700">
                  <Mail className="w-5 h-5" />
                  <span className="text-sm">{task.resident_email || '-'}</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Call Resident
              </button>
            </div>

            {taskStatus === 'assigned' && (
              <div className="space-y-3">
                <button
                  onClick={handleStartTask}
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Start Task
                </button>
              </div>
            )}

            {taskStatus === 'in-progress' && (
              <div className="space-y-3">
                <button
                  onClick={() => setShowCompletionModal(true)}
                  disabled={submitting}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark as Complete
                </button>

                <button
                  onClick={() => setShowExtensionModal(true)}
                  disabled={submitting}
                  className="w-full bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Clock className="w-5 h-5" />
                  Request Extension
                </button>
              </div>
            )}

            {taskStatus === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-green-900 mb-2">Task Completed</h3>
                <p className="text-sm text-green-700">
                  This task has been marked as completed
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Complete Task</h3>
            <p className="text-blue-700 mb-4">
              Are you sure you want to mark this task as complete? Make sure you have:
            </p>

            <ul className="text-sm text-blue-600 mb-6 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className={`w-4 h-4 ${afterImages.length > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                Uploaded after images ({afterImages.length} uploaded)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className={`w-4 h-4 ${notes.trim() ? 'text-green-600' : 'text-gray-400'}`} />
                Added work notes
              </li>
            </ul>

            <div className="flex gap-3">
              <button
                onClick={handleCompleteTask}
                disabled={submitting}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Complete Task
              </button>

              <button
                onClick={() => setShowCompletionModal(false)}
                disabled={submitting}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showExtensionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">
              Request Deadline Extension
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Extension Days
              </label>
              <input
                type="number"
                value={extensionDays}
                onChange={(e) => setExtensionDays(e.target.value)}
                min="1"
                max="7"
                className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Reason for Extension
              </label>
              <textarea
                value={extensionReason}
                onChange={(e) => setExtensionReason(e.target.value)}
                className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                placeholder="Explain why you need more time..."
                disabled={submitting}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRequestExtension}
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Submit Request
              </button>

              <button
                onClick={() => setShowExtensionModal(false)}
                disabled={submitting}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
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