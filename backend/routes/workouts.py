from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models.workout import Workout
from services.auth_service import get_current_member
import logging

router = APIRouter()

# In-memory storage for workouts
workouts_db = {}  # Format: {email: [workout1, workout2, ...]}

logger = logging.getLogger(__name__)

@router.post("/workout")
async def add_workout(workout: dict, current_member = Depends(get_current_member)):
    """Add a new workout"""
    try:
        # Extract email from current_member
        email = current_member.get('email') if isinstance(current_member, dict) else current_member.email
        
        # Create workout object
        new_workout = {
            'date': workout.get('date'),
            'exercises': workout.get('exercises'),
            'sets': workout.get('sets'),
            'reps': workout.get('reps'),
            'calories': workout.get('calories'),
            'member_id': email
        }
        
        # Store in memory
        if email not in workouts_db:
            workouts_db[email] = []
        workouts_db[email].append(new_workout)
        
        logger.info(f"Workout added for {email}: {new_workout}")
        logger.info(f"All workouts: {workouts_db}")
        
        return {"success": True, "message": "Workout logged successfully", "workout": new_workout}
    except Exception as e:
        logger.error(f"Error adding workout: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/member/all")
async def get_all_member_workouts(current_member = Depends(get_current_member)):
    """Get all workouts for the current member"""
    try:
        # Extract email from current_member
        email = current_member.get('email') if isinstance(current_member, dict) else current_member.email
        
        logger.info(f"Fetching workouts for {email}")
        logger.info(f"Available workouts: {workouts_db}")
        
        # Return workouts for this member
        member_workouts = workouts_db.get(email, [])
        logger.info(f"Returning {len(member_workouts)} workouts")
        return member_workouts
    except Exception as e:
        logger.error(f"Error fetching workouts: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/member/{member_id}")
async def get_member_workouts(member_id: str, current_member = Depends(get_current_member)):
    """Get workouts for a specific member"""
    try:
        email = current_member.get('email') if isinstance(current_member, dict) else current_member.email
        
        if email != member_id:
            raise HTTPException(status_code=403, detail="Not authorized to access these workouts")
        
        member_workouts = workouts_db.get(member_id, [])
        return member_workouts
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching member workouts: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))