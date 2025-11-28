from celery import Celery
from datetime import datetime
from backend.services.ai_service import generate_ai_suggestions
from backend.services.cache_service import calculate_calories_burned
from backend.models import Workout, ProgressReport
from backend.utils.helpers import send_email_report

celery = Celery(__name__)
celery.conf.broker_url = 'redis://localhost:6379/0'

@celery.task
def calculate_calories(workout_id):
    workout = Workout.get(workout_id)
    if workout:
        calories = calculate_calories_burned(workout)
        return calories
    return None

@celery.task
def generate_suggestions(member_id):
    suggestions = generate_ai_suggestions(member_id)
    return suggestions

@celery.task
def send_weekly_report(member_id):
    report = ProgressReport.get_weekly_report(member_id)
    send_email_report(member_id, report)