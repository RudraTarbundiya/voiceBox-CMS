/**
 * Dashboard Page
 * Main dashboard for students and faculty
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import ComplaintCard from '../../components/complaint/ComplaintCard';
import { STATUS_CONFIG } from '../../utils/constants';

const DashboardPage = () => {
    const { user } = useAuth();
    const { complaints, fetchMyComplaints, loading } = useComplaints();
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        resolved: 0,
        closed: 0
    });

    useEffect(() => {
        fetchMyComplaints();
    }, [fetchMyComplaints]);

    // Calculate stats
    useEffect(() => {
        if (complaints.length > 0) {
            setStats({
                total: complaints.length,
                pending: complaints.filter(c => ['NEW', 'ASSIGNED', 'IN_PROGRESS'].includes(c.status)).length,
                resolved: complaints.filter(c => c.status === 'RESOLVED').length,
                closed: complaints.filter(c => c.status === 'CLOSED').length
            });
        }
    }, [complaints]);

    // Recent complaints (last 5)
    const recentComplaints = complaints.slice(0, 5);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="flex">
                <Sidebar />

                <main className="flex-1 p-6">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Welcome back, {user?.name?.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Here's an overview of your complaints
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <Link
                            to="/complaints/new"
                            className="card p-6 hover:shadow-md transition-shadow group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                                    <span className="text-2xl">➕</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Submit Complaint</h3>
                                    <p className="text-sm text-gray-500">File a new complaint</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            to="/complaints/my"
                            className="card p-6 hover:shadow-md transition-shadow group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                    <span className="text-2xl">📋</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">My Complaints</h3>
                                    <p className="text-sm text-gray-500">View all your complaints</p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="card p-5">
                            <p className="text-sm text-gray-500 mb-1">Total Complaints</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="card p-5">
                            <p className="text-sm text-gray-500 mb-1">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                        </div>
                        <div className="card p-5">
                            <p className="text-sm text-gray-500 mb-1">Resolved</p>
                            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                        </div>
                        <div className="card p-5">
                            <p className="text-sm text-gray-500 mb-1">Closed</p>
                            <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
                        </div>
                    </div>

                    {/* Recent Complaints */}
                    <div className="card">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Complaints</h2>
                            <Link to="/complaints/my" className="text-sm text-primary-600 hover:text-primary-700">
                                View all →
                            </Link>
                        </div>

                        <div className="p-6">
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                    <p className="text-gray-500 mt-2">Loading...</p>
                                </div>
                            ) : recentComplaints.length > 0 ? (
                                <div className="space-y-4">
                                    {recentComplaints.map(complaint => (
                                        <ComplaintCard
                                            key={complaint._id}
                                            complaint={complaint}
                                            showActions={false}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-4xl mb-2">📭</p>
                                    <p className="text-gray-500">No complaints yet</p>
                                    <Link to="/complaints/new" className="text-primary-600 text-sm mt-2 inline-block">
                                        Submit your first complaint
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;
