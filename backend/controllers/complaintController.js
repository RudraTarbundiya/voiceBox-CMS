/**
 * Complaint Controller
 * Handles complaint CRUD operations, file uploads, and feedback
 * Role-based access: students/faculty create, coordinators update status, admin close
 */

import Complaint from '../models/Complaint.js';
import fs from 'fs';
import path from 'path';

/**
 * Create a new complaint with optional file attachments
 * POST /api/complaints
 * Allowed: student, faculty
 */
export const createComplaint = async (req, res ,next) => {
    try {
        const { title, description, category } = req.body;

        // Validate required fields
        if (!title || !description || !category) {
            // Clean up uploaded files if validation fails
            if (req.files) {
                req.files.forEach(file => {
                    fs.unlink(file.path, err => {
                        if (err) console.error('Error deleting file:', err);
                    });
                });
            }
            return res.status(400).json({
                success: false,
                message: 'Please provide title, description, and category'
            });
        }

        // Process uploaded files
        const attachments = req.files ? req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size
        })) : [];

        // Create complaint
        const complaint = await Complaint.create({
            title,
            description,
            category,
            department: req.user.department, // User's department
            createdBy: req.user._id,
            attachments,
            status: 'NEW',
            statusHistory: [{
                status: 'NEW',
                changedBy: req.user._id,
                changedAt: new Date(),
                note: 'Complaint created'
            }]
        });

        // Populate createdBy for response
        await complaint.populate('createdBy', 'name email department');

        console.log(`📝 New complaint created: ${complaint._id}`);

        res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully',
            complaint
        });

    } catch (error) {
        console.error('Create Complaint Error:', error);

        // Clean up uploaded files on error
        if (req.files) {
            req.files.forEach(file => {
                fs.unlink(file.path, err => {
                    if (err) console.error('Error deleting file:', err);
                });
            });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        next(error);
    }
};

/**
 * Get current user's complaints
 * GET /api/complaints/my
 * Allowed: all authenticated users
 */
export const getMyComplaints = async (req, res, next) => {
    try {
        const complaints = await Complaint.find({ createdBy: req.user._id })
            .populate('createdBy', 'name email department')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: complaints.length,
            complaints
        });

    } catch (error) {
        console.error('Get My Complaints Error:', error);
        next(error);
    }
};

/**
 * Get all complaints (admin only)
 * GET /api/complaints/all
 * Allowed: admin
 */
export const getAllComplaints = async (req, res, next) => {
    try {
        const { status, category, department, page = 1, limit = 20 } = req.query;

        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (department) filter.assignedDepartment = department;

        const complaints = await Complaint.find(filter)
            .populate('createdBy', 'name email department')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Complaint.countDocuments(filter);

        res.json({
            success: true,
            count: complaints.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            complaints
        });

    } catch (error) {
        console.error('Get All Complaints Error:', error);
        next(error);
    }
};

/**
 * Get complaints by department (coordinator only)
 * GET /api/complaints/department
 * Allowed: coordinator
 */
export const getDepartmentComplaints = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        // Filter by coordinator's department (assigned department)
        const filter = { assignedDepartment: req.user.department };
        if (status) filter.status = status;

        const complaints = await Complaint.find(filter)
            .populate('createdBy', 'name email department')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Complaint.countDocuments(filter);

        res.json({
            success: true,
            count: complaints.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            complaints
        });

    } catch (error) {
        console.error('Get Department Complaints Error:', error);
        next(error);
    }
};

/**
 * Get single complaint by ID
 * GET /api/complaints/:id
 * Allowed: owner, coordinator (same dept), admin
 */
export const getComplaintById = async (req, res, next) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('createdBy', 'name email department')
            .populate('statusHistory.changedBy', 'name');

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Check access rights
        const isOwner = complaint.createdBy._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        const isCoordinatorSameDept = req.user.role === 'coordinator' &&
            complaint.assignedDepartment === req.user.department;

        if (!isOwner && !isAdmin && !isCoordinatorSameDept) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this complaint'
            });
        }

        res.json({
            success: true,
            complaint
        });

    } catch (error) {
        console.error('Get Complaint By ID Error:', error);
        next(error);    
    }
};

