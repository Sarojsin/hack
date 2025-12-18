# backend/app/models/post.py
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    media_url = Column(String, nullable=True)
    media_type = Column(String, nullable=True)  # 'image' or 'video'
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Ranking aggregates (cached for performance)
    total_rankings = Column(Integer, default=0)
    average_rank = Column(Float, default=0.0)
    
    # Relationships
    owner = relationship("User", back_populates="posts")
    rankings = relationship("Ranking", back_populates="post", cascade="all, delete-orphan")