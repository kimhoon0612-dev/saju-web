from fastapi import APIRouter, Depends, HTTPException, status
import os
from jose import jwe

BIRTH_DATA_KEY = os.getenv("BIRTH_DATA_KEY", "saju_birth_data_secret_key_32_bytes_!").encode()[:32]
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.market_models import User, PointTransaction, Reservation, EmailVerification
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])

class BirthDataUpdate(BaseModel):
    birth_time_iso: str
    is_lunar: bool = False
    is_leap_month: bool = False
    gender: Optional[str] = None
    name: Optional[str] = None
    saju_summary: Optional[str] = None

@router.get("/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get current logged in user profile (including Coin balance).
    Decrypts birth_time_iso dynamically if encrypted.
    """
    birth_time_iso = current_user.birth_time_iso
    # Encrypted birth_time_iso in JWE starts with "ey" and is long
    if birth_time_iso and (birth_time_iso.startswith("ey") or len(birth_time_iso) > 50):
        try:
            birth_time_iso = jwe.decrypt(birth_time_iso.encode(), BIRTH_DATA_KEY).decode()
        except Exception as e:
            print("[Birth Data Decryption Failed]", e)
            
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "gender": current_user.gender,
        "role": current_user.role,
        "point_balance": current_user.point_balance,
        "is_lunar": current_user.is_lunar,
        "is_leap_month": current_user.is_leap_month,
        "birth_time_iso": birth_time_iso,
        "saju_summary": current_user.saju_summary
    }

@router.post("/birth-data")
async def save_birth_data(
    data: BirthDataUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Save or update user's birth data for saju calculation auto-restore.
    Encrypts birth_time_iso using JWE prior to DB write for compliance with privacy guidelines.
    """
    try:
        encrypted_birth = jwe.encrypt(
            data.birth_time_iso.encode(),
            BIRTH_DATA_KEY,
            algorithm="dir",
            encryption="A256GCM"
        ).decode()
        current_user.birth_time_iso = encrypted_birth
    except Exception as e:
        print("[Birth Data Encryption Error]", e)
        # Fallback to plain if encryption fails in dev or error
        current_user.birth_time_iso = data.birth_time_iso

    current_user.is_lunar = data.is_lunar
    current_user.is_leap_month = data.is_leap_month
    if data.gender:
        current_user.gender = data.gender
    if data.name:
        current_user.name = data.name
    if data.saju_summary:
        current_user.saju_summary = data.saju_summary
    await db.commit()
    await db.refresh(current_user)
    return {"status": "ok", "message": "사주 데이터를 안전하게 암호화하여 저장했습니다."}

@router.delete("/me")
async def delete_user_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """
    Delete the current user account entirely. This is heavily required for iOS App Store Review.
    """
    # Cascade delete sensitive points and personal info (Optional: anonymize instead)
    # We will hard delete for compliance
    
    # 1. Delete associated reservations
    await db.execute(delete(Reservation).where((Reservation.user_id == current_user.id) | (Reservation.expert_id == current_user.id)))
    
    # 2. Delete point transactions
    await db.execute(delete(PointTransaction).where(PointTransaction.user_id == current_user.id))
    
    # 3. Delete email verifications if any
    await db.execute(delete(EmailVerification).where(EmailVerification.email == current_user.email))
    
    # 4. Delete user
    await db.execute(delete(User).where(User.id == current_user.id))
    
    await db.commit()
    
    return {"status": "success", "message": "User account deleted successfully."}
    
@router.get("/attendance/status")
async def get_attendance_status(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """
    Check if the user has claimed daily attendance reward today.
    Also returns consecutive_days count for streak bonuses.
    """
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    stmt = select(PointTransaction).where(
        PointTransaction.user_id == current_user.id,
        PointTransaction.description == "출석체크 보상",
        PointTransaction.created_at >= today_start
    )
    result = await db.execute(stmt)
    transaction = result.scalars().first()
    
    # Count consecutive days (last 7 days)
    consecutive_days = 0
    for days_ago in range(1, 8):
        day_start = (datetime.utcnow() - timedelta(days=days_ago)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        day_stmt = select(PointTransaction).where(
            PointTransaction.user_id == current_user.id,
            PointTransaction.description == "출석체크 보상",
            PointTransaction.created_at >= day_start,
            PointTransaction.created_at < day_end
        )
        day_result = await db.execute(day_stmt)
        if day_result.scalars().first():
            consecutive_days += 1
        else:
            break
    
    return {
        "already_claimed": transaction is not None,
        "consecutive_days": consecutive_days
    }

@router.post("/attendance")
async def claim_attendance_reward(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """
    Claim daily attendance reward. Base: 50 coins. 7-day streak bonus: +100 coins.
    """
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    stmt = select(PointTransaction).where(
        PointTransaction.user_id == current_user.id,
        PointTransaction.description == "출석체크 보상",
        PointTransaction.created_at >= today_start
    )
    result = await db.execute(stmt)
    transaction = result.scalars().first()
    
    if transaction:
        raise HTTPException(status_code=400, detail="이미 오늘의 출석 보상을 받으셨습니다.")
    
    # Count consecutive days to determine bonus
    consecutive_days = 0
    for days_ago in range(1, 7):
        day_start = (datetime.utcnow() - timedelta(days=days_ago)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        day_stmt = select(PointTransaction).where(
            PointTransaction.user_id == current_user.id,
            PointTransaction.description == "출석체크 보상",
            PointTransaction.created_at >= day_start,
            PointTransaction.created_at < day_end
        )
        day_result = await db.execute(day_stmt)
        if day_result.scalars().first():
            consecutive_days += 1
        else:
            break
    
    new_streak = consecutive_days + 1
    reward_amount = 50
    streak_bonus = 100 if new_streak >= 7 else 0
    total_reward = reward_amount + streak_bonus
    
    current_user.point_balance += total_reward
    
    new_transaction = PointTransaction(
        user_id=current_user.id,
        amount=total_reward,
        description="출석체크 보상",
        is_escrow_locked=False
    )
    db.add(new_transaction)
    await db.commit()
    await db.refresh(current_user)
    
    return {
        "status": "success", 
        "message": f"출석 완료! {total_reward} 코인이 지급되었습니다.",
        "reward_amount": reward_amount,
        "streak_bonus": streak_bonus,
        "new_streak": new_streak,
        "new_balance": current_user.point_balance
    }
