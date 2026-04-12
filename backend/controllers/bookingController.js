const { Booking, Chef, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  const { chefId, date, time, guests, address, city, state, zipCode, specialRequests } = req.body;

  const chef = await Chef.findByPk(chefId);
  if (!chef) {
    return res.status(404).json({
      success: false,
      message: 'Chef not found',
    });
  }

  // Calculate amounts
  const baseAmount = chef.pricePerService;
  const guestFee = guests * (chef.pricePerGuest || 0);
  const serviceFee = baseAmount * 0.1;
  const totalAmount = baseAmount + guestFee + serviceFee;
  const chefEarnings = baseAmount + guestFee;

  const booking = await Booking.create({
    userId: req.user.id,
    chefId,
    chefName: chef.name,
    cuisine: chef.cuisine,
    date,
    time,
    guests,
    address,
    city,
    state,
    zipCode,
    specialRequests,
    totalAmount,
    serviceFee,
    chefEarnings,
    status: 'pending',
    paymentStatus: 'pending'
  });

  // Increment chef's total bookings
  await chef.increment('totalBookings');

  res.status(201).json({
    success: true,
    data: booking,
  });
};

// @desc    Get user bookings
// @route   GET /api/bookings/user
// @access  Private
const getUserBookings = async (req, res) => {
  const bookings = await Booking.findAll({
    where: { userId: req.user.id },
    include: [{
      model: Chef,
      as: 'chef',
      attributes: ['id', 'name', 'profileImage', 'rating']
    }],
    order: [['date', 'DESC']]
  });

  res.status(200).json({
    success: true,
    data: bookings,
  });
};

// @desc    Get chef bookings
// @route   GET /api/bookings/chef
// @access  Private (Chef only)
const getChefBookings = async (req, res) => {
  const chef = await Chef.findOne({ where: { userId: req.user.id } });
  if (!chef) {
    return res.status(404).json({
      success: false,
      message: 'Chef profile not found',
    });
  }

  const bookings = await Booking.findAll({
    where: { chefId: chef.id },
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'name', 'email', 'phone']
    }],
    order: [['date', 'DESC']]
  });

  res.status(200).json({
    success: true,
    data: bookings,
  });
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  const booking = await Booking.findByPk(req.params.id, {
    include: [
      { model: Chef, as: 'chef' },
      { model: User, as: 'user', attributes: { exclude: ['password'] } }
    ]
  });

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    });
  }

  if (booking.userId !== req.user.id && booking.chef.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(401).json({
      success: false,
      message: 'Not authorized',
    });
  }

  res.status(200).json({
    success: true,
    data: booking,
  });
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findByPk(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    });
  }

  const chef = await Chef.findByPk(booking.chefId);

  if (chef.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(401).json({
      success: false,
      message: 'Not authorized',
    });
  }

  booking.status = status;
  if (status === 'completed') {
    booking.completedAt = new Date();
  }
  await booking.save();

  res.status(200).json({
    success: true,
    data: booking,
  });
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  const { reason } = req.body;
  const booking = await Booking.findByPk(req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    });
  }

  if (booking.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(401).json({
      success: false,
      message: 'Not authorized',
    });
  }

  if (!booking.canCancel()) {
    return res.status(400).json({
      success: false,
      message: 'Booking cannot be cancelled less than 24 hours before the scheduled time',
    });
  }

  booking.status = 'cancelled';
  booking.cancellationReason = reason;
  booking.cancelledAt = new Date();
  await booking.save();

  res.status(200).json({
    success: true,
    data: booking,
  });
};

module.exports = {
  createBooking,
  getUserBookings,
  getChefBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
};