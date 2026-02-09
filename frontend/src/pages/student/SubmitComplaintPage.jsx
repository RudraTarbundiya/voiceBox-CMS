/**
 * Submit Complaint Page
 * Form for submitting new complaints
 */

import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import ComplaintForm from '../../components/complaint/ComplaintForm';

const SubmitComplaintPage = () => {
    const navigate = useNavigate();

    const handleSuccess = () => {
        navigate('/complaints/my');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="flex">
                <Sidebar />

                <main className="flex-1 p-6">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Submit Complaint</h1>
                        <p className="text-gray-600 mt-1">
                            Fill out the form below to submit a new complaint
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="max-w-2xl">
                        <div className="card p-6">
                            <ComplaintForm onSuccess={handleSuccess} />
                        </div>

                        {/* Info Box */}
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                            <h3 className="text-sm font-medium text-blue-800 mb-2">📌 Important Notes</h3>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• You cannot edit a complaint after submission</li>
                                <li>• Maximum 3 files, 5MB each</li>
                                <li>• Provide detailed information for faster resolution</li>
                                <li>• Your complaint will be reviewed by the admin</li>
                            </ul>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SubmitComplaintPage;
