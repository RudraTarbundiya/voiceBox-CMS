/**
 * Axios API Configuration
 * Configured with credentials for session cookies
 */

import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true, // Essential for session cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor for logging (development only)
api.interceptors.request.use(
    (config) => {
        if (import.meta.env.DEV) {
            console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle common errors
        if (error.response?.status === 401) {
            // Clear any local state and redirect to login
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
