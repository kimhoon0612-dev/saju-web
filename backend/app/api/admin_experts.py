from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.market_models import VirtualExpert, ExpertReview, ExpertSettlement
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class ExpertCreateUpdate(BaseModel):
    category: str
    display_name: str
    code: str
    tags: Optional[str] = None
    rating: float = 5.0
    reviews_count: int = 0
    avg_minutes: int = 10
    total_consults: int = 0
    image_url: Optional[str] = None
    is_online: bool = True
    banner_text: Optional[str] = None
    is_free_available: bool = False
    introduction_text: Optional[str] = None

class SettlementSchema(BaseModel):
    id: int
    expert_name: str
    amount: int
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

@router.get("/")
async def get_all_admin_experts(db: AsyncSession = Depends(get_db)):
    """Admin route to fetch all experts"""
    result = await db.execute(select(VirtualExpert))
    experts = result.scalars().all()
    return experts

@router.post("/")
async def create_expert(data: ExpertCreateUpdate, db: AsyncSession = Depends(get_db)):
    """Admin route to create an expert"""
    new_expert = VirtualExpert(**data.model_dump())
    db.add(new_expert)
    await db.commit()
    await db.refresh(new_expert)
    return new_expert

@router.put("/{expert_id}")
async def update_expert(expert_id: int, data: ExpertCreateUpdate, db: AsyncSession = Depends(get_db)):
    """Admin route to update an expert"""
    result = await db.execute(select(VirtualExpert).where(VirtualExpert.id == expert_id))
    expert = result.scalars().first()
    if not expert:
        raise HTTPException(status_code=404, detail="Expert not found")
    
    for key, value in data.model_dump().items():
        setattr(expert, key, value)
    
    await db.commit()
    await db.refresh(expert)
    return expert

@router.delete("/{expert_id}")
async def delete_expert(expert_id: int, db: AsyncSession = Depends(get_db)):
    """Admin route to delete an expert"""
    result = await db.execute(select(VirtualExpert).where(VirtualExpert.id == expert_id))
    expert = result.scalars().first()
    if not expert:
        raise HTTPException(status_code=404, detail="Expert not found")
    
    await db.delete(expert)
    await db.commit()
    return {"message": "Deleted successfully"}

# --- Reviews Management ---
@router.get("/{expert_id}/reviews")
async def get_all_expert_reviews(expert_id: int, db: AsyncSession = Depends(get_db)):
    """Admin route to fetch ALL reviews for an expert"""
    result = await db.execute(select(ExpertReview).where(ExpertReview.expert_id == expert_id))
    reviews = result.scalars().all()
    return reviews

@router.delete("/reviews/{review_id}")
async def toggle_review_hidden(review_id: int, db: AsyncSession = Depends(get_db)):
    """Toggle visibility (is_hidden)"""
    result = await db.execute(select(ExpertReview).where(ExpertReview.id == review_id))
    review = result.scalars().first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review.is_hidden = not review.is_hidden
    await db.commit()
    return {"message": f"Review visibility set to: not hidden ({review.is_hidden})"}


# --- Settlement Management ---
@router.get("/settlements/all", response_model=List[SettlementSchema])
async def get_all_settlements(db: AsyncSession = Depends(get_db)):
    """Fetch ALL settlements across all experts"""
    query = select(ExpertSettlement, VirtualExpert.display_name).join(
        VirtualExpert, ExpertSettlement.expert_id == VirtualExpert.id
    )
    result = await db.execute(query)
    
    response_data = []
    for settlement, display_name in result.all():
        response_data.append({
            "id": settlement.id,
            "expert_name": display_name,
            "amount": settlement.amount,
            "status": settlement.status,
            "created_at": settlement.created_at,
            "completed_at": settlement.completed_at
        })
    return response_data

@router.put("/settlements/{settlement_id}/complete")
async def complete_settlement(settlement_id: int, db: AsyncSession = Depends(get_db)):
    """Mark a settlement as completed"""
    result = await db.execute(select(ExpertSettlement).where(ExpertSettlement.id == settlement_id))
    settlement = result.scalars().first()
    if not settlement:
        raise HTTPException(status_code=404, detail="Settlement not found")
    
    settlement.status = "COMPLETED"
    settlement.completed_at = datetime.utcnow()
    await db.commit()
    return {"message": "Settlement completed"}
