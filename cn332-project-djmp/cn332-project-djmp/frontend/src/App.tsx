import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "./components/auth/LoginPage";
import ProfilePage from "./components/shared/ProfilePage";
import ProtectedRoute from "./components/shared/ProtectedRoute";

import { UserProvider } from "./context/UserContext";
import { NotificationProvider } from "./context/NotificationContext";

const ResidentDashboard = lazy(() => import("./components/resident/ResidentDashboard"));
const OfficerDashboard = lazy(() => import("./components/officer/OfficerDashboard"));
const TechnicianDashboard = lazy(() => import("./components/technician/TechnicianDashboard"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));

function NotFoundPage() {
  return <div>404 Not Found</div>;
}

function PageLoader() {
  return <div>Loading...</div>;
}

export default function App() {
  return (
    <Router>
      <UserProvider>
        <NotificationProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LoginPage />} />

              <Route
                path="/resident/*"
                element={
                  <ProtectedRoute allowedRoles={["resident"]}>
                    <ResidentDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/officer/*"
                element={
                  <ProtectedRoute allowedRoles={["officer", "admin"]}>
                    <OfficerDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/technician/*"
                element={
                  <ProtectedRoute allowedRoles={["technician"]}>
                    <TechnicianDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute
                    allowedRoles={["resident", "officer", "technician", "admin"]}
                  >
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </NotificationProvider>
      </UserProvider>
    </Router>
  );
}