/**
 * Main Application Component
 * Defines routing and layout structure
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Student/Faculty Pages
import DashboardPage from './pages/student/DashboardPage';
import SubmitComplaintPage from './pages/student/SubmitComplaintPage';
import MyComplaintsPage from './pages/student/MyComplaintsPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

// Coordinator Pages
import CoordinatorDashboardPage from './pages/coordinator/CoordinatorDashboardPage';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';

/**
 * Main App Component
 */
function App() {
    const { loading } = useAuth();

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Student/Faculty Routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['student', 'faculty']}>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/complaints/new"
                element={
                    <ProtectedRoute allowedRoles={['student', 'faculty']}>
                        <SubmitComplaintPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/complaints/my"
                element={
                    <ProtectedRoute allowedRoles={['student', 'faculty']}>
                        <MyComplaintsPage />
                    </ProtectedRoute>
                }
            />

            {/* Admin Routes */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/*"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage />
                    </ProtectedRoute>
                }
            />

            {/* Coordinator Routes */}
            <Route
                path="/coordinator"
                element={
                    <ProtectedRoute allowedRoles={['coordinator']}>
                        <CoordinatorDashboardPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/coordinator/*"
                element={
                    <ProtectedRoute allowedRoles={['coordinator']}>
                        <CoordinatorDashboardPage />
                    </ProtectedRoute>
                }
            />

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* 404 - Redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

export default App;
