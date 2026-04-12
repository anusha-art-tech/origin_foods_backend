const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getAllChefs,
  getAllBookings,
  updateUserRole,
  verifyChef,
  getDashboardStats,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.get('/chefs', getAllChefs);
router.get('/bookings', getAllBookings);
router.get('/stats', getDashboardStats);
router.put('/users/:id/role', updateUserRole);
router.put('/chefs/:id/verify', verifyChef);

module.exports = router;