// Dashboard management with real-time Socket.IO updates
let socket = null;
let progressUpdateTimeout = null;

document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // Try to read current user
    let currentUser = null;
    if (typeof storage !== 'undefined' && storage.getCurrentUser) {
        currentUser = storage.getCurrentUser();
    }

    // Initialize Socket.IO connection
    initializeSocket(currentUser);

    // Always show base static stats
    await updateDashboardStats(currentUser);

    // Only fetch member workout data for members
    if (currentUser && currentUser.role === 'member') {
        await fetchRealWorkoutData(currentUser.id);
        // Set up periodic refresh every 30 seconds
        setInterval(() => fetchRealWorkoutData(currentUser.id), 30000);
    }
});

// Initialize Socket.IO connection
function initializeSocket(currentUser) {
    if (!currentUser || currentUser.role !== 'member') {
        return;
    }

    try {
        socket = io('http://localhost:8000', {
            auth: {
                token: localStorage.getItem('token')
            },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        socket.on('connect', () => {
            console.log('✓ Connected to Socket.IO server');
            // Join the user's progress room
            socket.emit('joinProgressRoom', currentUser.id);
        });

        socket.on('progressUpdated', async (data) => {
            console.log('📊 Real-time progress update received:', data);

            // Clear existing timeout
            if (progressUpdateTimeout) {
                clearTimeout(progressUpdateTimeout);
            }

            // Update dashboard with new data
            if (data.success && data.data) {
                updateDashboardWithStats(data.data);
            }

            // Refresh full data after a short delay
            progressUpdateTimeout = setTimeout(() => {
                updateDashboardStats(currentUser);
            }, 1000);
        });

        socket.on('disconnect', () => {
            console.log('✗ Disconnected from Socket.IO server');
        });

        socket.on('error', (error) => {
            console.error('Socket.IO error:', error);
        });
    } catch (error) {
        console.error('Error initializing Socket.IO:', error);
    }
}

// Update dashboard with real-time stats
function updateDashboardWithStats(stats) {
    if (!stats) return;

    if (stats.totalWorkouts !== undefined) {
        document.getElementById("total-workouts").textContent = stats.totalWorkouts;
    }
    if (stats.totalCalories !== undefined) {
        document.getElementById("total-calories").textContent = Math.round(stats.totalCalories);
    }
    if (stats.totalDuration !== undefined) {
        const element = document.getElementById("total-duration");
        if (element) {
            element.textContent = Math.round(stats.totalDuration);
        }
    }

    // Add animation effect
    const elements = document.querySelectorAll('[id^="total-"]');
    elements.forEach(el => {
        el.classList.add('stat-updated');
        setTimeout(() => el.classList.remove('stat-updated'), 300);
    });
}

async function updateDashboardStats(currentUser) {
    if (!currentUser || currentUser.role !== 'member') {
        document.getElementById("total-workouts").textContent = "0";
        document.getElementById("total-calories").textContent = "0";
        document.getElementById("streak").textContent = "0";
        document.getElementById("goal-progress").textContent = "0%";
        return;
    }

    try {
        // Fetch progress data from API
        const response = await fetch(`http://localhost:8000/api/members/progress`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            const data = result.data;

            console.log('Progress data:', data);

            if (data && data.stats) {
                // Update dashboard with real data
                document.getElementById("total-workouts").textContent = data.stats.totalWorkouts || "0";
                document.getElementById("total-calories").textContent = Math.round(data.stats.totalCalories || 0);
                document.getElementById("streak").textContent = data.stats.totalWorkouts > 0 ? Math.min(data.stats.totalWorkouts, 7) : "0";
                document.getElementById("goal-progress").textContent = Math.min(((data.stats.totalCalories || 0) / 5000) * 100, 100).toFixed(1) + "%";
            }
        } else {
            // Fallback to placeholder
            document.getElementById("total-workouts").textContent = "0";
            document.getElementById("total-calories").textContent = "0";
            document.getElementById("streak").textContent = "0";
            document.getElementById("goal-progress").textContent = "0%";
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
    }
}

async function fetchRealWorkoutData(userId) {
    // Fetch actual workout data from backend
    try {
        const response = await fetch(`http://localhost:8000/api/workouts`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const result = await response.json();
        const data = result.data || [];

        console.log('Fetched workouts:', data);

        if (Array.isArray(data) && data.length > 0) {
            displayProgress(data);
            updateWorkoutStats(data);
        } else {
            displayProgress([]);
        }
    } catch (error) {
        console.error('Error fetching workouts:', error);
        displayProgress([]);
    }
}

function displayProgress(data) {
    const progressContainer = document.getElementById("progress-container");
    if (!progressContainer) return;

    progressContainer.innerHTML = "";

    if (data.length === 0) {
        progressContainer.innerHTML = `
            <div class="empty-state">
                <h3>No workouts yet</h3>
                <p>Start logging your workouts to see progress</p>
            </div>
        `;
        return;
    }

    data.forEach(workout => {
        const progressElement = document.createElement("div");
        progressElement.className = "progress-item";
        const dateObj = new Date(workout.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const totalDuration = workout.totalDuration || 0;
        const totalCalories = workout.totalCalories || 0;
        const exerciseCount = workout.exercises ? workout.exercises.length : 0;

        progressElement.innerHTML = `
            <h3>📅 ${formattedDate}</h3>
            <p><strong>💪 Exercises:</strong> ${exerciseCount}</p>
            <p><strong>⏱️ Duration:</strong> ${totalDuration} min</p>
            <p><strong>🔥 Calories Burned:</strong> ${totalCalories} kcal</p>
            <p><strong>📝 Mood:</strong> ${workout.mood || 'Not specified'}</p>
        `;
        progressContainer.appendChild(progressElement);
    });
}

function updateWorkoutStats(data) {
    // Update dashboard stats with real data
    const totalWorkouts = data.length;
    const totalCalories = data.reduce((sum, w) => sum + (w.totalCalories || 0), 0);
    const totalDuration = data.reduce((sum, w) => sum + (w.totalDuration || 0), 0);
    const avgCalories = totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0;

    document.getElementById("total-workouts").textContent = totalWorkouts;
    document.getElementById("total-calories").textContent = totalCalories;

    // Update duration if element exists
    const durationElement = document.getElementById("total-duration");
    if (durationElement) {
        durationElement.textContent = totalDuration;
    }

    // Calculate streak (simplified - count consecutive recent workouts)
    document.getElementById("streak").textContent = totalWorkouts > 0 ? Math.min(totalWorkouts, 7) : 0;

    // Calculate goal progress (percentage)
    const goalProgress = Math.min((totalCalories / 5000) * 100, 100);
    document.getElementById("goal-progress").textContent = goalProgress.toFixed(1) + "%";
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (socket) {
        socket.disconnect();
    }
});
