import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import TopNavigation from '../shared/TopNavigation';
import AnnouncementModal from '../shared/AnnouncementModal';
import ResidentHome from './ResidentHome';
import MaintenanceRequestForm from './MaintenanceRequestForm';
import RequestTracking from './RequestTracking';
import RequestDetail from './RequestDetail';

export default function ResidentDashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'resident') {
      navigate('/');
    }
  }, [user, navigate]);

  const announcements = [
    {
      id: '1',
      title: 'Pool Maintenance Notice',
      message:
        'The swimming pool will be closed for maintenance on February 5-6, 2026. We apologize for any inconvenience.',
      type: 'info' as const,
      date: 'January 30, 2026',
      priority: 'medium' as const,
    },
    {
      id: '2',
      title: 'Road Closure Alert',
      message:
        'Main entrance road will be partially closed on February 1, 2026 from 9:00 AM to 3:00 PM for repairs. Please use the alternative entrance.',
      type: 'warning' as const,
      date: 'January 29, 2026',
      priority: 'high' as const,
    },
    {
      id: '3',
      title: 'Community Meeting',
      message:
        'Monthly community meeting scheduled for February 10, 2026 at 7:00 PM in the community hall. All residents are welcome to attend.',
      type: 'announcement' as const,
      date: 'January 28, 2026',
      priority: 'low' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      <TopNavigation />
      {showAnnouncement && (
        <AnnouncementModal announcements={announcements} onClose={() => setShowAnnouncement(false)} />
      )}
      <Routes>
        <Route path="/" element={<ResidentHome />} />
        <Route path="/new-request" element={<MaintenanceRequestForm />} />
        <Route path="/requests" element={<RequestTracking />} />
        <Route path="/requests/:id" element={<RequestDetail />} />
        <Route path="*" element={<Navigate to="/resident" replace />} />
      </Routes>
    </div>
  );
}
