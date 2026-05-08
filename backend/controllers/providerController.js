import User from '../models/User.js';

// @desc    Get all providers (users with role='provider')
// @route   GET /api/providers
// @access  Public
export const getProviders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments({ role: 'provider' });
    const providers = await User.find({ role: 'provider' })
      .skip(skip)
      .limit(limit)
      .select('name email profileImage phone address averageRating reviewsCount');

    res.json({
      data: providers,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get single provider
// @route   GET /api/providers/:id
// @access  Public
export const getProviderById = async (req, res) => {
  try {
    const provider = await User.findById(req.params.id).select('-password');
    if (provider && provider.role === 'provider') {
      res.json(provider);
    } else {
      res.status(404).json({ message: 'Provider not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
