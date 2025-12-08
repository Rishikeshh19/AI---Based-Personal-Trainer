const express = require('express');
const router = express.Router();
const { register, updateActiveUsers } = require('../middleware/metrics');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/metrics
// @desc    Get Prometheus metrics
// @access  Public (Prometheus scraping)
router.get('/', async (req, res) => {
    try {
        // Update active users count before returning metrics
        await updateActiveUsers(User);
        
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (error) {
        res.status(500).end(error);
    }
});

// @route   GET /api/metrics/dashboard
// @desc    Get metrics dashboard data for admin
// @access  Private/Admin
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
    try {
        const User = require('../models/User');
        const Workout = require('../models/Workout');
        const Message = require('../models/Message');

        // Get user statistics
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        const memberCount = await User.countDocuments({ role: 'member' });
        const trainerCount = await User.countDocuments({ role: 'trainer' });
        const adminCount = await User.countDocuments({ role: 'admin' });

        // Get workout statistics
        const totalWorkouts = await Workout.countDocuments();
        const todayWorkouts = await Workout.countDocuments({
            date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        });
        const weekWorkouts = await Workout.countDocuments({
            date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        // Get message statistics
        const totalMessages = await Message.countDocuments();
        const todayMessages = await Message.countDocuments({
            createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        });

        // Get recent user registrations (last 7 days)
        const recentRegistrations = await User.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        // Get workout trends (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const workoutTrends = await Workout.aggregate([
            {
                $match: { date: { $gte: thirtyDaysAgo } }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    count: { $sum: 1 },
                    totalCalories: { $sum: '$caloriesBurned' }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Get user activity by role
        const userActivity = await Workout.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $group: {
                    _id: '$user.role',
                    totalWorkouts: { $sum: 1 },
                    totalCalories: { $sum: '$caloriesBurned' }
                }
            }
        ]);

        // System health metrics
        const systemHealth = {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            timestamp: new Date()
        };

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    members: memberCount,
                    trainers: trainerCount,
                    admins: adminCount,
                    recentRegistrations
                },
                workouts: {
                    total: totalWorkouts,
                    today: todayWorkouts,
                    thisWeek: weekWorkouts,
                    trends: workoutTrends
                },
                messages: {
                    total: totalMessages,
                    today: todayMessages
                },
                userActivity,
                systemHealth
            }
        });
    } catch (error) {
        console.error('Error fetching metrics dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching metrics data',
            error: error.message
        });
    }
});

module.exports = router;
