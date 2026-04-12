const { User, Chef } = require('../models');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { name, email, password, role, phone, address, city, state, country, zipCode } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'User already exists',
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user',
    phone,
    address,
    city,
    state,
    country,
    zipCode
  });

  // If registering as chef, create chef profile
  if (role === 'chef') {
    await Chef.create({
      userId: user.id,
      name,
      bio: req.body.bio || '',
      experience: req.body.experience || 0,
      pricePerService: req.body.pricePerService || 0,
      city: city,
      state: state,
      country: country
    });
  }

  sendTokenResponse(user, 201, res);
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an email and password',
    });
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  sendTokenResponse(user, 200, res);
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  const user = await User.findByPk(req.user.id);
  
  let chefProfile = null;
  if (user.role === 'chef') {
    chefProfile = await Chef.findOne({ where: { userId: user.id } });
  }

  res.status(200).json({
    success: true,
    data: {
      user,
      chefProfile,
    },
  });
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
const updateDetails = async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    country: req.body.country,
    zipCode: req.body.zipCode,
  };

  const user = await User.update(fieldsToUpdate, {
    where: { id: req.user.id },
    returning: true,
  });

  const updatedUser = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] }
  });

  res.status(200).json({
    success: true,
    data: updatedUser,
  });
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (!(await user.matchPassword(req.body.currentPassword))) {
    return res.status(401).json({
      success: false,
      message: 'Password is incorrect',
    });
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

module.exports = {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  logout,
};