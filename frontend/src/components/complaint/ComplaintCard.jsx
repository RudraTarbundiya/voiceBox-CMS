/**
 * ComplaintCard Component
 * Displays a single complaint with status and actions
 */

import { STATUS_CONFIG, DEPARTMENT_LABELS } from '../../utils/constants';

const ComplaintCard = ({ complaint, onViewDetails, onAction, showActions = true }) => {
    const statusConfig = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.NEW;

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="card-hover p-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                        {complaint.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        #{complaint._id?.slice(-8)} • {formatDate(complaint.createdAt)}
                    </p>
                </div>
                <span className={statusConfig.bgClass}>
                    {statusConfig.label}
                </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {complaint.description}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-600">
                    📁 {complaint.category}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-600">
                    🏢 {DEPARTMENT_LABELS[complaint.department] || complaint.department}
                </span>
                {complaint.assignedDepartment && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-xs text-blue-700">
                        ➡️ Assigned: {complaint.assignedDepartment}
                    </span>
                )}
                {complaint.attachments?.length > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-600">
                        📎 {complaint.attachments.length} file(s)
                    </span>
                )}
            </div>

            {/* Feedback if exists */}
            {complaint.feedback && (
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-medium text-green-800">
                            Rating: {complaint.feedback.rating}/10
                        </span>
                    </div>
                    <p className="text-sm text-green-700">{complaint.feedback.comment}</p>
                </div>
            )}

            {/* Actions */}
            {showActions && (
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <button
                        onClick={() => onViewDetails && onViewDetails(complaint)}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                        View Details
                    </button>
                    {onAction && (
                        <>
                            <span className="text-gray-300">|</span>
                            <button
                                onClick={() => onAction(complaint)}
                                className="text-sm text-gray-600 hover:text-gray-700"
                            >
                                Take Action
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ComplaintCard;
