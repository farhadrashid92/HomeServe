import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Service from '../models/Service.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID');

// Category → default service title + description map
const CATEGORY_DEFAULTS = {
  Cleaning:     { title: 'Home Cleaning Service',      description: 'Professional home cleaning services including deep cleaning, regular maintenance, kitchen and bathroom sanitization.' },
  Maintenance:  { title: 'AC Repair & Maintenance',    description: 'Expert AC installation, repair, gas refilling, filter cleaning, and full servicing for all brands.' },
  Electrical:   { title: 'Electrical Services',        description: 'Licensed electrician for wiring, fuse box work, appliance installation, fault finding, and safety checks.' },
  Plumbing:     { title: 'Plumbing Services',          description: 'Expert plumber for leaks, blockages, pipe fitting, water heater installation, and bathroom fittings.' },
  'Pest Control': { title: 'Pest Control Services',   description: 'Safe and effective treatment for cockroaches, ants, bedbugs, rodents, and termites.' },
  Painting:     { title: 'Painting Services',          description: 'Interior and exterior wall painting with premium quality paints and professional finish.' },
  Carpenter:    { title: 'Carpentry Services',         description: 'Custom furniture, door/window fitting, cabinet installation, and woodwork repairs.' },
  'CCTV Installation': { title: 'CCTV Installation',  description: 'Install and configure security cameras, DVR/NVR systems, and remote viewing setup.' },
  Gardening:    { title: 'Gardening Services',         description: 'Lawn mowing, plant care, garden design, and seasonal maintenance.' },
  'Home Shifting': { title: 'Home Shifting Services', description: 'Safe packing, loading, transport, and unpacking of household belongings.' },
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role, phone, profileImage, address, category, price } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'customer',
      phone,
      profileImage,
      address,
    });

    await user.save();

    // ── Link Provider to Service Category ────────────────────────
    if (user.role === 'provider' && category) {
      const existingService = await Service.findOne({ category });
      if (existingService) {
        await Service.updateOne(
          { _id: existingService._id },
          { $addToSet: { providers: user._id } }
        );
      } else {
        const defaults = CATEGORY_DEFAULTS[category] || {
          title: `${category} Service`,
          description: `Professional ${category.toLowerCase()} services by a verified provider.`,
        };

        await Service.create({
          title: defaults.title,
          description: defaults.description,
          category,
          price: price || 1500,
          providers: [user._id],
        });
      }
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profileImage: user.profileImage,
      address: user.address,
      availability: user.availability,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
        address: user.address,
        availability: user.availability,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      user.profileImage = req.body.profileImage || user.profileImage;

      if (req.body.availability) {
        user.availability = req.body.availability;
      }

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        profileImage: updatedUser.profileImage,
        address: updatedUser.address,
        availability: updatedUser.availability,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate User or Provider via Google ID Token
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  const { credential, role, phone, address, profileImage, category, price } = req.body;

  try {
    // Determine audience strictly checking against env variables or dummy constants
    const audience = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
    
    // Explicit token bypass if the string inherently matches local dummy debugging (Avoids crashing until Admin provisions Google Cloud Keys)
    let email, name, picture;
    
    if (audience === 'YOUR_GOOGLE_CLIENT_ID' && credential.includes('dummy')) {
       email = `test_${Math.random().toString(36).slice(2, 7)}@example.com`;
       name = 'Google Test User';
       picture = '';
    } else {
       const ticket = await client.verifyIdToken({
         idToken: credential,
         audience: audience,
       });
       const payload = ticket.getPayload();
       email = payload.email;
       name = payload.name;
       picture = payload.picture;
    }
    
    let user = await User.findOne({ email });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const generatedPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(generatedPassword, salt);

      user = new User({
        name,
        email,
        password: hashedPassword,
        role: role || 'customer',
        phone: phone || '',
        profileImage: profileImage || picture,
        address: address || '',
      });

      await user.save();

      // Only attempt to bind Service Category defaults if registering explicitly under the Provider role
      if (user.role === 'provider' && category) {
        const existingService = await Service.findOne({ category });
        if (existingService) {
          await Service.updateOne(
            { _id: existingService._id },
            { $addToSet: { providers: user._id } }
          );
        } else {
          const defaults = CATEGORY_DEFAULTS[category] || {
            title: `${category} Service`,
            description: `Professional ${category.toLowerCase()} services by a verified provider.`,
          };

          await Service.create({
            title: defaults.title,
            description: defaults.description,
            category,
            price: price || 1500,
            providers: [user._id],
          });
        }
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profileImage: user.profileImage,
      address: user.address,
      availability: user.availability,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Google Auth Validation Error:", error.message);
    res.status(401).json({ message: 'Google authentication validation actively failed' });
  }
};
