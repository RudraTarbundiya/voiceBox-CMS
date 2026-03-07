import React, { useEffect, useState } from 'react';
import { useComplaintStore } from '../../store/useComplaintStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function CoordinatorDashboard() {
    const { complaints, fetchDepartmentComplaints, updateComplaintStatus, loading } = useComplaintStore();
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [note, setNote] = useState('');

    useEffect(() => {
        fetchDepartmentComplaints();
    }, [fetchDepartmentComplaints]);

    const handleStatusUpdate = async (status) => {
        if (!selectedComplaint) return;
        setIsUpdating(true);
        try {
            await updateComplaintStatus(selectedComplaint._id, { status, note });
            toast.success(`Complaint status updated to ${status.replace('_', ' ')}`);
            setSelectedComplaint(null);
            setNote('');
        } catch (err) {
            toast.error('Failed to update status');
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Department View</h1>
                    <p className="text-muted-foreground">Manage and resolve complaints routed to your department.</p>
                </div>
            </div>

            {loading && complaints.length === 0 ? (
                <div className="flex h-40 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence>
                        {complaints.map((complaint, i) => (
                            <motion.div
                                key={complaint._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, delay: i * 0.05 }}
                            >
                                <Card className="h-full flex flex-col hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setSelectedComplaint(complaint)}>
                                    <CardHeader className="pb-3 border-b">
                                        <div className="flex justify-between items-start gap-4">
                                            <CardTitle className="text-base line-clamp-1">{complaint.title}</CardTitle>
                                            <Badge variant={complaint.status.toLowerCase()}>{complaint.status.replace('_', ' ')}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(complaint.createdAt).toLocaleDateString()} • {complaint.category}
                                        </p>
                                    </CardHeader>
                                    <CardContent className="pt-4 flex-1">
                                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                            {complaint.description}
                                        </p>
                                        <div className="flex justify-end gap-2 mt-auto">
                                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedComplaint(complaint); }}>
                                                Review & Update
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {complaints.length === 0 && (
                        <div className="col-span-full flex h-40 items-center justify-center rounded-lg border border-dashed bg-muted/10">
                            <p className="text-muted-foreground">No active complaints in your department right now.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Action Modal */}
            <Modal
                isOpen={!!selectedComplaint}
                onClose={() => setSelectedComplaint(null)}
                title="Complaint Details"
                className="max-w-2xl"
            >
                {selectedComplaint && (
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-lg">{selectedComplaint.title}</h3>
                                <Badge variant={selectedComplaint.status.toLowerCase()}>{selectedComplaint.status.replace('_', ' ')}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground bg-muted p-4 rounded-md">
                                {selectedComplaint.description}
                            </p>
                        </div>

                        {selectedComplaint.attachments?.length > 0 && (
                            <div>
                                <h4 className="font-medium text-sm mb-2">Attachments</h4>
                                <div className="flex gap-2">
                                    {selectedComplaint.attachments.map((att, i) => (
                                        <Badge key={i} variant="outline" className="cursor-pointer hover:bg-accent">
                                            {att.originalName || att.filename}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Current status dictates what we can transition to */}
                        {selectedComplaint.status === 'ASSIGNED' && (
                            <div className="space-y-4 border-t pt-4">
                                <p className="text-sm font-medium">Update Status: Move to In Progress</p>
                                <textarea
                                    className="w-full rounded-md border border-input bg-background p-3 text-sm"
                                    placeholder="Notes on investigation..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={3}
                                />
                                <Button className="w-full" onClick={() => handleStatusUpdate('IN_PROGRESS')} disabled={isUpdating}>
                                    {isUpdating ? 'Updating...' : 'Start Investigating (IN PROGRESS)'}
                                </Button>
                            </div>
                        )}

                        {selectedComplaint.status === 'IN_PROGRESS' && (
                            <div className="space-y-4 border-t pt-4">
                                <p className="text-sm font-medium">Update Status: Mark as Resolved</p>
                                <textarea
                                    className="w-full rounded-md border border-input bg-background p-3 text-sm"
                                    placeholder="Details of the resolution..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={3}
                                />
                                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate('RESOLVED')} disabled={isUpdating || !note}>
                                    {isUpdating ? 'Updating...' : 'Resolve Issue'}
                                </Button>
                            </div>
                        )}

                        {['RESOLVED', 'CLOSED'].includes(selectedComplaint.status) && (
                            <div className="border-t pt-4">
                                <p className="text-sm text-muted-foreground text-center">
                                    This issue has been resolved. No further action needed.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
