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
import { validateRequest } from '../middleware/validateMiddleware.js';
import {
    objectIdParamSchema,
    attachmentParamSchema,
    complaintCreateSchema,
    complaintFeedbackSchema,
    complaintStatusUpdateSchema,
    complaintListQuerySchema,
    departmentComplaintQuerySchema
} from '../validators/schemas.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create complaint with file upload (student/faculty only)
router.post(
    '/',
    requireRole('student', 'faculty'),
    uploadComplaintFiles,
    handleUploadError,
    validateRequest({ body: complaintCreateSchema }),
    createComplaint
);

// Get current user's complaints
router.get('/my', getMyComplaints);

// Get all complaints (admin only)
router.get('/all', requireAdmin, validateRequest({ query: complaintListQuerySchema }), getAllComplaints);

// Get department complaints (coordinator only)
router.get('/department', requireCoordinator, validateRequest({ query: departmentComplaintQuerySchema }), getDepartmentComplaints);

// Get single complaint by ID
router.get('/:id', validateRequest({ params: objectIdParamSchema }), getComplaintById);

// Update complaint status (coordinator only)
router.patch(
    '/:id/status',
    requireCoordinator,
    validateRequest({ params: objectIdParamSchema, body: complaintStatusUpdateSchema }),
    updateComplaintStatus
);

// Submit feedback (complaint owner only)
router.post('/:id/feedback', validateRequest({ params: objectIdParamSchema, body: complaintFeedbackSchema }), submitFeedback);

// Download attachment
router.get('/:id/attachments/:filename', validateRequest({ params: attachmentParamSchema }), downloadAttachment);

export default router;
