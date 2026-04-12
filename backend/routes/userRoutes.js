const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getUserBookings,
  getUserReviews,
  getFavoriteChefs,
  addFavoriteChef,
  removeFavoriteChef,
  getUserStats,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { validateUserUpdate, checkValidation } = require('../middleware/validationMiddleware');

// Get user profile
router.get('/profile', protect, getUserProfile);

// Update user profile
router.put('/profile', protect, validateUserUpdate, checkValidation, updateUserProfile);

// Get user bookings
router.get('/bookings', protect, getUserBookings);

// Get user reviews
router.get('/reviews', protect, getUserReviews);

// Get favorite chefs
router.get('/favorites', protect, getFavoriteChefs);

// Add favorite chef
router.post('/favorites/:chefId', protect, addFavoriteChef);

// Remove favorite chef
router.delete('/favorites/:chefId', protect, removeFavoriteChef);

// Get user statistics
router.get('/stats', protect, getUserStats);

module.exports = router;