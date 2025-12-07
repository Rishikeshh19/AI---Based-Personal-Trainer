const User = require('../models/User');
const Workout = require('../models/Workout');

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndDelete(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            message: `User ${user.name} deleted successfully`,
            deletedUser: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Error deleting user' });
    }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('_id name email role createdAt')
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Error fetching users' });
    }
};

// Get user details (admin only)
exports.getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ success: false, message: 'Error fetching user' });
    }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email, role } = req.body;

        // Validate role
        const validRoles = ['user', 'member', 'trainer', 'admin'];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({ 
                success: false, 
                message: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
            });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true })
            .select('_id name email role createdAt');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, message: 'Error updating user' });
    }
};

// Get system statistics (admin only)
exports.getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const usersByRole = {};
        
        const roles = ['user', 'member', 'trainer', 'admin'];
        for (const role of roles) {
            usersByRole[role] = await User.countDocuments({ role });
        }

        const totalWorkouts = await Workout.countDocuments();
        const totalExercises = await Workout.aggregate([
            { $group: { _id: null, total: { $sum: { $size: '$exercises' } } } }
        ]);

        res.json({
            success: true,
            stats: {
                totalUsers,
                usersByRole,
                totalWorkouts,
                totalExercises: totalExercises[0]?.total || 0,
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error('Error fetching system stats:', error);
        res.status(500).json({ success: false, message: 'Error fetching system stats' });
    }
};

// Get activity log (admin only)
exports.getActivityLog = async (req, res) => {
    try {
        const recentWorkouts = await Workout.find()
            .select('userId date exercises totalDuration totalCalories')
            .sort({ date: -1 })
            .limit(50)
            .populate('userId', 'name email role');

        res.json({
            success: true,
            count: recentWorkouts.length,
            activity: recentWorkouts
        });
    } catch (error) {
        console.error('Error fetching activity log:', error);
        res.status(500).json({ success: false, message: 'Error fetching activity log' });
    }
};
