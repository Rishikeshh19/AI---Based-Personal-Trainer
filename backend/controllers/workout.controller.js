const Workout = require('../models/Workout');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const logger = require('../utils/logger');

// Helper function to emit real-time progress updates
async function emitProgressUpdate(userId) {
    try {
        // Get updated progress
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const workouts = await Workout.find({
            user: userId,
            date: { $gte: thirtyDaysAgo }
        }).sort({ date: -1 });

        const stats = {
            totalWorkouts: workouts.length,
            totalCalories: workouts.reduce((sum, w) => sum + w.totalCalories, 0),
            totalDuration: workouts.reduce((sum, w) => sum + w.totalDuration, 0),
            lastUpdated: new Date()
        };

        // Emit via Socket.IO to user's progress room
        if (global.io) {
            global.io.to(`progress:${userId}`).emit('progressUpdated', {
                success: true,
                data: stats,
                timestamp: new Date()
            });

            logger.info(`Progress update emitted for user: ${userId}`, { stats });
        }

        // Clear progress cache to force fresh fetch
        await global.cacheService.delete(`user:${userId}:progress`);
    } catch (error) {
        logger.error('Error emitting progress update:', error);
    }
}

// @desc    Create a new workout
// @route   POST /api/workouts
// @access  Private
exports.createWorkout = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.user = req.user.id;

    const workout = await Workout.create(req.body);

    logger.info(`Workout created: ${workout._id} by user ${req.user.id}`, {
        user: req.user.id,
        workout: workout._id
    });

    // Create notification for workout completion
    try {
        const user = await User.findById(req.user.id);
        const notification = {
            userId: req.user.id,
            type: 'workout_completed',
            title: 'Workout Completed',
            message: `Great job! You completed a workout with ${workout.exercises?.length || 0} exercises`,
            metadata: { workoutId: workout._id, duration: workout.totalDuration, calories: workout.totalCalories },
            read: false
        };
        await global.notificationQueue?.add(notification);
        
        // Notify trainer if member has one
        if (user.trainerId) {
            const trainerNotification = {
                userId: user.trainerId,
                type: 'client_workout',
                title: 'Client Workout Completed',
                message: `${user.profile?.firstName || user.username} completed a workout (${workout.totalDuration} min, ${workout.totalCalories} cal)`,
                metadata: { memberId: req.user.id, workoutId: workout._id },
                read: false
            };
            await global.notificationQueue?.add(trainerNotification);
        }
    } catch (notifError) {
        logger.error('Error creating workout notifications:', notifError);
    }

    // Emit real-time update
    await emitProgressUpdate(req.user.id);

    // Clear workouts cache
    await global.cacheService.delete(`user:${req.user.id}:workouts`);

    res.status(201).json({
        success: true,
        data: workout
    });
});

// @desc    Get all workouts for logged in user with caching
// @route   GET /api/workouts
// @access  Private
exports.getWorkouts = asyncHandler(async (req, res, next) => {
    const cacheKey = `user:${req.user.id}:workouts`;

    // Try cache first
    let workouts = await global.cacheService.get(cacheKey);
    if (workouts) {
        logger.debug(`Workouts cache HIT for user ${req.user.id}`);
        return res.status(200).json({
            success: true,
            count: workouts.length,
            data: workouts,
            source: 'cache'
        });
    }

    workouts = await Workout.find({ user: req.user.id })
        .sort({ date: -1 })
        .populate('user', 'username email')
        .lean();

    // Cache for 5 minutes
    await global.cacheService.set(cacheKey, workouts, 300);

    res.status(200).json({
        success: true,
        count: workouts.length,
        data: workouts,
        source: 'database'
    });
});

