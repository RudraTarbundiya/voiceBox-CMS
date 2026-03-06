import React, { useEffect } from 'react';
import { useComplaintStore } from '../../store/useComplaintStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { FileText, PlusCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
    const { complaints, fetchMyComplaints, loading, error } = useComplaintStore();

    useEffect(() => {
        fetchMyComplaints();
    }, []);

    // Stats
    const activeCount = complaints.filter(c => ['NEW', 'ASSIGNED', 'IN_PROGRESS'].includes(c.status)).length;
    const resolvedCount = complaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Complaints</h1>
                    <p className="text-muted-foreground">Track and manage your submitted issues.</p>
                </div>
                <Link to="/complaints/new">
                    <Button className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        New Complaint
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Submitted</CardTitle>
                        <FileText className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{complaints.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-yellow-500/5 border-yellow-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCount}</div>
                    </CardContent>
                </Card>
                <Card className="bg-green-500/5 border-green-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resolved/Closed</CardTitle>
                        <svg
                            className="h-4 w-4 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{resolvedCount}</div>
                    </CardContent>
                </Card>
            </div>

            {error ? (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                    {error}
                </div>
            ) : loading ? (
                <div className="flex h-40 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
            ) : complaints.length === 0 ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                            <FileText className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h2 className="mt-6 text-xl font-semibold">No complaints registered</h2>
                        <p className="mb-8 mt-2 text-center text-sm font-normal leading-6 text-muted-foreground">
                            You haven't submitted any complaints yet. The process is completely simple and transparent.
                        </p>
                        <Link to="/complaints/new">
                            <Button>Submit your first complaint</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {complaints.map((complaint, i) => (
                        <motion.div
                            key={complaint._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: i * 0.1 }}
                        >
                            <Card className="h-full flex flex-col hover:border-primary/50 transition-colors">
                                <CardHeader>
                                    <div className="flex justify-between items-start gap-4">
                                        <CardTitle className="text-lg line-clamp-1">{complaint.title}</CardTitle>
                                        <Badge variant={complaint.status.toLowerCase()}>{complaint.status.replace('_', ' ')}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(complaint.createdAt).toLocaleDateString()} • {complaint.category} • {complaint.department}
                                    </p>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {complaint.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
