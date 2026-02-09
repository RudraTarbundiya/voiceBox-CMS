/**
 * Admin Dashboard Page
 * Main dashboard for administrators
 * Features: view all complaints, assign departments, promote faculty, close complaints
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import ComplaintCard from '../../components/complaint/ComplaintCard';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { useComplaints } from '../../context/ComplaintContext';
import { useAlert } from '../../context/AlertContext';
import api from '../../api/axios';
import { STATUS_CONFIG, DEPARTMENTS, STATUSES } from '../../utils/constants';

const AdminDashboardPage = () => {
    const { complaints, fetchAllComplaints, assignDepartment, closeComplaint, loading } = useComplaints();
    const { showAlert } = useAlert();

    const [stats, setStats] = useState(null);
    const [filter, setFilter] = useState('all');
    const [faculty, setFaculty] = useState([]);
    const [coordinators, setCoordinators] = useState([]);

    // Modals
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [showPromoteModal, setShowPromoteModal] = useState(false);

    // Form state
    const [assignDept, setAssignDept] = useState('');
    const [closeNote, setCloseNote] = useState('');
    const [promoteUserId, setPromoteUserId] = useState('');

    useEffect(() => {
        fetchAllComplaints();
        fetchStats();
        fetchFaculty();
        fetchCoordinators();
    }, [fetchAllComplaints]);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/stats');
            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchFaculty = async () => {
        try {
            const response = await api.get('/admin/users/faculty');
            if (response.data.success) {
                setFaculty(response.data.faculty);
            }
        } catch (error) {
            console.error('Error fetching faculty:', error);
        }
    };

    const fetchCoordinators = async () => {
        try {
            const response = await api.get('/admin/users/coordinators');
            if (response.data.success) {
                setCoordinators(response.data.coordinators);
            }
        } catch (error) {
            console.error('Error fetching coordinators:', error);
        }
    };

    // Filter complaints
    const filteredComplaints = complaints.filter(c => {
        if (filter === 'all') return true;
        return c.status === filter;
    });

    // Handle assign department
    const handleAssign = async () => {
        if (!assignDept) return;
        const result = await assignDepartment(selectedComplaint._id, assignDept);
        if (result.success) {
            setShowAssignModal(false);
            setSelectedComplaint(null);
            setAssignDept('');
        }
    };

    // Handle close complaint
    const handleClose = async () => {
        const result = await closeComplaint(selectedComplaint._id, closeNote);
        if (result.success) {
            setShowCloseModal(false);
            setSelectedComplaint(null);
            setCloseNote('');
        }
    };

    // Handle promote faculty
    const handlePromote = async () => {
        if (!promoteUserId) return;
        try {
            const response = await api.patch(`/admin/users/${promoteUserId}/promote`);
            if (response.data.success) {
                showAlert('success', response.data.message);
                setShowPromoteModal(false);
                setPromoteUserId('');
                fetchFaculty();
                fetchCoordinators();
            }
        } catch (error) {
            showAlert('error', error.response?.data?.message || 'Failed to promote faculty');
        }
    };

    // Action handler
    const handleAction = (complaint) => {
        setSelectedComplaint(complaint);
        if (complaint.status === 'NEW') {
            setShowAssignModal(true);
        } else if (complaint.status === 'RESOLVED' && complaint.feedback) {
            setShowCloseModal(true);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="flex">
                <Sidebar />

                <main className="flex-1 p-6">
                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-gray-600 mt-1">Manage complaints and users</p>
                        </div>
                        <Button onClick={() => setShowPromoteModal(true)}>
                            🎖️ Promote Faculty
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                            <div className="card p-5">
                                <p className="text-sm text-gray-500 mb-1">Total Complaints</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.complaints.total}</p>
                            </div>
                            <div className="card p-5">
                                <p className="text-sm text-gray-500 mb-1">New</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {stats.complaints.byStatus?.NEW || 0}
                                </p>
                            </div>
                            <div className="card p-5">
                                <p className="text-sm text-gray-500 mb-1">In Progress</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {stats.complaints.byStatus?.IN_PROGRESS || 0}
                                </p>
                            </div>
                            <div className="card p-5">
                                <p className="text-sm text-gray-500 mb-1">Resolved</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {stats.complaints.byStatus?.RESOLVED || 0}
                                </p>
                            </div>
                            <div className="card p-5">
                                <p className="text-sm text-gray-500 mb-1">Avg Rating</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    ⭐ {stats.averageFeedbackRating}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Quick Info - Coordinators */}
                    <div className="card p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">Coordinators</h3>
                            <span className="text-sm text-gray-500">{coordinators.length} total</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {coordinators.length > 0 ? (
                                coordinators.map(coord => (
                                    <span key={coord._id} className="badge bg-green-100 text-green-800">
                                        {coord.name} ({coord.department})
                                    </span>
                                ))
                            ) : (
                                <span className="text-sm text-gray-500">No coordinators assigned yet</span>
                            )}
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
                        {Object.keys(STATUSES).map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === status ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {STATUS_CONFIG[status].label}
                            </button>
                        ))}
                    </div>

                    {/* Complaints List */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
                        </div>
                    ) : filteredComplaints.length > 0 ? (
                        <div className="grid gap-4">
                            {filteredComplaints.map(complaint => (
                                <ComplaintCard
                                    key={complaint._id}
                                    complaint={complaint}
                                    onAction={handleAction}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="card p-12 text-center">
                            <p className="text-4xl mb-4">📭</p>
                            <p className="text-gray-500">No complaints found</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Assign Department Modal */}
            <Modal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                title="Assign Department"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Assign this complaint to a department for resolution.
                    </p>
                    <div>
                        <label className="label">Select Department</label>
                        <select
                            value={assignDept}
                            onChange={(e) => setAssignDept(e.target.value)}
                            className="input"
                        >
                            <option value="">Choose department</option>
                            {DEPARTMENTS.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setShowAssignModal(false)} fullWidth>
                            Cancel
                        </Button>
                        <Button onClick={handleAssign} disabled={!assignDept} fullWidth>
                            Assign
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Close Complaint Modal */}
            <Modal
                isOpen={showCloseModal}
                onClose={() => setShowCloseModal(false)}
                title="Close Complaint"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Close this complaint after user feedback has been received.
                    </p>
                    <div>
                        <label className="label">Note (Optional)</label>
                        <textarea
                            value={closeNote}
                            onChange={(e) => setCloseNote(e.target.value)}
                            placeholder="Add a closing note..."
                            rows={3}
                            className="input resize-none"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setShowCloseModal(false)} fullWidth>
                            Cancel
                        </Button>
                        <Button variant="success" onClick={handleClose} fullWidth>
                            Close Complaint
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Promote Faculty Modal */}
            <Modal
                isOpen={showPromoteModal}
                onClose={() => setShowPromoteModal(false)}
                title="Promote Faculty to Coordinator"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Select a faculty member to promote as department coordinator.
                    </p>
                    <div>
                        <label className="label">Select Faculty</label>
                        <select
                            value={promoteUserId}
                            onChange={(e) => setPromoteUserId(e.target.value)}
                            className="input"
                        >
                            <option value="">Choose faculty member</option>
                            {faculty.map(f => (
                                <option key={f._id} value={f._id}>
                                    {f.name} ({f.department})
                                </option>
                            ))}
                        </select>
                    </div>
                    {faculty.length === 0 && (
                        <p className="text-sm text-yellow-600">No faculty members available for promotion.</p>
                    )}
                    <div className="flex gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setShowPromoteModal(false)} fullWidth>
                            Cancel
                        </Button>
                        <Button onClick={handlePromote} disabled={!promoteUserId} fullWidth>
                            Promote
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminDashboardPage;
