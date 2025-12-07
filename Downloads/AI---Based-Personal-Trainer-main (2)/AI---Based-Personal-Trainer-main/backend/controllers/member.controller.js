const User = require('../models/User');
const Workout = require('../models/Workout');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const logger = require('../utils/logger');

// @desc    Get current user profile
// @route   GET /api/members/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Update user profile
// @route   PUT /api/members/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        'profile.firstName': req.body.firstName,
        'profile.lastName': req.body.lastName,
        'profile.age': req.body.age,
        'profile.gender': req.body.gender,
        'profile.height': req.body.height,
        'profile.weight': req.body.weight,
        'profile.fitnessLevel': req.body.fitnessLevel,
        'profile.goals': req.body.goals,
        'profile.bio': req.body.bio
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key =>
        fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    // Clear cache for this user
    await global.cacheService.deletePattern(`user:${req.user.id}:*`);

    logger.info(`Profile updated for user: ${user._id}`, {
        user: user._id
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Get user progress summary with caching
// @route   GET /api/members/progress
// @access  Private
exports.getProgress = asyncHandler(async (req, res, next) => {
    const cacheKey = `user:${req.user.id}:progress`;

    // Try to get from cache first
    let cachedProgress = await global.cacheService.get(cacheKey);
    if (cachedProgress) {
        logger.debug(`Progress cache HIT for user ${req.user.id}`);
        return res.status(200).json({
            success: true,
            data: cachedProgress,
            source: 'cache'
        });
    }

    const user = await User.findById(req.user.id);

    // Get workout stats for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const workouts = await Workout.find({
        user: req.user.id,
        date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 });

    // Calculate stats
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
        recentWorkouts: workouts.slice(0, 5),
        lastUpdated: new Date()
    };

    const progressData = {
        user: user,
        stats: stats
    };

    // Cache for 5 minutes
    await global.cacheService.set(cacheKey, progressData, 300);

    res.status(200).json({
        success: true,
        data: progressData,
        source: 'database'
    });
});

// @desc    Assign a trainer to the member
// @route   PUT /api/members/assign-trainer
// @access  Private
exports.assignTrainer = asyncHandler(async (req, res, next) => {
    const { trainerId } = req.body;

    if (!trainerId) {
        return next(new ErrorResponse('Trainer ID is required', 400));
    }

    // Verify trainer exists and is actually a trainer
    const trainer = await User.findById(trainerId);
    if (!trainer) {
        return next(new ErrorResponse('Trainer not found', 404));
    }

    if (trainer.role !== 'trainer') {
        return next(new ErrorResponse('User is not a trainer', 400));
    }

    // Update member's trainerId
    const member = await User.findByIdAndUpdate(
        req.user.id,
        { trainerId: trainerId },
        { new: true }
    ).populate('trainerId', 'username email profile');

    // Add member to trainer's assignedClients if not already there
    if (!trainer.assignedClients.includes(req.user.id)) {
        trainer.assignedClients.push(req.user.id);
        await trainer.save();
    }

    // Clear caches
    await global.cacheService.deletePattern(`user:${req.user.id}:*`);
    await global.cacheService.deletePattern(`trainer:${trainerId}:*`);

    logger.info(`Member ${req.user.id} assigned to trainer ${trainerId}`);

    res.status(200).json({
        success: true,
        message: 'Trainer assigned successfully',
        data: member
    });
});

// @desc    Get current trainer info for member
// @route   GET /api/members/current-trainer
// @access  Private
exports.getCurrentTrainer = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate('trainerId', 'username email profile');

    if (!user.trainerId) {
        return res.status(200).json({
            success: true,
            data: null,
            message: 'No trainer assigned yet'
        });
    }

    res.status(200).json({
        success: true,
        data: user.trainerId
    });
});

