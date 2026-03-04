from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.models.market_models import PointTransaction, Reservation, User, ReservationStatus

async def charge_user_points(db: AsyncSession, user_id: int, amount: int) -> User:
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.point_balance += amount
    tx = PointTransaction(
        user_id=user_id,
        amount=amount,
        description="포인트 충전",
        is_escrow_locked=False
    )
    db.add(tx)
    await db.commit()
    await db.refresh(user)
    return user

async def lock_escrow_points(db: AsyncSession, user_id: int, amount: int, reservation_id: int) -> PointTransaction:
    """예약 확정 시 사용자 포인트를 에스크로 상태로 차감(잠금)합니다."""
    user = await db.get(User, user_id)
    if not user or user.point_balance < amount:
        raise HTTPException(status_code=400, detail="잔액이 부족합니다. 포인트를 충전해주세요.")
        
    user.point_balance -= amount
    
    tx = PointTransaction(
        user_id=user_id,
        amount=-amount,
        description="전문가 실시간 상담 예약 (에스크로 보류)",
        is_escrow_locked=True,
        reservation_id=reservation_id
    )
    db.add(tx)
    await db.commit()
    return tx

async def release_escrow_points(db: AsyncSession, reservation_id: int) -> None:
    """상담 완료 시(COMPLETED) 에스크로를 해제하고 전문가에게 수익을 즉시 정산합니다."""
    # Find the locked transaction
    from sqlalchemy.future import select
    stmt = select(PointTransaction).filter_by(reservation_id=reservation_id, is_escrow_locked=True)
    result = await db.execute(stmt)
    tx = result.scalar_one_or_none()
    
    if not tx:
        raise HTTPException(status_code=404, detail="에스크로 내역을 찾을 수 없습니다.")
        
    res = await db.get(Reservation, reservation_id)
    if res.status != ReservationStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="상담이 '완료' 상태가 아닙니다.")

    # 에스크로 해제
    tx.is_escrow_locked = False
    
    # 전문가에게 포인트 지급 (수수료 10% 제외 가정)
    EXPERT_FEE_RATE = 0.9
    settlement_amount = int(abs(tx.amount) * EXPERT_FEE_RATE)
    
    expert = await db.get(User, res.expert_id)
    expert.point_balance += settlement_amount
    
    settlement_tx = PointTransaction(
        user_id=res.expert_id,
        amount=settlement_amount,
        description=f"상담 수익금 정산 (예약 ID: {reservation_id})",
        is_escrow_locked=False,
        reservation_id=reservation_id
    )
    db.add(settlement_tx)
    await db.commit()
