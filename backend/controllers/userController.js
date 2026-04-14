const asyncHandler = require('express-async-handler');
const { User, Booking, Review, Chef, FavoriteChef } = require('../models');
const { Op } = require('sequelize');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
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
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
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
});

// @desc    Get user bookings
// @route   GET /api/users/bookings
// @access  Private
const getUserBookings = asyncHandler(async (req, res) => {
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
});

// @desc    Get user reviews
// @route   GET /api/users/reviews
// @access  Private
const getUserReviews = asyncHandler(async (req, res) => {
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
});

// @desc    Get user's favorite chefs
// @route   GET /api/users/favorites
// @access  Private
const getFavoriteChefs = asyncHandler(async (req, res) => {
  const favoriteLinks = await FavoriteChef.findAll({
    where: { userId: req.user.id },
    include: [{
      model: Chef,
      as: 'chef',
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'avatar']
      }]
    }],
    order: [['createdAt', 'DESC']],
  });

  res.status(200).json({
    success: true,
    data: favoriteLinks.map((link) => link.chef),
  });
});

// @desc    Add chef to favorites
// @route   POST /api/users/favorites/:chefId
// @access  Private
const addFavoriteChef = asyncHandler(async (req, res) => {
  const { chefId } = req.params;
  
  const chef = await Chef.findByPk(chefId);
  if (!chef) {
    res.status(404);
    throw new Error('Chef not found');
  }

  await FavoriteChef.findOrCreate({
    where: {
      userId: req.user.id,
      chefId: parseInt(chefId, 10),
    },
  });

  res.status(200).json({
    success: true,
    message: 'Chef added to favorites',
  });
});

// @desc    Remove chef from favorites
// @route   DELETE /api/users/favorites/:chefId
// @access  Private
const removeFavoriteChef = asyncHandler(async (req, res) => {
  const { chefId } = req.params;
  await FavoriteChef.destroy({
    where: {
      userId: req.user.id,
      chefId: parseInt(chefId, 10),
    },
  });

  res.status(200).json({
    success: true,
    message: 'Chef removed from favorites',
  });
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
const getUserStats = asyncHandler(async (req, res) => {
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

  const totalFavorites = await FavoriteChef.count({
    where: { userId: req.user.id }
  });
  
  const upcomingBookings = await Booking.count({
    where: {
      userId: req.user.id,
      status: { [Op.in]: ['pending', 'confirmed'] },
      date: { [Op.gte]: new Date().toISOString().split('T')[0] }
    }
  });

  res.status(200).json({
    success: true,
    data: {
      totalBookings,
      completedBookings,
      totalSpent: totalSpent || 0,
      totalReviews,
      totalFavorites,
      upcomingBookings,
    },
  });
});

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
