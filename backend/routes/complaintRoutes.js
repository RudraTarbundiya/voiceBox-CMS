/**
 * Complaint Routes
 * Handles complaint CRUD operations, file uploads, and feedback
 */

import express from 'express';
import {
    createComplaint,
    getMyComplaints,
    getAllComplaints,
    getDepartmentComplaints,
    getComplaintById,
    updateComplaintStatus,
    submitFeedback,
    downloadAttachment
} from '../controllers/complaintController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole, requireAdmin, requireCoordinator } from '../middleware/roleMiddleware.js';
import { uploadComplaintFiles, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create complaint with file upload (student/faculty only)
router.post(
    '/',
    requireRole('student', 'faculty'),
    uploadComplaintFiles,
    handleUploadError,
    createComplaint
);

// Get current user's complaints
router.get('/my', getMyComplaints);

// Get all complaints (admin only)
router.get('/all', requireAdmin, getAllComplaints);

// Get department complaints (coordinator only)
router.get('/department', requireCoordinator, getDepartmentComplaints);

// Get single complaint by ID
router.get('/:id', getComplaintById);

// Update complaint status (coordinator only)
router.patch(
    '/:id/status',
    requireCoordinator,
    updateComplaintStatus
);

// Submit feedback (complaint owner only)
router.post('/:id/feedback', submitFeedback);

// Download attachment
router.get('/:id/attachments/:filename', downloadAttachment);

export default router;
