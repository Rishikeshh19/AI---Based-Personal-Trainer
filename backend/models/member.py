from pydantic import BaseModel, ConfigDict
from typing import Optional

class Member(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra='ignore')
    
    id: Optional[int] = None
    name: str
    email: str  # Changed from EmailStr to str for simplicity
    password: str
    role: str = "member"  # e.g., 'member' or 'trainer'