# backend/app/schemas/ranking.py
from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional

class RankingBase(BaseModel):
    post_id: int
    rank_value: int
    
    @validator('rank_value')
    def validate_rank(cls, v):
        if v not in [1, 2, 3]:
            raise ValueError('Rank must be 1, 2, or 3')
        return v

class RankingCreate(RankingBase):
    pass

class RankingResponse(RankingBase):
    id: int
    user_id: int
    ranked_at: datetime
    
    class Config:
        orm_mode = True

class RankingStats(BaseModel):
    total_rankings: int
    average_rank: float
    rank_1_count: int
    rank_2_count: int
    rank_3_count: int