const express = require('express');
const router = express.Router();
const {
  createReview,
  getChefReviews,
  getUserReviews,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/chef/:chefId', getChefReviews);
router.get('/user', protect, getUserReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;