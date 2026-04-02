/**
 * Cloudinary Configuration
 * Configures Cloudinary SDK using environment variables.
 * API_SECRET is used server-side only for signing — never exposed to frontend.
 */

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

export default cloudinary;
