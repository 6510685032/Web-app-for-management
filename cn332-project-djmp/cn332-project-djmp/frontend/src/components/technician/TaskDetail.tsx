import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, Calendar, Clock, Upload, X, CheckCircle } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [taskStatus, setTaskStatus] = useState('in-progress');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [afterImages, setAfterImages] = useState<File[]>([]);
  const [extensionDays, setExtensionDays] = useState('2');
  const [extensionReason, setExtensionReason] = useState('');
  const [notes, setNotes] = useState('');

  const task = {
    id: id || 'REQ-2026-001',
    resident: {
      name: 'Sarah Johnson',
      unit: 'A-205',
      phone: '+66 81-234-5678',
      email: 'sarah.j@email.com',
    },
    category: 'Plumbing',
    description: 'Kitchen sink faucet leaking continuously. Water pressure seems higher than normal.',
    priority: 'high',
    status: taskStatus,
    scheduledDate: '2026-01-31',
    scheduledTime: '10:00 AM',
    location: 'Unit A-205 - Kitchen',
    beforeImages: [
      'https://images.unsplash.com/photo-1585704032915-c3401ed4f2ca?w=400',
    ],
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setAfterImages([...afterImages, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setAfterImages(afterImages.filter((_, i) => i !== index));
  };

  const handleCompleteTask = () => {
    if (afterImages.length === 0) {
      alert('Please upload at least one after image');
      return;
    }
    setShowCompletionModal(false);
    setTaskStatus('completed');
    setTimeout(() => {
      navigate('/technician/tasks');
    }, 1500);
  };

  const handleRequestExtension = () => {
    if (!extensionReason) {
      alert('Please provide a reason for the extension');
      return;
    }
    setShowExtensionModal(false);
    alert('Extension request submitted successfully');
  };

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
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{task.id}</h1>
                <StatusBadge status={task.status as any} />
              </div>
              <p className="text-blue-100">{task.category} - {task.description}</p>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(task.scheduledDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{task.scheduledTime}</span>
            </div>
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Task Details */}
            <div>
              <h2 className="text-xl font-semibold text-blue-900 mb-4">Task Details</h2>
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
                  <span>{task.location}</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Description</h3>
                <p className="text-blue-700 bg-white p-4 rounded-lg border border-blue-200">
                  {task.description}
                </p>
              </div>
            </div>

            {/* Before Images */}
            <div>
              <h3 className="font-semibold text-blue-900 mb-3">Before Images</h3>
              <div className="grid grid-cols-2 gap-4">
                {task.beforeImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Before ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border border-blue-200"
                  />
                ))}
              </div>
            </div>

            {/* After Images Upload */}
            {task.status === 'in-progress' && (
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
                  />
                  <label htmlFor="after-image-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                    <p className="text-blue-700 font-medium mb-1">Click to upload after images</p>
                    <p className="text-sm text-blue-500">Required before marking task as complete</p>
                  </label>
                </div>

                {afterImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {afterImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`After ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-blue-200"
                        />
                        <button
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
            )}

            {/* Work Notes */}
            {task.status === 'in-progress' && (
              <div>
                <h3 className="font-semibold text-blue-900 mb-3">Work Notes</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  placeholder="Add notes about the work performed, parts used, etc..."
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resident Info */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-4">Resident Information</h3>
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                  {task.resident.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h4 className="font-semibold text-blue-900">{task.resident.name}</h4>
                <p className="text-sm text-blue-600">Unit {task.resident.unit}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-blue-700">
                  <Phone className="w-5 h-5" />
                  <span className="text-sm">{task.resident.phone}</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Call Resident
              </button>
            </div>

            {/* Actions */}
            {task.status === 'in-progress' && (
              <div className="space-y-3">
                <button
                  onClick={() => setShowCompletionModal(true)}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark as Complete
                </button>
                <button
                  onClick={() => setShowExtensionModal(true)}
                  className="w-full bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Clock className="w-5 h-5" />
                  Request Extension
                </button>
              </div>
            )}

            {task.status === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-green-900 mb-2">Task Completed</h3>
                <p className="text-sm text-green-700">
                  Awaiting resident approval
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Modal */}
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
                <CheckCircle className="w-4 h-4 text-gray-400" />
                Added work notes
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                Cleaned up work area
              </li>
            </ul>
            <div className="flex gap-3">
              <button
                onClick={handleCompleteTask}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Complete Task
              </button>
              <button
                onClick={() => setShowCompletionModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extension Modal */}
      {showExtensionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Request Deadline Extension</h3>
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
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRequestExtension}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Submit Request
              </button>
              <button
                onClick={() => setShowExtensionModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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
