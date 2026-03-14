from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from datetime import datetime
from typing import Optional

from app.core.database import get_db
from app.models.market_models import Reservation, PointTransaction, User, ExpertProfile, UserRole

router = APIRouter(prefix="/api/admin/marketplace", tags=["admin_marketplace"])

class ExpertRegisterRequest(BaseModel):
    display_name: str
    specialty: str
    short_bio: str
    price_per_session: int
    share_ratio_percent: int = 70
    image_url: Optional[str] = None

class ShareRatioUpdateRequest(BaseModel):
    share_ratio_percent: int

@router.put("/experts/{expert_id}/share-ratio")
async def update_expert_share_ratio(expert_id: int, req: ShareRatioUpdateRequest, db: AsyncSession = Depends(get_db)):
    """
    [Admin] 전문가별 상담 수익 배분율(%) 수정
    """
    stmt = select(ExpertProfile).where(ExpertProfile.user_id == expert_id)
    result = await db.execute(stmt)
    profile = result.scalars().first()
    
    if not profile:
        # Create a basic profile if it somehow doesn't exist
        profile = ExpertProfile(user_id=expert_id, display_name=f"Expert #{expert_id}", share_ratio_percent=req.share_ratio_percent)
        db.add(profile)
    else:
        profile.share_ratio_percent = req.share_ratio_percent
        
    await db.commit()
    
    return {"status": "success", "message": "정산 비율이 갱신되었습니다."}

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
        share_ratio_percent=req.share_ratio_percent,
        aura_element="wood", # Default
        rating=5,
        image_url=req.image_url
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
    stmt = select(PointTransaction, User, ExpertProfile)\
        .join(User, PointTransaction.user_id == User.id)\
        .outerjoin(ExpertProfile, User.id == ExpertProfile.user_id)\
        .where(PointTransaction.description.like("%상담 수익금%"))\
        .order_by(desc(PointTransaction.created_at))\
        .limit(100)
        
    result = await db.execute(stmt)
    records = result.all()
    
    # Manually grouping for simple return
    summary = {}
    for tx, expert_user, profile in records:
        if expert_user.id not in summary:
            # 기본값
            display_name = f"등록 미완료 (#{expert_user.id})"
            ratio = 70
            
            if profile:
                display_name = profile.display_name
                ratio = profile.share_ratio_percent if profile.share_ratio_percent else 70
                
            summary[expert_user.id] = {
                "expert_id": expert_user.id,
                "expert_name": display_name,
                "share_ratio_percent": ratio,
                "total_sessions": 0,
                "fee_deducted": 0,
                "final_settlement_amount": 0,
                "total_sales_amount": 0
            }
        
        # 현재 tx.amount는 상담사에게 지급된 수익금이라고 가정 (예: 총액의 share_ratio_percent 만큼)
        # 역산하여 총 매출(total_sales_amount)과 플랫폼 수수료(fee_deducted) 재계산 지원
        ratio = summary[expert_user.id]["share_ratio_percent"]
        expert_share = tx.amount
        
        # 역산 시뮬레이션 (tx.amount가 70%라면, 총매출은 tx.amount / 0.7)
        if ratio > 0:
            total_sales = int(expert_share / (ratio / 100))
        else:
            total_sales = expert_share
            
        fee = total_sales - expert_share
        
        summary[expert_user.id]["total_sessions"] += 1
        summary[expert_user.id]["final_settlement_amount"] += expert_share
        summary[expert_user.id]["fee_deducted"] += fee
        summary[expert_user.id]["total_sales_amount"] += total_sales
        
    return {
        "period": datetime.now().strftime("%Y-%m"),
        "settlements": list(summary.values())
    }
