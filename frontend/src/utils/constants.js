/**
 * Application Constants
 * Centralized constants for the application
 */

// User Roles
export const ROLES = {
    STUDENT: 'student',
    FACULTY: 'faculty',
    COORDINATOR: 'coordinator',
    ADMIN: 'admin'
};

// Departments
export const DEPARTMENTS = ['CE', 'IT', 'EC'];

// Department Labels
export const DEPARTMENT_LABELS = {
    CE: 'Computer Engineering',
    IT: 'Information Technology',
    EC: 'Electronics & Communication'
};

// Complaint Categories
export const CATEGORIES = [
    { value: 'academic', label: 'Academic' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'hostel', label: 'Hostel' },
    { value: 'library', label: 'Library' },
    { value: 'it/portal', label: 'IT/Portal' }
];

// Complaint Statuses
export const STATUSES = {
    NEW: 'NEW',
    ASSIGNED: 'ASSIGNED',
    IN_PROGRESS: 'IN_PROGRESS',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED'
};

// Status Labels and Colors
export const STATUS_CONFIG = {
    NEW: { label: 'New', color: 'blue', bgClass: 'badge-new' },
    ASSIGNED: { label: 'Assigned', color: 'yellow', bgClass: 'badge-assigned' },
    IN_PROGRESS: { label: 'In Progress', color: 'purple', bgClass: 'badge-in-progress' },
    RESOLVED: { label: 'Resolved', color: 'green', bgClass: 'badge-resolved' },
    CLOSED: { label: 'Closed', color: 'gray', bgClass: 'badge-closed' }
};

// File upload limits
export const FILE_LIMITS = {
    MAX_FILES: 3,
    MAX_SIZE_MB: 5,
    MAX_SIZE_BYTES: 5 * 1024 * 1024,
    ALLOWED_TYPES: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ]
};

// Rating scale
export const RATING_SCALE = {
    MIN: 1,
    MAX: 10
};
