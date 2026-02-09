/**
 * FeedbackForm Component
 * Form for submitting feedback on resolved complaints
 */

import { useState } from 'react';
import Button from '../common/Button';
import { useComplaints } from '../../context/ComplaintContext';
import { RATING_SCALE } from '../../utils/constants';

const FeedbackForm = ({ complaint, onSuccess, onCancel }) => {
    const { submitFeedback, loading } = useComplaints();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!comment.trim()) {
            setError('Please provide a comment');
            return;
        }

        const result = await submitFeedback(complaint._id, rating, comment);

        if (result.success) {
            onSuccess && onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
                <label className="label">
                    How would you rate the resolution? <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4 mt-2">
                    <input
                        type="range"
                        min={RATING_SCALE.MIN}
                        max={RATING_SCALE.MAX}
                        value={rating}
                        onChange={(e) => setRating(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <div className="w-16 h-12 flex items-center justify-center bg-primary-50 rounded-lg">
                        <span className="text-xl font-bold text-primary-600">{rating}</span>
                        <span className="text-sm text-primary-400">/10</span>
                    </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Poor</span>
                    <span>Excellent</span>
                </div>
            </div>

            {/* Comment */}
            <div>
                <label htmlFor="comment" className="label">
                    Your Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => {
                        setComment(e.target.value);
                        setError('');
                    }}
                    placeholder="Share your experience and suggestions..."
                    rows={4}
                    className={`input resize-none ${error ? 'input-error' : ''}`}
                />
                {error && (
                    <p className="text-sm text-red-500 mt-1">{error}</p>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
                {onCancel && (
                    <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
                        Cancel
                    </Button>
                )}
                <Button type="submit" loading={loading} fullWidth>
                    Submit Feedback
                </Button>
            </div>
        </form>
    );
};

export default FeedbackForm;
