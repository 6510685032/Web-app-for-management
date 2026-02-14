import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, Calendar, MapPin, CheckCircle, X, Clock, Image as ImageIcon } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);

  // Mock request data
  const request = {
    id: id || 'REQ-2026-001',
    category: 'Plumbing',
    description: 'Kitchen sink faucet leaking',
    status: 'in-progress',
    date: '2026-01-28',
    priority: 'medium',
    location: 'My Unit - Kitchen',
    technician: {
      name: 'John Smith',
      phone: '+66 85-123-4567',
      email: 'john.smith@techservices.com',
      avatar: 'JS',
    },
    timeline: [
      { status: 'submitted', date: '2026-01-28 10:30 AM', note: 'Request submitted' },
      { status: 'reviewed', date: '2026-01-28 11:15 AM', note: 'Request reviewed and approved by officer' },
      { status: 'assigned', date: '2026-01-28 02:00 PM', note: 'Assigned to John Smith' },
      { status: 'in-progress', date: '2026-01-29 09:00 AM', note: 'Technician started work' },
    ],
    scheduledDate: '2026-02-01',
    estimatedCompletion: '2026-02-01',
    beforeImages: [
      'https://images.unsplash.com/photo-1585704032915-c3401ed4f2ca?w=400',
      'https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=400',
    ],
    afterImages: [],
    extensionRequest: {
      days: 2,
      reason: 'Need to order special part - expected arrival in 2 days',
      status: 'pending',
    },
  };

  const handleApproveWork = () => {
    setShowApprovalModal(false);
    navigate('/resident/requests');
  };

  const handleApproveExtension = (approved: boolean) => {
    setShowExtensionModal(false);
    // Handle extension approval
  };

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
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{request.id}</h1>
                <StatusBadge status={request.status as any} />
              </div>
              <p className="text-blue-100">{request.category} - {request.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100 mb-1">Submitted on</p>
              <p className="font-medium">{new Date(request.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}</p>
            </div>
          </div>
        </div>

        {/* Extension Request Alert */}
        {request.extensionRequest && request.extensionRequest.status === 'pending' && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">Extension Request Pending</p>
                  <p className="text-sm text-yellow-700">
                    Technician requested {request.extensionRequest.days}-day extension: {request.extensionRequest.reason}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExtensionModal(true)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
              >
                Review Request
              </button>
            </div>
          </div>
        )}

        <div className="p-6 grid md:grid-cols-3 gap-6">
          {/* Left Column - Request Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Request Information */}
            <div>
              <h2 className="text-xl font-semibold text-blue-900 mb-4">Request Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Category</p>
                  <p className="font-medium text-blue-900">{request.category}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Priority</p>
                  <p className="font-medium text-blue-900 capitalize">{request.priority}</p>
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
                      {new Date(request.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Description</h3>
              <p className="text-blue-700 bg-blue-50 p-4 rounded-lg">{request.description}</p>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="font-semibold text-blue-900 mb-4">Status Timeline</h3>
              <div className="space-y-4">
                {request.timeline.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      {index < request.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-blue-200 my-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <StatusBadge status={item.status as any} size="sm" />
                      <p className="text-blue-700 mt-2">{item.note}</p>
                      <p className="text-sm text-blue-500 mt-1">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Images */}
            <div>
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Before Images
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {request.beforeImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Before ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border border-blue-200"
                  />
                ))}
              </div>
            </div>

            {request.afterImages.length > 0 && (
              <div>
                <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  After Images
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {request.afterImages.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`After ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-blue-200"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Technician Info */}
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-4">Assigned Technician</h3>
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                  {request.technician.avatar}
                </div>
                <h4 className="font-semibold text-blue-900">{request.technician.name}</h4>
                <p className="text-sm text-blue-600">Plumbing Specialist</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-blue-700">
                  <Phone className="w-5 h-5" />
                  <span className="text-sm">{request.technician.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-blue-700">
                  <Mail className="w-5 h-5" />
                  <span className="text-sm">{request.technician.email}</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Contact Technician
              </button>
            </div>

            {request.status === 'in-progress' && (
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">Work in Progress</h3>
                <p className="text-sm text-green-700 mb-4">
                  The technician is currently working on your request. You will be notified when the work is completed.
                </p>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs text-green-600 mb-1">Estimated Completion</p>
                  <p className="font-medium text-green-900">
                    {new Date(request.estimatedCompletion).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Approve Completed Work</h3>
            <p className="text-blue-700 mb-6">
              Are you satisfied with the completed work? Approving will close this request.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleApproveWork}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Approve & Close
              </button>
              <button
                onClick={() => setShowApprovalModal(false)}
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
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Extension Request</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-700 mb-2">
                <strong>Requested Extension:</strong> {request.extensionRequest?.days} days
              </p>
              <p className="text-sm text-yellow-700">
                <strong>Reason:</strong> {request.extensionRequest?.reason}
              </p>
            </div>
            <p className="text-blue-700 mb-6">
              Do you approve this deadline extension?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleApproveExtension(true)}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Approve
              </button>
              <button
                onClick={() => handleApproveExtension(false)}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
