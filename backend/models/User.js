const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('../utils/logger');

// Define the user schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false // Don't return password in query results
    },
    role: {
        type: String,
        enum: ['user', 'member', 'trainer', 'admin'],
        default: 'user'
    },
    profile: {
        firstName: {
            type: String,
            trim: true
        },
        lastName: {
            type: String,
            trim: true
        },
        age: Number,
        gender: {
            type: String,
            enum: ['male', 'female', 'other', 'prefer not to say']
        },
        height: Number, // in cm
        weight: Number, // in kg
        fitnessLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced', 'expert']
        },
        goals: [{
            type: String,
            enum: ['weight loss', 'muscle gain', 'endurance', 'strength', 'flexibility', 'general fitness']
        }],
        profilePicture: String,
        bio: String,
        // Trainer specific fields
        specialization: String,
        certifications: [String],
        yearsOfExperience: Number,
        hourlyRate: Number
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: Date,
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    // Member-Trainer relationship
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // For trainers: array of member IDs they are assigned to
    assignedClients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            // Remove sensitive data when converting to JSON
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    }
});

// Check if user profile is complete
userSchema.methods.isProfileComplete = function () {
    if (!this.profile) return false;

    const commonFields = ['firstName', 'lastName'];
    const hasCommon = commonFields.every(field => this.profile[field]);

    if (!hasCommon) return false;

    if (this.role === 'trainer') {
        const trainerFields = ['specialization', 'bio', 'yearsOfExperience'];
        return trainerFields.every(field => this.profile[field]);
    } else {
        // Member fields
        const memberFields = ['age', 'gender', 'height', 'weight', 'fitnessLevel'];
        return memberFields.every(field => this.profile[field]);
    }
};

// Pre-save hook to hash password before saving
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(10);
        // Hash the password with the salt
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        logger.error('Error hashing password:', error);
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        logger.error('Error comparing passwords:', error);
        throw error;
    }
};

// Create text index for search
userSchema.index(
    {
        'username': 'text',
        'email': 'text',
        'profile.firstName': 'text',
        'profile.lastName': 'text'
    },
    {
        weights: {
            'username': 10,
            'email': 5,
            'profile.firstName': 8,
            'profile.lastName': 8
        },
        name: 'user_search_index'
    }
);

// Generate JWT token
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

// Create and export the model
const User = mongoose.model('User', userSchema);

module.exports = User;
