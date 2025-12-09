let socket = null;
let progressUpdateTimeout = null;

async function fetchAndRenderProgress(currentUser) {
    if (!currentUser || currentUser.role !== 'member') {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const progressRes = await fetch('http://localhost:8000/api/members/progress', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!progressRes.ok) return;

        const progressJson = await progressRes.json();
        const progressData = progressJson.data;

        if (!progressData || !progressData.stats) return;

        const stats = progressData.stats;
        const workouts = stats.recentWorkouts || [];

        // Update main progress list
        const progressContainer = document.getElementById('progress-data');
        if (progressContainer) {
            if (workouts.length === 0) {
                progressContainer.innerHTML = `
                    <div class="empty-state">
                        <h3>No progress data yet</h3>
                        <p>Start logging workouts to see your progress</p>
                    </div>
                `;
            } else {
                progressContainer.innerHTML = '';
                workouts.forEach(workout => {
                    const card = document.createElement('div');
                    card.className = 'progress-card';

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

                    card.innerHTML = `
                        <h4>${formattedDate}</h4>
                        <p><strong>Exercises:</strong> ${exerciseCount}</p>
                        <p><strong>Duration:</strong> ${totalDuration} min</p>
                        <p><strong>Calories:</strong> ${totalCalories} kcal</p>
                        <p><strong>Mood:</strong> ${workout.mood || 'Not specified'}</p>
                    `;

                    progressContainer.appendChild(card);
                });
            }
        }

        // Weekly stats (logic: from 'weeklyResetDate' in localStorage, or default last 7 days if not set)
        let weeklyStartDateStr = localStorage.getItem(`weeklyResetDate_${currentUser.id}`);
        let weeklyStartDate;

        if (weeklyStartDateStr) {
            weeklyStartDate = new Date(weeklyStartDateStr);
        } else {
            // Default to 7 days ago if never manually reset
            const now = new Date();
            weeklyStartDate = new Date(now);
            weeklyStartDate.setDate(now.getDate() - 7);
        }

        let weeklyWorkouts = 0;
        let weeklyCalories = 0;
        let weeklyDuration = 0;

        workouts.forEach(w => {
            const d = new Date(w.date);
            if (d >= weeklyStartDate) {
                weeklyWorkouts += 1;
                weeklyCalories += w.totalCalories || 0;
                weeklyDuration += w.totalDuration || 0;
            }
        });

        const weeklyWorkoutsEl = document.getElementById('weekly-workouts');
        if (weeklyWorkoutsEl) weeklyWorkoutsEl.textContent = weeklyWorkouts;

        const weeklyCaloriesEl = document.getElementById('weekly-calories');
        if (weeklyCaloriesEl) weeklyCaloriesEl.textContent = Math.round(weeklyCalories);

        const totalTimeEl = document.getElementById('total-time');
        if (totalTimeEl) totalTimeEl.textContent = `${Math.round(weeklyDuration / 60)}h`;

        // Monthly stats (use stats totals over last 30 days)
        const monthlyDataEl = document.getElementById('monthly-data');
        if (monthlyDataEl) {
            monthlyDataEl.classList.remove('empty-state');
            monthlyDataEl.innerHTML = `
                <div class="progress-card">
                    <h4>Last 30 Days</h4>
                    <p><strong>Total Workouts:</strong> ${stats.totalWorkouts || 0}</p>
                    <p><strong>Total Calories:</strong> ${Math.round(stats.totalCalories || 0)} kcal</p>
                    <p><strong>Total Duration:</strong> ${(stats.totalDuration || 0)} min</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('Error fetching progress data for progress page:', error);
    }
}

function initializeProgressSocket(currentUser) {
    if (!currentUser || currentUser.role !== 'member') return;

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
            console.log('✓ [progress] Connected to Socket.IO server');
            socket.emit('joinProgressRoom', currentUser.id);
        });

        socket.on('progressUpdated', (data) => {
            console.log('📈 [progress] Real-time progress update received:', data);

            if (progressUpdateTimeout) {
                clearTimeout(progressUpdateTimeout);
            }

            // Fetch latest data shortly after event
            progressUpdateTimeout = setTimeout(() => {
                fetchAndRenderProgress(currentUser);
            }, 500);
        });

        socket.on('disconnect', () => {
            console.log('✗ [progress] Disconnected from Socket.IO server');
        });

        socket.on('error', (error) => {
            console.error('[progress] Socket.IO error:', error);
        });
    } catch (error) {
        console.error('Error initializing progress Socket.IO:', error);
    }
}

// Entry for progress.html
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let currentUser = null;
    if (typeof storage !== 'undefined' && storage.getCurrentUser) {
        currentUser = storage.getCurrentUser();
    }

    if (!currentUser) return;

    initializeProgressSocket(currentUser);
    fetchAndRenderProgress(currentUser);

    const startNewWeekBtn = document.getElementById('start-new-week-btn');
    if (startNewWeekBtn) {
        startNewWeekBtn.addEventListener('click', () => {
            if (typeof showConfirm === 'function') {
                showConfirm('Start a new week? This will reset your "Weekly Statistics" view to zero. Your historical data remains safe.', () => {
                    localStorage.setItem(`weeklyResetDate_${currentUser.id}`, new Date().toISOString());
                    fetchAndRenderProgress(currentUser);
                    showToast('Weekly stats reset!', 'success', 3000);
                });
            } else {
                if (confirm('Start a new week? This will reset your "Weekly Statistics" view to zero. Your historical data remains safe.')) {
                    localStorage.setItem(`weeklyResetDate_${currentUser.id}`, new Date().toISOString());
                    fetchAndRenderProgress(currentUser);
                    alert('Weekly stats reset!');
                }
            }
        });
    }
});

window.addEventListener('beforeunload', () => {
    if (socket) {
        socket.disconnect();
    }
});
