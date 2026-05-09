import express from 'express';
import { check } from 'express-validator';
import { registerUser, loginUser, updateProfile, googleAuth, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  registerUser
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  loginUser
);

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, updateProfile);

// @desc    Authenticate via Google Identity
// @route   POST /api/auth/google
// @access  Public
router.post('/google', googleAuth);

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', forgotPassword);

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
router.post('/reset-password/:token', resetPassword);

export default router;
