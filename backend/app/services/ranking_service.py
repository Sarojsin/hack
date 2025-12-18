# backend/app/services/ranking_service.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.ranking import Ranking
from models.post import Post
import math

class RankingService:
    @staticmethod
    def add_or_update_ranking(db: Session, user_id: int, post_id: int, rank_value: int):
        # Check if user owns the post
        post = db.query(Post).filter(Post.id == post_id).first()
        if post.user_id == user_id:
            raise ValueError("Cannot rank your own post")
        
        # Check if ranking exists
        existing_ranking = db.query(Ranking).filter(
            Ranking.user_id == user_id,
            Ranking.post_id == post_id
        ).first()
        
        if existing_ranking:
            # Update existing ranking
            existing_ranking.rank_value = rank_value
        else:
            # Create new ranking
            new_ranking = Ranking(
                user_id=user_id,
                post_id=post_id,
                rank_value=rank_value
            )
            db.add(new_ranking)
        
        db.commit()
        
        # Update post aggregates
        RankingService._update_post_rankings(db, post_id)
        
        return existing_ranking or new_ranking
    
    @staticmethod
    def _update_post_rankings(db: Session, post_id: int):
        # Calculate aggregates
        result = db.query(
            func.count(Ranking.id).label('total'),
            func.avg(Ranking.rank_value).label('average')
        ).filter(Ranking.post_id == post_id).first()
        
        post = db.query(Post).filter(Post.id == post_id).first()
        if post and result.total:
            post.total_rankings = result.total
            post.average_rank = round(float(result.average), 2)
            db.commit()
    
    @staticmethod
    def get_ranking_stats(db: Session, post_id: int):
        # Get count for each rank value
        stats = db.query(
            Ranking.rank_value,
            func.count(Ranking.id).label('count')
        ).filter(
            Ranking.post_id == post_id
        ).group_by(Ranking.rank_value).all()
        
        # Initialize counts
        counts = {1: 0, 2: 0, 3: 0}
        for rank_value, count in stats:
            counts[rank_value] = count
        
        total = sum(counts.values())
        average = sum(k * v for k, v in counts.items()) / total if total > 0 else 0
        
        return {
            "total_rankings": total,
            "average_rank": round(average, 2),
            "rank_1_count": counts[1],
            "rank_2_count": counts[2],
            "rank_3_count": counts[3]
        }
    
    @staticmethod
    def get_user_ranking(db: Session, user_id: int, post_id: int):
        return db.query(Ranking).filter(
            Ranking.user_id == user_id,
            Ranking.post_id == post_id
        ).first()