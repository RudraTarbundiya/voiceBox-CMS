/**
 * Login Page
 * User authentication with email/password and Google OAuth
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';

const LoginPage = () => {
    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        email: 'rudra@gmail.com',
        password: '123456'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    function getDashboardPath(user) {
        if (!user) return '/dashboard';
        if (user.role === 'admin') return '/admin';
        if (user.role === 'coordinator') return '/coordinator';
        return '/dashboard';
    }

    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || getDashboardPath(user);
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, location.state, navigate, user]);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(formData.email, formData.password);

        if (result.success) {
            navigate(getDashboardPath(result.user), { replace: true });
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    const handleGoogleSuccess = (user) => {
        navigate(getDashboardPath(user), { replace: true });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <span className="text-white font-bold text-3xl">C</span>
                    </div>
                    <h1 className="mt-4 text-2xl font-bold text-gray-900">
                        Welcome Back
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Sign in to your account
                    </p>
                </div>

                {/* Login Card */}
                <div className="card p-8">
                    {/* Google Login */}
                    <GoogleLoginButton onSuccess={handleGoogleSuccess} />

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">or continue with email</span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="label">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                                className="input"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="label">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                className="input"
                            />
                        </div>

                        <Button type="submit" loading={loading} fullWidth>
                            Sign In
                        </Button>
                    </form>

                    {/* Register Link */}
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">
                            Register here
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-xs text-gray-400">
                    College Complaint Management System
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
