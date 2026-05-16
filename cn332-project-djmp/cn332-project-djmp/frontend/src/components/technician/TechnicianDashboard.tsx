import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import TopNavigation from '../shared/TopNavigation';
import TechnicianSidebar from './TechnicianSidebar';
import TechnicianHome from './TechnicianHome';
import MyTasks from './MyTasks';
import TaskDetail from './TaskDetail';
import ProfilePage from '../shared/ProfilePage';
import SettingsPage from '../shared/SettingsPage';

export default function TechnicianDashboard() {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'technician') {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="djmp-bg h-screen flex flex-col">
      <TopNavigation />
      <div className="flex flex-1 overflow-hidden">
        <TechnicianSidebar />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <Routes>
            <Route path="/" element={<TechnicianHome />} />
            <Route path="/tasks" element={<MyTasks />} />
            <Route path="/tasks/:id" element={<TaskDetail />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/technician" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
