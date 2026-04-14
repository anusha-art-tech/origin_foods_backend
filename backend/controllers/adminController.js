const asyncHandler = require('express-async-handler');
const { User, Chef, Booking } = require('../models');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const { count, rows } = await User.findAndCountAll({
    attributes: { exclude: ['password'] },
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    data: rows,
    pagination: {
      page,
      limit,
      total: count,
      pages: Math.ceil(count / limit),
    },
  });
});

// @desc    Get all chefs
// @route   GET /api/admin/chefs
// @access  Private/Admin
const getAllChefs = asyncHandler(async (req, res) => {
  const chefs = await Chef.findAll({
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'name', 'email', 'phone']
    }],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    data: chefs,
  });
});

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.findAll({
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: Chef, as: 'chef', attributes: ['id', 'name'] }
    ],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    data: bookings,
  });
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await User.findByPk(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.update({ role });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Verify chef
// @route   PUT /api/admin/chefs/:id/verify
// @access  Private/Admin
const verifyChef = asyncHandler(async (req, res) => {
  const chef = await Chef.findByPk(req.params.id);

  if (!chef) {
    res.status(404);
    throw new Error('Chef not found');
  }

  await chef.update({ isVerified: true });

  res.status(200).json({
    success: true,
    data: chef,
  });
});

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (_req, res) => {
  const totalUsers = await User.count();
  const totalChefs = await Chef.count();
  const totalBookings = await Booking.count();
  const totalRevenue = await Booking.sum('totalAmount', {
    where: { status: 'completed' }
  });
  const pendingBookings = await Booking.count({
    where: { status: 'pending' }
  });

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalChefs,
      totalBookings,
      totalRevenue: totalRevenue || 0,
      pendingBookings,
    },
  });
});

module.exports = {
  getAllUsers,
  getAllChefs,
  getAllBookings,
  updateUserRole,
  verifyChef,
  getDashboardStats,
};
