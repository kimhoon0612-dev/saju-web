from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.market_models import VirtualExpert, ExpertReview
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class ExpertReviewSchema(BaseModel):
    id: int
    expert_id: int
    author_name: str
    rating: int
    content: str
    is_hidden: bool
    
    class Config:
        from_attributes = True

class VirtualExpertSchema(BaseModel):
    id: int
    category: str
    display_name: str
    code: str
    tags: Optional[str] = None
    rating: float
    reviews_count: int
    avg_minutes: int
    total_consults: int
    image_url: Optional[str] = None
    is_online: bool
    banner_text: Optional[str] = None
    is_free_available: bool
    introduction_text: Optional[str] = None

    class Config:
        from_attributes = True

@router.get("/", response_model=List[VirtualExpertSchema])
async def get_all_experts(db: AsyncSession = Depends(get_db)):
    """Fetch all active virtual experts for the user app"""
    result = await db.execute(select(VirtualExpert))
    experts = result.scalars().all()
    return experts

@router.get("/{expert_id}/reviews", response_model=List[ExpertReviewSchema])
async def get_expert_reviews(expert_id: int, db: AsyncSession = Depends(get_db)):
    """Fetch all non-hidden reviews for a specific expert"""
    result = await db.execute(
        select(ExpertReview)
        .where(ExpertReview.expert_id == expert_id, ExpertReview.is_hidden == False)
        .order_by(ExpertReview.created_at.desc())
    )
    reviews = result.scalars().all()
    return reviews
