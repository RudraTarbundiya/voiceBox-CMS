/**
 * Complaint Management System - Backend Server
 * 
 * Express server with:
 * - Session-based authentication (signed HTTP-only cookies)
 * - Role-based access control
 * - File upload support
 * - CORS with credentials
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import csrf from 'csurf';

// Import database connection
import connectDB from './config/db.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import cloudinaryRoutes from './routes/cloudinaryRoutes.js';
import { sanitizeRequestData } from './middleware/sanitizeMiddleware.js';

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// ==================== MIDDLEWARE ====================

// CORS configuration - allow frontend with credentials
const frontendUrl1 = process.env.FRONTEND_URL1 || 'http://localhost:5173';
const frontendUrl2 = process.env.FRONTEND_URL2 || 'http://localhost:5174';
const isProduction = process.env.NODE_ENV === 'production';

const csrfProtection = csrf({
    cookie: {
        key: '_csrf',
        httpOnly: true,
        signed: true,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction
    }
});

app.use(cors({
    origin: [frontendUrl1, frontendUrl2].filter(Boolean), // Filter out any undefined URLs
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Security headers + CSP to reduce XSS and data injection risks
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            baseUri: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            formAction: ["'self'"],
            connectSrc: ["'self'", frontendUrl1, frontendUrl2].filter(Boolean),
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com'],
            fontSrc: ["'self'", 'data:']
        }
    }
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Prevent MongoDB operator injection payloads like $ne and $gt.
app.use(mongoSanitize({ replaceWith: '_' }));

// Strip HTML/script payloads from request data.
app.use(sanitizeRequestData);

// Cookie parser with secret for signed cookies
app.use(cookieParser(process.env.COOKIE_SECRET || 'your_super_secret_cookie_key'));

// CSRF protection for state-changing requests
app.use(csrfProtection);

// ==================== ROUTES ====================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Complaint Management System API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`🔗 Frontend: ${process.env.FRONTEND_URL1 || 'http://localhost:5173'}`);
    console.log(`🔗 Frontend: ${process.env.FRONTEND_URL2}`);
    console.log('═══════════════════════════════════════════════════');
});

export default app;
