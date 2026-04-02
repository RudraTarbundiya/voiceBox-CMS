/**
 * Cloudinary Upload Utility
 * 
 * Two-step secure upload:
 * 1. Get a signed upload credential from the backend (API_SECRET never leaves server)
 * 2. Upload file directly to Cloudinary using the signature
 * 
 * All files are uploaded with type "authenticated" (private — not publicly accessible).
 */

import api from '../api/axios';

/**
 * Get upload signature from backend
 * @returns {{ signature, timestamp, folder, apiKey, cloudName }}
 */
async function getUploadSignature() {
    const res = await api.post('/cloudinary/signature');
    return res.data;
}

/**
 * Upload a single file to Cloudinary using signed upload
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Optional progress callback (0-100)
 * @returns {{ publicId, url, originalName, mimetype, size, resourceType }}
 */
export async function uploadFileToCloudinary(file, onProgress) {
    // Step 1: Get signature from backend
    const { signature, timestamp, folder, apiKey, cloudName } = await getUploadSignature();

    // Step 2: Upload directly to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', signature);
    formData.append('timestamp', timestamp);
    formData.append('api_key', apiKey);
    formData.append('folder', folder);
    formData.append('type', 'authenticated'); // Private upload

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Cloudinary upload failed');
    }

    const data = await response.json();

    // Return normalized attachment metadata to store in MongoDB
    return {
        publicId: data.public_id,
        url: data.secure_url,
        originalName: file.name,
        mimetype: file.type || 'application/octet-stream',
        size: data.bytes,
        resourceType: data.resource_type || 'raw'
    };
}

/**
 * Upload multiple files to Cloudinary sequentially
 * @param {File[]} files - Array of files to upload
 * @param {Function} onFileProgress - Callback(fileIndex, percent) for each file progress
 * @returns {Array<{ publicId, url, originalName, mimetype, size, resourceType }>}
 */
export async function uploadFilesToCloudinary(files, onFileProgress) {
    const results = [];

    for (let i = 0; i < files.length; i++) {
        const result = await uploadFileToCloudinary(files[i], (percent) => {
            if (onFileProgress) onFileProgress(i, percent);
        });
        results.push(result);

        // Signal completion for this file
        if (onFileProgress) onFileProgress(i, 100);
    }

    return results;
}
