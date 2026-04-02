/**
 * Admin Controller
 * Handles admin-specific operations:
 * - Assign department to complaints
 * - Promote faculty to coordinator
 * - Close complaints after feedback
 * - Get all users/faculty list
 */

import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import Session from '../models/Session.js';

/**
 * Assign department to a complaint
 * Changes status from NEW to ASSIGNED
 * PATCH /api/admin/complaints/:id/assign
 * Allowed: admin only
 */
export const assignDepartment = async (req, res , next) => {
    try {
        const { department, note } = req.body;

        if (!department) {
            return res.status(400).json({
                success: false,
                message: 'Department is required'
            });
        }

        // Validate department
        const validDepartments = ['CE', 'IT', 'EC'];
        if (!validDepartments.includes(department)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid department. Must be CE, IT, or EC'
            });
        }

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Only NEW complaints can be assigned
        if (complaint.status !== 'NEW') {
            return res.status(400).json({
                success: false,
                message: `Cannot assign department. Complaint is already ${complaint.status}`
            });
        }

        // Update complaint
        complaint.assignedDepartment = department;
        complaint.status = 'ASSIGNED';
        complaint.statusHistory.push({
            status: 'ASSIGNED',
            changedBy: req.user._id,
            changedAt: new Date(),
            note: note || `Assigned to ${department} department`
        });

        await complaint.save();
        await complaint.populate('createdBy', 'name email department');

        console.log(`🏷️ Complaint ${complaint._id} assigned to ${department}`);

        res.json({
            success: true,
            message: `Complaint assigned to ${department} department`
        });

    } catch (error) {
        console.error('Assign Department Error:', error);
        next(error);
    }
};

/**
 * Close a complaint (only after feedback is submitted)
 * PATCH /api/admin/complaints/:id/close
 * Allowed: admin only
 */
export const closeComplaint = async (req, res,next) => {
    try {
        const { note } = req.body;

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Check if complaint is resolved
        if (complaint.status !== 'RESOLVED') {
            return res.status(400).json({
                success: false,
                message: 'Only resolved complaints can be closed'
            });
        }

        // Check if feedback exists
        if (!complaint.feedback) {
            return res.status(400).json({
                success: false,
                message: 'Feedback must be submitted before closing the complaint'
            });
        }

        // Close complaint
        complaint.status = 'CLOSED';
        complaint.statusHistory.push({
            status: 'CLOSED',
            changedBy: req.user._id,
            changedAt: new Date(),
            note: note || 'Complaint closed by admin'
        });

        await complaint.save();
        await complaint.populate('createdBy', 'name email department');

        console.log(`✅ Complaint ${complaint._id} closed`);

        res.json({
            success: true,
            message: 'Complaint closed successfully',
        });

    } catch (error) {
        console.error('Close Complaint Error:', error);
        next(error);
    }
};

/**
 * Promote faculty to coordinator
 * PATCH /api/admin/users/:id/promote
 * Allowed: admin only
 */
export const promoteFacultyToCoordinator = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Only faculty can be promoted
        if (user.role !== 'faculty') {
            return res.status(400).json({
                success: false,
                message: 'Only faculty members can be promoted to coordinator'
            });
        }

        // Promote to coordinator
        user.role = 'coordinator';
        await user.save();

        console.log(`🎖️ User ${user.email} promoted to coordinator for ${user.department}`);

        res.json({
            success: true,
            message: `${user.name} promoted to coordinator for ${user.department} department`
        });

    } catch (error) {
        console.error('Promote Faculty Error:', error);
        next(error);
    }
};

/**
 * Get all faculty members (for promotion UI)
 * GET /api/admin/users/faculty
 * Allowed: admin only
 */
