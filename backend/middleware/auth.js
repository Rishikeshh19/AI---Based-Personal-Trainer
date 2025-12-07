const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const logger = require('../utils/logger');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    // Set token from Bearer token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // Set token from cookie
    else if (req.cookies.token) {
        token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Add user to request object
        req.user = await User.findById(decoded.id);

        // Check if user exists
        if (!req.user) {
            return next(new ErrorResponse('User not found', 404));
        }

        // Check if user is active
        if (req.user.status !== 'active') {
            return next(new ErrorResponse('User account is not active', 401));
        }

        next();
    } catch (err) {
        logger.error('Authentication error:', err);
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorResponse(
                    `User role ${req.user.role} is not authorized to access this route`,
                    403
                )
            );
        }
        next();
    };
};

// Check if user is the owner of the resource or admin
exports.checkOwnership = (model) => {
    return async (req, res, next) => {
        try {
            const resource = await model.findById(req.params.id);

            if (!resource) {
                return next(
                    new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404)
                );
            }

            // Grant access if user is admin or resource owner
            if (req.user.role === 'admin' || resource.user.toString() === req.user.id) {
                req.resource = resource;
                return next();
            }

            return next(
                new ErrorResponse(
                    `User ${req.user.id} is not authorized to update this resource`,
                    403
                )
            );
        } catch (error) {
            logger.error('Ownership check error:', error);
            return next(
                new ErrorResponse('Error checking resource ownership', 500)
            );
        }
    };
};

// Require members to have a trainer assigned
exports.requireTrainer = (req, res, next) => {
    // Only enforce for members
    if (req.user.role !== 'member') {
        return next();
    }

    // Check if trainer is assigned
    if (!req.user.trainerId) {
        return next(
            new ErrorResponse('You must select a trainer before accessing this feature. Please visit Select Trainer page.', 403)
        );
    }

    next();
};

