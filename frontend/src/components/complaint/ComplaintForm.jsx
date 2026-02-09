/**
 * ComplaintForm Component
 * Form for submitting new complaints with file upload
 */

import { useState } from 'react';
import Button from '../common/Button';
import { CATEGORIES, DEPARTMENTS, FILE_LIMITS } from '../../utils/constants';
import { useComplaints } from '../../context/ComplaintContext';

const ComplaintForm = ({ onSuccess }) => {
    const { createComplaint, loading } = useComplaints();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: ''
    });
    const [files, setFiles] = useState([]);
    const [errors, setErrors] = useState({});

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error on change
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle file selection
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);

        // Validate file count
        if (selectedFiles.length + files.length > FILE_LIMITS.MAX_FILES) {
            setErrors(prev => ({
                ...prev,
                files: `Maximum ${FILE_LIMITS.MAX_FILES} files allowed`
            }));
            return;
        }

        // Validate file sizes
        for (const file of selectedFiles) {
            if (file.size > FILE_LIMITS.MAX_SIZE_BYTES) {
                setErrors(prev => ({
                    ...prev,
                    files: `File ${file.name} exceeds ${FILE_LIMITS.MAX_SIZE_MB}MB limit`
                }));
                return;
            }
        }

        setFiles(prev => [...prev, ...selectedFiles]);
        setErrors(prev => ({ ...prev, files: '' }));
    };

    // Remove file
    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length < 5) {
            newErrors.title = 'Title must be at least 5 characters';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length < 20) {
            newErrors.description = 'Description must be at least 20 characters';
        }

        if (!formData.category) {
            newErrors.category = 'Category is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        // Create FormData for file upload
        const submitData = new FormData();
        submitData.append('title', formData.title);
        submitData.append('description', formData.description);
        submitData.append('category', formData.category);

        files.forEach(file => {
            submitData.append('attachments', file);
        });

        const result = await createComplaint(submitData);

        if (result.success) {
            // Reset form
            setFormData({ title: '', description: '', category: '' });
            setFiles([]);
            onSuccess && onSuccess(result.complaint);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
                <label htmlFor="title" className="label">
                    Complaint Title <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Brief title describing your complaint"
                    className={`input ${errors.title ? 'input-error' : ''}`}
                />
                {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                )}
            </div>

            {/* Category */}
            <div>
                <label htmlFor="category" className="label">
                    Category <span className="text-red-500">*</span>
                </label>
                <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`input ${errors.category ? 'input-error' : ''}`}
                >
                    <option value="">Select a category</option>
                    {CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>
                            {cat.label}
                        </option>
                    ))}
                </select>
                {errors.category && (
                    <p className="text-sm text-red-500 mt-1">{errors.category}</p>
                )}
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className="label">
                    Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide detailed information about your complaint..."
                    rows={5}
                    className={`input resize-none ${errors.description ? 'input-error' : ''}`}
                />
                <div className="flex justify-between mt-1">
                    {errors.description ? (
                        <p className="text-sm text-red-500">{errors.description}</p>
                    ) : (
                        <span />
                    )}
                    <span className="text-xs text-gray-400">
                        {formData.description.length}/5000
                    </span>
                </div>
            </div>

            {/* File Upload */}
            <div>
                <label className="label">
                    Attachments (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                    <input
                        type="file"
                        id="files"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                    />
                    <label htmlFor="files" className="cursor-pointer">
                        <div className="text-4xl mb-2">📎</div>
                        <p className="text-sm text-gray-600">
                            <span className="text-primary-600 font-medium">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Max {FILE_LIMITS.MAX_FILES} files, {FILE_LIMITS.MAX_SIZE_MB}MB each
                        </p>
                    </label>
                </div>

                {errors.files && (
                    <p className="text-sm text-red-500 mt-2">{errors.files}</p>
                )}

                {/* Selected Files */}
                {files.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-lg">📄</span>
                                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                                    <span className="text-xs text-gray-400">
                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
                <Button type="submit" loading={loading} fullWidth>
                    Submit Complaint
                </Button>
            </div>
        </form>
    );
};

export default ComplaintForm;
