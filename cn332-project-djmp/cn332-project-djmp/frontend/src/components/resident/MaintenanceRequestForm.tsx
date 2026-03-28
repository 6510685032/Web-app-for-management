import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, CheckCircle } from 'lucide-react';
import api from '../../utils/api';

export default function MaintenanceRequestForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: '',
    location: '',
    description: '',
    priority: 'medium',
  });

  const [images, setImages] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdRequestId, setCreatedRequestId] = useState('');

  const categories = [
    'Plumbing',
    'Electrical',
    'Air Conditioning',
    'Structural',
    'Common Area',
    'Elevator',
    'Security',
    'Parking',
    'Other',
  ];

  const locations = [
    'My Unit',
    'Common Area - Lobby',
    'Common Area - Pool',
    'Common Area - Gym',
    'Common Area - Parking',
    'Common Area - Elevator',
    'Common Area - Garden',
    'Other',
  ];

  const imagePreviews = useMemo(
    () => images.map((image) => ({ file: image, url: URL.createObjectURL(image) })),
    [images]
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const payload = new FormData();
      payload.append('category', formData.category);
      payload.append('location', formData.location);
      payload.append('description', formData.description);
      payload.append('priority', formData.priority);

      images.forEach((image) => {
        payload.append('images', image);
      });

      const response = await api.post('/maintenance-requests/', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const requestId =
        response.data?.request?.request_code ||
        response.data?.request?.id ||
        response.data?.id ||
        'Submitted';

      setCreatedRequestId(String(requestId));
      setSubmitted(true);

      setTimeout(() => {
        navigate('/resident/requests');
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting request:', error);
      setErrorMessage(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          'ไม่สามารถส่งคำขอแจ้งซ่อมได้'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-blue-900 mb-4">Request Submitted Successfully!</h2>
          <p className="text-blue-600 mb-2">Your maintenance request has been received.</p>
          <p className="text-blue-500 text-sm mb-8">
            You will receive a notification once it has been reviewed and assigned to a technician.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg inline-block">
            <p className="text-sm text-blue-700 mb-1">Request ID</p>
            <p className="text-2xl font-bold text-blue-900">{createdRequestId}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate('/resident')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">New Maintenance Request</h1>
          <p className="text-blue-100">Fill out the form below to submit a maintenance request</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Problem Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={submitting}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={submitting}
            >
              <option value="">Select a location</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Priority Level <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'low', label: 'Low', color: 'border-blue-300 hover:bg-blue-50' },
                { value: 'medium', label: 'Medium', color: 'border-yellow-300 hover:bg-yellow-50' },
                { value: 'high', label: 'High', color: 'border-red-300 hover:bg-red-50' },
              ].map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: priority.value })}
                  disabled={submitting}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${priority.color} ${
                    formData.priority === priority.value ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'
                  }`}
                >
                  <span className="font-medium text-blue-900">{priority.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Problem Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
              placeholder="Please provide a detailed description of the problem..."
              required
              disabled={submitting}
            />
            <p className="text-sm text-blue-500 mt-2">
              Tip: Include specific details about when the problem started and any relevant circumstances
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Upload Images / Videos (Optional)
            </label>
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="image-upload"
                accept="image/*,video/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={submitting}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <p className="text-blue-700 font-medium mb-1">Click to upload images or videos</p>
                <p className="text-sm text-blue-500">PNG, JPG, MP4 up to 10MB each</p>
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {imagePreviews.map((image, index) => (
                  <div key={index} className="relative group">
                    {image.file.type.startsWith('video/') ? (
                      <video
                        src={image.url}
                        className="w-full h-32 object-cover rounded-lg border border-blue-200"
                        controls
                      />
                    ) : (
                      <img
                        src={image.url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-blue-200"
                      />
                    )}
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

          <div className="flex gap-3 pt-4 border-t border-blue-100">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/resident')}
              disabled={submitting}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}