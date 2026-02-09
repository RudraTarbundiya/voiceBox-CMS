/**
 * Authentication Context
 * Manages user authentication state and session
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAlert } from './AlertContext';

// Create context
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * Wraps app and provides auth state and methods
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showAlert } = useAlert();

    /**
     * Check current session on mount
     */
    const checkAuth = useCallback(async () => {
        try {
            const response = await api.get('/auth/me');
            if (response.data.success) {
                setUser(response.data.user);
            }
        } catch (error) {
            // Not logged in - clear user
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Check auth on mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    /**
     * Register new user
     */
    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            if (response.data.success) {
                setUser(response.data.user);
                showAlert('success', 'Registration successful! Welcome aboard.');
                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            showAlert('error', message);
            return { success: false, message };
        }
    };

    /**
     * Login with email and password
     */
    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.success) {
                setUser(response.data.user);
                showAlert('success', `Welcome back, ${response.data.user.name}!`);
                return { success: true, user: response.data.user };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            showAlert('error', message);
            return { success: false, message };
        }
    };

    /**
     * Google OAuth login
     */
    const googleLogin = async (credential, additionalData = {}) => {
        try {
            const response = await api.post('/auth/google', {
                credential,
                ...additionalData
            });

            if (response.data.success) {
                setUser(response.data.user);
                showAlert('success', `Welcome, ${response.data.user.name}!`);
                return { success: true, user: response.data.user };
            }
        } catch (error) {
            // Check if we need additional info
            if (error.response?.data?.requiresInfo) {
                return {
                    success: false,
                    requiresInfo: true,
                    message: error.response.data.message
                };
            }
            const message = error.response?.data?.message || 'Google login failed';
            showAlert('error', message);
            return { success: false, message };
        }
    };

    /**
     * Logout user
     */
    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            showAlert('success', 'Logged out successfully');
            return { success: true };
        } catch (error) {
            // Clear user even if API fails
            setUser(null);
            return { success: true };
        }
    };

    /**
     * Logout from all devices
     */
    const logoutAll = async () => {
        try {
            const response = await api.post('/auth/logout-all');
            setUser(null);
            showAlert('success', response.data.message || 'Logged out from all devices');
            return { success: true };
        } catch (error) {
            // Clear user even if API fails
            setUser(null);
            showAlert('success', 'Logged out from all devices');
            return { success: true };
        }
    };

    /**
     * Check if user has specific role
     */
    const hasRole = (roles) => {
        if (!user) return false;
        if (Array.isArray(roles)) {
            return roles.includes(user.role);
        }
        return user.role === roles;
    };

    /**
     * Check if user is authenticated
     */
    const isAuthenticated = !!user;

    const value = {
        user,
        loading,
        isAuthenticated,
        register,
        login,
        googleLogin,
        logout,
        logoutAll,
        hasRole,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;
