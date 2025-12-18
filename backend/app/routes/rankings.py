# backend/app/routes/rankings.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.ranking import RankingCreate, RankingResponse, RankingStats
from services.ranking_service import RankingService
from dependencies.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/rankings", tags=["rankings"])

@router.post("/", response_model=RankingResponse)
def create_or_update_ranking(
    ranking: RankingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        db_ranking = RankingService.add_or_update_ranking(
            db, current_user.id, ranking.post_id, ranking.rank_value
        )
        return db_ranking
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/post/{post_id}/stats", response_model=RankingStats)
def get_post_ranking_stats(
    post_id: int,
    db: Session = Depends(get_db)
):
    stats = RankingService.get_ranking_stats(db, post_id)
    return stats

@router.get("/post/{post_id}/my-ranking")
def get_my_ranking_for_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ranking = RankingService.get_user_ranking(db, current_user.id, post_id)
    if ranking:
        return {"rank_value": ranking.rank_value}
    return {"rank_value": None}

@router.get("/user/my-rankings")
def get_my_rankings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from models.ranking import Ranking
    rankings = db.query(Ranking).filter(
        Ranking.user_id == current_user.id
    ).all()
    return rankings