// @desc    Get single workout
// @route   GET /api/workouts/:id
// @access  Private
exports.getWorkout = asyncHandler(async (req, res, next) => {
    const workout = await Workout.findById(req.params.id).populate('user', 'username email');

    if (!workout) {
        return next(new ErrorResponse(`Workout not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns the workout
    if (workout.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to access this workout`, 401));
    }

    res.status(200).json({
        success: true,
        data: workout
    });
});

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
exports.updateWorkout = asyncHandler(async (req, res, next) => {
    let workout = await Workout.findById(req.params.id);

    if (!workout) {
        return next(new ErrorResponse(`Workout not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns the workout
    if (workout.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this workout`, 401));
    }

    workout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    logger.info(`Workout updated: ${workout._id} by user ${req.user.id}`, {
        user: req.user.id,
        workout: workout._id
    });

    // Emit real-time update
    await emitProgressUpdate(req.user.id);

    // Clear caches
    await global.cacheService.delete(`user:${req.user.id}:workouts`);
    await global.cacheService.delete(`user:${req.user.id}:progress`);

    res.status(200).json({
        success: true,
        data: workout
    });
});

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
exports.deleteWorkout = asyncHandler(async (req, res, next) => {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
        return next(new ErrorResponse(`Workout not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns the workout
    if (workout.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this workout`, 401));
    }

    await workout.deleteOne();

    logger.info(`Workout deleted: ${req.params.id} by user ${req.user.id}`, {
        user: req.user.id,
        workout: req.params.id
    });

    // Emit real-time update
    await emitProgressUpdate(req.user.id);

    // Clear caches
    await global.cacheService.delete(`user:${req.user.id}:workouts`);
    await global.cacheService.delete(`user:${req.user.id}:progress`);

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get workouts by date range
// @route   GET /api/workouts/range/:startDate/:endDate
// @access  Private
exports.getWorkoutsByDateRange = asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.params;

    const workouts = await Workout.find({
        user: req.user.id,
        date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
    }).sort({ date: -1 });

    res.status(200).json({
        success: true,
        count: workouts.length,
        data: workouts
    });
});

// @desc    Get workout statistics
// @route   GET /api/workouts/stats
// @access  Private
exports.getWorkoutStats = asyncHandler(async (req, res, next) => {
    const cacheKey = `user:${req.user.id}:stats`;

    // Try cache first
    let stats = await global.cacheService.get(cacheKey);
    if (stats) {
        return res.status(200).json({
            success: true,
            data: stats,
            source: 'cache'
        });
    }

    const result = await Workout.aggregate([
        {
            $match: { user: req.user._id }
        },
        {
            $group: {
                _id: null,
                totalWorkouts: { $sum: 1 },
                totalCalories: { $sum: '$totalCalories' },
                totalDuration: { $sum: '$totalDuration' },
                avgCalories: { $avg: '$totalCalories' },
                avgDuration: { $avg: '$totalDuration' }
            }
        }
    ]);

    stats = result[0] || {
        totalWorkouts: 0,
        totalCalories: 0,
        totalDuration: 0,
        avgCalories: 0,
        avgDuration: 0
    };

    // Cache for 10 minutes
    await global.cacheService.set(cacheKey, stats, 600);

    res.status(200).json({
        success: true,
        data: stats,
        source: 'database'
    });
});

// @desc    Get workouts for a specific member
// @route   GET /api/workouts/member/:memberId
// @access  Private
exports.getMemberWorkouts = asyncHandler(async (req, res, next) => {
    const { memberId } = req.params;
    const cacheKey = `workouts:member:${memberId}`;

    // Try cache first
    let workouts = await global.cacheService.get(cacheKey);
    if (workouts) {
        return res.status(200).json({
            success: true,
            count: workouts.length,
            data: workouts,
            source: 'cache'
        });
    }

    workouts = await Workout.find({ user: memberId })
        .sort({ date: -1 })
        .populate('user', 'name email')
        .lean();

    // Cache for 5 minutes
    await global.cacheService.set(cacheKey, workouts, 300);

    res.status(200).json({
        success: true,
        count: workouts.length,
        data: workouts,
        source: 'database'
    });
});

