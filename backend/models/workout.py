from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class Exercise(BaseModel):
    name: str
    sets: int
    reps: int
    calories: Optional[int] = None

class Workout(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    date: datetime
    exercises: List[Exercise]
    total_calories: Optional[int] = None
    member_id: Optional[str] = None