from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.models.market_models import User, UserRole
import hashlib

router = APIRouter(prefix="/api/auth", tags=["auth"])

class RegisterRequest(BaseModel):
    email: str
    password: Optional[str] = None # Optional for Kakao login
    name: str
    gender: Optional[str] = None
    birth_time_iso: Optional[str] = None
    is_lunar: Optional[bool] = False
    is_leap_month: Optional[bool] = False
    login_type: str = "email" # "email" or "kakao"

class RegisterResponse(BaseModel):
    status: str
    message: str
    user_id: int

def hash_password(password: str) -> str:
    # A simple hash for now, in production use bcrypt
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/register", response_model=RegisterResponse)
async def register_user(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """
    Register a new user with email or kakao.
    """
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == request.email))
    existing_user = result.scalars().first()
    
    if existing_user:
        # If logging in with Kakao and email already exists, just return success 
        # (in a real app, we'd log them in and return a JWT here)
        if request.login_type == "kakao":
             return RegisterResponse(status="success", message="User already exists, logged in.", user_id=existing_user.id)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    new_user = User(
        username=request.email, # Use email as username for uniqueness
        email=request.email,
        name=request.name,
        gender=request.gender,
        birth_time_iso=request.birth_time_iso,
        is_lunar=request.is_lunar,
        is_leap_month=request.is_leap_month,
        role=UserRole.USER
    )
    
    if request.login_type == "email" and request.password:
        new_user.password_hash = hash_password(request.password)

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return RegisterResponse(
        status="success", 
        message="Registration successful", 
        user_id=new_user.id
    )
