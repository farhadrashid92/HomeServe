import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Service',
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Booking',
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Prevent users from leaving multiple reviews for the same booking
reviewSchema.index({ user: 1, booking: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
