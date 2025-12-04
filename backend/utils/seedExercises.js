const mongoose = require('mongoose');
const Exercise = require('../models/Exercise');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: '../.env' });

// Sample exercises data
const exercises = [
    {
        name: 'Barbell Bench Press',
        description: 'A compound exercise that targets the chest, shoulders, and triceps.',
        bodyPart: 'chest',
        equipment: 'barbell',
        gifUrl: 'https://v2.exercisedb.io/image/6bP7B0b7vTtQvX',
        target: 'pectorals',
        secondaryMuscles: ['shoulders', 'triceps'],
        instructions: [
            'Lie on a flat bench with a barbell at arm\'s length over your chest.',
            'Lower the bar to your chest while keeping your elbows at a 45-degree angle.',
            'Press the bar back up to the starting position.'
        ]
    },
    {
        name: 'Dumbbell Shoulder Press',
        description: 'An exercise that targets the shoulders and triceps.',
        bodyPart: 'shoulders',
        equipment: 'dumbbell',
        gifUrl: 'https://v2.exercisedb.io/image/6bP7B0b7vTtQvX',
        target: 'delts',
        secondaryMuscles: ['triceps', 'upper back'],
        instructions: [
            'Sit on a bench with back support and hold a dumbbell in each hand at shoulder height.',
            'Press the dumbbells upward until your arms are fully extended.',
            'Lower the dumbbells back to the starting position.'
        ]
    },
    {
        name: 'Bodyweight Squat',
        description: 'A fundamental lower body exercise that targets the quads, hamstrings, and glutes.',
        bodyPart: 'upper legs',
        equipment: 'body weight',
        gifUrl: 'https://v2.exercisedb.io/image/6bP7B0b7vTtQvX',
        target: 'quads',
        secondaryMuscles: ['hamstrings', 'glutes', 'calves'],
        instructions: [
            'Stand with your feet shoulder-width apart.',
            'Lower your body by bending your knees and pushing your hips back.',
            'Keep your chest up and back straight as you lower down.',
            'Press through your heels to return to the starting position.'
        ]
    }
];

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    // Import data
    const importData = async () => {
        try {
            await Exercise.deleteMany();
            await Exercise.insertMany(exercises);
            console.log('Data imported successfully');
            process.exit();
        } catch (error) {
            console.error('Error importing data:', error);
            process.exit(1);
        }
    };
    importData();
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
});
