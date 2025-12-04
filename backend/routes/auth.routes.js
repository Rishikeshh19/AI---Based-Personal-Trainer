const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');

// Middleware to handle validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

// @route   POST /api/auth/register
router.post(
    '/register',
    [
        check('username', 'Username is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 8 or more characters').isLength({ min: 8 })
    ],
    validate,
    asyncHandler(authController.register)
);

// @route   POST /api/auth/login
router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    validate,
    asyncHandler(authController.login)
);

// @route   GET /api/auth/me
router.get('/me', protect, asyncHandler(authController.getMe));

// @route   GET /api/auth/users
router.get('/users', protect, asyncHandler(authController.getAllUsers));

// @route   POST /api/auth/forgot-password
router.post(
    '/forgot-password',
    [check('email', 'Please include a valid email').isEmail()],
    validate,
    asyncHandler(authController.forgotPassword)
);

// @route   PUT /api/auth/reset-password/:resettoken
router.put(
    '/reset-password/:resettoken',
    [check('password', 'Please enter a password with 8 or more characters').isLength({ min: 8 })],
    validate,
    asyncHandler(authController.resetPassword)
);

// @route   PUT /api/auth/update-details
router.put(
    '/update-details',
    protect,
    [
        check('username', 'Username is required').optional().not().isEmpty(),
        check('email', 'Please include a valid email').optional().isEmail()
    ],
    validate,
    asyncHandler(authController.updateDetails)
);

// @route   PUT /api/auth/update-password
router.put(
    '/update-password',
    protect,
    [
        check('currentPassword', 'Current password is required').exists(),
        check('newPassword', 'Please enter a password with 8 or more characters').isLength({ min: 8 })
    ],
    validate,
    asyncHandler(authController.updatePassword)
);

module.exports = router;