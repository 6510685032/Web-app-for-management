import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import StatusBadge from '../shared/StatusBadge';
import { Plus, FileText, CheckCircle, Clock, AlertTriangle, TrendingUp, Home } from 'lucide-react';

export default function ResidentHome() {
  const { user } = useUser();
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Requests', value: '12', icon: FileText, color: 'bg-blue-500' },
    { label: 'Completed', value: '8', icon: CheckCircle, color: 'bg-green-500' },
    { label: 'In Progress', value: '3', icon: Clock, color: 'bg-yellow-500' },
    { label: 'Pending', value: '1', icon: AlertTriangle, color: 'bg-orange-500' },
  ];

  const recentRequests = [
    {
      id: 'REQ-2026-001',
      category: 'Plumbing',
      description: 'Kitchen sink faucet leaking',
      status: 'in-progress' as const,
      date: '2026-01-28',
      technician: 'John Smith',
    },
    {
      id: 'REQ-2026-002',
      category: 'Electrical',
      description: 'Living room light fixture not working',
      status: 'completed' as const,
      date: '2026-01-25',
      technician: 'Maria Garcia',
    },
    {
      id: 'REQ-2026-003',
      category: 'Common Area',
      description: 'Elevator button stuck on 3rd floor',
      status: 'pending' as const,
      date: '2026-01-30',
      technician: '-',
    },
    {
      id: 'REQ-2026-004',
      category: 'Air Conditioning',
      description: 'AC unit making loud noise',
      status: 'in-progress' as const,
      date: '2026-01-27',
      technician: 'David Lee',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          Welcome back, {user?.name.split(' ')[0]}!
        </h1>
        <p className="text-blue-600">Manage your maintenance requests and track their progress</p>
        <div className="mt-2 flex items-center gap-2 text-blue-700">
          <Home className="w-5 h-5" />
          <span className="font-medium">{user?.unit}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => navigate('/resident/new-request')}
          className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition-colors shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-xl font-semibold mb-2">New Maintenance Request</h3>
              <p className="text-blue-100">Submit a new maintenance or repair request</p>
            </div>
            <Plus className="w-12 h-12 group-hover:scale-110 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => navigate('/resident/requests')}
          className="bg-white p-6 rounded-xl hover:bg-blue-50 transition-colors shadow-lg border border-blue-100 group"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Track My Requests</h3>
              <p className="text-blue-600">View all your maintenance requests</p>
            </div>
            <FileText className="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-blue-900 mb-1">{stat.value}</p>
              <p className="text-sm text-blue-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="p-6 border-b border-blue-100 bg-blue-50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-blue-900">Recent Maintenance Requests</h2>
              <p className="text-sm text-blue-600 mt-1">Track the status of your latest requests</p>
            </div>
            <button
              onClick={() => navigate('/resident/requests')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View All →
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50 border-b border-blue-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Technician
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {recentRequests.map((request) => (
                <tr
                  key={request.id}
                  onClick={() => navigate(`/resident/requests/${request.id}`)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-blue-900">{request.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-blue-700">{request.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-blue-600">{request.description}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-blue-700">{request.technician}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-blue-600">
                      {new Date(request.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Quick Tips</h3>
            <ul className="space-y-1 text-blue-100">
              <li>• Submit requests with detailed descriptions and photos for faster processing</li>
              <li>• Check your notifications regularly for updates on your requests</li>
              <li>• Approve completed work promptly to help us improve our service</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
