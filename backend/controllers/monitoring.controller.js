const User = require('../models/User');
const Workout = require('../models/Workout');
const mongoose = require('mongoose');
const os = require('os');

// Get overall statistics (accessible to all authenticated users)
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalMembers = await User.countDocuments({ role: 'member' });
        const totalTrainers = await User.countDocuments({ role: 'trainer' });
        const totalWorkouts = await Workout.countDocuments();

        // Get users created in last 24 hours
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const newUsersToday = await User.countDocuments({ createdAt: { $gte: last24Hours } });
        const newWorkoutsToday = await Workout.countDocuments({ date: { $gte: last24Hours } });

        // Get users by status
        const activeUsers = await User.countDocuments({ isActive: true });
        const inactiveUsers = await User.countDocuments({ isActive: false });

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalMembers,
                totalTrainers,
                totalWorkouts,
                newUsersToday,
                newWorkoutsToday,
                activeUsers,
                inactiveUsers,
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

// Get system health metrics
exports.getSystemHealth = async (req, res) => {
    try {
        // System metrics
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;
        const memoryUsagePercent = ((usedMemory / totalMemory) * 100).toFixed(2);

        const cpus = os.cpus();
        const cpuCount = cpus.length;
        const loadAverage = os.loadavg();

        // Process metrics
        const processMemory = process.memoryUsage();
        const uptime = process.uptime();

        // Database metrics
        const dbState = mongoose.connection.readyState;
        const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

        res.json({
            success: true,
            health: {
                system: {
                    platform: os.platform(),
                    arch: os.arch(),
                    hostname: os.hostname(),
                    cpuCount,
                    loadAverage: {
                        '1min': loadAverage[0].toFixed(2),
                        '5min': loadAverage[1].toFixed(2),
                        '15min': loadAverage[2].toFixed(2)
                    },
                    memory: {
                        total: Math.round(totalMemory / 1024 / 1024),
                        free: Math.round(freeMemory / 1024 / 1024),
                        used: Math.round(usedMemory / 1024 / 1024),
                        usagePercent: memoryUsagePercent
                    }
                },
                process: {
                    uptime: Math.round(uptime),
                    memory: {
                        rss: Math.round(processMemory.rss / 1024 / 1024),
                        heapTotal: Math.round(processMemory.heapTotal / 1024 / 1024),
                        heapUsed: Math.round(processMemory.heapUsed / 1024 / 1024),
                        external: Math.round(processMemory.external / 1024 / 1024)
                    },
                    pid: process.pid,
                    nodeVersion: process.version
                },
                database: {
                    status: dbStates[dbState],
                    connected: dbState === 1,
                    host: mongoose.connection.host,
                    name: mongoose.connection.name
                },
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error('Error fetching system health:', error);
        res.status(500).json({ success: false, message: 'Error fetching system health' });
    }
};

// Get performance metrics
exports.getPerformanceMetrics = async (req, res) => {
    try {
        // Get workout statistics
        const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const workoutsLast7Days = await Workout.countDocuments({ date: { $gte: last7Days } });
        const workoutsLast30Days = await Workout.countDocuments({ date: { $gte: last30Days } });

        // Get average workout duration
        const avgDuration = await Workout.aggregate([
            { $match: { date: { $gte: last7Days } } },
            { $group: { _id: null, avgDuration: { $avg: '$totalDuration' } } }
        ]);

        // Get user growth
        const usersLast7Days = await User.countDocuments({ createdAt: { $gte: last7Days } });
        const usersLast30Days = await User.countDocuments({ createdAt: { $gte: last30Days } });

        // Get daily workout trend for last 7 days
        const dailyWorkouts = await Workout.aggregate([
            { $match: { date: { $gte: last7Days } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    count: { $sum: 1 },
                    totalCalories: { $sum: '$totalCalories' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            metrics: {
                workouts: {
                    last7Days: workoutsLast7Days,
                    last30Days: workoutsLast30Days,
                    avgDuration: avgDuration.length > 0 ? Math.round(avgDuration[0].avgDuration) : 0,
                    dailyTrend: dailyWorkouts
                },
                users: {
                    newLast7Days: usersLast7Days,
                    newLast30Days: usersLast30Days
                },
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error('Error fetching performance metrics:', error);
        res.status(500).json({ success: false, message: 'Error fetching performance metrics' });
    }
};

// Get database performance
exports.getDatabaseMetrics = async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const admin = db.admin();

        // Get database stats
        const dbStats = await db.stats();
        
        // Get collection stats
        const collections = await db.listCollections().toArray();
        const collectionStats = [];

        for (const col of collections) {
            const stats = await db.collection(col.name).stats();
            collectionStats.push({
                name: col.name,
                count: stats.count,
                size: Math.round(stats.size / 1024),
                avgObjSize: Math.round(stats.avgObjSize),
                storageSize: Math.round(stats.storageSize / 1024)
            });
        }

        res.json({
            success: true,
            database: {
                stats: {
                    collections: dbStats.collections,
                    dataSize: Math.round(dbStats.dataSize / 1024 / 1024),
                    storageSize: Math.round(dbStats.storageSize / 1024 / 1024),
                    indexes: dbStats.indexes,
                    indexSize: Math.round(dbStats.indexSize / 1024 / 1024)
                },
                collections: collectionStats,
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error('Error fetching database metrics:', error);
        res.status(500).json({ success: false, message: 'Error fetching database metrics' });
    }
};
