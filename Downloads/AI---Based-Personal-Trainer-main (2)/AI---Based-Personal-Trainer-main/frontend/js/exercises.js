// Exercise database with embedded Base64 GIFs for portability
// GIFs are embedded in gif_database.js for offline support

const exerciseDatabase = {
    chest: [
        {
            name: 'Push-ups',
            description: 'Classic bodyweight exercise for chest, shoulders, and triceps',
            difficulty: 'beginner',
            sets: 3,
            reps: 12,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Push ups.gif'] : null
        },
        {
            name: 'Bench Press',
            description: 'Fundamental compound movement for building chest mass',
            difficulty: 'intermediate',
            sets: 4,
            reps: 10,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Bench Press.gif'] : null
        },
        {
            name: 'Dumbbell Flyes',
            description: 'Isolation exercise targeting the chest muscles',
            difficulty: 'intermediate',
            sets: 3,
            reps: 12,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Dumbell Flies.gif'] : null
        },
        {
            name: 'Incline Bench Press',
            description: 'Targets upper chest development',
            difficulty: 'intermediate',
            sets: 4,
            reps: 10,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Incline Bench Press.gif'] : null
        }
    ],
    shoulders: [
        {
            name: 'Overhead Press',
            description: 'Compound movement for overall shoulder development',
            difficulty: 'intermediate',
            sets: 4,
            reps: 10,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Overhead press.gif'] : null
        },
        {
            name: 'Lateral Raises',
            description: 'Isolation exercise for side deltoids',
            difficulty: 'beginner',
            sets: 3,
            reps: 15,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Lateral Raises.gif'] : null
        },
        {
            name: 'Front Raises',
            description: 'Targets front deltoids',
            difficulty: 'beginner',
            sets: 3,
            reps: 12,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Front Raises.gif'] : null
        },
        {
            name: 'Face Pulls',
            description: 'Great for rear deltoids and upper back',
            difficulty: 'intermediate',
            sets: 3,
            reps: 15,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Face Pull.gif'] : null
        }
    ],
    biceps: [
        {
            name: 'Barbell Curls',
            description: 'Classic bicep builder',
            difficulty: 'beginner',
            sets: 3,
            reps: 12,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Dumbell curls.gif'] : null
        },
        {
            name: 'Hammer Curls',
            description: 'Targets biceps and forearms',
            difficulty: 'beginner',
            sets: 3,
            reps: 12,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Hammer curls.gif'] : null
        },
        {
            name: 'Concentration Curls',
            description: 'Isolation exercise for bicep peak',
            difficulty: 'intermediate',
            sets: 3,
            reps: 10,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Concentration curls.gif'] : null
        },
        {
            name: 'Preacher Curls',
            description: 'Strict form bicep exercise',
            difficulty: 'intermediate',
            sets: 3,
            reps: 12,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Preacher curls.gif'] : null
        }
    ],
    triceps: [
        {
            name: 'Tricep Dips',
            description: 'Bodyweight exercise for triceps',
            difficulty: 'intermediate',
            sets: 3,
            reps: 12,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Triceps-Dips.gif'] : null
        },
        {
            name: 'Overhead Extension',
            description: 'Stretches and works all three heads',
            difficulty: 'beginner',
            sets: 3,
            reps: 12,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Overhead extension.gif'] : null
        },
        {
            name: 'Tricep Pushdown',
            description: 'Cable exercise for triceps',
            difficulty: 'beginner',
            sets: 3,
            reps: 15,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Triceps pushdown.gif'] : null
        },
        {
            name: 'Close-Grip Bench',
            description: 'Compound movement for triceps',
            difficulty: 'intermediate',
            sets: 4,
            reps: 10,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Close-Grip-Bench-Press.gif'] : null
        }
    ],
    back: [
        {
            name: 'Pull-ups',
            description: 'King of back exercises',
            difficulty: 'intermediate',
            sets: 3,
            reps: 10,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Pull-up.gif'] : null
        },
        {
            name: 'Bent-Over Rows',
            description: 'Compound back builder',
            difficulty: 'intermediate',
            sets: 4,
            reps: 10,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Barbell-Bent-Over-Row.gif'] : null
        },
        {
            name: 'Lat Pulldown',
            description: 'Great for lat development',
            difficulty: 'beginner',
            sets: 3,
            reps: 12,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Lat-Pulldown.gif'] : null
        },
        {
            name: 'Deadlifts',
            description: 'Full body compound movement',
            difficulty: 'advanced',
            sets: 4,
            reps: 6,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Barbell-Deadlift.gif'] : null
        }
    ],
    core: [
        {
            name: 'Planks',
            description: 'Isometric core strengthener',
            difficulty: 'beginner',
            sets: 3,
            reps: '60 seconds',
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['body-saw-plank.gif'] : null
        },
        {
            name: 'Russian Twists',
            description: 'Oblique targeting exercise',
            difficulty: 'beginner',
            sets: 3,
            reps: 20,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Russian twists.gif'] : null
        },
        {
            name: 'Bicycle Crunches',
            description: 'Dynamic ab exercise',
            difficulty: 'beginner',
            sets: 3,
            reps: 20,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Bicycle-Crunch.gif'] : null
        },
        {
            name: 'Hanging Leg Raises',
            description: 'Advanced core exercise',
            difficulty: 'advanced',
            sets: 3,
            reps: 12,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Hanging-Knee-Raises.gif'] : null
        }
    ],
    lower_front: [
        {
            name: 'Squats',
            description: 'King of leg exercises',
            difficulty: 'intermediate',
            sets: 4,
            reps: 10,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['smith-machine-squat.gif'] : null
        },
        {
            name: 'Leg Press',
            description: 'Machine-based quad builder',
            difficulty: 'beginner',
            sets: 4,
            reps: 12,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Leg-Press.gif'] : null
        },
        {
            name: 'Lunges',
            description: 'Unilateral leg exercise',
            difficulty: 'beginner',
            sets: 3,
            reps: 12,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['dumbbell-lunges.gif'] : null
        },
        {
            name: 'Leg Extensions',
            description: 'Isolation for quads',
            difficulty: 'beginner',
            sets: 3,
            reps: 15,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['LEG-EXTENSION.gif'] : null
        },
        {
            name: 'Standing Calf Raises',
            description: 'Primary calf exercise',
            difficulty: 'beginner',
            sets: 4,
            reps: 15,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Dumbbell-Calf-Raise.gif'] : null
        }
    ],
    lower_back: [
        {
            name: 'Romanian Deadlifts',
            description: 'Hamstring and glute builder',
            difficulty: 'intermediate',
            sets: 4,
            reps: 10,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Barbell-Romanian-Deadlift.gif'] : null
        },
        {
            name: 'Leg Curls',
            description: 'Isolation for hamstrings',
            difficulty: 'beginner',
            sets: 3,
            reps: 12,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Leg-Curl.gif'] : null
        },
        {
            name: 'Hip Thrusts',
            description: 'Best glute builder',
            difficulty: 'intermediate',
            sets: 4,
            reps: 12,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Barbell-Hip-Thrust.gif'] : null
        },
        {
            name: 'Bulgarian Split Squats',
            description: 'Unilateral glute exercise',
            difficulty: 'intermediate',
            sets: 3,
            reps: 10,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Dumbbell-Bulgarian-Split-Squat.gif'] : null
        },
        {
            name: 'Glute Bridges',
            description: 'Bodyweight glute activation',
            difficulty: 'beginner',
            sets: 3,
            reps: 15,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['anim-glute-bridges.gif'] : null
        }
    ],
    forearms: [
        {
            name: 'Wrist Curls',
            description: 'Forearm flexor exercise',
            difficulty: 'beginner',
            sets: 3,
            reps: 15,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Dumbbell-Wrist-Curl.gif'] : null
        },
        {
            name: 'Reverse Wrist Curls',
            description: 'Forearm extensor exercise',
            difficulty: 'beginner',
            sets: 3,
            reps: 15,
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Barbell-Reverse-Wrist-Curl.gif'] : null
        },
        {
            name: 'Farmers Walk',
            description: 'Grip and forearm strength',
            difficulty: 'intermediate',
            sets: 3,
            reps: '60 seconds',
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Farmers walk.gif'] : null
        },
        {
            name: 'Dead Hangs',
            description: 'Grip endurance exercise',
            difficulty: 'beginner',
            sets: 3,
            reps: '30 seconds',
            gif: typeof gifDatabase !== 'undefined' ? gifDatabase['Dead hang.gif'] : null
        }
    ]
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = exerciseDatabase;
}
