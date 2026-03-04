from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from datetime import datetime

from app.core.database import get_db
from app.models.market_models import Reservation, PointTransaction, User, ExpertProfile, UserRole

router = APIRouter(prefix="/api/admin/marketplace", tags=["admin_marketplace"])

class ExpertRegisterRequest(BaseModel):
    display_name: str
    specialty: str
    short_bio: str
    price_per_session: int

@router.post("/register-expert")
async def register_expert(req: ExpertRegisterRequest, db: AsyncSession = Depends(get_db)):
    """
    [Admin] 신규 전문가 계정 및 프로필 통합 생성
    """
    import uuid
    fake_username = f"expert_{uuid.uuid4().hex[:8]}"
    new_user = User(
        username=fake_username,
        role=UserRole.EXPERT,
        point_balance=0
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    new_profile = ExpertProfile(
        user_id=new_user.id,
        display_name=req.display_name,
        specialty=req.specialty,
        short_bio=req.short_bio,
        price_per_session=req.price_per_session,
        aura_element="wood", # Default
        rating=5
    )
    db.add(new_profile)
    await db.commit()
    
    return {
        "status": "success",
        "message": f"'{req.display_name}' 전문가가 성공적으로 등재되었습니다.",
        "expert_id": new_user.id
    }

@router.get("/matching-logs")
async def get_matching_logs(db: AsyncSession = Depends(get_db)):
    """
    [Admin] AI 매칭 시스템 Trigger 로그 및 상담 예약 내역
    """
    stmt = select(Reservation).order_by(desc(Reservation.created_at)).limit(50)
    result = await db.execute(stmt)
    reservations = result.scalars().all()
    
    logs = []
    for r in reservations:
        logs.append({
            "reservation_id": r.id,
            "user_id": r.user_id,
            "expert_id": r.expert_id,
            "trigger_context": r.ai_context_summary[:30] + "..." if r.ai_context_summary else "N/A",
            "status": r.status.value,
            "created_at": r.created_at.isoformat()
        })
        
    return {
        "total_ai_triggers": len(logs) + 1200, # Mock total for analytics
        "successful_matches": len(logs) + 350,
        "conversion_rate": 29.1,
        "recent_logs": logs
    }

@router.get("/settlements")
async def get_monthly_settlements(db: AsyncSession = Depends(get_db)):
    """
    [Admin] 전문가별 월간 정산 집계 리포트 (에스크로 트랜잭션 기반)
    """
    # MVP: Find recent expert settlement transactions
    stmt = select(PointTransaction, User)\
        .join(User, PointTransaction.user_id == User.id)\
        .where(PointTransaction.description.like("%상담 수익금%"))\
        .order_by(desc(PointTransaction.created_at))\
        .limit(100)
        
    result = await db.execute(stmt)
    records = result.all()
    
    # Manually grouping for simple return
    summary = {}
    for tx, expert in records:
        if expert.id not in summary:
            summary[expert.id] = {
                "expert_id": expert.id,
                "expert_name": f"Expert #{expert.id}", # Placeholder if no specific display_name column
                "total_sessions": 0,
                "fee_deducted": 0,
                "final_settlement_amount": 0
            }
        summary[expert.id]["total_sessions"] += 1
        summary[expert.id]["final_settlement_amount"] += tx.amount
        # reverse calculated the 10% fee
        fee = int((tx.amount / 0.9) * 0.1)
        summary[expert.id]["fee_deducted"] += fee
        
    return {
        "period": datetime.now().strftime("%Y-%m"),
        "settlements": list(summary.values())
    }
