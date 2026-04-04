import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";
import { sanitizePayload } from '../utils/sanitize.js';

// Creating context
const AuthContext = createContext({
    user: null,
    loading: true,
    login: async () => { },
    register: async () => { },
    logout: async () => { },
    checkAuth: async () => { },
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const res = await api.get('/auth/me');
            if (res.data.success) {
                setUser(res.data.user);
                return res.data.user;
            } else {
                setUser(null);
                return null;
            }
        } catch (error) {
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (credentials) => {
        const safeCredentials = sanitizePayload(credentials);
        const res = await api.post('/auth/login', safeCredentials);
        if (res.data.success) {
            // Backend login only sets the session cookie, doesn't return user data
            // So we fetch the user profile from /auth/me
            const user = await checkAuth();
            return { ...res.data, user };
        }
        return res.data;
    };

    const register = async (userData) => {
        const safeUserData = sanitizePayload(userData);
        const res = await api.post('/auth/register', safeUserData);
        if (res.data.success) {
            const user = await checkAuth();
            return { ...res.data, user };
        }
        return res.data;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            setUser(null);
        }
    };

    const logoutAll = async () => {
        try {
            const res = await api.post('/auth/logout-all');
            return res.data;
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, logoutAll, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
