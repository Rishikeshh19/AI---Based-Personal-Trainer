from fastapi import APIRouter, Depends
from typing import List
from models.member import Member
from services.ai_service import generate_ai_suggestions

router = APIRouter()

@router.get("/suggestions/{member_id}", response_model=dict)
async def get_suggestions(member_id: str):
    """
    Generate AI-based workout and nutrition suggestions for a member.
    """
    # For now, pass empty progress data. In production, fetch from database
    suggestions = generate_ai_suggestions(member_id, [])
    return suggestions