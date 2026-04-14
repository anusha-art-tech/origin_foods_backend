const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  validateRegister,
  validateLogin,
  validatePasswordUpdate,
  checkValidation,
} = require('../middleware/validationMiddleware');
const { chefImageUpload } = require('../middleware/uploadMiddleware');

router.post('/register', chefImageUpload, validateRegister, checkValidation, register);
router.post('/login', validateLogin, checkValidation, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, validatePasswordUpdate, checkValidation, updatePassword);
router.get('/logout', protect, logout);

module.exports = router;
