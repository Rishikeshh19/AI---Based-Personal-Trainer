const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    bodyPart: {
        type: String,
        required: [true, 'Please specify the body part'],
        enum: [
            'back',
            'cardio',
            'chest',
            'lower arms',
            'lower legs',
            'neck',
            'shoulders',
            'upper arms',
            'upper legs',
            'waist'
        ]
    },
    equipment: {
        type: String,
        required: [true, 'Please specify the equipment'],
        enum: [
            'assisted',
            'band',
            'barbell',
            'body weight',
            'bosu ball',
            'cable',
            'dumbbell',
            'elliptical machine',
            'ez barbell',
            'hammer',
            'kettlebell',
            'leverage machine',
            'medicine ball',
            'olympic barbell',
            'resistance band',
            'roller',
            'rope',
            'skierg machine',
            'sled machine',
            'smith machine',
            'stability ball',
            'stationary bike',
            'stepmill machine',
            'tire',
            'trap bar',
            'upper body ergometer',
            'weighted',
            'wheel roller',
            'none'
        ]
    },
    gifUrl: {
        type: String,
        required: true,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please use a valid URL with HTTP or HTTPS'
        ]
    },
    target: {
        type: String,
        required: [true, 'Please specify the target muscle'],
        enum: [
            'abductors',
            'abs',
            'adductors',
            'biceps',
            'calves',
            'cardiovascular system',
            'delts',
            'forearms',
            'glutes',
            'hamstrings',
            'lats',
            'levator scapulae',
            'pectorals',
            'quads',
            'serratus anterior',
            'spine',
            'traps',
            'triceps',
            'upper back'
        ]
    },
    secondaryMuscles: [{
        type: String
    }],
    instructions: [{
        type: String,
        required: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create a compound index for better query performance
ExerciseSchema.index({ name: 'text', bodyPart: 1, equipment: 1, target: 1 });

module.exports = mongoose.model('Exercise', ExerciseSchema);
