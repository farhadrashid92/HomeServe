import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import User from '../models/User.js';

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  try {
    const booking = await Booking.findById(bookingId).populate('service');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify booking belongs to user
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to review this booking' });
    }

    // Verify booking status
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed bookings can be reviewed' });
    }

    // Check for existing review
    const existingReview = await Review.findOne({ booking: bookingId, user: req.user._id });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this booking' });
    }

    const review = await Review.create({
      user: req.user._id,
      service: booking.service._id,
      provider: booking.provider,
      booking: booking._id,
      rating: Number(rating),
      comment
    });

    // --- Update Service Average Rating ---
    const serviceReviews = await Review.find({ service: booking.service._id });
    const serviceAvg = serviceReviews.reduce((acc, item) => item.rating + acc, 0) / serviceReviews.length;
    
    await Service.findByIdAndUpdate(booking.service._id, {
      averageRating: serviceAvg,
      reviewsCount: serviceReviews.length
    });

    // --- Update Provider Average Rating ---
    const providerReviews = await Review.find({ provider: booking.provider });
    const providerAvg = providerReviews.reduce((acc, item) => item.rating + acc, 0) / providerReviews.length;
    
    await User.findByIdAndUpdate(booking.provider, {
      averageRating: providerAvg,
      reviewsCount: providerReviews.length
    });

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating review' });
  }
};

// @desc    Get reviews for a service
// @route   GET /api/reviews/service/:serviceId
// @access  Public
export const getServiceReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ service: req.params.serviceId })
      .populate('user', 'name profileImage')
      .populate('provider', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching service reviews' });
  }
};

// @desc    Get reviews for a provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
export const getProviderReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching provider reviews' });
  }
};

// @desc    Get my reviews
// @route   GET /api/reviews/me
// @access  Private
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('service', 'title')
      .populate('provider', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user reviews' });
  }
};
