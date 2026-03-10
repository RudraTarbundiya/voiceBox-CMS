/**
 * Admin Routes
 * Handles admin-specific operations:
 * - Department assignment
 * - Faculty promotion
 * - Complaint closing
 * - Stats and user management
 */

import express from 'express';
import {
    assignDepartment,
    closeComplaint,
    promoteFacultyToCoordinator,
    getFacultyList,
    getCoordinatorList,
    getAdminStats,
    getAllUsers,
    forceLogoutUser
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import {
    objectIdParamSchema,
    adminAssignDepartmentSchema,
    adminCloseComplaintSchema,
    adminUserFilterQuerySchema,
    adminFacultyFilterQuerySchema
} from '../validators/schemas.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// Dashboard stats
router.get('/stats', getAdminStats);

// User management
router.get('/users', validateRequest({ query: adminUserFilterQuerySchema }), getAllUsers);
router.get('/users/faculty', validateRequest({ query: adminFacultyFilterQuerySchema }), getFacultyList);
router.get('/users/coordinators', getCoordinatorList);
router.patch('/users/:id/promote', validateRequest({ params: objectIdParamSchema }), promoteFacultyToCoordinator);
router.delete('/users/:id/sessions', validateRequest({ params: objectIdParamSchema }), forceLogoutUser);

// Complaint management
router.patch('/complaints/:id/assign', validateRequest({ params: objectIdParamSchema, body: adminAssignDepartmentSchema }), assignDepartment);
router.patch('/complaints/:id/close', validateRequest({ params: objectIdParamSchema, body: adminCloseComplaintSchema }), closeComplaint);

export default router;
