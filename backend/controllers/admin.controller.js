const User = require('../models/User');
const Workout = require('../models/Workout');

// Create new user (admin only)
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, password, and role are required'
            });
        }

        // Validate role
        const validRoles = ['user', 'member', 'trainer', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Generate username from email (before @)
        const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

        // Split name into first and last
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || firstName;

        // Create user
        const user = await User.create({
            username,
            email,
            password, // Will be hashed by the User model pre-save hook
            role,
            status: 'active',
            profile: {
                firstName,
                lastName
            }
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                _id: user._id,
                name: `${firstName} ${lastName}`,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, message: error.message || 'Error creating user' });
    }
};

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
            .select('_id username email role createdAt profile.firstName profile.lastName')
            .sort({ createdAt: -1 })
            .limit(100);

        // Transform users to include a displayName
        const transformedUsers = users.map(user => ({
            _id: user._id,
            name: user.profile?.firstName && user.profile?.lastName
                ? `${user.profile.firstName} ${user.profile.lastName}`
                : user.username || 'Unknown User',
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        }));

        res.json({
            success: true,
            count: transformedUsers.length,
            users: transformedUsers
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
            .select('user date exercises totalDuration totalCalories')
            .sort({ date: -1 })
            .limit(50)
            .populate({
                path: 'user',
                select: 'username email role profile.firstName profile.lastName'
            })
            .lean();

        // Filter out workouts without valid users and format the response
        const formattedActivity = recentWorkouts
            .filter(workout => workout.user) // Only include workouts with valid user references
            .map(workout => {
                const user = workout.user;
                const displayName = user.profile?.firstName && user.profile?.lastName
                    ? `${user.profile.firstName} ${user.profile.lastName}`
                    : user.username || user.email?.split('@')[0] || 'User';
                
                return {
                    userId: {
                        name: displayName,
                        email: user.email || 'N/A',
                        role: user.role || 'user'
                    },
                    date: workout.date,
                    exercises: workout.exercises,
                    totalDuration: workout.totalDuration,
                    totalCalories: workout.totalCalories
                };
            });

        res.json({
            success: true,
            count: formattedActivity.length,
            activity: formattedActivity
        });
    } catch (error) {
        console.error('Error fetching activity log:', error);
        res.status(500).json({ success: false, message: 'Error fetching activity log' });
    }
};
