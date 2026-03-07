import React, { useState } from 'react';
import { Modal } from './modal';
import { Badge } from './badge';
import { Button } from './button';
import { FileText, Download, Mic, Eye, EyeOff } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const isAudioFile = (mimetype) => mimetype?.startsWith('audio/');
const isImageFile = (mimetype) => mimetype?.startsWith('image/');
const isPdfFile = (mimetype) => mimetype === 'application/pdf';

function AttachmentItem({ file, complaintId }) {
    const [showPreview, setShowPreview] = useState(false);
    const url = `${API_BASE}/complaints/${complaintId}/attachments/${file.filename}`;
    const canPreview = isAudioFile(file.mimetype) || isImageFile(file.mimetype) || isPdfFile(file.mimetype);

    return (
        <div className="rounded-lg border bg-muted/20 overflow-hidden">
            {/* Compact row */}
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3 min-w-0">
                    {isAudioFile(file.mimetype) ? (
                        <Mic className="h-5 w-5 text-primary shrink-0" />
                    ) : (
                        <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{file.originalName}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {canPreview && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => setShowPreview(!showPreview)}
                        >
                            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {showPreview ? 'Hide' : 'Preview'}
                        </Button>
                    )}
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-1">
                            <Download className="h-4 w-4" /> Download
                        </Button>
                    </a>
                </div>
            </div>

            {/* Expandable preview */}
            {showPreview && (
                <div className="border-t">
                    {isAudioFile(file.mimetype) && (
                        <div className="p-3">
                            <audio controls className="w-full h-8" src={url} />
                        </div>
                    )}
                    {isImageFile(file.mimetype) && (
                        <img src={url} alt={file.originalName} className="w-full max-h-64 object-contain bg-black/20" />
                    )}
                    {isPdfFile(file.mimetype) && (
                        <iframe src={url} title={file.originalName} className="w-full h-72 border-0" />
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * Shared Complaint Detail Modal
 * Shows full complaint details with expandable attachment previews
 */
export function ComplaintDetailModal({ complaint, isOpen, onClose, children }) {
    if (!complaint) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Complaint Details"
            className="max-w-2xl"
        >
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-lg">{complaint.title}</h3>
                        <Badge variant={complaint.status.toLowerCase()}>
                            {complaint.status.replace('_', ' ')}
                        </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>📁 {complaint.category}</span>
                        <span>🏢 Dept: {complaint.department}</span>
                        {complaint.assignedDepartment && (
                            <span>➡️ Assigned: {complaint.assignedDepartment}</span>
                        )}
                        <span>📅 {new Date(complaint.createdAt).toLocaleString()}</span>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <p className="text-sm font-medium mb-2">Description</p>
                    <p className="text-sm text-muted-foreground bg-muted p-4 rounded-md whitespace-pre-wrap">
                        {complaint.description}
                    </p>
                </div>

                {/* Attachments */}
                {complaint.attachments && complaint.attachments.length > 0 && (
                    <div>
                        <p className="text-sm font-medium mb-3">
                            Attachments ({complaint.attachments.length})
                        </p>
                        <div className="space-y-2">
                            {complaint.attachments.map((file, idx) => (
                                <AttachmentItem
                                    key={idx}
                                    file={file}
                                    complaintId={complaint._id}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Feedback */}
                {complaint.feedback && (
                    <div>
                        <p className="text-sm font-medium mb-2">User Feedback</p>
                        <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-md">
                            <p className="text-sm font-semibold mb-1">
                                Rating: {complaint.feedback.rating}/10
                            </p>
                            <p className="text-sm text-muted-foreground">
                                "{complaint.feedback.comment}"
                            </p>
                        </div>
                    </div>
                )}

                {/* Role-specific actions */}
                {children}
            </div>
        </Modal>
    );
}
