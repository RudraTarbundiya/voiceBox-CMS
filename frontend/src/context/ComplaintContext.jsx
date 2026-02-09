/**
 * Complaint Context
 * Manages complaints state and API operations
 */

import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAlert } from './AlertContext';

const ComplaintContext = createContext(null);

/**
 * Complaint Provider Component
 */
export const ComplaintProvider = ({ children }) => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0
    });
    const { showAlert } = useAlert();

    /**
     * Fetch user's own complaints
     */
    const fetchMyComplaints = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/complaints/my');
            if (response.data.success) {
                setComplaints(response.data.complaints);
                return response.data.complaints;
            }
        } catch (error) {
            showAlert('error', 'Failed to fetch complaints');
            return [];
        } finally {
            setLoading(false);
        }
    }, [showAlert]);

    /**
     * Fetch all complaints (admin only)
     */
    const fetchAllComplaints = useCallback(async (filters = {}) => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters).toString();
            const response = await api.get(`/complaints/all?${params}`);
            if (response.data.success) {
                setComplaints(response.data.complaints);
                setPagination({
                    page: response.data.page,
                    pages: response.data.pages,
                    total: response.data.total
                });
                return response.data.complaints;
            }
        } catch (error) {
            showAlert('error', 'Failed to fetch complaints');
            return [];
        } finally {
            setLoading(false);
        }
    }, [showAlert]);

    /**
     * Fetch department complaints (coordinator only)
     */
    const fetchDepartmentComplaints = useCallback(async (filters = {}) => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters).toString();
            const response = await api.get(`/complaints/department?${params}`);
            if (response.data.success) {
                setComplaints(response.data.complaints);
                setPagination({
                    page: response.data.page,
                    pages: response.data.pages,
                    total: response.data.total
                });
                return response.data.complaints;
            }
        } catch (error) {
            showAlert('error', 'Failed to fetch complaints');
            return [];
        } finally {
            setLoading(false);
        }
    }, [showAlert]);

    /**
     * Create new complaint
     */
    const createComplaint = useCallback(async (formData) => {
        setLoading(true);
        try {
            const response = await api.post('/complaints', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                showAlert('success', 'Complaint submitted successfully');
                return { success: true, complaint: response.data.complaint };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to submit complaint';
            showAlert('error', message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, [showAlert]);

    /**
     * Submit feedback for a complaint
     */
    const submitFeedback = useCallback(async (complaintId, rating, comment) => {
        try {
            const response = await api.post(`/complaints/${complaintId}/feedback`, {
                rating,
                comment
            });
            if (response.data.success) {
                showAlert('success', 'Feedback submitted successfully');
                // Update local state
                setComplaints(prev => prev.map(c =>
                    c._id === complaintId ? response.data.complaint : c
                ));
                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to submit feedback';
            showAlert('error', message);
            return { success: false, message };
        }
    }, [showAlert]);

    /**
     * Update complaint status (coordinator)
     */
    const updateStatus = useCallback(async (complaintId, status, note) => {
        try {
            const response = await api.patch(`/complaints/${complaintId}/status`, {
                status,
                note
            });
            if (response.data.success) {
                showAlert('success', `Status updated to ${status}`);
                setComplaints(prev => prev.map(c =>
                    c._id === complaintId ? response.data.complaint : c
                ));
                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update status';
            showAlert('error', message);
            return { success: false, message };
        }
    }, [showAlert]);

    /**
     * Assign department (admin)
     */
    const assignDepartment = useCallback(async (complaintId, department, note) => {
        try {
            const response = await api.patch(`/admin/complaints/${complaintId}/assign`, {
                department,
                note
            });
            if (response.data.success) {
                showAlert('success', `Assigned to ${department} department`);
                setComplaints(prev => prev.map(c =>
                    c._id === complaintId ? response.data.complaint : c
                ));
                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to assign department';
            showAlert('error', message);
            return { success: false, message };
        }
    }, [showAlert]);

    /**
     * Close complaint (admin)
     */
    const closeComplaint = useCallback(async (complaintId, note) => {
        try {
            const response = await api.patch(`/admin/complaints/${complaintId}/close`, { note });
            if (response.data.success) {
                showAlert('success', 'Complaint closed successfully');
                setComplaints(prev => prev.map(c =>
                    c._id === complaintId ? response.data.complaint : c
                ));
                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to close complaint';
            showAlert('error', message);
            return { success: false, message };
        }
    }, [showAlert]);

    const value = {
        complaints,
        loading,
        pagination,
        fetchMyComplaints,
        fetchAllComplaints,
        fetchDepartmentComplaints,
        createComplaint,
        submitFeedback,
        updateStatus,
        assignDepartment,
        closeComplaint
    };

    return (
        <ComplaintContext.Provider value={value}>
            {children}
        </ComplaintContext.Provider>
    );
};

/**
 * Custom hook to use complaint context
 */
export const useComplaints = () => {
    const context = useContext(ComplaintContext);
    if (!context) {
        throw new Error('useComplaints must be used within ComplaintProvider');
    }
    return context;
};

export default ComplaintContext;
