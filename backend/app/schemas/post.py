# backend/app/schemas/post.py
from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class MediaType(str, Enum):
    IMAGE = "image"
    VIDEO = "video"

class PostBase(BaseModel):
    text: str
    media_url: Optional[str] = None
    media_type: Optional[MediaType] = None

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    text: Optional[str] = None
    media_url: Optional[str] = None
    media_type: Optional[MediaType] = None

class PostResponse(PostBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    total_rankings: int = 0
    average_rank: float = 0.0
    owner_username: str
    
    class Config:
        orm_mode = True