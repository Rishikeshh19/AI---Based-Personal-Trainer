const User = require('../models/User');
const Workout = require('../models/Workout');

// Get overall statistics (accessible to all authenticated users)
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalMembers = await User.countDocuments({ role: 'member' });
        const totalTrainers = await User.countDocuments({ role: 'trainer' });
        const totalWorkouts = await Workout.countDocuments();

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalMembers,
                totalTrainers,
                totalWorkouts,
                lastUpdated: new Date()
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: 'Error fetching statistics' });
    }
};

// Get all members (accessible to all authenticated users)
exports.getAllMembers = async (req, res) => {
    try {
        const members = await User.find({ role: 'member' })
            .select('_id name email createdAt trainerId')
            .limit(50);

        res.json({
            success: true,
            count: members.length,
            members
        });
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ success: false, message: 'Error fetching members' });
    }
};

// Get all trainers (accessible to all authenticated users)
exports.getAllTrainers = async (req, res) => {
    try {
        const trainers = await User.find({ role: 'trainer' })
            .select('_id name email specialization createdAt')
            .limit(50);

        res.json({
            success: true,
            count: trainers.length,
            trainers
        });
    } catch (error) {
        console.error('Error fetching trainers:', error);
        res.status(500).json({ success: false, message: 'Error fetching trainers' });
    }
};

// Get recent activity/workouts (accessible to all authenticated users)
exports.getActivity = async (req, res) => {
    try {
        const recentWorkouts = await Workout.find()
            .select('userId date exercises totalDuration totalCalories')
            .sort({ date: -1 })
            .limit(20)
            .populate('userId', 'name email');

        res.json({
            success: true,
            count: recentWorkouts.length,
            activity: recentWorkouts
        });
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ success: false, message: 'Error fetching activity' });
    }
};

// Get monitoring dashboard data (all-in-one)
exports.getDashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalMembers = await User.countDocuments({ role: 'member' });
        const totalTrainers = await User.countDocuments({ role: 'trainer' });
        const totalWorkouts = await Workout.countDocuments();

        const recentMembers = await User.find({ role: 'member' })
            .select('name email createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        const recentTrainers = await User.find({ role: 'trainer' })
            .select('name email createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        const recentActivity = await Workout.find()
            .select('userId date exercises totalDuration totalCalories')
            .sort({ date: -1 })
            .limit(10)
            .populate('userId', 'name email');

        res.json({
            success: true,
            dashboard: {
                stats: {
                    totalUsers,
                    totalMembers,
                    totalTrainers,
                    totalWorkouts
                },
                recentMembers,
                recentTrainers,
                recentActivity,
                lastUpdated: new Date()
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).json({ success: false, message: 'Error fetching dashboard data' });
    }
};
