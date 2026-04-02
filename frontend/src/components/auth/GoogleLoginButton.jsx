import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function GoogleLoginButton() {
    const { checkAuth } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showInfoForm, setShowInfoForm] = useState(false);
    const [pendingCredential, setPendingCredential] = useState(null);
    const [role, setRole] = useState('student');
    const [department, setDepartment] = useState('CE');

    const submitGoogleAuth = async (credential, extraData = {}) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/auth/google', {
                credential,
                ...extraData
            });

            if (res.data.success) {
                await checkAuth();
                navigate('/dashboard');
            } else if (res.data.requiresInfo) {
                // New user — need role & department
                setPendingCredential(credential);
                setShowInfoForm(true);
                setLoading(false);
            } else {
                setError(res.data.message || 'Google Auth failed');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to authenticate with Google';
            if (err.response?.data?.requiresInfo) {
                setPendingCredential(credential);
                setShowInfoForm(true);
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = (credentialResponse) => {
        submitGoogleAuth(credentialResponse.credential);
    };

    const handleError = () => {
        setError('Google Sign-In was unsuccessful or closed.');
    };

    const handleInfoSubmit = (e) => {
        e.preventDefault();
        if (pendingCredential) {
            submitGoogleAuth(pendingCredential, { role, department });
        }
    };

    const selectClass =
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

    if (showInfoForm) {
        return (
            <form onSubmit={handleInfoSubmit} className="space-y-3">
                <p className="text-sm text-center text-muted-foreground">
                    Complete your profile to continue with Google
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-sm font-medium leading-none" htmlFor="google-role">Role</label>
                        <select
                            id="google-role"
                            className={selectClass}
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium leading-none" htmlFor="google-dept">Department</label>
                        <select
                            id="google-dept"
                            className={selectClass}
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        >
                            <option value="CE">Computer Engineering</option>
                            <option value="IT">Information Technology</option>
                            <option value="EC">Electronics &amp; Communication</option>
                        </select>
                    </div>
                </div>
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                    {loading ? 'Signing in...' : 'Continue'}
                </button>
                <button
                    type="button"
                    onClick={() => { setShowInfoForm(false); setPendingCredential(null); setError(null); }}
                    className="w-full text-xs text-muted-foreground hover:underline"
                >
                    Cancel
                </button>
            </form>
        );
    }

    return (
        <div className="flex flex-col gap-2 items-center">
            {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-foreground"></div>
            ) : (
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={handleError}
                    width="300"
                    text="continue_with"
                    shape="rectangular"
                    theme="outline"
                    useOneTap
                />
            )}
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
        </div>
    );
}
