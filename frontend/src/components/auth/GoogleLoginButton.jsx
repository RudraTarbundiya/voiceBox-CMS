/**
 * GoogleLoginButton Component
 * Google OAuth login button with One Tap support
 */

import { GoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { DEPARTMENTS } from '../../utils/constants';

const GoogleLoginButton = ({ onSuccess, enableOneTap = true }) => {
    const { googleLogin } = useAuth();
    const [showDepartmentModal, setShowDepartmentModal] = useState(false);
    const [pendingCredential, setPendingCredential] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedRole, setSelectedRole] = useState('student');
    const [loading, setLoading] = useState(false);

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);

        try {
            // Try to login/register with ID token
            const result = await googleLogin(credentialResponse.credential);

            if (result.requiresInfo) {
                // New user - need department selection
                setPendingCredential(credentialResponse.credential);
                setShowDepartmentModal(true);
            } else if (result.success) {
                onSuccess && onSuccess(result.user);
            }
        } catch (error) {
            console.error('Google login error:', error);
        }

        setLoading(false);
    };

    const handleGoogleError = () => {
        console.error('Google login failed');
        setLoading(false);
    };

    // Enable One Tap login
    useGoogleOneTapLogin({
        onSuccess: handleGoogleSuccess,
        onError: handleGoogleError,
        disabled: !enableOneTap,
        auto_select: false,
        cancel_on_tap_outside: true,
        prompt_parent_id: 'g_id_onload'
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
            {/* One Tap container */}
            <div id="g_id_onload"></div>

            {/* Standard Google button */}
            <div className={`flex justify-center ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    size="large"
                    text="continue_with"
                    logo_alignment="left"
                    useOneTap={false}
                />
            </div>

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
