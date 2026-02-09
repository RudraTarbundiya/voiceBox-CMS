/**
 * Role-based Access Control Middleware
 * Restricts route access based on user roles
 * Roles: student, faculty, coordinator, admin
 */

/**
 * Middleware factory to require specific roles
 * @param  {...string} allowedRoles - Roles allowed to access the route
 * @returns {Function} Express middleware function
 * 
 * Usage: requireRole('admin', 'coordinator')
 */
export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Check if user exists (auth middleware should have attached it)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        // Check if user's role is in the allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Middleware to require admin role only
 */
export const requireAdmin = requireRole('admin');

/**
 * Middleware to require coordinator role only
 */
export const requireCoordinator = requireRole('coordinator');

/**
 * Middleware to require admin or coordinator
 */
export const requireAdminOrCoordinator = requireRole('admin', 'coordinator');

/**
 * Middleware to require student or faculty (for complaint submission)
 */
export const requireStudentOrFaculty = requireRole('student', 'faculty');

export default requireRole;
