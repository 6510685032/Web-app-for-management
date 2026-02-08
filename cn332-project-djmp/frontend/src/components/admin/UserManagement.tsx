import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Edit2, Trash2, UserCheck, X } from 'lucide-react';

export default function UserManagement() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const users = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      role: 'resident',
      unit: 'A-205',
      phone: '+66 81-234-5678',
      status: 'active',
      joinDate: '2023-01-15',
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.c@email.com',
      role: 'officer',
      phone: '+66 82-345-6789',
      status: 'active',
      joinDate: '2022-06-01',
    },
    {
      id: '3',
      name: 'John Smith',
      email: 'john.s@email.com',
      role: 'technician',
      specialty: 'Plumbing',
      phone: '+66 85-123-4567',
      status: 'active',
      joinDate: '2022-09-10',
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.d@email.com',
      role: 'resident',
      unit: 'C-308',
      phone: '+66 81-987-6543',
      status: 'active',
      joinDate: '2023-03-20',
    },
    {
      id: '5',
      name: 'Jessica Williams',
      email: 'jessica.w@email.com',
      role: 'admin',
      phone: '+66 84-567-8901',
      status: 'active',
      joinDate: '2021-03-20',
    },
  ];

  const filteredUsers = selectedRole === 'all' ? users : users.filter((u) => u.role === selectedRole);

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
        return 'Administrator';
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

  const roleCounts = {
    all: users.length,
    resident: users.filter((u) => u.role === 'resident').length,
    officer: users.filter((u) => u.role === 'officer').length,
    technician: users.filter((u) => u.role === 'technician').length,
    admin: users.filter((u) => u.role === 'admin').length,
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <button
        onClick={() => navigate('/admin')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2">User Management</h1>
              <p className="text-blue-100">Manage system users and their access levels</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New User
            </button>
          </div>
        </div>

        {/* Role Filter Tabs */}
        <div className="border-b border-blue-100 bg-blue-50 px-6">
          <div className="flex gap-4 overflow-x-auto">
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
                  {roleCounts[tab.key as keyof typeof roleCounts]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-blue-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
            <input
              type="text"
              placeholder="Search by name, email, or unit..."
              className="w-full pl-11 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50 border-b border-blue-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100 bg-white">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-blue-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-blue-600">{user.email}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-blue-700 text-sm">
                      {user.role === 'resident' && user.unit ? `Unit ${user.unit}` : ''}
                      {user.role === 'technician' && user.specialty ? user.specialty : ''}
                      {(user.role === 'officer' || user.role === 'admin') && user.phone}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-blue-600 text-sm">
                      {new Date(user.joinDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-blue-900">Add New User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-blue-400 hover:text-blue-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john.doe@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">Role</label>
                <select className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select a role</option>
                  <option value="resident">Resident</option>
                  <option value="officer">Juristic Officer</option>
                  <option value="technician">Technician</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+66 XX-XXX-XXXX"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Add User
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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
