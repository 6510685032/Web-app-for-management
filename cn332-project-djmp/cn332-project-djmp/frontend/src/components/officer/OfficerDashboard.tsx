import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import TopNavigation from '../shared/TopNavigation';
import OfficerHome from './OfficerHome';
import RequestManagement from './RequestManagement';
import TaskDispatch from './TaskDispatch';
import AnalyticsDashboard from './AnalyticsDashboard';

export default function OfficerDashboard() {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'officer') {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-blue-50">
      <TopNavigation />
      <Routes>
        <Route path="/" element={<OfficerHome />} />
        <Route path="/requests" element={<RequestManagement />} />
        <Route path="/dispatch" element={<TaskDispatch />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="*" element={<Navigate to="/officer" replace />} />
      </Routes>
    </div>
  );
}
