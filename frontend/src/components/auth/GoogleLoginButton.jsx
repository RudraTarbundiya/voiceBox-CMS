/**
 * GoogleLoginButton Component
 * Google OAuth login button using @react-oauth/google
 */

import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { DEPARTMENTS } from '../../utils/constants';

const GoogleLoginButton = ({ onSuccess }) => {
    const { googleLogin } = useAuth();
    const [showDepartmentModal, setShowDepartmentModal] = useState(false);
    const [pendingCredential, setPendingCredential] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedRole, setSelectedRole] = useState('student');
    const [loading, setLoading] = useState(false);

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);

            // Get user info from Google
            const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            }).then(res => res.json());

            // Try to login/register
            const result = await googleLogin(tokenResponse.id_token || tokenResponse.access_token, {
                credential: tokenResponse.access_token
            });

            if (result.requiresInfo) {
                // New user - need department selection
                setPendingCredential(tokenResponse.access_token);
                setShowDepartmentModal(true);
            } else if (result.success) {
                onSuccess && onSuccess(result.user);
            }

            setLoading(false);
        },
        onError: (error) => {
            console.error('Google login error:', error);
            setLoading(false);
        },
        flow: 'implicit'
    });

    const handleDepartmentSubmit = async () => {
        if (!selectedDepartment) return;

        setLoading(true);
        const result = await googleLogin(pendingCredential, {
            department: selectedDepartment,
            role: selectedRole
        });

        if (result.success) {
            setShowDepartmentModal(false);
            onSuccess && onSuccess(result.user);
        }
        setLoading(false);
    };

    return (
        <>
            <button
                onClick={() => login()}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
                {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                ) : (
                    <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Continue with Google</span>
                    </>
                )}
            </button>

            {/* Department Selection Modal for New Users */}
            <Modal
                isOpen={showDepartmentModal}
                onClose={() => setShowDepartmentModal(false)}
                title="Complete Your Registration"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Please select your department and role to complete registration.
                    </p>

                    <div>
                        <label className="label">Department</label>
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="input"
                        >
                            <option value="">Select Department</option>
                            {DEPARTMENTS.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="label">Role</label>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="input"
                        >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="secondary"
                            onClick={() => setShowDepartmentModal(false)}
                            fullWidth
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDepartmentSubmit}
                            loading={loading}
                            disabled={!selectedDepartment}
                            fullWidth
                        >
                            Complete Registration
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default GoogleLoginButton;
