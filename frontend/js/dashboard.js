// Dashboard management with real data from backend
document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // Load stats
    updateDashboardStats();
    fetchRealWorkoutData();
});

function updateDashboardStats() {
    // Fetch from backend or use placeholder
    document.getElementById("total-workouts").textContent = "0";
    document.getElementById("total-calories").textContent = "0";
    document.getElementById("streak").textContent = "0";
    document.getElementById("goal-progress").textContent = "0%";
}

function fetchRealWorkoutData() {
    // Fetch actual workout data from backend
    fetch('http://localhost:5000/api/workouts/member/all', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Fetched workouts:', data);
        if (Array.isArray(data) && data.length > 0) {
            displayProgress(data);
            updateWorkoutStats(data);
        } else {
            displayProgress([]);
        }
    })
    .catch(error => {
        console.error('Error fetching workouts:', error);
        displayProgress([]);
    });
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
        
        progressElement.innerHTML = `
            <h3>📅 ${formattedDate}</h3>
            <p><strong>💪 Exercises:</strong> ${workout.exercises || 'N/A'}</p>
            <p><strong>🔢 Sets:</strong> ${workout.sets || 'N/A'}</p>
            <p><strong>🔢 Reps:</strong> ${workout.reps || 'N/A'}</p>
            <p><strong>🔥 Calories Burned:</strong> ${workout.calories || 0} kcal</p>
        `;
        progressContainer.appendChild(progressElement);
    });
}

function updateWorkoutStats(data) {
    // Update dashboard stats with real data
    const totalWorkouts = data.length;
    const totalCalories = data.reduce((sum, w) => sum + (w.calories || 0), 0);
    const avgCalories = totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0;

    document.getElementById("total-workouts").textContent = totalWorkouts;
    document.getElementById("total-calories").textContent = totalCalories;
    
    // Calculate streak (simplified - count consecutive recent workouts)
    document.getElementById("streak").textContent = totalWorkouts > 0 ? Math.min(totalWorkouts, 7) : 0;
    
    // Calculate goal progress (percentage)
    const goalProgress = Math.min((totalCalories / 5000) * 100, 100);
    document.getElementById("goal-progress").textContent = Math.round(goalProgress) + "%";
}