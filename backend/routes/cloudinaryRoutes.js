/**
 * Cloudinary Routes
 * Handles upload signature generation and signed URL creation.
 * All routes require authentication.
 */

import express from 'express';
import { generateSignature, generateSignedUrl } from '../controllers/cloudinaryController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Generate upload signature (for frontend direct upload to Cloudinary)
router.post('/signature', generateSignature);

// Generate a temporary signed URL for viewing/downloading private files
router.post('/signed-url', generateSignedUrl);

export default router;
