const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Exercise = require('../models/Exercise');
const logger = require('../utils/logger');

// Apply auth middleware to all routes
router.use(protect);

// @desc    Get all exercises with caching
// @route   GET /api/exercises
// @access  Private
router.get('/', async (req, res) => {
    try {
        const cacheKey = 'exercises:all';

        // Try to get from cache
        let exercises = await global.cacheService.get(cacheKey);
        if (exercises) {
            logger.debug('Exercises cache HIT');
            return res.status(200).json({
                success: true,
                count: exercises.length,
                data: exercises,
                source: 'cache'
            });
        }

        // Query database
        exercises = await Exercise.find({}).lean();

        // Cache for 24 hours (exercise database rarely changes)
        await global.cacheService.set(cacheKey, exercises, 86400);

        logger.debug('Exercises cached - 24 hour TTL');

        res.status(200).json({
            success: true,
            count: exercises.length,
            data: exercises,
            source: 'database'
        });
    } catch (err) {
        logger.error('Error fetching exercises:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message
        });
    }
});

// @desc    Get single exercise with caching
// @route   GET /api/exercises/:id
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const cacheKey = `exercise:${req.params.id}`;

        // Try to get from cache
        let exercise = await global.cacheService.get(cacheKey);
        if (exercise) {
            logger.debug(`Exercise ${req.params.id} cache HIT`);
            return res.status(200).json({
                success: true,
                data: exercise,
                source: 'cache'
            });
        }

        // Query database
        exercise = await Exercise.findById(req.params.id).lean();

        if (!exercise) {
            return res.status(404).json({
                success: false,
                message: 'Exercise not found'
            });
        }

        // Cache for 24 hours
        await global.cacheService.set(cacheKey, exercise, 86400);

        res.status(200).json({
            success: true,
            data: exercise,
            source: 'database'
        });
    } catch (err) {
        logger.error('Error fetching exercise:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message
        });
    }
});

// @desc    Get exercises by muscle group with caching
// @route   GET /api/exercises/muscle/:muscleGroup
// @access  Private
router.get('/muscle/:muscleGroup', async (req, res) => {
    try {
        const cacheKey = `exercises:muscle:${req.params.muscleGroup.toLowerCase()}`;

        // Try to get from cache
        let exercises = await global.cacheService.get(cacheKey);
        if (exercises) {
            logger.debug(`Exercises for muscle ${req.params.muscleGroup} cache HIT`);
            return res.status(200).json({
                success: true,
                count: exercises.length,
                data: exercises,
                source: 'cache'
            });
        }

        // Query database
        exercises = await Exercise.find({
            muscleGroup: { $regex: req.params.muscleGroup, $options: 'i' }
        }).lean();

        // Cache for 24 hours
        await global.cacheService.set(cacheKey, exercises, 86400);

        res.status(200).json({
            success: true,
            count: exercises.length,
            data: exercises,
            source: 'database'
        });
    } catch (err) {
        logger.error('Error fetching exercises by muscle:', err);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message
        });
    }
});

module.exports = router;
