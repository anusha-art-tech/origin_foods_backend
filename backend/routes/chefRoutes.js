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
  getChefCuisines,
  createChefCuisine,
  updateChefCuisine,
  deleteChefCuisine,
} = require('../controllers/chefController');
const { protect, protectChef } = require('../middleware/authMiddleware');
const {
  validateChefProfile,
  validateChefUpdate,
  validateCuisine,
  checkValidation,
} = require('../middleware/validationMiddleware');
const { chefImageUpload } = require('../middleware/uploadMiddleware');

router.get('/', getChefs);
router.get('/top', getTopChefs);
router.get('/search', searchChefs);
router.get('/:id/availability', getChefAvailability);
router.get('/:id/cuisines', getChefCuisines);
router.get('/:id', getChefById);
router.post('/', protect, chefImageUpload, validateChefProfile, checkValidation, createChefProfile);
router.put('/:id', protect, chefImageUpload, validateChefUpdate, checkValidation, updateChefProfile);
router.post('/:id/cuisines', protectChef, chefImageUpload, validateCuisine, checkValidation, createChefCuisine);
router.put('/:id/cuisines/:cuisineId', protectChef, chefImageUpload, validateCuisine, checkValidation, updateChefCuisine);
router.delete('/:id/cuisines/:cuisineId', protectChef, deleteChefCuisine);

module.exports = router;
