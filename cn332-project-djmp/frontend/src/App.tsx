import React, { useState, useEffect } from 'react';
import 'vite/modulepreload-polyfill';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import ResidentDashboard from './components/resident/ResidentDashboard';
import OfficerDashboard from './components/officer/OfficerDashboard';
import TechnicianDashboard from './components/technician/TechnicianDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import ProfilePage from './components/shared/ProfilePage';
import { UserProvider } from './context/UserContext';
import { NotificationProvider } from './context/NotificationContext';

export default function App() {
  return (
    <Router>
      <UserProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/resident/*" element={<ResidentDashboard />} />
            <Route path="/officer/*" element={<OfficerDashboard />} />
            <Route path="/technician/*" element={<TechnicianDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </NotificationProvider>
      </UserProvider>
    </Router>
  );
}
