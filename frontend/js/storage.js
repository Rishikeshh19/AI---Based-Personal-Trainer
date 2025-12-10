// LocalStorage-based authentication and data storage
const STORAGE_KEYS = {
    USERS: 'ai_trainer_users',
    CURRENT_USER: 'current_user',
    TOKEN: 'token',
    WORKOUTS: 'ai_trainer_workouts',
    TRAINER_CLIENTS: 'trainer_clients',
    EXERCISES: 'workout_exercises'
};

// Workout exercises by muscle group with GIF URLs
const WORKOUT_EXERCISES = {
    chest: [
        { name: 'Push-ups', difficulty: 'beginner', sets: 3, reps: 12, description: 'Classic bodyweight exercise for chest, shoulders, and triceps', gif: 'https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif' },
        { name: 'Bench Press', difficulty: 'intermediate', sets: 4, reps: 10, description: 'Fundamental compound movement for building chest mass', gif: 'https://media.giphy.com/media/5xtDarmwsuR9sDKgF2I/giphy.gif' },
        { name: 'Dumbbell Flyes', difficulty: 'intermediate', sets: 3, reps: 12, description: 'Isolation exercise targeting the chest muscles', gif: 'https://media.giphy.com/media/l0HlVODVZvMfGKXAA/giphy.gif' },
        { name: 'Incline Bench Press', difficulty: 'intermediate', sets: 4, reps: 10, description: 'Targets upper chest development', gif: 'https://media.giphy.com/media/l0HlR3chv6g7bKhrq/giphy.gif' }
    ],
    shoulders: [
        { name: 'Overhead Press', difficulty: 'intermediate', sets: 4, reps: 10, description: 'Compound movement for overall shoulder development', gif: 'https://media.giphy.com/media/l3q2UmzWI2xEQpnJS/giphy.gif' },
        { name: 'Lateral Raises', difficulty: 'beginner', sets: 3, reps: 15, description: 'Isolation exercise for side deltoids', gif: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif' },
        { name: 'Front Raises', difficulty: 'beginner', sets: 3, reps: 12, description: 'Targets front deltoids', gif: 'https://media.giphy.com/media/l0HlVODVZvMfGKXAA/giphy.gif' },
        { name: 'Face Pulls', difficulty: 'intermediate', sets: 3, reps: 15, description: 'Great for rear deltoids and upper back', gif: 'https://media.giphy.com/media/3o7TKPATxjC9zZFVHq/giphy.gif' }
    ],
    biceps: [
        { name: 'Barbell Curls', difficulty: 'beginner', sets: 3, reps: 12, description: 'Classic bicep builder', gif: 'https://media.giphy.com/media/l0HlMZcYzLS53IZAc/giphy.gif' },
        { name: 'Hammer Curls', difficulty: 'beginner', sets: 3, reps: 12, description: 'Targets biceps and forearms', gif: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif' },
        { name: 'Concentration Curls', difficulty: 'intermediate', sets: 3, reps: 10, description: 'Isolation exercise for bicep peak', gif: 'https://media.giphy.com/media/l0HlVODVZvMfGKXAA/giphy.gif' },
        { name: 'Preacher Curls', difficulty: 'intermediate', sets: 3, reps: 12, description: 'Strict form bicep exercise', gif: 'https://media.giphy.com/media/l3q2UmzWI2xEQpnJS/giphy.gif' }
    ],
    triceps: [
        { name: 'Tricep Dips', difficulty: 'intermediate', sets: 3, reps: 12, description: 'Bodyweight exercise for triceps', gif: 'https://media.giphy.com/media/l0HlSY9x8FZo0XO1i/giphy.gif' },
        { name: 'Overhead Extension', difficulty: 'beginner', sets: 3, reps: 12, description: 'Stretches and works all three heads', gif: 'https://media.giphy.com/media/l3q2UmzWI2xEQpnJS/giphy.gif' },
        { name: 'Tricep Pushdown', difficulty: 'beginner', sets: 3, reps: 15, description: 'Cable exercise for triceps', gif: 'https://media.giphy.com/media/l0HlR3chv6g7bKhrq/giphy.gif' },
        { name: 'Close-Grip Bench', difficulty: 'intermediate', sets: 4, reps: 10, description: 'Compound movement for triceps', gif: 'https://media.giphy.com/media/5xtDarmwsuR9sDKgF2I/giphy.gif' }
    ],
    back: [
        { name: 'Pull-ups', difficulty: 'intermediate', sets: 3, reps: 10, description: 'King of back exercises', gif: 'https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif' },
        { name: 'Bent-Over Rows', difficulty: 'intermediate', sets: 4, reps: 10, description: 'Compound back builder', gif: 'https://media.giphy.com/media/3o6ZsYq8d7Q5L6bvfO/giphy.gif' },
        { name: 'Lat Pulldown', difficulty: 'beginner', sets: 3, reps: 12, description: 'Great for lat development', gif: 'https://media.giphy.com/media/l0HlVODVZvMfGKXAA/giphy.gif' },
        { name: 'Deadlifts', difficulty: 'advanced', sets: 4, reps: 6, description: 'Full body compound movement', gif: 'https://media.giphy.com/media/3o7TKqnN349PBUtGFO/giphy.gif' }
    ],
    core: [
        { name: 'Planks', difficulty: 'beginner', sets: 3, reps: '60 seconds', description: 'Isometric core strengthener', gif: 'https://media.giphy.com/media/l0HlPystfePnAI3G8/giphy.gif' },
        { name: 'Russian Twists', difficulty: 'beginner', sets: 3, reps: 20, description: 'Oblique targeting exercise', gif: 'https://media.giphy.com/media/l3q2U1F2d5e8BdP1S/giphy.gif' },
        { name: 'Bicycle Crunches', difficulty: 'beginner', sets: 3, reps: 20, description: 'Dynamic ab exercise', gif: 'https://media.giphy.com/media/l0HlNFQ9x8FZo0XO1i/giphy.gif' },
        { name: 'Hanging Leg Raises', difficulty: 'advanced', sets: 3, reps: 12, description: 'Advanced core exercise', gif: 'https://media.giphy.com/media/l0HlTy9x8s1WysLq0/giphy.gif' }
    ],
    quads: [
        { name: 'Squats', difficulty: 'intermediate', sets: 4, reps: 10, description: 'King of leg exercises', gif: 'https://media.giphy.com/media/ZXlK4bTUhJiNy/giphy.gif' },
        { name: 'Leg Press', difficulty: 'beginner', sets: 4, reps: 12, description: 'Machine-based quad builder', gif: 'https://media.giphy.com/media/l0HlTy9x8s1WysLq0/giphy.gif' },
        { name: 'Lunges', difficulty: 'beginner', sets: 3, reps: 12, description: 'Unilateral leg exercise', gif: 'https://media.giphy.com/media/l0HlPystfePnAI3G8/giphy.gif' },
        { name: 'Leg Extensions', difficulty: 'beginner', sets: 3, reps: 15, description: 'Isolation for quads', gif: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif' }
    ],
    hamstrings: [
        { name: 'Romanian Deadlifts', difficulty: 'intermediate', sets: 4, reps: 10, description: 'Hamstring and glute builder', gif: 'https://media.giphy.com/media/3o7TKqnN349PBUtGFO/giphy.gif' },
        { name: 'Leg Curls', difficulty: 'beginner', sets: 3, reps: 12, description: 'Isolation for hamstrings', gif: 'https://media.giphy.com/media/l0HlNFQ9x8FZo0XO1i/giphy.gif' },
        { name: 'Good Mornings', difficulty: 'intermediate', sets: 3, reps: 12, description: 'Posterior chain exercise', gif: 'https://media.giphy.com/media/l3q2U1F2d5e8BdP1S/giphy.gif' },
        { name: 'Nordic Curls', difficulty: 'advanced', sets: 3, reps: 8, description: 'Advanced hamstring exercise', gif: 'https://media.giphy.com/media/l0HlTy9x8s1WysLq0/giphy.gif' }
    ],
    glutes: [
        { name: 'Hip Thrusts', difficulty: 'intermediate', sets: 4, reps: 12, description: 'Best glute builder', gif: 'https://media.giphy.com/media/l0HlPystfePnAI3G8/giphy.gif' },
        { name: 'Bulgarian Split Squats', difficulty: 'intermediate', sets: 3, reps: 10, description: 'Unilateral glute exercise', gif: 'https://media.giphy.com/media/l0HlTy9x8s1WysLq0/giphy.gif' },
        { name: 'Glute Bridges', difficulty: 'beginner', sets: 3, reps: 15, description: 'Bodyweight glute activation', gif: 'https://media.giphy.com/media/l3q2UmzWI2xEQpnJS/giphy.gif' },
        { name: 'Cable Kickbacks', difficulty: 'beginner', sets: 3, reps: 15, description: 'Isolation for glutes', gif: 'https://media.giphy.com/media/l0HlVODVZvMfGKXAA/giphy.gif' }
    ],
    calves: [
        { name: 'Standing Calf Raises', difficulty: 'beginner', sets: 4, reps: 15, description: 'Primary calf exercise', gif: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif' },
        { name: 'Seated Calf Raises', difficulty: 'beginner', sets: 3, reps: 20, description: 'Targets soleus muscle', gif: 'https://media.giphy.com/media/l3q2UmzWI2xEQpnJS/giphy.gif' },
        { name: 'Jump Rope', difficulty: 'beginner', sets: 3, reps: '60 seconds', description: 'Dynamic calf exercise', gif: 'https://media.giphy.com/media/l0HlPystfePnAI3G8/giphy.gif' },
        { name: 'Box Jumps', difficulty: 'intermediate', sets: 3, reps: 10, description: 'Explosive calf training', gif: 'https://media.giphy.com/media/3o7TKPATxjC9zZFVHq/giphy.gif' }
    ],
    forearms: [
        { name: 'Wrist Curls', difficulty: 'beginner', sets: 3, reps: 15, description: 'Forearm flexor exercise', gif: 'https://media.giphy.com/media/l3q2UmzWI2xEQpnJS/giphy.gif' },
        { name: 'Reverse Wrist Curls', difficulty: 'beginner', sets: 3, reps: 15, description: 'Forearm extensor exercise', gif: 'https://media.giphy.com/media/l0HlVODVZvMfGKXAA/giphy.gif' },
        { name: 'Farmers Walk', difficulty: 'intermediate', sets: 3, reps: '60 seconds', description: 'Grip and forearm strength', gif: 'https://media.giphy.com/media/l0HlPystfePnAI3G8/giphy.gif' },
        { name: 'Dead Hangs', difficulty: 'beginner', sets: 3, reps: '30 seconds', description: 'Grip endurance exercise', gif: 'https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif' }
    ]
};

// Initialize storage with demo users if empty
function initializeStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        const demoUsers = [
            {
                id: '1',
                name: 'Demo Member',
                email: 'member@demo.com',
                password: 'member123',
                role: 'member',
                trainerId: null,
                createdAt: new Date().toISOString(),
                workouts: []
            },
            {
                id: '2',
                name: 'John Trainer',
                email: 'trainer@demo.com',
                password: 'trainer123',
                role: 'trainer',
                specialization: 'Strength Training',
                bio: 'Certified personal trainer with 10+ years experience',
                clients: [],
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                name: 'Sarah Fitness',
                email: 'sarah@trainer.com',
                password: 'trainer123',
                role: 'trainer',
                specialization: 'Cardio & Weight Loss',
                bio: 'Helping clients achieve their fitness goals',
                clients: [],
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(demoUsers));
    }

    // Initialize exercises
    if (!localStorage.getItem(STORAGE_KEYS.EXERCISES)) {
        localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(WORKOUT_EXERCISES));
    }

    // Initialize trainer-client relationships
    if (!localStorage.getItem(STORAGE_KEYS.TRAINER_CLIENTS)) {
        localStorage.setItem(STORAGE_KEYS.TRAINER_CLIENTS, JSON.stringify([]));
    }
}

// User management
const storage = {
    // Get all users
    getUsers() {
        initializeStorage();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    },

    // Save users
    saveUsers(users) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    },

    // Find user by email
    findUserByEmail(email) {
        const users = this.getUsers();
        return users.find(u => u.email.toLowerCase() === email.toLowerCase());
    },

    // Add new user
    addUser(userData) {
        const users = this.getUsers();
        // Check if user already exists
        if (this.findUserByEmail(userData.email)) {
            throw new Error('User with this email already exists');
        }

        const newUser = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email.toLowerCase(),
            password: userData.password, // In production, hash this
            role: userData.role,
            trainerId: userData.role === 'member' ? null : undefined,
            workouts: userData.role === 'member' ? [] : undefined,
            clients: userData.role === 'trainer' ? [] : undefined,
            specialization: userData.role === 'trainer' ? (userData.specialization || 'General Fitness') : undefined,
            bio: userData.role === 'trainer' ? (userData.bio || '') : undefined,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        this.saveUsers(users);
        return newUser;
    },

    // Authenticate user
    authenticate(email, password) {
        const user = this.findUserByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }
        if (user.password !== password) {
            throw new Error('Invalid email or password');
        }
        return user;
    },

    // Generate a simple token (mock JWT)
    generateToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        };
        // Simple base64 encoding (not secure, just for demo)
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const body = btoa(JSON.stringify(payload));
        const signature = btoa('mock-signature-' + Date.now());
        return `${header}.${body}.${signature}`;
    },

    // Set current user session
    setSession(user, token) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    },

    // Get current user
    getCurrentUser() {
        const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        return userStr ? JSON.parse(userStr) : null;
    },

    // Set current user (alias for setSession for backwards compatibility)
    setCurrentUser(user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    },

    // Get current token
    getToken() {
        return localStorage.getItem(STORAGE_KEYS.TOKEN);
    },

    // Clear session
    clearSession() {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
    },

    // Update user
    updateUser(userId, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index === -1) {
            throw new Error('User not found');
        }
        users[index] = { ...users[index], ...updates };
        this.saveUsers(users);

        // Update current user if it's the same user
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            this.setSession(users[index], this.getToken());
        }

        return users[index];
    },

    // Get exercises by muscle group
    getExercisesByMuscle(muscle) {
        const exercises = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXERCISES) || '{}');
        return exercises[muscle] || [];
    },

    // Get all exercises
    getAllExercises() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.EXERCISES) || '{}');
    },

    // Add workout to user
    addWorkout(userId, workout) {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);
        if (!user || user.role !== 'member') {
            throw new Error('User not found or not a member');
        }

        if (!user.workouts) user.workouts = [];
        const newWorkout = {
            id: Date.now().toString(),
            ...workout,
            date: workout.date || new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };
        user.workouts.push(newWorkout);
        this.saveUsers(users);

        // Update current user if it's the same user
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            this.setSession(user, this.getToken());
        }

        return newWorkout;
    },

    // Get user workouts
    getUserWorkouts(userId) {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);
        return user && user.workouts ? user.workouts : [];
    },

    // Get all trainers
    getTrainers() {
        const users = this.getUsers();
        return users.filter(u => u.role === 'trainer');
    },

    // Assign trainer to member
    assignTrainer(memberId, trainerId) {
        const users = this.getUsers();
        const member = users.find(u => u.id === memberId && u.role === 'member');
        const trainer = users.find(u => u.id === trainerId && u.role === 'trainer');

        if (!member || !trainer) {
            throw new Error('Member or trainer not found');
        }

        // Remove from previous trainer if any
        if (member.trainerId) {
            const prevTrainer = users.find(u => u.id === member.trainerId);
            if (prevTrainer && prevTrainer.clients) {
                prevTrainer.clients = prevTrainer.clients.filter(c => c.id !== memberId);
            }
        }

        // Assign new trainer
        member.trainerId = trainerId;
        if (!trainer.clients) trainer.clients = [];
        if (!trainer.clients.find(c => c.id === memberId)) {
            trainer.clients.push({
                id: memberId,
                name: member.name,
                email: member.email,
                assignedAt: new Date().toISOString()
            });
        }

        this.saveUsers(users);

        // Update current user if it's the same user
        const currentUser = this.getCurrentUser();
        if (currentUser && (currentUser.id === memberId || currentUser.id === trainerId)) {
            const updatedUser = currentUser.id === memberId ? member : trainer;
            this.setSession(updatedUser, this.getToken());
        }

        return { member, trainer };
    },

    // Get trainer's clients
    getTrainerClients(trainerId) {
        const users = this.getUsers();
        const trainer = users.find(u => u.id === trainerId && u.role === 'trainer');
        if (!trainer || !trainer.clients) return [];

        return trainer.clients.map(clientInfo => {
            const client = users.find(u => u.id === clientInfo.id);
            return {
                ...clientInfo,
                workouts: client ? (client.workouts || []) : [],
                stats: client ? this.calculateClientStats(client.id) : null
            };
        });
    },

    // Calculate client statistics
    calculateClientStats(clientId) {
        const workouts = this.getUserWorkouts(clientId);
        const totalWorkouts = workouts.length;
        const totalCalories = workouts.reduce((sum, w) => sum + (parseInt(w.calories) || 0), 0);
        const recentWorkouts = workouts.filter(w => {
            const workoutDate = new Date(w.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return workoutDate >= weekAgo;
        }).length;

        // Calculate streak
        let streak = 0;
        if (workouts.length > 0) {
            const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let checkDate = new Date(today);

            for (const workout of sortedWorkouts) {
                const workoutDate = new Date(workout.date);
                workoutDate.setHours(0, 0, 0, 0);
                if (workoutDate.getTime() === checkDate.getTime()) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else if (workoutDate < checkDate) {
                    break;
                }
            }
        }

        return {
            totalWorkouts,
            totalCalories,
            weeklyWorkouts: recentWorkouts,
            streak,
            lastWorkout: workouts.length > 0 ? workouts[workouts.length - 1].date : null
        };
    }
};

// Initialize on load
initializeStorage();

