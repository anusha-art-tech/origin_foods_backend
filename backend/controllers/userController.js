const { User, Booking, Review, Chef, sequelize } = require('../models');
const { Op } = require('sequelize');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] }
  });

  let chefProfile = null;
  if (user.role === 'chef') {
    chefProfile = await Chef.findOne({ where: { userId: user.id } });
  }

  res.status(200).json({
    success: true,
    data: { user, chefProfile },
  });
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const { name, phone, address, city, state, country, zipCode } = req.body;

  await User.update(
    { name, phone, address, city, state, country, zipCode },
    { where: { id: req.user.id } }
  );

  const updatedUser = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] }
  });

  res.status(200).json({
    success: true,
    data: updatedUser,
  });
};

// @desc    Get user bookings
// @route   GET /api/users/bookings
// @access  Private
const getUserBookings = async (req, res) => {
  const bookings = await Booking.findAll({
    where: { userId: req.user.id },
    include: [{
      model: Chef,
      as: 'chef',
      attributes: ['id', 'name', 'profileImage', 'rating', 'city', 'state']
    }],
    order: [['date', 'DESC']]
  });

  res.status(200).json({
    success: true,
    data: bookings,
  });
};

// @desc    Get user reviews
// @route   GET /api/users/reviews
// @access  Private
const getUserReviews = async (req, res) => {
  const reviews = await Review.findAll({
    where: { userId: req.user.id },
    include: [{
      model: Chef,
      as: 'chef',
      attributes: ['id', 'name', 'profileImage', 'rating', 'city']
    }],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    data: reviews,
  });
};

// @desc    Get user's favorite chefs
// @route   GET /api/users/favorites
// @access  Private
const getFavoriteChefs = async (req, res) => {
  const user = await User.findByPk(req.user.id);
  const favoriteChefIds = user.favoriteChefs || [];
  
  const favoriteChefs = await Chef.findAll({
    where: { id: { [Op.in]: favoriteChefIds } },
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'name', 'avatar']
    }]
  });

  res.status(200).json({
    success: true,
    data: favoriteChefs,
  });
};

// @desc    Add chef to favorites
// @route   POST /api/users/favorites/:chefId
// @access  Private
const addFavoriteChef = async (req, res) => {
  const { chefId } = req.params;
  
  const chef = await Chef.findByPk(chefId);
  if (!chef) {
    return res.status(404).json({
      success: false,
      message: 'Chef not found',
    });
  }

  const user = await User.findByPk(req.user.id);
  let favorites = user.favoriteChefs || [];
  
  if (!favorites.includes(parseInt(chefId))) {
    favorites.push(parseInt(chefId));
    await user.update({ favoriteChefs: favorites });
  }

  res.status(200).json({
    success: true,
    message: 'Chef added to favorites',
  });
};

// @desc    Remove chef from favorites
// @route   DELETE /api/users/favorites/:chefId
// @access  Private
const removeFavoriteChef = async (req, res) => {
  const { chefId } = req.params;
  const user = await User.findByPk(req.user.id);
  let favorites = user.favoriteChefs || [];
  
  favorites = favorites.filter(id => id !== parseInt(chefId));
  await user.update({ favoriteChefs: favorites });

  res.status(200).json({
    success: true,
    message: 'Chef removed from favorites',
  });
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
const getUserStats = async (req, res) => {
  const totalBookings = await Booking.count({
    where: { userId: req.user.id }
  });
  
  const completedBookings = await Booking.count({
    where: { userId: req.user.id, status: 'completed' }
  });
  
  const totalSpent = await Booking.sum('totalAmount', {
    where: { userId: req.user.id, status: 'completed' }
  });
  
  const totalReviews = await Review.count({
    where: { userId: req.user.id }
  });
  
  const upcomingBookings = await Booking.count({
    where: {
      userId: req.user.id,
      status: { [Op.in]: ['pending', 'confirmed'] },
      date: { [Op.gte]: new Date() }
    }
  });

  res.status(200).json({
    success: true,
    data: {
      totalBookings,
      completedBookings,
      totalSpent: totalSpent || 0,
      totalReviews,
      upcomingBookings,
    },
  });
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserBookings,
  getUserReviews,
  getFavoriteChefs,
  addFavoriteChef,
  removeFavoriteChef,
  getUserStats,
};