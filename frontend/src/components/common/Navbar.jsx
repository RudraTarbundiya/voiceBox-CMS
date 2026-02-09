/**
 * Navbar Component
 * Main navigation bar with user menu and role-based links
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Get dashboard link based on role
    const getDashboardLink = () => {
        if (!user) return '/login';
        switch (user.role) {
            case ROLES.ADMIN:
                return '/admin';
            case ROLES.COORDINATOR:
                return '/coordinator';
            default:
                return '/dashboard';
        }
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">C</span>
                            </div>
                            <span className="font-semibold text-gray-900 text-lg hidden sm:block">
                                CMS
                            </span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    {isAuthenticated && (
                        <div className="hidden md:flex items-center space-x-4">
                            <Link
                                to={getDashboardLink()}
                                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                            >
                                Dashboard
                            </Link>

                            {(user?.role === ROLES.STUDENT || user?.role === ROLES.FACULTY) && (
                                <>
                                    <Link
                                        to="/complaints/new"
                                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                                    >
                                        Submit Complaint
                                    </Link>
                                    <Link
                                        to="/complaints/my"
                                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                                    >
                                        My Complaints
                                    </Link>
                                </>
                            )}
                        </div>
                    )}

                    {/* User Menu */}
                    <div className="flex items-center">
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-medium text-sm">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 animate-fade-in">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                            <p className="text-xs text-primary-600 capitalize mt-1">
                                                {user?.role} • {user?.department}
                                            </p>
                                        </div>

                                        <div className="md:hidden py-1">
                                            <Link
                                                to={getDashboardLink()}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Dashboard
                                            </Link>
                                            {(user?.role === ROLES.STUDENT || user?.role === ROLES.FACULTY) && (
                                                <>
                                                    <Link
                                                        to="/complaints/new"
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                        onClick={() => setIsMenuOpen(false)}
                                                    >
                                                        Submit Complaint
                                                    </Link>
                                                    <Link
                                                        to="/complaints/my"
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                        onClick={() => setIsMenuOpen(false)}
                                                    >
                                                        My Complaints
                                                    </Link>
                                                </>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login" className="btn-secondary">
                                    Sign in
                                </Link>
                                <Link to="/register" className="btn-primary">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Click outside to close menu */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
        </nav>
    );
};

export default Navbar;
