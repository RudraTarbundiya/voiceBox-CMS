/**
 * Complaint Model
 * Defines the schema for complaints in the system
 * Categories: academic, infrastructure, hostel, library, it/portal
 * Status Lifecycle: NEW → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED
 */

import mongoose from 'mongoose';

// Valid categories and statuses
const CATEGORIES = ['academic', 'infrastructure', 'hostel', 'library', 'it/portal'];
const STATUSES = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const DEPARTMENTS = ['CE', 'IT', 'EC'];

// Attachment sub-schema for Cloudinary uploads
const attachmentSchema = new mongoose.Schema({
    publicId: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    resourceType: {
        type: String,
        required: true,
        enum: ['image', 'video', 'raw', 'auto'],
        default: 'raw'
    }
}, { _id: false });

// Feedback sub-schema
const feedbackSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: true,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating cannot exceed 10']
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

// Main complaint schema
const complaintSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [5, 'Title must be at least 5 characters'],
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [20, 'Description must be at least 20 characters'],
        maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    category: {
        type: String,
        enum: {
            values: CATEGORIES,
            message: '{VALUE} is not a valid category'
        },
        required: [true, 'Category is required']
    },
    // User's department (from their profile)
    department: {
        type: String,
        enum: {
            values: DEPARTMENTS,
            message: '{VALUE} is not a valid department'
        },
        required: true
    },
    // Department assigned by admin to handle the complaint
    assignedDepartment: {
        type: String,
        enum: {
            values: DEPARTMENTS,
            message: '{VALUE} is not a valid department'
        },
        default: null
    },
    status: {
        type: String,
        enum: {
            values: STATUSES,
            message: '{VALUE} is not a valid status'
        },
        default: 'NEW'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // File attachments (max 3 files, 5MB each)
    attachments: {
        type: [attachmentSchema],
        validate: {
            validator: function (v) {
                return v.length <= 3;
            },
            message: 'Maximum 3 attachments allowed'
        },
        default: []
    },
    // Feedback from user after resolution
    feedback: {
        type: feedbackSchema,
        default: null
    },
    // Status history for tracking
    statusHistory: [{
        status: {
            type: String,
            enum: STATUSES
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        changedAt: {
            type: Date,
            default: Date.now
        },
        note: String
    }]
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Indexes for faster queries
complaintSchema.index({ createdBy: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ department: 1 });
complaintSchema.index({ assignedDepartment: 1 });
complaintSchema.index({ createdAt: -1 });

/**
 * Pre-save hook to record status changes in history
 */
complaintSchema.pre('save', function (next) {
    // If status changed, add to history
    if (this.isModified('status') && !this.isNew) {
        this.statusHistory.push({
            status: this.status,
            changedAt: new Date()
        });
    }
    next();
});

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
