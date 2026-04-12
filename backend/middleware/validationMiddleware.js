const { body, validationResult } = require('express-validator');

// Validation rules for user registration
const validateRegister = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['user', 'chef']).withMessage('Role must be either user or chef'),
];

// Validation rules for user login
const validateLogin = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

// Validation rules for chef profile creation
const validateChefProfile = [
  body('name')
    .notEmpty().withMessage('Chef name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('bio')
    .notEmpty().withMessage('Bio is required')
    .isLength({ max: 1000 }).withMessage('Bio cannot exceed 1000 characters'),
  body('experience')
    .notEmpty().withMessage('Experience is required')
    .isInt({ min: 0, max: 50 }).withMessage('Experience must be between 0 and 50 years'),
  body('pricePerService')
    .notEmpty().withMessage('Price per service is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('cuisine')
    .notEmpty().withMessage('Cuisine type is required'),
];

// Validation rules for booking creation
const validateBooking = [
  body('chefId')
    .notEmpty().withMessage('Chef ID is required')
    .isInt().withMessage('Chef ID must be a number'),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isDate().withMessage('Please provide a valid date'),
  body('time')
    .notEmpty().withMessage('Time is required'),
  body('guests')
    .notEmpty().withMessage('Number of guests is required')
    .isInt({ min: 1, max: 50 }).withMessage('Guests must be between 1 and 50'),
  body('address')
    .notEmpty().withMessage('Address is required'),
  body('city')
    .notEmpty().withMessage('City is required'),
];

// Validation rules for review creation
const validateReview = [
  body('bookingId')
    .notEmpty().withMessage('Booking ID is required')
    .isInt().withMessage('Booking ID must be a number'),
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('comment')
    .notEmpty().withMessage('Comment is required')
    .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
];

// Validation rules for password update
const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

// Validation rules for user profile update
const validateUserUpdate = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail().withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .isLength({ max: 20 }).withMessage('Phone number cannot exceed 20 characters'),
];

// Validation rules for chef update
const validateChefUpdate = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('bio')
    .optional()
    .isLength({ max: 1000 }).withMessage('Bio cannot exceed 1000 characters'),
  body('experience')
    .optional()
    .isInt({ min: 0, max: 50 }).withMessage('Experience must be between 0 and 50 years'),
  body('pricePerService')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('pricePerGuest')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price per guest must be a positive number'),
];

// Validation rules for booking status update
const validateBookingStatus = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded'])
    .withMessage('Invalid status value'),
];

// Validation rules for user role update (admin only)
const validateUserRole = [
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['user', 'chef', 'admin']).withMessage('Invalid role value'),
];

// Middleware to check validation results
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateChefProfile,
  validateBooking,
  validateReview,
  validatePasswordUpdate,
  validateUserUpdate,
  validateChefUpdate,
  validateBookingStatus,
  validateUserRole,
  checkValidation,
};