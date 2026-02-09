/**
 * Sidebar Component
 * Secondary navigation for dashboard pages
 */

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

const Sidebar = () => {
    const { user } = useAuth();

    // Define navigation items based on role
    const getNavItems = () => {
        const baseItems = [];

        if (user?.role === ROLES.ADMIN) {
            return [
                { to: '/admin', label: 'Dashboard', icon: '📊' },
                { to: '/admin/complaints', label: 'All Complaints', icon: '📋' },
                { to: '/admin/users', label: 'Manage Users', icon: '👥' },
                { to: '/admin/coordinators', label: 'Coordinators', icon: '🎖️' }
            ];
        }

        if (user?.role === ROLES.COORDINATOR) {
            return [
                { to: '/coordinator', label: 'Dashboard', icon: '📊' },
                { to: '/coordinator/complaints', label: 'Department Complaints', icon: '📋' }
            ];
        }

        // Student / Faculty
        return [
            { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
            { to: '/complaints/new', label: 'Submit Complaint', icon: '➕' },
            { to: '/complaints/my', label: 'My Complaints', icon: '📋' }
        ];
    };

    const navItems = getNavItems();

    return (
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
            <div className="p-4">
                {/* User Info Card */}
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-600 capitalize">
                                {user?.role} • {user?.department}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/dashboard' || item.to === '/admin' || item.to === '/coordinator'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-primary-50 text-primary-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span className="text-sm">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
