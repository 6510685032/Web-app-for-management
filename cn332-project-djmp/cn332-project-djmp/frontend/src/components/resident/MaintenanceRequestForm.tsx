import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

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
      const newImages = Array.from(e.target.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (newImages.length < (e.target.files?.length || 0)) {
        alert('Only image files (PNG, JPG, GIF, WEBP) are allowed.');
      }
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
        <div className="glass-card rounded-xl shadow-lg p-12 text-center" style={{ background: 'var(--djmp-surface)' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--accent-100)' }}>
            <CheckCircle className="w-12 h-12" style={{ color: 'var(--accent-600)' }} />
          </div>
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--djmp-text)' }}>Request Submitted Successfully!</h2>
          <p className="mb-2" style={{ color: 'var(--accent-600)' }}>Your maintenance request has been received.</p>
          <p className="text-sm mb-8" style={{ color: 'var(--djmp-text-muted)' }}>
            You will receive a notification once it has been reviewed and assigned to a technician.
          </p>
          <div className="p-4 rounded-lg inline-block" style={{ background: 'var(--djmp-surface-2)', border: '1px solid var(--djmp-border)' }}>
            <p className="text-sm mb-1" style={{ color: 'var(--djmp-text-muted)' }}>Request ID</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--djmp-text)' }}>{createdRequestId}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate('/resident')}
        className="flex items-center gap-2 mb-6 font-medium transition-colors hover:opacity-80"
        style={{ color: 'var(--accent-600)' }}
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="glass-card rounded-xl shadow-lg overflow-hidden" style={{ background: 'var(--djmp-surface)' }}>
        <div className="p-6 text-white" style={{ background: 'var(--accent-gradient)' }}>
          <h1 className="text-2xl font-bold mb-2">New Maintenance Request</h1>
          <p className="opacity-90">Fill out the form below to submit a maintenance request</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMessage && (
            <div className="rounded-lg px-4 py-3 text-red-700" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--djmp-text)' }}>
              Problem Category <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              disabled={submitting}
              required
            >
              <SelectTrigger className="w-full h-[50px] px-4 rounded-lg text-base focus:ring-2 focus:ring-blue-500 transition-colors" style={{ background: 'var(--djmp-input-bg)', borderColor: 'var(--djmp-input-border)', color: 'var(--djmp-text)' }}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="shadow-lg z-50" style={{ background: 'var(--djmp-surface)', borderColor: 'var(--djmp-border)' }}>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-base cursor-pointer hover:opacity-80 transition-opacity" style={{ color: 'var(--djmp-text)' }}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--djmp-text)' }}>
              Location <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.location}
              onValueChange={(value) => setFormData({ ...formData, location: value })}
              disabled={submitting}
              required
            >
              <SelectTrigger className="w-full h-[50px] px-4 rounded-lg text-base focus:ring-2 focus:ring-blue-500 transition-colors" style={{ background: 'var(--djmp-input-bg)', borderColor: 'var(--djmp-input-border)', color: 'var(--djmp-text)' }}>
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent className="shadow-lg z-50" style={{ background: 'var(--djmp-surface)', borderColor: 'var(--djmp-border)' }}>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc} className="text-base cursor-pointer hover:opacity-80 transition-opacity" style={{ color: 'var(--djmp-text)' }}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--djmp-text)' }}>
              Priority Level <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'low', label: 'Low', color: 'rgba(59, 130, 246, 0.2)', activeColor: 'rgba(59, 130, 246, 0.1)' },
                { value: 'medium', label: 'Medium', color: 'rgba(234, 179, 8, 0.2)', activeColor: 'rgba(234, 179, 8, 0.1)' },
                { value: 'high', label: 'High', color: 'rgba(239, 68, 68, 0.2)', activeColor: 'rgba(239, 68, 68, 0.1)' },
              ].map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: priority.value })}
                  disabled={submitting}
                  className={`px-4 py-3 rounded-lg border-2 transition-all`}
                  style={{
                    background: formData.priority === priority.value ? priority.activeColor : 'var(--djmp-input-bg)',
                    borderColor: formData.priority === priority.value ? 'var(--accent-500)' : priority.color,
                  }}
                >
                  <span className="font-medium" style={{ color: 'var(--djmp-text)' }}>{priority.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--djmp-text)' }}>
              Problem Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 transition-colors"
              style={{ background: 'var(--djmp-input-bg)', borderColor: 'var(--djmp-input-border)', borderStyle: 'solid', borderWidth: '1px', color: 'var(--djmp-text)' }}
              placeholder="Please provide a detailed description of the problem..."
              required
              disabled={submitting}
            />
            <p className="text-sm mt-2" style={{ color: 'var(--djmp-text-muted)' }}>
              Tip: Include specific details about when the problem started and any relevant circumstances
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--djmp-text)' }}>
              Upload Images (Optional)
            </label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center transition-colors hover:opacity-80" style={{ borderColor: 'var(--djmp-border)' }}>
              <input
                type="file"
                id="image-upload"
                accept="image/png,image/jpeg,image/gif,image/webp"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={submitting}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--accent-500)' }} />
                <p className="font-medium mb-1" style={{ color: 'var(--djmp-text)' }}>Click to upload images</p>
                <p className="text-sm" style={{ color: 'var(--djmp-text-muted)' }}>PNG, JPG, GIF, WEBP up to 10MB each</p>
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {imagePreviews.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                      style={{ borderColor: 'var(--djmp-border)' }}
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

          <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--djmp-border)' }}>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 text-white py-3 rounded-lg transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-110 shadow-md hover:shadow-lg"
              style={{ background: 'var(--accent-gradient)' }}
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/resident')}
              disabled={submitting}
              className="px-6 py-3 rounded-lg transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'var(--djmp-surface-2)', color: 'var(--djmp-text)' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}