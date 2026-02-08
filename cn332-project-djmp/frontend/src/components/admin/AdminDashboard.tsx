import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import TopNavigation from '../shared/TopNavigation';
import AdminHome from './AdminHome';
import UserManagement from './UserManagement';
import SystemSettings from './SystemSettings';
import Reports from './Reports';

export default function AdminDashboard() {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-blue-50">
      <TopNavigation />
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/settings" element={<SystemSettings />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </div>
  );
}
