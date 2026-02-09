/**
 * User Model
 * Defines the schema for users in the complaint management system
 * Roles: student, faculty, coordinator, admin
 * Departments: CE, IT, EC
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Define valid roles and departments
const ROLES = ['student', 'faculty', 'coordinator', 'admin'];
const DEPARTMENTS = ['CE', 'IT', 'EC'];

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },
    role: {
        type: String,
        enum: {
            values: ROLES,
            message: '{VALUE} is not a valid role'
        },
        default: 'student'
    },
    department: {
        type: String,
        enum: {
            values: DEPARTMENTS,
            message: '{VALUE} is not a valid department'
        },
        required: [true, 'Department is required']
    },
    // Google OAuth ID (optional, for Google login users)
    googleId: {
        type: String,
        sparse: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

/**
 * Pre-save hook to hash password before saving
 * Only hashes if password is modified (new or changed)
 */
userSchema.pre('save', async function (next) {
    // Skip if password not modified
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate salt and hash password
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Method to compare provided password with hashed password
 * @param {string} candidatePassword - Password to compare
 * @returns {boolean} - True if password matches
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Create indexes for faster queries
// Note: email index is already created by unique: true constraint
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });

const User = mongoose.model('User', userSchema);

export default User;
