from typing import List, Dict
import numpy as np

def generate_ai_suggestions(member_id: str, progress_data: List[Dict]) -> Dict:
    """
    Generate AI-based workout and nutrition suggestions based on member progress.

    Args:
        member_id (str): The ID of the member for whom suggestions are generated.
        progress_data (List[Dict]): A list of dictionaries containing progress data.

    Returns:
        Dict: A dictionary containing workout and nutrition suggestions.
    """
    # Example logic for generating suggestions based on progress data
    if not progress_data:
        return {"error": "No progress data available."}

    # Calculate average performance metrics
    total_calories = sum(item['calories'] for item in progress_data)
    total_workouts = len(progress_data)
    average_calories = total_calories / total_workouts

    # Generate workout suggestion based on average calories burned
    if average_calories < 300:
        workout_suggestion = "Increase your workout intensity. Consider adding more weight or increasing reps."
    else:
        workout_suggestion = "Maintain your current workout intensity. You're doing great!"

    # Nutrition suggestion based on average calories
    if average_calories < 300:
        nutrition_suggestion = "Consider increasing your protein intake to support muscle growth."
    else:
        nutrition_suggestion = "Keep up with your balanced diet to sustain your current performance."

    return {
        "member_id": member_id,
        "workout_suggestion": workout_suggestion,
        "nutrition_suggestion": nutrition_suggestion
    }