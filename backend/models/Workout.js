const mongoose = require('mongoose');

// Define the workout schema
const workoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    exercises: [{
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['cardio', 'strength', 'flexibility', 'sports', 'other'],
            default: 'other'
        },
        duration: {
            type: Number, // in minutes
            min: 0
        },
        sets: {
            type: Number,
            min: 0
        },
        reps: {
            type: Number,
            min: 0
        },
        weight: {
            type: Number, // in kg
            min: 0
        },
        distance: {
            type: Number, // in km
            min: 0
        },
        notes: String
    }],
    totalDuration: {
        type: Number, // in minutes
        default: 0
    },
    totalCalories: {
        type: Number,
        default: 0,
        min: 0
    },
    intensity: {
        type: String,
        enum: ['low', 'moderate', 'high', 'extreme'],
        default: 'moderate'
    },
    notes: {
        type: String,
        maxlength: 500
    },
    mood: {
        type: String,
        enum: ['excellent', 'good', 'okay', 'tired', 'exhausted']
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete ret.__v;
            return ret;
        }
    }
});

// Index for efficient queries
workoutSchema.index({ user: 1, date: -1 });
workoutSchema.index({ user: 1, createdAt: -1 });

// Calculate total duration from exercises if not provided
workoutSchema.pre('save', function (next) {
    if (this.exercises && this.exercises.length > 0) {
        // Calculate total duration if not explicitly set
        if (!this.totalDuration || this.totalDuration === 0) {
            this.totalDuration = this.exercises.reduce((total, exercise) => {
                return total + (exercise.duration || 0);
            }, 0);
        }
    }
    next();
});

// Create and export the model
const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;
