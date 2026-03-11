import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { ArrowUpCircle, LogOut } from 'lucide-react';

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [deptFilter, setDeptFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [promotingId, setPromotingId] = useState(null);
    const [loggingOutId, setLoggingOutId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [deptFilter, roleFilter]);

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const params = new URLSearchParams();
            if (deptFilter) params.append('department', deptFilter);
            if (roleFilter) params.append('role', roleFilter);
            const queryString = params.toString() ? `?${params.toString()}` : '';
            const res = await api.get(`/admin/users${queryString}`);
            setUsers(res.data.users || []);
        } catch (err) {
            toast.error('failed with ' + (err.response?.data?.message || 'an error'));
        } finally {
            setUsersLoading(false);
        }
    };

    const handlePromote = async (userId, userName) => {
        if (!confirm(`Promote ${userName} to Coordinator? This action cannot be undone.`)) return;
        setPromotingId(userId);
        try {
            const res = await api.patch(`/admin/users/${userId}/promote`);
            toast.success(res.data.message || `${userName} promoted to Coordinator!`);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to promote user');
        } finally {
            setPromotingId(null);
        }
    };

    const handleForceLogout = async (userId, userName) => {
        if (!confirm(`Force logout ${userName} from all devices?`)) return;
        setLoggingOutId(userId);
        try {
            const res = await api.delete(`/admin/users/${userId}/sessions`);
            toast.success(res.data.message || `${userName} logged out from all devices`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to force logout user');
        } finally {
            setLoggingOutId(null);
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-red-500/15 text-red-500 border-red-500/30';
            case 'coordinator': return 'bg-purple-500/15 text-purple-500 border-purple-500/30';
            case 'faculty': return 'bg-blue-500/15 text-blue-500 border-blue-500/30';
            case 'student': return 'bg-green-500/15 text-green-500 border-green-500/30';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
                <p className="text-muted-foreground">View all registered users, promote faculty, or force logout sessions.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-muted-foreground">Department:</label>
                    <select
                        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="CE">CE</option>
                        <option value="IT">IT</option>
                        <option value="EC">EC</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-muted-foreground">Role:</label>
                    <select
                        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="coordinator">Coordinator</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div className="ml-auto">
                    <Badge variant="outline" className="text-sm">
                        {users.length} user{users.length !== 1 ? 's' : ''}
                    </Badge>
                </div>
            </div>

            {/* Users Table */}
            {usersLoading ? (
                <div className="flex h-40 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
            ) : users.length === 0 ? (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed bg-muted/10">
                    <p className="text-muted-foreground">No users found.</p>
                </div>
            ) : (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-muted/30">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Department</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {users.map((user, i) => (
                                        <motion.tr
                                            key={user._id}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2, delay: i * 0.03 }}
                                            className="border-b last:border-b-0 hover:bg-muted/20 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium">{user.name}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-semibold px-2 py-0.5 rounded bg-muted">
                                                    {user.department}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getRoleBadgeColor(user.role)}`}>
                                                    {user.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    {user.role === 'faculty' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-purple-500 border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-400 cursor-pointer"
                                                            onClick={() => handlePromote(user._id, user.name)}
                                                            disabled={promotingId === user._id}
                                                        >
                                                            <ArrowUpCircle className="mr-1 h-4 w-4" />
                                                            {promotingId === user._id ? 'Promoting...' : 'Promote'}
                                                        </Button>
                                                    )}
                                                    {user.role !== 'admin' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-orange-500 border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400 cursor-pointer"
                                                            onClick={() => handleForceLogout(user._id, user.name)}
                                                            disabled={loggingOutId === user._id}
                                                        >
                                                            <LogOut className="mr-1 h-4 w-4" />
                                                            {loggingOutId === user._id ? 'Logging out...' : 'Force Logout'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}
