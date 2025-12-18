# backend/app/models/ranking.py
from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Ranking(Base):
    __tablename__ = "rankings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    rank_value = Column(Integer, nullable=False)  # 1, 2, or 3
    ranked_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Ensure one ranking per user per post
    __table_args__ = (UniqueConstraint('user_id', 'post_id', name='unique_user_post_ranking'),)
    
    # Relationships
    user = relationship("User", back_populates="rankings")
    post = relationship("Post", back_populates="rankings")