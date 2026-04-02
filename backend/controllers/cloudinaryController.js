/**
 * Cloudinary Controller
 * Handles upload signature generation and signed URL creation.
 * API_SECRET never leaves the server — only signatures and temporary URLs are sent to the client.
 */

import cloudinary from '../config/cloudinaryConfig.js';

/**
 * Generate a Cloudinary upload signature
 * POST /api/cloudinary/signature
 * Allowed: authenticated users (student, faculty)
 * 
 * The frontend uses this signature to upload directly to Cloudinary
 * with type "authenticated" so files are private.
 */
export const generateSignature = async (req, res, next) => {
    try {
        const timestamp = Math.round(Date.now() / 1000);
        const folder = 'voicebox-cms/complaints';

        // Parameters that will be signed — must match exactly what frontend sends
        const paramsToSign = {
            timestamp,
            folder,
            type: 'authenticated'    // Private upload — not publicly accessible
        };

        // Generate signature using API_SECRET (never sent to frontend)
        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET
        );

        res.json({
            success: true,
            signature,
            timestamp,
            folder,
            apiKey: process.env.CLOUDINARY_API_KEY,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME
        });
    } catch (error) {
        console.error('Generate Signature Error:', error);
        next(error);
    }
};

/**
 * Generate a signed URL for accessing a private attachment
 * POST /api/cloudinary/signed-url
 * Body: { publicId, resourceType }
 * 
 * Returns a signed URL for downloading / viewing.
 * Files stored as 'authenticated' type cannot be accessed without a valid signature.
 * The signature is generated server-side using API_SECRET — never exposed to the client.
 */
export const generateSignedUrl = async (req, res, next) => {
    try {
        const { publicId, resourceType } = req.body;

        if (!publicId) {
            return res.status(400).json({
                success: false,
                message: 'publicId is required'
            });
        }

        const type = resourceType || 'raw';

        // Generate a signed URL for authenticated resources
        // sign_url: true appends a signature derived from API_SECRET
        // Without this signature, Cloudinary returns 401
        const signedUrl = cloudinary.url(publicId, {
            type: 'authenticated',
            resource_type: type,
            sign_url: true,
            secure: true
        });

        res.json({
            success: true,
            signedUrl
        });
    } catch (error) {
        console.error('Generate Signed URL Error:', error);
        next(error);
    }
};
