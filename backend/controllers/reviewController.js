const asyncHandler = require('express-async-handler');
const { Review, Booking, Chef, User } = require('../models');

const syncChefRating = async (chefId) => {
  const reviews = await Review.findAll({ where: { chefId } });
  const totalReviews = reviews.length;
  const avgRating = totalReviews
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / totalReviews
    : 0;

  await Chef.update(
    {
      rating: Number(avgRating.toFixed(2)),
      totalReviews,
    },
    { where: { id: chefId } }
  );
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, title, comment } = req.body;

  // Check if booking exists and belongs to user
  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  if (booking.userId !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  if (booking.status !== 'completed') {
    res.status(400);
    throw new Error('Can only review completed bookings');
  }

  // Check if review already exists
  const existingReview = await Review.findOne({ where: { bookingId } });
  if (existingReview) {
    res.status(400);
    throw new Error('Review already exists for this booking');
  }

  const review = await Review.create({
    userId: req.user.id,
    chefId: booking.chefId,
    bookingId,
    rating,
    title,
    comment,
  });

  await syncChefRating(booking.chefId);

  res.status(201).json({
    success: true,
    data: review,
  });
});

// @desc    Get chef reviews
// @route   GET /api/reviews/chef/:chefId
// @access  Public
const getChefReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.findAll({
    where: { chefId: req.params.chefId },
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'name', 'avatar']
    }],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    data: reviews,
  });
});

// @desc    Get user reviews
// @route   GET /api/reviews/user
// @access  Private
const getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.findAll({
    where: { userId: req.user.id },
    include: [{
      model: Chef,
      as: 'chef',
      attributes: ['id', 'name', 'profileImage']
    }],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    data: reviews,
  });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findByPk(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.userId !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await review.update({
    rating: req.body.rating ?? review.rating,
    title: req.body.title ?? review.title,
    comment: req.body.comment ?? review.comment,
  });
  await syncChefRating(review.chefId);

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByPk(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.userId !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized');
  }

  const chefId = review.chefId;
  await review.destroy();
  await syncChefRating(chefId);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully',
  });
});

module.exports = {
  createReview,
  getChefReviews,
  getUserReviews,
  updateReview,
  deleteReview,
};
