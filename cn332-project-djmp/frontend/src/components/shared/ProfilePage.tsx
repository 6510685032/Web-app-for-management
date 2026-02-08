import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import TopNavigation from './TopNavigation';
import { User, Mail, Phone, Home, Calendar, ArrowLeft, Edit2, Save, X } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    unit: user?.unit || '',
  });

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      unit: user?.unit || '',
    });
    setIsEditing(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'officer':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'technician':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'resident':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'System Administrator';
      case 'officer':
        return 'Juristic Officer';
      case 'technician':
        return 'Technician';
      case 'resident':
        return 'Resident';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <TopNavigation />
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/30">
                  {user?.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{user?.name}</h1>
                  <span
                    className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium border ${getRoleBadgeColor(
                      user?.role || ''
                    )}`}
                  >
                    {getRoleLabel(user?.role || '')}
                  </span>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-6">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </div>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-blue-900 px-4 py-2 bg-blue-50 rounded-lg">{user?.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </div>
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-blue-900 px-4 py-2 bg-blue-50 rounded-lg">{user?.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </div>
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-blue-900 px-4 py-2 bg-blue-50 rounded-lg">{user?.phone}</p>
                )}
              </div>

              {user?.role === 'resident' && (
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="w-4 h-4" />
                      Unit Number
                    </div>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-blue-900 px-4 py-2 bg-blue-50 rounded-lg">{user?.unit}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    Member Since
                  </div>
                </label>
                <p className="text-blue-900 px-4 py-2 bg-blue-50 rounded-lg">
                  {new Date(user?.joinDate || '').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="p-8 bg-blue-50 border-t border-blue-100">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Account Status</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 mb-1">Account Status</p>
                <p className="text-lg font-semibold text-green-600">Active</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 mb-1">Last Login</p>
                <p className="text-lg font-semibold text-blue-900">Today, 10:30 AM</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 mb-1">Two-Factor Auth</p>
                <p className="text-lg font-semibold text-yellow-600">Not Enabled</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
