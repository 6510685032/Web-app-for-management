import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import api from '../../utils/api';

interface UserItem {
  id: string | number;
  username?: string;
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  unit_number?: string;
  joinDate?: string;
}

interface UserFormData {
  name: string;
  email: string;
  role: string;
  phone: string;
  password: string;
}

export default function UserManagement() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: '',
    phone: '',
    password: '',
  });

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      role: '',
      phone: '',
      password: '',
    });
  };

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await api.get('/users/');
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setErrorMessage(
        error?.response?.data?.error ||
          'ไม่สามารถโหลดข้อมูลผู้ใช้ได้'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const response = await api.post('/users/', formData);

      if (response.status === 201 || response.status === 200) {
        closeModals();
        await fetchUsers();
        alert('เพิ่มผู้ใช้สำเร็จ!');
      }
    } catch (error: any) {
      console.error('Error adding user:', error);
      alert(error?.response?.data?.error || 'เกิดข้อผิดพลาดในการเพิ่มผู้ใช้');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSubmitting(true);
    setErrorMessage('');

    try {
      const payload: Partial<UserFormData> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
      };

      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      const response = await api.put(`/users/${selectedUser.id}/`, payload);

      if (response.status === 200) {
        closeModals();
        await fetchUsers();
        alert('อัปเดตข้อมูลสำเร็จ!');
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      alert(error?.response?.data?.error || 'เกิดข้อผิดพลาดในการอัปเดตผู้ใช้');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string | number) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?')) return;

    try {
      const response = await api.delete(`/users/${id}/`);

      if (response.status === 200 || response.status === 204) {
        await fetchUsers();
        alert('ลบผู้ใช้สำเร็จ!');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(error?.response?.data?.error || 'เกิดข้อผิดพลาดในการลบผู้ใช้');
    }
  };

  const openEditModal = (user: UserItem) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || '',
      phone: user.phone || '',
      password: '',
    });
    setShowEditModal(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
      case 'administrator':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'officer':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'technician':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'resident':
      case 'tenant':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    if (!role) return 'Unknown';

    switch (role.toLowerCase()) {
      case 'admin':
        return 'Administrator';
      case 'officer':
        return 'Juristic Officer';
      case 'technician':
        return 'Technician';
      case 'resident':
      case 'tenant':
        return 'Resident';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    const searchLower = searchQuery.toLowerCase();

    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(searchLower)) ||
      (u.email && u.email.toLowerCase().includes(searchLower)) ||
      (u.phone && u.phone.toLowerCase().includes(searchLower));

    return matchesRole && matchesSearch;
  });

  const roleCounts = {
    all: users.length,
    resident: users.filter(
      (u) =>
        u.role?.toLowerCase() === 'resident' ||
        u.role?.toLowerCase() === 'tenant'
    ).length,
    officer: users.filter((u) => u.role?.toLowerCase() === 'officer').length,
    technician: users.filter((u) => u.role?.toLowerCase() === 'technician').length,
    admin: users.filter((u) => u.role?.toLowerCase() === 'admin').length,
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <button
        onClick={() => navigate('/admin')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">User Management</h1>
            <p className="text-blue-100">Manage system users and their access levels</p>
          </div>
          <button
            onClick={() => {
              setFormData({
                name: '',
                email: '',
                role: '',
                phone: '',
                password: '',
              });
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add New User
          </button>
        </div>

        <div className="border-b border-blue-100 bg-blue-50 px-6 flex gap-4 overflow-x-auto">
          {[
            { key: 'all', label: 'All Users' },
            { key: 'resident', label: 'Residents' },
            { key: 'officer', label: 'Officers' },
            { key: 'technician', label: 'Technicians' },
            { key: 'admin', label: 'Administrators' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedRole(tab.key)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                selectedRole === tab.key
                  ? 'border-blue-600 text-blue-900'
                  : 'border-transparent text-blue-600 hover:text-blue-700'
              }`}
            >
              {tab.label}
              <span className="ml-2 px-2 py-0.5 bg-blue-200 text-blue-700 rounded-full text-xs">
                {roleCounts[tab.key as keyof typeof roleCounts] || 0}
              </span>
            </button>
          ))}
        </div>

        <div className="p-6 border-b border-blue-100 relative">
          <Search className="absolute left-9 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-11 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {errorMessage && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-200 text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-blue-600 font-medium">
              Loading users from database...
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-blue-50 border-b border-blue-100 text-xs font-medium text-blue-700 uppercase">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Join Date</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                            {user.name
                              ? user.name
                                  .split(' ')
                                  .map((n: string) => n[0])
                                  .join('')
                                  .substring(0, 2)
                                  .toUpperCase()
                              : '?'}
                          </div>
                          <span className="font-medium text-blue-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-blue-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                            user.role || ''
                          )}`}
                        >
                          {getRoleLabel(user.role || '')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-blue-700">{user.phone || '-'}</td>
                      <td className="px-6 py-4 text-blue-600 text-sm">
                        {user.joinDate
                          ? new Date(user.joinDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-blue-900">
                {showAddModal ? 'Add New User' : 'Edit User'}
              </h3>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={showAddModal ? handleAddUser : handleUpdateUser}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1 text-blue-900">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-blue-900">
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                />
              </div>

              {showAddModal && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-blue-900">
                    Password
                  </label>
                  <input
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  />
                </div>
              )}

              {showEditModal && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-blue-900">
                    New Password (optional)
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Leave blank to keep current password"
                    disabled={submitting}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1 text-blue-900">
                  Role
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                >
                  <option value="">Select a role</option>
                  <option value="resident">Resident</option>
                  <option value="officer">Juristic Officer</option>
                  <option value="technician">Technician</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-blue-900">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+66 XX-XXX-XXXX"
                  disabled={submitting}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {showAddModal
                    ? submitting
                      ? 'Creating...'
                      : 'Create User'
                    : submitting
                    ? 'Saving...'
                    : 'Save Changes'}
                </button>

                <button
                  type="button"
                  onClick={closeModals}
                  disabled={submitting}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}