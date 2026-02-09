/**
 * Session Model
 * Handles user sessions with TTL (Time To Live) auto-expiry
 * Max 2 active sessions per user
 * Sessions expire after 7 days
 */

import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    userAgent: {
        type: String,
        default: ''
    },
    ipAddress: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true,
        // TTL index - MongoDB will automatically delete documents after this date
        index: { expireAfterSeconds: 0 }
    }
});

/**
 * Static method to create a new session with max 2 sessions enforcement
 * If user already has 2 sessions, the oldest one is deleted
 * @param {string} sessionId - Unique session identifier (UUID)
 * @param {ObjectId} userId - User's MongoDB ObjectId
 * @param {string} userAgent - Browser user agent string
 * @param {string} ipAddress - Client IP address
 * @returns {Session} - Newly created session document
 */
sessionSchema.statics.createSession = async function (sessionId, userId, userAgent = '', ipAddress = '') {
    // Calculate expiration date (7 days from now)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Find all existing sessions for this user, sorted by creation date (oldest first)
    const existingSessions = await this.find({ userId }).sort({ createdAt: 1 });

    // If user has 2 or more sessions, delete the oldest one(s)
    if (existingSessions.length >= 2) {
        // Delete oldest session(s) to maintain max 2 sessions
        const sessionsToDelete = existingSessions.slice(0, existingSessions.length - 1);
        await this.deleteMany({ _id: { $in: sessionsToDelete.map(s => s._id) } });
        console.log(`🗑️ Deleted ${sessionsToDelete.length} old session(s) for user ${userId}`);
    }

    // Create new session
    const session = await this.create({
        sessionId,
        userId,
        userAgent,
        ipAddress,
        expiresAt
    });

    return session;
};

/**
 * Static method to validate a session
 * @param {string} sessionId - Session ID to validate
 * @returns {Session|null} - Session document if valid, null otherwise
 */
sessionSchema.statics.validateSession = async function (sessionId) {
    const session = await this.findOne({
        sessionId,
        expiresAt: { $gt: new Date() } // Check if not expired
    }).populate('userId');

    return session;
};

/**
 * Static method to delete a session (logout)
 * @param {string} sessionId - Session ID to delete
 */
sessionSchema.statics.deleteSession = async function (sessionId) {
    await this.deleteOne({ sessionId });
};

/**
 * Static method to delete all sessions for a user
 * @param {ObjectId} userId - User ID to clear sessions for
 */
sessionSchema.statics.clearUserSessions = async function (userId) {
    await this.deleteMany({ userId });
};

const Session = mongoose.model('Session', sessionSchema);

export default Session;
