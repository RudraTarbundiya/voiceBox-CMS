/**
 * Authentication Routes
 * Handles user registration, login, logout, and Google OAuth
 */

import express from 'express';
import {
    register,
    login,
    logout,
    logoutAll,
    getMe,
    googleAuth
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);

// Protected routes (require authentication)
router.post('/logout', authenticate, logout);
router.post('/logout-all', authenticate, logoutAll);
router.get('/me', authenticate, getMe);

export default router;

