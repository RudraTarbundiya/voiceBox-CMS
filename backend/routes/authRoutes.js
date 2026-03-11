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
    googleAuth,
    sendOtp
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import {
    registerSchema,
    loginSchema,
    googleAuthSchema,
    sendOtpSchema
} from '../validators/schemas.js';

const router = express.Router();

// Public routes
router.post('/send-otp', validateRequest({ body: sendOtpSchema }), sendOtp);
router.post('/register', validateRequest({ body: registerSchema }), register);
router.post('/login', validateRequest({ body: loginSchema }), login);
router.post('/google', validateRequest({ body: googleAuthSchema }), googleAuth);

// Protected routes (require authentication)
router.post('/logout', authenticate, logout);
router.post('/logout-all', authenticate, logoutAll);
router.get('/me', authenticate, getMe);

export default router;

