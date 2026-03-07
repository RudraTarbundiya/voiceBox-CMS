import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Login() {
    const { login, user, loading } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // If already logged in, redirect to dashboard based on role
    useEffect(() => {
        if (!loading && user) {
            toast('You are already logged in!', { icon: 'ℹ️' });
            if (user.role === 'admin') {
                navigate('/admin', { replace: true });
            } else if (user.role === 'coordinator') {
                navigate('/coordinator', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        }
    }, [user, loading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            await login(formData);
            toast.success('Login successful! Welcome back.');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid credentials');
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="border-border bg-card/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <GoogleLoginButton />

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground backdrop-blur-xl">Or continue with email</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@college.edu"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                                        Password
                                    </label>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                            <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                                {isSubmitting ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col items-center justify-center space-y-2 text-sm text-muted-foreground">
                        <div>
                            Don't have an account?{' '}
                            <Link to="/register" className="font-semibold text-primary hover:underline">
                                Sign up
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
