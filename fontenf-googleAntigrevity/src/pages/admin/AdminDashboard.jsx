import React, { useEffect, useState } from 'react';
import { useComplaintStore } from '../../store/useComplaintStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
    const { complaints, fetchAllComplaints, updateComplaintStatus, loading, stats, fetchStats } = useComplaintStore();
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [department, setDepartment] = useState('CE');
    const [note, setNote] = useState('');

    // Local filter
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchAllComplaints();
        fetchStats();
    }, [fetchAllComplaints, fetchStats]);

    const handleAssignment = async () => {
        if (!selectedComplaint) return;
        setIsUpdating(true);
        try {
            await updateComplaintStatus(selectedComplaint._id, { department, note });
            setSelectedComplaint(null);
            setNote('');
        } catch (err) {
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClose = async () => {
        if (!selectedComplaint) return;
        setIsUpdating(true);
        try {
            await updateComplaintStatus(selectedComplaint._id, { status: "CLOSED", note });
            setSelectedComplaint(null);
            setNote('');
        } catch (err) {
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredComplaints = filter === 'ALL'
        ? complaints
        : complaints.filter(c => c.status === filter);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
                    <p className="text-muted-foreground">Globally monitor, route, and close all registered complaints.</p>
                </div>
            </div>

            {stats && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="bg-muted/10">
                        <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                                <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-500/10 border-blue-500/20">
                        <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-blue-500">Unassigned (NEW)</p>
                                <div className="text-2xl font-bold text-blue-500">
                                    {complaints.filter(c => c.status === 'NEW').length}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-yellow-500/10 border-yellow-500/20">
                        <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-yellow-500">In Progress</p>
                                <div className="text-2xl font-bold text-yellow-500">
                                    {complaints.filter(c => c.status === 'IN_PROGRESS').length}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-500/20">
                        <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-green-500">Awaiting Closure</p>
                                <div className="text-2xl font-bold text-green-500">
                                    {complaints.filter(c => c.status === 'RESOLVED').length}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <div className="flex gap-2 p-1 bg-muted/40 rounded-lg w-fit">
                {['ALL', 'NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => (
                    <Button
                        key={status}
                        variant={filter === status ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter(status)}
                        className="rounded-md"
                    >
                        {status}
                    </Button>
                ))}
            </div>

            {loading && complaints.length === 0 ? (
                <div className="flex h-40 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence>
                        {filteredComplaints.map((complaint, i) => (
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
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs text-muted-foreground">{new Date(complaint.createdAt).toLocaleDateString()}</p>
                                            {complaint.assignedDepartment && (
                                                <p className="text-xs font-semibold px-2 py-0.5 rounded bg-muted">
                                                    {complaint.assignedDepartment}
                                                </p>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 flex-1">
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                            {complaint.description}
                                        </p>
                                        <div className="flex justify-end gap-2 mt-auto">
                                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedComplaint(complaint); }}>
                                                Take Action
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredComplaints.length === 0 && (
                        <div className="col-span-full flex h-40 items-center justify-center rounded-lg border border-dashed bg-muted/10">
                            <p className="text-muted-foreground">No queries matching the current filter.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Action Modal */}
            <Modal
                isOpen={!!selectedComplaint}
                onClose={() => setSelectedComplaint(null)}
                title="Administrative Controls"
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

                        {/* If NEW: Assign Department */}
                        {selectedComplaint.status === 'NEW' && (
                            <div className="space-y-4 border-t pt-4">
                                <p className="text-sm font-medium">Route to Department</p>
                                <div className="flex gap-4">
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                    >
                                        <option value="CE">Computer Engineering</option>
                                        <option value="IT">Information Technology</option>
                                        <option value="EC">Electronics & Communication</option>
                                    </select>
                                </div>
                                <textarea
                                    className="w-full rounded-md border border-input bg-background p-3 text-sm"
                                    placeholder="Notes for the coordinator..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={2}
                                />
                                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleAssignment} disabled={isUpdating}>
                                    {isUpdating ? 'Assigning...' : `Assign to ${department}`}
                                </Button>
                            </div>
                        )}

                        {/* If RESOLVED: Close Complaint */}
                        {selectedComplaint.status === 'RESOLVED' && (
                            <div className="space-y-4 border-t pt-4">
                                <p className="text-sm font-medium">Close System Record</p>

                                {selectedComplaint.feedback ? (
                                    <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-md">
                                        <p className="text-sm font-semibold mb-1">User Feedback (Rating: {selectedComplaint.feedback.rating}/10)</p>
                                        <p className="text-sm text-muted-foreground">"{selectedComplaint.feedback.comment}"</p>
                                    </div>
                                ) : (
                                    <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-3 rounded-r-md">
                                        <p className="text-sm text-yellow-700 dark:text-yellow-500">No user feedback yet. Proceed with manual closure?</p>
                                    </div>
                                )}

                                <textarea
                                    className="w-full rounded-md border border-input bg-background p-3 text-sm mt-4"
                                    placeholder="Closing notes..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={2}
                                />
                                <Button className="w-full bg-gray-600 hover:bg-gray-700" onClick={handleClose} disabled={isUpdating || !note}>
                                    {isUpdating ? 'Closing...' : 'Close Complaint'}
                                </Button>
                            </div>
                        )}

                        {['ASSIGNED', 'IN_PROGRESS'].includes(selectedComplaint.status) && (
                            <div className="border-t pt-4">
                                <p className="text-sm text-muted-foreground text-center">
                                    This issue is currently being resolved by a coordinator.
                                </p>
                            </div>
                        )}

                        {selectedComplaint.status === 'CLOSED' && (
                            <div className="border-t pt-4">
                                <p className="text-sm text-muted-foreground text-center">
                                    This issue is sealed and marked permanently as CLOSED.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