/**
 * Update complaint status (coordinator only)
 * PATCH /api/complaints/:id/status
 * Allowed: coordinator (same dept)
 * Valid transitions: ASSIGNED → IN_PROGRESS → RESOLVED
 */
export const updateComplaintStatus = async (req, res ,next) => {
    try {
        const { status, note } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Check if coordinator's department matches assigned department
        if (complaint.assignedDepartment !== req.user.department) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized. This complaint is not assigned to your department.'
            });
        }

        // Validate status transition for coordinator
        const validTransitions = {
            'ASSIGNED': ['IN_PROGRESS'],
            'IN_PROGRESS': ['RESOLVED']
        };

        const allowedNextStatuses = validTransitions[complaint.status] || [];

        if (!allowedNextStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status transition. Current: ${complaint.status}, Allowed: ${allowedNextStatuses.join(', ') || 'none'}`
            });
        }

        // Update status
        complaint.status = status;
        complaint.statusHistory.push({
            status,
            changedBy: req.user._id,
            changedAt: new Date(),
            note: note || `Status changed to ${status}`
        });

        await complaint.save();
        await complaint.populate('createdBy', 'name email department');

        console.log(`📋 Complaint ${complaint._id} status changed to ${status}`);

        res.json({
            success: true,
            message: `Status updated to ${status}`,
            complaint
        });

    } catch (error) {
        console.error('Update Status Error:', error);
        next(error);
    }
};

/**
 * Submit feedback for a resolved complaint
 * POST /api/complaints/:id/feedback
 * Allowed: complaint owner only, status must be RESOLVED
 */
export const submitFeedback = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;

        // Validate feedback
        if (!rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Rating and comment are required'
            });
        }

        if (rating < 1 || rating > 10) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 10'
            });
        }

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Check if user is the complaint owner
        if (complaint.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the complaint owner can submit feedback'
            });
        }

        // Check if complaint is resolved
        if (complaint.status !== 'RESOLVED') {
            return res.status(400).json({
                success: false,
                message: 'Feedback can only be submitted for resolved complaints'
            });
        }

        // Check if feedback already exists
        if (complaint.feedback) {
            return res.status(400).json({
                success: false,
                message: 'Feedback already submitted'
            });
        }

        // Add feedback
        complaint.feedback = {
            rating: parseInt(rating),
            comment,
            submittedAt: new Date()
        };

        await complaint.save();
        await complaint.populate('createdBy', 'name email department');

        console.log(`⭐ Feedback submitted for complaint ${complaint._id}`);

        res.json({
            success: true,
            message: 'Feedback submitted successfully',
            complaint
        });

    } catch (error) {
        console.error('Submit Feedback Error:', error);
        next(error);
    }
};

/**
 * Download complaint attachment
 * GET /api/complaints/:id/attachments/:filename
 */
export const downloadAttachment = async (req, res, next) => {
    try {
        const { id, filename } = req.params;

        const complaint = await Complaint.findById(id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Check access rights
        const isOwner = complaint.createdBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        const isCoordinatorSameDept = req.user.role === 'coordinator' &&
            complaint.assignedDepartment === req.user.department;

        if (!isOwner && !isAdmin && !isCoordinatorSameDept) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this attachment'
            });
        }

        // Find attachment
        const attachment = complaint.attachments.find(a => a.filename === filename);

        if (!attachment) {
            return res.status(404).json({
                success: false,
                message: 'Attachment not found'
            });
        }

        // Send file
        const filePath = path.join(process.cwd(), 'uploads', filename);
        res.download(filePath, attachment.originalName);

    } catch (error) {
        console.error('Download Attachment Error:', error);
        next(error);
    }
};