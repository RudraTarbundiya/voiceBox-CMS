/**
 * Authentication Middleware
 * Validates session cookie and attaches user to request
 * Uses signed HTTP-only cookies for security
 */

import Session from '../models/Session.js';

/**
 * Middleware to authenticate user via session cookie
 * Reads signed cookie, validates session in DB, attaches req.user
 */
export const authenticate = async (req, res, next) => {
    try {
        // Get session ID from signed cookie
        const sessionId = req.signedCookies.sessionId;

        if (!sessionId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated. Please login.'
            });
        }

        // Validate session from database
        const session = await Session.validateSession(sessionId);

        if (!session || !session.userId) {
            // Clear invalid cookie
            res.clearCookie('sessionId');
            return res.status(401).json({
                success: false,
                message: 'Session expired or invalid. Please login again.'
            });
        }

        // Attach user to request (populated from session)
        req.user = session.userId;
        req.sessionId = sessionId;

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

/**
 * Optional authentication middleware
 * Attaches user if session exists, but doesn't block if not
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const sessionId = req.signedCookies.sessionId;

        if (sessionId) {
            const session = await Session.validateSession(sessionId);
            if (session && session.userId) {
                req.user = session.userId;
                req.sessionId = sessionId;
            }
        }

        next();
    } catch (error) {
        // Continue without user
        next();
    }
};

export default authenticate;
