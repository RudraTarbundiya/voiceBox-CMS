import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Mic, LogOut, Menu, X, Home, FileText, Settings, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../utils/cn';

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navLinks = [
        {
            title: 'Dashboard',
            icon: Home,
            href: user?.role === 'admin' ? '/admin' : user?.role === 'coordinator' ? '/coordinator' : '/dashboard',
            roles: ['student', 'faculty', 'coordinator', 'admin']
        },
        {
            title: 'Submit Complaint',
            icon: FileText,
            href: '/complaints/new',
            roles: ['student', 'faculty']
        },
        {
            title: 'Manage Users',
            icon: Users,
            href: '/admin/users',
            roles: ['admin']
        }
    ];

    const filteredLinks = navLinks.filter(link => link.roles.includes(user?.role));

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">

            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-card transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-16 items-center px-6 border-b">
                    <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Mic className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Voice<span className="text-primary">Box</span></span>
                    </Link>
                </div>

                <div className="flex flex-col justify-between h-[calc(100vh-4rem)]">
                    <nav className="space-y-1 p-4">
                        {filteredLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.href || location.pathname.startsWith(`${link.href}/`);

                            return (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    {link.title}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t">
                        <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground mb-4 bg-muted/50 rounded-lg">
                            <div className="flex-1 overflow-hidden">
                                <p className="truncate font-medium text-foreground">{user?.name}</p>
                                <p className="truncate text-xs">{user?.email}</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-16 items-center justify-between border-b px-4 lg:px-8 bg-background/80 backdrop-blur-md">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 -ml-2 rounded-md hover:bg-muted"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="flex-1" />

                    <div className="flex items-center gap-4">
                        <div className="hidden text-sm md:block text-muted-foreground bg-muted px-3 py-1 rounded-full">
                            Role: <span className="font-semibold text-foreground uppercase">{user?.role}</span>
                            {user?.department && ` • Dept: ${user.department}`}
                        </div>

                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="rounded-full p-2 transition-colors hover:bg-muted"
                        >
                            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-8">
                    <div className="mx-auto max-w-7xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
