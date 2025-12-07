const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Workout = require('../models/Workout');

// Get progress data with filtering
router.get('/', protect, async (req, res) => {
    try {
        const filter = req.query.filter || 'weekly'; // weekly, monthly, all
        const userId = req.user.id;

        let dateFilter = {};
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (filter === 'weekly') {
            // Last 7 days
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            dateFilter = { $gte: weekAgo, $lt: new Date() };
        } else if (filter === 'monthly') {
            // Last 30 days
            const monthAgo = new Date(today);
            monthAgo.setDate(monthAgo.getDate() - 30);
            dateFilter = { $gte: monthAgo, $lt: new Date() };
        }
        // 'all' has no date filter

        const query = { user: userId };
        if (Object.keys(dateFilter).length > 0) {
            query.date = dateFilter;
        }

        const workouts = await Workout.find(query)
            .sort({ date: -1 })
            .select('date exercises totalDuration totalCalories intensity notes mood');

        res.status(200).json({
            success: true,
            filter,
            count: workouts.length,
            workouts
        });
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching progress data',
            error: error.message
        });
    }
});

// Get weekly statistics
router.get('/weekly', protect, async (req, res) => {
    try {
        const period = req.query.period || 'current'; // current, previous, all
        const userId = req.user.id;

        let startDate, endDate;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (period === 'current') {
            // Current week (Monday to Sunday)
            const dayOfWeek = today.getDay();
            const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            startDate = new Date(today.setDate(diff));
            endDate = new Date();
        } else if (period === 'previous') {
            // Previous week
            const dayOfWeek = today.getDay();
            const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            endDate = new Date(today.setDate(diff - 1));
            startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - 6);
        } else {
            // All time
            startDate = new Date(2000, 0, 1);
            endDate = new Date();
        }

        const workouts = await Workout.find({
            user: userId,
            date: { $gte: startDate, $lt: endDate }
        });

        const stats = {
            period,
            startDate,
            endDate,
            workoutCount: workouts.length,
            totalCalories: workouts.reduce((sum, w) => sum + (w.totalCalories || 0), 0),
            totalDuration: workouts.reduce((sum, w) => sum + (w.totalDuration || 0), 0),
            avgIntensity: calculateAvgIntensity(workouts)
        };

        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching weekly stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching weekly stats',
            error: error.message
        });
    }
});

// Helper function to calculate average intensity
function calculateAvgIntensity(workouts) {
    if (workouts.length === 0) return 'N/A';
    
    const intensityMap = { low: 1, moderate: 2, high: 3, extreme: 4 };
    const avg = workouts.reduce((sum, w) => sum + (intensityMap[w.intensity] || 0), 0) / workouts.length;
    
    if (avg >= 3.5) return 'Extreme';
    if (avg >= 2.5) return 'High';
    if (avg >= 1.5) return 'Moderate';
    return 'Low';
}

module.exports = router;
