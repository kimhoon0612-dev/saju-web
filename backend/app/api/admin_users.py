from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.models.market_models import User

router = APIRouter(prefix="/api/admin/users", tags=["admin_users"])

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

@router.get("/", response_model=List[UserResponse])
async def get_all_users(db: AsyncSession = Depends(get_db)):
    """
    [Admin] Fetch all registered users
    """
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    
    response_list = []
    for user in users:
        response_list.append(UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            gender=user.gender,
            birth_time_iso=user.birth_time_iso,
            is_lunar=user.is_lunar,
            is_leap_month=user.is_leap_month,
            role=user.role.value,
            created_at=user.created_at,
            point_balance=user.point_balance
        ))
        
    return response_list
