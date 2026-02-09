/**
 * My Complaints Page
 * View all complaints submitted by the current user
 */

import { useEffect, useState } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import ComplaintCard from '../../components/complaint/ComplaintCard';
import FeedbackForm from '../../components/complaint/FeedbackForm';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { useComplaints } from '../../context/ComplaintContext';
import { STATUS_CONFIG, STATUSES } from '../../utils/constants';

const MyComplaintsPage = () => {
    const { complaints, fetchMyComplaints, loading } = useComplaints();
    const [filter, setFilter] = useState('all');
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        fetchMyComplaints();
    }, [fetchMyComplaints]);

    // Filter complaints
    const filteredComplaints = complaints.filter(c => {
        if (filter === 'all') return true;
        return c.status === filter;
    });

    const handleViewDetails = (complaint) => {
        setSelectedComplaint(complaint);
        setShowDetailsModal(true);
    };

    const handleFeedbackClick = (complaint) => {
        setSelectedComplaint(complaint);
        setShowFeedbackModal(true);
    };

    const handleFeedbackSuccess = () => {
        setShowFeedbackModal(false);
        setSelectedComplaint(null);
        fetchMyComplaints();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="flex">
                <Sidebar />

                <main className="flex-1 p-6">
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
                            <p className="text-gray-600 mt-1">
                                Track all your submitted complaints
                            </p>
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'all'
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                All ({complaints.length})
                            </button>
                            {Object.keys(STATUSES).map(status => {
                                const count = complaints.filter(c => c.status === status).length;
                                if (count === 0) return null;
                                return (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === status
                                                ? 'bg-gray-900 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {STATUS_CONFIG[status].label} ({count})
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Complaints List */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="text-gray-500 mt-3">Loading complaints...</p>
                        </div>
                    ) : filteredComplaints.length > 0 ? (
                        <div className="grid gap-4">
                            {filteredComplaints.map(complaint => (
                                <div key={complaint._id} className="relative">
                                    <ComplaintCard
                                        complaint={complaint}
                                        onViewDetails={handleViewDetails}
                                    />

                                    {/* Feedback Button for RESOLVED complaints */}
                                    {complaint.status === 'RESOLVED' && !complaint.feedback && (
                                        <div className="mt-2">
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => handleFeedbackClick(complaint)}
                                            >
                                                ⭐ Submit Feedback
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card p-12 text-center">
                            <p className="text-4xl mb-4">📭</p>
                            <p className="text-gray-500">No complaints found</p>
                            {filter !== 'all' && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFilter('all')}
                                    className="mt-2"
                                >
                                    Clear filter
                                </Button>
                            )}
                        </div>
                    )}
                </main>
            </div>

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
                                <h4 className="font-medium text-green-900 mb-1">Your Feedback</h4>
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

            {/* Feedback Modal */}
            <Modal
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                title="Submit Feedback"
            >
                {selectedComplaint && (
                    <div>
                        <p className="text-sm text-gray-600 mb-4">
                            Provide feedback for: <strong>{selectedComplaint.title}</strong>
                        </p>
                        <FeedbackForm
                            complaint={selectedComplaint}
                            onSuccess={handleFeedbackSuccess}
                            onCancel={() => setShowFeedbackModal(false)}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MyComplaintsPage;
