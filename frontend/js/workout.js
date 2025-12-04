// frontend/js/workout.js

document.addEventListener('DOMContentLoaded', function () {
    const workoutForm = document.getElementById('workout-form');
    const workoutLog = document.getElementById('workout-log');
    let selectedExercises = [];

    // Initialize exercise selection
    function initExerciseSelection() {
        const exerciseCheckboxes = document.querySelectorAll('.exercise-checkbox');
        exerciseCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                const exerciseId = this.value;
                if (this.checked) {
                    if (!selectedExercises.includes(exerciseId)) {
                        selectedExercises.push(exerciseId);
                    }
                } else {
                    selectedExercises = selectedExercises.filter(id => id !== exerciseId);
                }
                updateSelectedExercises();
            });
        });
    }

    // Update the hidden input with selected exercises
    function updateSelectedExercises() {
        const selectedExercisesInput = document.getElementById('selected-exercises');
        selectedExercisesInput.value = JSON.stringify(selectedExercises);

        // Update the display of selected exercises
        const selectedExercisesContainer = document.getElementById('selected-exercises-display');
        if (selectedExercises.length > 0) {
            selectedExercisesContainer.innerHTML = selectedExercises.map(id => {
                const exerciseName = document.querySelector(`.exercise-checkbox[value="${id}"]`).dataset.name;
                return `<span class="selected-exercise">${exerciseName}</span>`;
            }).join('');
        } else {
            selectedExercisesContainer.innerHTML = '<p>No exercises selected</p>';
        }
    }

    // Handle form submission
    workoutForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        if (selectedExercises.length === 0) {
            alert('Please select at least one exercise');
            return;
        }

        const formData = new FormData(workoutForm);
        const workoutData = {
            date: formData.get('date') || new Date().toISOString().split('T')[0],
            exercises: selectedExercises,
            sets: parseInt(formData.get('sets')),
            reps: parseInt(formData.get('reps')),
            duration: parseInt(formData.get('duration')),
            notes: formData.get('notes') || ''
        };

        await addWorkout(workoutData);
    });

    function addWorkout(workoutData) {
        fetch('http://localhost:8000/api/workouts/workout', {
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
        fetch('http://localhost:8000/api/workouts/member/all', {
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
