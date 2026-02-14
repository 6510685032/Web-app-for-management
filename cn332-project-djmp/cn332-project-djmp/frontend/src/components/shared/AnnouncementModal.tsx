import React from 'react';
import { X, AlertTriangle, Info, CheckCircle, Megaphone } from 'lucide-react';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'announcement';
  date: string;
  priority: 'high' | 'medium' | 'low';
}

interface AnnouncementModalProps {
  announcements: Announcement[];
  onClose: () => void;
}

export default function AnnouncementModal({ announcements, onClose }: AnnouncementModalProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'announcement':
        return <Megaphone className="w-6 h-6 text-blue-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-yellow-200';
      case 'success':
        return 'border-green-200';
      case 'announcement':
        return 'border-blue-200';
      default:
        return 'border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold mb-2">Important Announcements</h2>
          <p className="text-blue-100">Please review the following updates</p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`border-l-4 ${getBorderColor(announcement.type)} bg-white p-4 rounded-r-lg shadow-sm`}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">{getIcon(announcement.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-blue-900">{announcement.title}</h3>
                      {announcement.priority === 'high' && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full whitespace-nowrap">
                          High Priority
                        </span>
                      )}
                    </div>
                    <p className="text-blue-700 mb-2">{announcement.message}</p>
                    <p className="text-sm text-blue-500">Posted on {announcement.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-blue-50 border-t border-blue-100">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
