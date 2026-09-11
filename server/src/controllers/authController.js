const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET || 'medibook_super_secure_secret_key_2026_fyp',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, city } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Default to 'patient' unless explicitly allowed
    let assignedRole = 'patient';
    if (['patient', 'doctor', 'hospital_admin'].includes(role)) {
      assignedRole = role;
    }

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      phone: phone || '',
      city: city || 'Lahore',
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact support.',
      });
    }

    const token = generateToken(user);

    // Attach doctor or hospital context if applicable
    let extraContext = {};
    if (user.role === 'doctor') {
      const docProfile = await Doctor.findOne({ user: user._id }).populate('hospital', 'name slug');
      if (docProfile) {
        extraContext.doctorId = docProfile._id;
        extraContext.hospitalId = docProfile.hospital?._id;
        extraContext.hospitalName = docProfile.hospital?.name;
      }
    } else if (user.role === 'hospital_admin') {
      const hosp = await Hospital.findOne({ adminUser: user._id });
      if (hosp) {
        extraContext.hospitalId = hosp._id;
        extraContext.hospitalName = hosp.name;
        extraContext.hospitalSlug = hosp.slug;
      }
    }

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        avatar: user.avatar,
        ...extraContext,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let extraContext = {};

    if (user.role === 'doctor') {
      const docProfile = await Doctor.findOne({ user: user._id })
        .populate('hospital', 'name slug logo')
        .populate('department', 'name')
        .populate('specialties', 'name');
      if (docProfile) {
        extraContext.doctorProfile = docProfile;
      }
    } else if (user.role === 'hospital_admin') {
      const hosp = await Hospital.findOne({ adminUser: user._id });
      if (hosp) {
        extraContext.hospitalProfile = hosp;
      }
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        avatar: user.avatar,
        ...extraContext,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, city, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, city, avatar },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};
