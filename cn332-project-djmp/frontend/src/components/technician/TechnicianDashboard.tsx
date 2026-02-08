import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import TopNavigation from '../shared/TopNavigation';
import TechnicianHome from './TechnicianHome';
import MyTasks from './MyTasks';
import TaskDetail from './TaskDetail';

export default function TechnicianDashboard() {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'technician') {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-blue-50">
      <TopNavigation />
      <Routes>
        <Route path="/" element={<TechnicianHome />} />
        <Route path="/tasks" element={<MyTasks />} />
        <Route path="/tasks/:id" element={<TaskDetail />} />
        <Route path="*" element={<Navigate to="/technician" replace />} />
      </Routes>
    </div>
  );
}