export const getFacultyList = async (req, res ,next) => {
    try {
        const { department } = req.query;

        const filter = { role: 'faculty' };
        if (department) filter.department = department;

        const faculty = await User.find(filter)
            .select('name email department createdAt')
            .sort({ department: 1, name: 1 });

        res.json({
            success: true,
            count: faculty.length,
            faculty
        });

    } catch (error) {
        console.error('Get Faculty List Error:', error);
        next(error);
    }
};

/**
 * Get all coordinators
 * GET /api/admin/users/coordinators
 * Allowed: admin only
 */
export const getCoordinatorList = async (req, res, next) => {
    try {
        const coordinators = await User.find({ role: 'coordinator' })
            .select('name email department createdAt')
            .sort({ department: 1, name: 1 });

        res.json({
            success: true,
            count: coordinators.length,
            coordinators
        });

    } catch (error) {
        console.error('Get Coordinator List Error:', error);
        next(error);
    }
};

/**
 * Get all users (for admin user management)
 * GET /api/admin/users
 * Allowed: admin only
 */
export const getAllUsers = async (req, res ,next) => {
    try {
        const { department, role } = req.query;

        const filter = {};
        if (department) filter.department = department;
        if (role) filter.role = role;

        const users = await User.find(filter)
            .select('name email department role createdAt')
            .sort({ role: 1, department: 1, name: 1 });

        const userIds = users.map((user) => user._id);
        const complaintCounts = await Complaint.aggregate([
            { $match: { createdBy: { $in: userIds } } },
            { $group: { _id: '$createdBy', count: { $sum: 1 } } }
        ]);

        const complaintCountMap = complaintCounts.reduce((acc, item) => {
            acc[item._id.toString()] = item.count;
            return acc;
        }, {});

        const usersWithComplaintCount = users.map((user) => {
            const userObj = user.toObject();
            return {
                ...userObj,
                complaintCount: complaintCountMap[user._id.toString()] || 0
            };
        });

        res.json({
            success: true,
            count: usersWithComplaintCount.length,
            users: usersWithComplaintCount
        });

    } catch (error) {
        console.error('Get All Users Error:', error);
        next(error);
    }
};

/**
 * Force logout a user by deleting all their sessions
 * DELETE /api/admin/users/:id/sessions
 * Allowed: admin only
 */
export const forceLogoutUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Don't allow admin to force-logout themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot force logout yourself. Use the regular logout instead.'
            });
        }

        // Delete all sessions for this user
        const result = await Session.deleteMany({ userId: user._id });

        console.log(`🚪 Admin force-logged out user ${user.email} (${result.deletedCount} sessions deleted)`);

        res.json({
            success: true,
            message: `${user.name} logged out from ${result.deletedCount} device(s)`,
            deletedSessions: result.deletedCount
        });

    } catch (error) {
        console.error('Force Logout Error:', error);
        next(error);
    }
};

/**
 * Get dashboard stats for admin
 * GET /api/admin/stats
 * Allowed: admin only
 */
export const getAdminStats = async (req, res, next) => {
    try {
        // Count complaints by status
        const statusCounts = await Complaint.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Count complaints by category
        const categoryCounts = await Complaint.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        // Count users by role
        const userCounts = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        // Average feedback rating
        const avgRating = await Complaint.aggregate([
            { $match: { feedback: { $ne: null } } },
            { $group: { _id: null, avgRating: { $avg: '$feedback.rating' } } }
        ]);

        res.json({
            success: true,
            stats: {
                complaints: {
                    byStatus: statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
                    byCategory: categoryCounts.reduce((acc, c) => ({ ...acc, [c._id]: c.count }), {}),
                    total: await Complaint.countDocuments()
                },
                users: {
                    byRole: userCounts.reduce((acc, u) => ({ ...acc, [u._id]: u.count }), {}),
                    total: await User.countDocuments()
                },
                averageFeedbackRating: avgRating[0]?.avgRating?.toFixed(1) || 'N/A'
            }
        });

    } catch (error) {
        console.error('Get Admin Stats Error:', error);
        next(error);
    }
};
