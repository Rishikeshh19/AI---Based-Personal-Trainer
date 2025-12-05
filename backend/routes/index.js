const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const workoutRoutes = require('./workout.routes');
const memberRoutes = require('./member.routes');
const trainerRoutes = require('./trainer.routes');
const exerciseRoutes = require('./exercise.routes');
const analyticsRoutes = require('./analytics.routes');
const progressRoutes = require('./progress.routes');
const aiSuggestionRoutes = require('./ai-suggestion.routes');
const messageRoutes = require('./message.routes');
const dietPlanRoutes = require('./diet-plan.routes');

// API routes
router.use('/auth', authRoutes);
router.use('/workouts', workoutRoutes);
router.use('/members', memberRoutes);
router.use('/trainers', trainerRoutes);
router.use('/exercises', exerciseRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/progress', progressRoutes);
router.use('/ai-suggestions', aiSuggestionRoutes);
router.use('/messages', messageRoutes);
router.use('/diet-plan', dietPlanRoutes);

module.exports = router;
