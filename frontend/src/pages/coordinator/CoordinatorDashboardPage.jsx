/**
 * Coordinator Dashboard Page
 * Dashboard for department coordinators
 * Features: view department complaints, update status
 */

import { useEffect, useState } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import ComplaintCard from '../../components/complaint/ComplaintCard';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import { STATUS_CONFIG, STATUSES } from '../../utils/constants';

const CoordinatorDashboardPage = () => {
    const { user } = useAuth();
    const { complaints, fetchDepartmentComplaints, updateStatus, loading } = useComplaints();

    const [filter, setFilter] = useState('all');
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [statusNote, setStatusNote] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        assigned: 0,
        inProgress: 0,
        resolved: 0
    });

    useEffect(() => {
        fetchDepartmentComplaints();
    }, [fetchDepartmentComplaints]);

    // Calculate stats
    useEffect(() => {
        if (complaints.length > 0) {
            setStats({
                total: complaints.length,
                assigned: complaints.filter(c => c.status === 'ASSIGNED').length,
                inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
                resolved: complaints.filter(c => c.status === 'RESOLVED').length
            });
        }
    }, [complaints]);

    // Filter complaints
    const filteredComplaints = complaints.filter(c => {
        if (filter === 'all') return true;
        return c.status === filter;
    });

    // Get valid next statuses for a complaint
    const getNextStatuses = (currentStatus) => {
        const transitions = {
            'ASSIGNED': ['IN_PROGRESS'],
            'IN_PROGRESS': ['RESOLVED']
        };
        return transitions[currentStatus] || [];
    };

    // View details handler
    const handleViewDetails = (complaint) => {
        setSelectedComplaint(complaint);
        setShowDetailsModal(true);
    };

    // Handle status update
    const handleAction = (complaint) => {
        const nextStatuses = getNextStatuses(complaint.status);
        if (nextStatuses.length > 0) {
            setSelectedComplaint(complaint);
            setNewStatus(nextStatuses[0]);
            setShowStatusModal(true);
        }
    };

    const handleUpdateStatus = async () => {
        if (!newStatus) return;
        const result = await updateStatus(selectedComplaint._id, newStatus, statusNote);
        if (result.success) {
            setShowStatusModal(false);
            setSelectedComplaint(null);
            setNewStatus('');
            setStatusNote('');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="flex">
                <Sidebar />

                <main className="flex-1 p-6">
                    {/* Page Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Coordinator Dashboard</h1>
                        <p className="text-gray-600 mt-1">
                            Managing complaints for <span className="font-semibold">{user?.department}</span> department
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="card p-5">
                            <p className="text-sm text-gray-500 mb-1">Total Assigned</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="card p-5 border-l-4 border-yellow-500">
                            <p className="text-sm text-gray-500 mb-1">Waiting</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.assigned}</p>
                        </div>
                        <div className="card p-5 border-l-4 border-purple-500">
                            <p className="text-sm text-gray-500 mb-1">In Progress</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
                        </div>
                        <div className="card p-5 border-l-4 border-green-500">
                            <p className="text-sm text-gray-500 mb-1">Resolved</p>
                            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2 flex-wrap mb-6">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            All
                        </button>
                        {['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => {
                            const count = complaints.filter(c => c.status === status).length;
                            return (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === status ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {STATUS_CONFIG[status].label} ({count})
                                </button>
                            );
                        })}
                    </div>

                    {/* Complaints List */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
                        </div>
                    ) : filteredComplaints.length > 0 ? (
                        <div className="grid gap-4">
                            {filteredComplaints.map(complaint => {
                                const canUpdate = getNextStatuses(complaint.status).length > 0;
                                return (
                                    <div key={complaint._id} className="relative">
                                        <ComplaintCard
                                            complaint={complaint}
                                            onViewDetails={handleViewDetails}
                                            onAction={canUpdate ? handleAction : undefined}
                                        />
                                        {canUpdate && (
                                            <div className="absolute top-4 right-4">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAction(complaint)}
                                                >
                                                    Update Status
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="card p-12 text-center">
                            <p className="text-4xl mb-4">📭</p>
                            <p className="text-gray-500">No complaints assigned to your department</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Update Status Modal */}
            <Modal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                title="Update Complaint Status"
            >
                {selectedComplaint && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-gray-900">{selectedComplaint.title}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Current Status: {STATUS_CONFIG[selectedComplaint.status]?.label}
                            </p>
                        </div>

                        <div>
                            <label className="label">New Status</label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="input"
                            >
                                {getNextStatuses(selectedComplaint.status).map(status => (
                                    <option key={status} value={status}>
                                        {STATUS_CONFIG[status].label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label">Note (Optional)</label>
                            <textarea
                                value={statusNote}
                                onChange={(e) => setStatusNote(e.target.value)}
                                placeholder="Add a note about this status change..."
                                rows={3}
                                className="input resize-none"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button variant="secondary" onClick={() => setShowStatusModal(false)} fullWidth>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdateStatus} fullWidth>
                                Update Status
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Details Modal */}
            <Modal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                title="Complaint Details"
                size="lg"
            >
                {selectedComplaint && (
                    <div className="space-y-4">
                        <div>
                            <span className={STATUS_CONFIG[selectedComplaint.status]?.bgClass}>
                                {STATUS_CONFIG[selectedComplaint.status]?.label}
                            </span>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg text-gray-900">
                                {selectedComplaint.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Category: {selectedComplaint.category} • Department: {selectedComplaint.department}
                            </p>
                        </div>

                        <div>
                            <p className="text-gray-700 whitespace-pre-wrap">
                                {selectedComplaint.description}
                            </p>
                        </div>

                        {selectedComplaint.attachments?.length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Attachments</h4>
                                <div className="space-y-1">
                                    {selectedComplaint.attachments.map((file, idx) => (
                                        <a
                                            key={idx}
                                            href={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/uploads/${file.filename}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-primary-600 hover:underline"
                                        >
                                            📎 {file.originalName}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedComplaint.feedback && (
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-medium text-green-900 mb-1">User Feedback</h4>
                                <p className="text-sm text-green-700">
                                    Rating: {selectedComplaint.feedback.rating}/10
                                </p>
                                <p className="text-sm text-green-700 mt-1">
                                    {selectedComplaint.feedback.comment}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CoordinatorDashboardPage;
