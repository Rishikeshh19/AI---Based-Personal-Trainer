from fastapi import APIRouter

router = APIRouter()

from . import auth, workouts, members, ai_suggestions

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(workouts.router, prefix="/workouts", tags=["workouts"])
router.include_router(members.router, prefix="/members", tags=["members"])
router.include_router(ai_suggestions.router, prefix="/ai", tags=["ai"])