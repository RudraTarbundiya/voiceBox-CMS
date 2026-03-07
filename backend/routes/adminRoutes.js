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

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// Dashboard stats
router.get('/stats', getAdminStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/faculty', getFacultyList);
router.get('/users/coordinators', getCoordinatorList);
router.patch('/users/:id/promote', promoteFacultyToCoordinator);
router.delete('/users/:id/sessions', forceLogoutUser);

// Complaint management
router.patch('/complaints/:id/assign', assignDepartment);
router.patch('/complaints/:id/close', closeComplaint);

export default router;
