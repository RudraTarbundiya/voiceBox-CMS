import { z } from 'zod';

const objectIdRegex = /^[a-f\d]{24}$/i;
const noPathTraversalRegex = /^[^\\/]+$/;

const emailDomain = process.env.EMAIL_DOMAIN || '@ldce.ac.in';
const departments = ['CE', 'IT', 'EC'];
const userRoles = ['student', 'faculty', 'coordinator', 'admin'];
const selfRegisterRoles = ['student', 'faculty'];
const complaintStatuses = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const complaintCategories = ['academic', 'infrastructure', 'hostel', 'library', 'it/portal'];

export const objectIdParamSchema = z.object({
    id: z.string().regex(objectIdRegex, 'Invalid resource id')
});

export const sendOtpSchema = z.object({
    email: z.string().trim().email().refine(v => v.toLowerCase().endsWith(emailDomain), {
        message: `Only ${emailDomain} email addresses are allowed`
    })
});

export const attachmentParamSchema = objectIdParamSchema.extend({
    filename: z.string()
        .min(1, 'Filename is required')
        .regex(noPathTraversalRegex, 'Invalid filename')
});

export const registerSchema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().refine(v => v.toLowerCase().endsWith(emailDomain), {
        message: `Only ${emailDomain} email addresses are allowed`
    }),
    password: z.string().min(6).max(128),
    role: z.enum(selfRegisterRoles).optional(),
    department: z.enum(departments),
    otp: z.string().length(4, 'OTP must be exactly 4 digits')
});

export const loginSchema = z.object({
    email: z.string().trim().email().refine(v => v.toLowerCase().endsWith(emailDomain), {
        message: `Only ${emailDomain} email addresses are allowed`
    }),
    password: z.string().min(1, 'Password is required')
});

export const googleAuthSchema = z.object({
    credential: z.string().trim().min(10, 'Google credential is required'),
    department: z.enum(departments).optional(),
    role: z.enum(selfRegisterRoles).optional()
});

export const complaintCreateSchema = z.object({
    title: z.string().trim().min(5).max(200),
    description: z.string().trim().min(20).max(5000),
    category: z.enum(complaintCategories)
});

export const complaintFeedbackSchema = z.object({
    rating: z.coerce.number().int().min(1).max(10),
    comment: z.string().trim().min(3).max(1000)
});

export const complaintStatusUpdateSchema = z.object({
    status: z.enum(['IN_PROGRESS', 'RESOLVED']),
    note: z.string().trim().min(1).max(1000).optional()
});

export const complaintListQuerySchema = z.object({
    status: z.enum(complaintStatuses).optional(),
    category: z.enum(complaintCategories).optional(),
    department: z.enum(departments).optional(),
    page: z.coerce.number().int().min(1).max(1000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const departmentComplaintQuerySchema = z.object({
    status: z.enum(complaintStatuses).optional(),
    page: z.coerce.number().int().min(1).max(1000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const adminAssignDepartmentSchema = z.object({
    department: z.enum(departments),
    note: z.string().trim().min(1).max(1000).optional()
});

export const adminCloseComplaintSchema = z.object({
    note: z.string().trim().min(1).max(1000).optional()
});

export const adminUserFilterQuerySchema = z.object({
    department: z.enum(departments).optional(),
    role: z.enum(userRoles).optional()
});

export const adminFacultyFilterQuerySchema = z.object({
    department: z.enum(departments).optional()
});