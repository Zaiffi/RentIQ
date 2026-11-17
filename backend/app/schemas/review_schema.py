from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ReviewCreate(BaseModel):
    rating: int
    comment: str


class ReviewResponse(BaseModel):
    id: int
    property_id: int
    user_id: int
    user_name: str
    rating: int
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True
