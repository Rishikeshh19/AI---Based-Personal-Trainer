from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List

class ProgressReport(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    member_id: str
    date: datetime
    workouts_completed: int
    total_calories_burned: float
    improvements: List[str]  # List of improvements or notes on progress