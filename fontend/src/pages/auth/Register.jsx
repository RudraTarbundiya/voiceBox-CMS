import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { sanitizePayload } from '../../utils/sanitize';
import api from '../../api/axios';

export default function Register() {
    const { register, user, loading } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        department: 'CE',
        role: 'student'
    });
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);

    const configuredDomain = import.meta.env.VITE_DOMAIN ;
    const allowedDomain = configuredDomain.startsWith('@')
        ? configuredDomain.toLowerCase()
        : `@${configuredDomain.toLowerCase()}`;
    const isValidDomain = formData.email.toLowerCase().endsWith(allowedDomain);

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

    // Countdown timer for OTP resend
    useEffect(() => {
        if (otpTimer <= 0) return;
        const interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [otpTimer]);

    const handleSendOtp = async () => {
        if (!formData.email) {
            toast.error('Please enter your email first');
            return;
        }
        if (!isValidDomain) {
            toast.error(`Only ${allowedDomain} email addresses are allowed`);
            return;
        }
        setIsSendingOtp(true);
        try {
            const response = await api.post('/auth/send-otp', { email: formData.email });
            toast.success(response.data.message || 'OTP sent to your email!');
            setOtpSent(true);
            setOtpTimer(60);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!otpSent) {
            toast.error('Please verify your email with OTP first');
            return;
        }
        if (!otpValue || otpValue.length !== 4) {
            toast.error('Please enter the 4-digit OTP');
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            await register(sanitizePayload({ ...formData, otp: otpValue }));
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-lg"
            >
                <Card className="border-border bg-card/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-3xl font-bold tracking-tight">Create an account</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Register as a student or faculty member
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <GoogleLoginButton />

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground backdrop-blur-xl">Or register with email</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none" htmlFor="name">Full Name</label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none" htmlFor="email">
                                    College Email <span className="text-xs text-muted-foreground">(must be {allowedDomain})</span>
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder={`yourname${allowedDomain}`}
                                        required
                                        value={formData.email}
                                        onChange={(e) => {
                                            setFormData({ ...formData, email: e.target.value });
                                            setOtpSent(false);
                                            setOtpValue('');
                                        }}
                                        className={formData.email && !isValidDomain ? 'border-destructive' : ''}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="shrink-0"
                                        disabled={!isValidDomain || isSendingOtp || otpTimer > 0}
                                        onClick={handleSendOtp}
                                    >
                                        {isSendingOtp ? 'Sending...' : otpTimer > 0 ? `Resend (${otpTimer}s)` : otpSent ? 'Resend OTP' : 'Send OTP'}
                                    </Button>
                                </div>
                                {formData.email && !isValidDomain && (
                                    <p className="text-xs text-destructive">Only {allowedDomain} emails are allowed</p>
                                )}
                            </div>

                            {otpSent && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none" htmlFor="otp">Enter OTP</label>
                                    <Input
                                        id="otp"
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="4-digit OTP"
                                        maxLength={4}
                                        required
                                        value={otpValue}
                                        onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    />
                                    <p className="text-xs text-muted-foreground">Check your inbox at {formData.email}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none" htmlFor="department">Department</label>
                                    <select
                                        id="department"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    >
                                        <option value="CE">Computer Engineering</option>
                                        <option value="IT">Information Technology</option>
                                        <option value="EC">Electronics & Communication</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none" htmlFor="role">Role</label>
                                    <select
                                        id="role"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="student">Student</option>
                                        <option value="faculty">Faculty</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none" htmlFor="password">Password</label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            {error && <p className="text-sm text-destructive">{error}</p>}

                            <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating account...' : 'Create Account'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col items-center justify-center space-y-2 text-sm text-muted-foreground">
                        <div>
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-primary hover:underline">
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
