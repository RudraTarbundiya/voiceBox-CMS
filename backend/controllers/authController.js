/**
 * Authentication Controller
 * Handles user registration, login, logout, and Google OAuth
 * Uses session-based authentication with signed HTTP-only cookies
 */

import User from '../models/User.js';
import Session from '../models/Session.js';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Cookie options for session
const cookieOptions = {
    httpOnly: true,     // Prevent XSS attacks
    signed: true,       // Sign cookie with secret
    sameSite: 'lax',   // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: process.env.NODE_ENV === 'production' // HTTPS only in production
};

/**
 * Register a new user
 * Only student and faculty can self-register
 * POST /api/auth/register
 */
export const register = async (req, res) => {
    try {
        const { name, email, password, role, department } = req.body;

        // Validate required fields
        if (!name || !email || !password || !department) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, password, and department'
            });
        }

        // Only allow student and faculty self-registration
        if (role && !['student', 'faculty'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Only student and faculty can self-register'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create new user (password hashed by pre-save hook)
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            role: role || 'student',
            department
        });

        // Create session for auto-login after registration
        const sessionId = uuidv4();
        await Session.createSession(
            sessionId,
            user._id,
            req.headers['user-agent'],
            req.ip
        );

        // Set session cookie
        res.cookie('sessionId', sessionId, cookieOptions);

        // Return user without password
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });

    } catch (error) {
        console.error('Register Error:', error);

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

/**
 * Login user with email and password
 * POST /api/auth/login
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user with password (select: false by default)
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Create session (handles max 2 sessions automatically)
        const sessionId = uuidv4();
        await Session.createSession(
            sessionId,
            user._id,
            req.headers['user-agent'],
            req.ip
        );

        // Set session cookie
        res.cookie('sessionId', sessionId, cookieOptions);

        console.log(`✅ User logged in: ${user.email}`);

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

/**
 * Logout user - delete session from DB
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
    try {
        const sessionId = req.signedCookies.sessionId;

        if (sessionId) {
            // Delete session from database
            await Session.deleteSession(sessionId);
            console.log(`🚪 Session deleted: ${sessionId.substring(0, 8)}...`);
        }

        // Clear cookie
        res.clearCookie('sessionId');

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
};

/**
 * Logout from all devices - delete all sessions for user
 * POST /api/auth/logout-all
 */
export const logoutAll = async (req, res) => {
    try {
        const userId = req.user._id;

        // Delete all sessions for this user
        const result = await Session.deleteMany({ userId });

        console.log(`🚪 All sessions deleted for user: ${req.user.email} (${result.deletedCount} sessions)`);

        // Clear cookie
        res.clearCookie('sessionId');

        res.json({
            success: true,
            message: `Logged out from ${result.deletedCount} device(s) successfully`
        });

    } catch (error) {
        console.error('Logout All Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
};


/**
 * Get current user info
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
    try {
        // req.user is attached by auth middleware
        res.json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                department: req.user.department
            }
        });

    } catch (error) {
        console.error('GetMe Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * Google OAuth callback
 * Handles Google ID token verification and user creation/login
 * POST /api/auth/google
 */
export const googleAuth = async (req, res) => {
    try {
        const { credential, department, role } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: 'Google credential is required'
            });
        }

        // Verify Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Check if user exists by Google ID or email
        let user = await User.findOne({
            $or: [{ googleId }, { email: email.toLowerCase() }]
        });

        if (user) {
            // Update Google ID if not set
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            // New user - department is required for Google signup
            if (!department) {
                return res.status(400).json({
                    success: false,
                    message: 'Department is required for new users',
                    requiresInfo: true
                });
            }

            // Only allow student and faculty self-registration
            if (role && !['student', 'faculty'].includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Only student and faculty can self-register'
                });
            }

            // Create new user (no password for Google users)
            user = await User.create({
                name,
                email: email.toLowerCase(),
                password: uuidv4(), // Random password (won't be used)
                role: role || 'student',
                department,
                googleId
            });
        }

        // Create session
        const sessionId = uuidv4();
        await Session.createSession(
            sessionId,
            user._id,
            req.headers['user-agent'],
            req.ip
        );

        // Set session cookie
        res.cookie('sessionId', sessionId, cookieOptions);

        console.log(`✅ Google user logged in: ${user.email}`);

        res.json({
            success: true,
            message: 'Google login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({
            success: false,
            message: 'Google authentication failed'
        });
    }
};
