import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import TopNavigation from '../shared/TopNavigation';
import OfficerHome from './OfficerHome';
import RequestManagement from './RequestManagement';
import TaskDispatch from './TaskDispatch';
import AnalyticsDashboard from './AnalyticsDashboard';
import KanbanBoard from './KanbanBoard';
import TechnicianSchedule from './TechnicianSchedule';

export default function OfficerDashboard() {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || (user.role !== 'officer' && user.role !== 'admin')) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="djmp-bg">
      <TopNavigation />
      <Routes>
        <Route path="/" element={<OfficerHome />} />
        <Route path="/requests" element={<RequestManagement />} />
        <Route path="/dispatch" element={<TaskDispatch />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/kanban" element={<KanbanBoard />} />
        <Route path="/schedule" element={<TechnicianSchedule />} />
        <Route path="*" element={<Navigate to="/officer" replace />} />
      </Routes>
    </div>
  );
}
