const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getChefBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect, protectChef } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/user', protect, getUserBookings);
router.get('/chef', protect, protectChef, getChefBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/status', protect, updateBookingStatus);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;