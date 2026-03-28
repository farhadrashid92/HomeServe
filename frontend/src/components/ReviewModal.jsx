import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import StarRating from './StarRating';
import { createReview } from '../services/reviewService';

const ReviewModal = ({ isOpen, onClose, booking, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createReview({
        bookingId: booking._id,
        rating,
        comment
      });
      onReviewSubmitted(booking._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Rate Your Service</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6 bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold shrink-0">
               {booking.provider?.name?.charAt(0) || 'P'}
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{booking.service?.title}</h3>
              <p className="text-sm text-slate-500">Provided by {booking.provider?.name}</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="mb-8 flex flex-col items-center">
            <p className="text-center font-bold text-slate-900 mb-4 text-lg">How was your experience?</p>
            <StarRating 
              rating={rating} 
              size="lg" 
              readOnly={false} 
              onChange={(newRating) => {
                setRating(newRating);
                setError(null);
              }}
            />
            <p className="text-sm text-slate-400 mt-2 font-medium">Click to rate</p>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Leave a Comment</label>
            <textarea 
              rows="4" 
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you liked (or didn't like) about the service..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white resize-none"
            ></textarea>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-3 font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-3 font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md shadow-primary-200"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
