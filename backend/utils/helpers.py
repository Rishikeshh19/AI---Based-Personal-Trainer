def calculate_bmi(weight, height):
    """Calculate Body Mass Index (BMI)"""
    if height <= 0:
        raise ValueError("Height must be greater than zero.")
    return weight / (height ** 2)

def format_workout_data(workout):
    """Format workout data for display"""
    return {
        "date": workout.date.strftime("%Y-%m-%d"),
        "exercises": [
            {
                "name": exercise.name,
                "sets": exercise.sets,
                "reps": exercise.reps,
                "calories": exercise.calories,
            } for exercise in workout.exercises
        ],
        "total_calories": sum(exercise.calories for exercise in workout.exercises),
    }

def generate_progress_report(member, workouts):
    """Generate a progress report for a member"""
    total_workouts = len(workouts)
    total_calories_burned = sum(workout.total_calories for workout in workouts)
    return {
        "member_name": member.name,
        "total_workouts": total_workouts,
        "total_calories_burned": total_calories_burned,
    }