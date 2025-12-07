const User = require('../models/User');
const Workout = require('../models/Workout');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const logger = require('../utils/logger');

// @desc    Get all trainers (for member selection)
// @route   GET /api/trainers
// @access  Private
exports.getAllTrainers = asyncHandler(async (req, res, next) => {
    const trainers = await User.find({ role: 'trainer' }).select('-password');

    res.status(200).json({
        success: true,
        count: trainers.length,
        data: trainers
    });
});

// @desc    Get all assigned clients for trainer
// @route   GET /api/trainers/clients
// @access  Private
exports.getAssignedClients = asyncHandler(async (req, res, next) => {
    const trainer = await User.findById(req.user.id).populate('assignedClients', 'username email profile role');

    if (!trainer) {
        return next(new ErrorResponse('Trainer not found', 404));
    }

    if (trainer.role !== 'trainer') {
        return next(new ErrorResponse('Only trainers can access this route', 403));
    }

    const assignedClients = trainer.assignedClients || [];

    res.status(200).json({
        success: true,
        count: assignedClients.length,
        data: assignedClients
    });
});

// @desc    Get client progress and details
// @route   GET /api/trainers/clients/:clientId
// @access  Private
exports.getClientDetails = asyncHandler(async (req, res, next) => {
    const trainer = await User.findById(req.user.id);

    if (!trainer || trainer.role !== 'trainer') {
        return next(new ErrorResponse('Only trainers can access this route', 403));
    }

    // Verify that this client is assigned to the trainer
    if (!trainer.assignedClients.includes(req.params.clientId)) {
        return next(new ErrorResponse('This client is not assigned to you', 403));
    }

    const client = await User.findById(req.params.clientId);
    if (!client) {
        return next(new ErrorResponse('Client not found', 404));
    }

    // Get client's workouts for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const workouts = await Workout.find({
        user: req.params.clientId,
        date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 });

    const stats = {
        totalWorkouts: workouts.length,
        totalCalories: workouts.reduce((sum, w) => sum + w.totalCalories, 0),
        totalDuration: workouts.reduce((sum, w) => sum + w.totalDuration, 0),
        avgCaloriesPerWorkout: workouts.length > 0
            ? workouts.reduce((sum, w) => sum + w.totalCalories, 0) / workouts.length
            : 0,
        avgDurationPerWorkout: workouts.length > 0
            ? workouts.reduce((sum, w) => sum + w.totalDuration, 0) / workouts.length
            : 0,
        recentWorkouts: workouts.slice(0, 5)
    };

    logger.info(`Trainer ${req.user.id} accessed client details: ${req.params.clientId}`);

    res.status(200).json({
        success: true,
        data: {
            client: client,
            stats: stats
        }
    });
});

// @desc    Remove a client from trainer's list
// @route   DELETE /api/trainers/clients/:clientId
// @access  Private
exports.removeClient = asyncHandler(async (req, res, next) => {
    const trainer = await User.findById(req.user.id);

    if (!trainer || trainer.role !== 'trainer') {
        return next(new ErrorResponse('Only trainers can access this route', 403));
    }

    // Remove client from trainer's assignedClients
    trainer.assignedClients = trainer.assignedClients.filter(
        id => id.toString() !== req.params.clientId
    );
    await trainer.save();

    // Remove trainer from client's trainerId
    await User.findByIdAndUpdate(req.params.clientId, { trainerId: null });

    logger.info(`Trainer ${req.user.id} removed client ${req.params.clientId}`);

    res.status(200).json({
        success: true,
        message: 'Client removed successfully'
    });
});

// @desc    Get trainer profile
// @route   GET /api/trainers/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res, next) => {
    const trainer = await User.findById(req.user.id).select('-password');

    if (!trainer) {
        return next(new ErrorResponse('Trainer not found', 404));
    }

    res.status(200).json({
        success: true,
        data: trainer
    });
});

// @desc    Update trainer profile
// @route   PUT /api/trainers/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        'profile.firstName': req.body.firstName,
        'profile.lastName': req.body.lastName,
        'profile.bio': req.body.bio,
        'profile.specialization': req.body.specialization,
        'profile.certifications': req.body.certifications,
        'profile.yearsOfExperience': req.body.yearsOfExperience,
        'profile.hourlyRate': req.body.hourlyRate
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key =>
        fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const trainer = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    logger.info(`Trainer profile updated: ${trainer._id}`);

    res.status(200).json({
        success: true,
        data: trainer
    });
});
