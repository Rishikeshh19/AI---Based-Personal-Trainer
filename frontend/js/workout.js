// frontend/js/workout.js

document.addEventListener('DOMContentLoaded', function() {
    const workoutForm = document.getElementById('workout-form');
    const workoutLog = document.getElementById('workout-log');

    workoutForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(workoutForm);
        const workoutData = {
            date: formData.get('date'),
            exercises: formData.get('exercises'),
            sets: parseInt(formData.get('sets')),
            reps: parseInt(formData.get('reps')),
            calories: parseInt(formData.get('calories'))
        };

        addWorkout(workoutData);
    });

    function addWorkout(workoutData) {
        fetch('http://localhost:5000/api/workouts/workout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(workoutData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Response:', data);
            alert('Workout logged successfully!');
            workoutForm.reset();
            fetchWorkouts();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error adding workout. Please try again.');
        });
    }

    function displayWorkout(workout) {
        const workoutItem = document.createElement('div');
        workoutItem.className = 'workout-item';
        workoutItem.innerHTML = `
            <h4>${workout.date}</h4>
            <p><strong>Exercises:</strong> ${workout.exercises || 'N/A'}</p>
            <p><strong>Sets:</strong> ${workout.sets || 'N/A'}</p>
            <p><strong>Reps:</strong> ${workout.reps || 'N/A'}</p>
            <p><strong>Calories Burned:</strong> ${workout.calories || 0}</p>
        `;
        workoutLog.appendChild(workoutItem);
    }

    function fetchWorkouts() {
        // Fetch workouts from backend
        fetch('http://localhost:5000/api/workouts/member/all', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Fetched workouts:', data);
            // Clear existing items
            const existingItems = workoutLog.querySelectorAll('.workout-item');
            existingItems.forEach(item => item.remove());
            
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(workout => displayWorkout(workout));
            }
        })
        .catch(error => console.error('Error:', error));
    }

    fetchWorkouts();
});
