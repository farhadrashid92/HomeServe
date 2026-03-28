import User from '../models/User.js';

// @desc    Get all providers (users with role='provider')
// @route   GET /api/providers
// @access  Public
export const getProviders = async (req, res) => {
  try {
    const providers = await User.find({ role: 'provider' }).select('-password');
    res.json(providers);
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
