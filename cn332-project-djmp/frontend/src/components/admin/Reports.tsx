import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Calendar, FileText, BarChart3, Users, Clock } from 'lucide-react';

export default function Reports() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({ from: '2026-01-01', to: '2026-01-31' });

  const reportTypes = [
    {
      id: 'maintenance',
      title: 'Maintenance Report',
      description: 'Comprehensive report of all maintenance requests and completions',
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      id: 'performance',
      title: 'Performance Report',
      description: 'Technician performance metrics and statistics',
      icon: BarChart3,
      color: 'bg-green-500',
    },
    {
      id: 'user-activity',
      title: 'User Activity Report',
      description: 'System usage and user engagement statistics',
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      id: 'response-time',
      title: 'Response Time Report',
      description: 'Average response and completion times analysis',
      icon: Clock,
      color: 'bg-orange-500',
    },
  ];

  const handleExportReport = (type: string, format: string) => {
    alert(`Exporting ${type} report as ${format}`);
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

      <div className="bg-white rounded-xl shadow-lg border border-blue-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Generate Reports</h1>
          <p className="text-blue-100">Export system data and analytics</p>
        </div>

        {/* Date Range Selection */}
        <div className="p-6 border-b border-blue-100 bg-blue-50">
          <h2 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Select Date Range
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">From Date</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">To Date</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Report Types */}
        <div className="p-6">
          <h2 className="font-semibold text-blue-900 mb-6">Available Reports</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              return (
                <div
                  key={report.id}
                  className="border-2 border-blue-200 rounded-xl p-6 hover:border-blue-400 transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 ${report.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 mb-1">{report.title}</h3>
                      <p className="text-sm text-blue-600">{report.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExportReport(report.id, 'PDF')}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export PDF
                    </button>
                    <button
                      onClick={() => handleExportReport(report.id, 'Excel')}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export Excel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-6 bg-blue-50 border-t border-blue-100">
          <h2 className="font-semibold text-blue-900 mb-4">Report Summary</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 mb-1">Total Requests</p>
              <p className="text-2xl font-bold text-blue-900">156</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">142</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 mb-1">Avg Response Time</p>
              <p className="text-2xl font-bold text-blue-900">2.5h</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 mb-1">Satisfaction Rate</p>
              <p className="text-2xl font-bold text-purple-600">94%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
