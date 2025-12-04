const { validationResult } = require('express-validator');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

// Middleware to handle validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Log validation errors
        logger.warn('Validation failed', {
            path: req.path,
            method: req.method,
            errors: errors.array(),
            body: req.body,
            params: req.params,
            query: req.query,
            user: req.user ? req.user.id : 'unauthenticated'
        });

        // Format error response
        const errorMessages = errors.array().map(err => ({
            field: err.param,
            message: err.msg,
            value: err.value
        }));

        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            errors: errorMessages
        });
    }

    next();
};

// Middleware to validate object IDs
const isValidObjectId = (req, res, next) => {
    const { id } = req.params;

    // Check if the ID is a valid MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        logger.warn(`Invalid object ID: ${id}`, {
            path: req.path,
            method: req.method,
            params: req.params
        });

        return next(new ErrorResponse(`Invalid ID format: ${id}`, 400));
    }

    next();
};

// Middleware to validate file uploads
const validateFileUpload = (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorResponse('Please upload a file', 400));
    }

    const file = req.files.file;

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        return next(new ErrorResponse(`File size should be less than ${maxSize / (1024 * 1024)}MB`, 400));
    }

    // Check file type (images only)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
        return next(new ErrorResponse('Please upload an image file (JPEG, PNG, GIF)', 400));
    }

    next();
};

// Middleware to validate pagination parameters
const validatePagination = (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    if (page < 1 || limit < 1) {
        return next(new ErrorResponse('Page and limit must be greater than 0', 400));
    }

    if (limit > 100) {
        return next(new ErrorResponse('Limit cannot exceed 100', 400));
    }

    req.pagination = { page, limit };
    next();
};

module.exports = {
    validate,
    isValidObjectId,
    validateFileUpload,
    validatePagination
};
