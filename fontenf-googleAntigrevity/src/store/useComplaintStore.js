import { create } from 'zustand';
import api from '../api/axios';

export const useComplaintStore = create((set, get) => ({
    complaints: [],
    currentComplaint: null,
    loading: false,
    error: null,

    // Stats for Admin
    stats: null,

    fetchMyComplaints: async () => {
        set({ loading: true, error: null });
        try {
            const res = await api.get('/complaints/my');
            set({ complaints: res.data.complaints || [], loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to get complaints', loading: false });
        }
    },

    fetchAllComplaints: async (filters = {}) => {
        set({ loading: true, error: null });
        try {
            let queryString = Object.keys(filters).length
                ? '?' + new URLSearchParams(filters).toString()
                : '';

            const res = await api.get(`/complaints/all${queryString}`);
            set({ complaints: res.data.complaints || [], loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to get complaints', loading: false });
        }
    },

    fetchDepartmentComplaints: async (status = '') => {
        set({ loading: true, error: null });
        try {
            const res = await api.get(`/complaints/department${status ? `?status=${status}` : ''}`);
            set({ complaints: res.data.complaints || [], loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to get complaints', loading: false });
        }
    },

    getComplaintById: async (id) => {
        set({ loading: true, error: null });
        try {
            const res = await api.get(`/complaints/${id}`);
            set({ currentComplaint: res.data.complaint, loading: false });
            return res.data.complaint;
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to fetch complaint', loading: false });
            return null;
        }
    },

    createComplaint: async (formData) => {
        set({ loading: true, error: null });
        try {
            const res = await api.post('/complaints', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Optionally re-fetch after creating
            set({ loading: false });
            return res.data;
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to create complaint', loading: false });
            throw err;
        }
    },

    // State transitions (Coordinator/Admin)
    updateComplaintStatus: async (id, statusData) => {
        set({ loading: true, error: null });
        try {
            const endpoint = statusData.department
                ? `/admin/complaints/${id}/assign` // Admin assigning
                : statusData.note && statusData.status === 'CLOSED'
                    ? `/admin/complaints/${id}/close`  // Admin closing
                    : `/complaints/${id}/status`;      // Coordinator updating status

            const res = await api.patch(endpoint, statusData);
            set((state) => ({
                complaints: state.complaints.map(c => c._id === id ? { ...c, ...res.data.complaint } : c),
                currentComplaint: state.currentComplaint?._id === id ? res.data.complaint : state.currentComplaint,
                loading: false
            }));
            return res.data;
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to update status', loading: false });
            throw err;
        }
    },

    submitFeedback: async (id, feedbackData) => {
        set({ loading: true, error: null });
        try {
            const res = await api.post(`/complaints/${id}/feedback`, feedbackData);
            set((state) => ({
                currentComplaint: state.currentComplaint?._id === id ? { ...state.currentComplaint, feedback: feedbackData } : state.currentComplaint,
                loading: false
            }));
            return res.data;
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to submit feedback', loading: false });
            throw err;
        }
    },

    fetchStats: async () => {
        try {
            const res = await api.get('/admin/stats');
            set({ stats: res.data.stats });
        } catch (err) {
            console.error("Failed to load stats", err);
        }
    }

}));
