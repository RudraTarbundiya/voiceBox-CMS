import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RootLayout from './components/layout/RootLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Lazy loading pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));

const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const SubmitComplaint = lazy(() => import('./pages/student/SubmitComplaint'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const CoordinatorDashboard = lazy(() => import('./pages/coordinator/CoordinatorDashboard'));

import { LoadingAnimation } from './components/ui/LoadingAnimation';

const Loader = () => <LoadingAnimation fullScreen={true} />;

function App() {
  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Unauthenticated / Public Routes */}
          <Route element={<RootLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Authenticated Dashboard Routes */}
          <Route element={<DashboardLayout />}>

            {/* Student & Faculty Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student', 'faculty']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complaints/new"
              element={
                <ProtectedRoute allowedRoles={['student', 'faculty']}>
                  <SubmitComplaint />
                </ProtectedRoute>
              }
            />

            {/* Coordinator Routes */}
            <Route
              path="/coordinator"
              element={
                <ProtectedRoute allowedRoles={['coordinator']}>
                  <CoordinatorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            {/* Fallback to keep users within dashboard */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div className="p-8"><h1 className="text-3xl font-bold">User Management</h1><p>Coming Soon</p></div>
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
