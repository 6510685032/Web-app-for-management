import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import TopNavigation from '../shared/TopNavigation';
import AnnouncementModal from '../shared/AnnouncementModal';
import ResidentHome from './ResidentHome';
import MaintenanceRequestForm from './MaintenanceRequestForm';
import RequestTracking from './RequestTracking';
import RequestDetail from './RequestDetail';
import api from '../../utils/api';

export default function ResidentDashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'resident') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await api.get('/announcements/');
        const data = Array.isArray(response.data) ? response.data : [];
        if (data.length > 0) {
          setAnnouncements(data);
          setShowAnnouncement(true);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <div className="min-h-screen bg-blue-50">
      <TopNavigation />
      {showAnnouncement && announcements.length > 0 && (
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
