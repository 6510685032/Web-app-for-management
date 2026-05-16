import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TopNavigation from '../shared/TopNavigation';
import AdminHome from './AdminHome';
import UserManagement from './UserManagement';
import SystemSettings from './SystemSettings';
import Reports from './Reports';
import ProfilePage from '../shared/ProfilePage';
import SettingsPage from '../shared/SettingsPage';

export default function AdminDashboard() {
  // ไม่ต้องเช็คสิทธิ์ตรงนี้แล้ว เพราะ ProtectedRoute ใน App.tsx จัดการให้แล้วแบบ 100%

  return (
    <div className="djmp-bg">
      <TopNavigation />
      
      {/* พื้นที่แสดงเนื้อหาที่จะเปลี่ยนไปตาม URL ด้านบน */}
      <div className="p-6">
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/settings" element={<SystemSettings />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/user-settings" element={<SettingsPage />} />
          
          {/* ถ้าพิมพ์ URL มั่วๆ ในฝั่ง admin ให้เด้งกลับมาหน้าแรกของ admin */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
}