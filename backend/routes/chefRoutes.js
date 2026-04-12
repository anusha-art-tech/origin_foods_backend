const express = require('express');
const router = express.Router();
const {
  getChefs,
  getChefById,
  createChefProfile,
  updateChefProfile,
  getChefAvailability,
  getTopChefs,
  searchChefs,
} = require('../controllers/chefController');
const { protect, protectChef } = require('../middleware/authMiddleware');

router.get('/', getChefs);
router.get('/top', getTopChefs);
router.get('/search', searchChefs);
router.get('/:id/availability', getChefAvailability);
router.get('/:id', getChefById);
router.post('/', protect, createChefProfile);
router.put('/:id', protect, updateChefProfile);

module.exports = router;