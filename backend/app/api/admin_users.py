from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, func
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.market_models import User, PointTransaction, Reservation, EmailVerification
from app.api.admin_auth import verify_admin

router = APIRouter(
    prefix="/api/admin/users",
    tags=["admin_users"],
    dependencies=[Depends(verify_admin)]
)


class UserResponse(BaseModel):
    id: int
    email: Optional[str]
    name: Optional[str]
    gender: Optional[str]
    birth_time_iso: Optional[str]
    is_lunar: Optional[bool]
    is_leap_month: Optional[bool]
    role: str
    created_at: datetime
    point_balance: int


class CoinGrantRequest(BaseModel):
    amount: int
    reason: str = "관리자 수동 지급"


# ─────────────────────────────────────────
# 전체 유저 목록 조회
# ─────────────────────────────────────────
@router.get("/", response_model=List[UserResponse])
async def get_all_users(db: AsyncSession = Depends(get_db)):
    """[Admin] 전체 등록 유저 목록 (최신순)"""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()

    return [
        UserResponse(
            id=u.id,
            email=u.email,
            name=u.name,
            gender=u.gender,
            birth_time_iso=u.birth_time_iso,
            is_lunar=u.is_lunar,
            is_leap_month=u.is_leap_month,
            role=u.role.value,
            created_at=u.created_at,
            point_balance=u.point_balance
        )
        for u in users
    ]


# ─────────────────────────────────────────
# 가입 통계
# ─────────────────────────────────────────
@router.get("/stats")
async def get_user_stats(db: AsyncSession = Depends(get_db)):
    """[Admin] 유저 가입 통계"""
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_q = await db.execute(select(func.count(User.id)))
    total = total_q.scalar_one_or_none() or 0

    today_q = await db.execute(select(func.count(User.id)).where(User.created_at >= today_start))
    today = today_q.scalar_one_or_none() or 0

    week_q = await db.execute(select(func.count(User.id)).where(User.created_at >= week_start))
    week = week_q.scalar_one_or_none() or 0

    month_q = await db.execute(select(func.count(User.id)).where(User.created_at >= month_start))
    month = month_q.scalar_one_or_none() or 0

    return {
        "total_users": total,
        "new_today": today,
        "new_this_week": week,
        "new_this_month": month,
    }


# ─────────────────────────────────────────
# 코인 수동 지급
# ─────────────────────────────────────────
@router.post("/{user_id}/coins")
async def grant_coins_to_user(
    user_id: int,
    body: CoinGrantRequest,
    db: AsyncSession = Depends(get_db)
):
    """[Admin] 특정 유저에게 코인 수동 지급 (음수면 차감)"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="유저를 찾을 수 없습니다.")

    user.point_balance += body.amount

    tx = PointTransaction(
        user_id=user.id,
        amount=body.amount,
        description=f"[관리자] {body.reason}",
        is_escrow_locked=False,
    )
    db.add(tx)
    await db.commit()
    await db.refresh(user)

    return {
        "status": "success",
        "user_id": user.id,
        "granted_amount": body.amount,
        "new_balance": user.point_balance,
    }


# ─────────────────────────────────────────
# 강제 탈퇴
# ─────────────────────────────────────────
@router.delete("/{user_id}")
async def force_delete_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """[Admin] 특정 유저 강제 탈퇴 (모든 관련 데이터 삭제)"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="유저를 찾을 수 없습니다.")

    # 1. 예약 삭제
    await db.execute(
        delete(Reservation).where(
            (Reservation.user_id == user_id) | (Reservation.expert_id == user_id)
        )
    )
    # 2. 포인트 트랜잭션 삭제
    await db.execute(delete(PointTransaction).where(PointTransaction.user_id == user_id))
    # 3. 이메일 인증 삭제
    if user.email:
        await db.execute(delete(EmailVerification).where(EmailVerification.email == user.email))
    # 4. 유저 삭제
    await db.execute(delete(User).where(User.id == user_id))
    await db.commit()

    return {"status": "success", "message": f"유저 {user_id} ({user.email}) 강제 탈퇴 완료"}
