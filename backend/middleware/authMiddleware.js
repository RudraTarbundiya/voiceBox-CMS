/**
 * Authentication Middleware
 * Validates session cookie and attaches user to request
 * Uses signed HTTP-only cookies for security
 */

import Session from '../models/Session.js';

const isProduction = process.env.NODE_ENV === 'production';
const clearCookieOptions = {
    httpOnly: true,
    signed: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction
};

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
            res.clearCookie('sessionId', clearCookieOptions);
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
        next(error);
    }
};

export default authenticate;