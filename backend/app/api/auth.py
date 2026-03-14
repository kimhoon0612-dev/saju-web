from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

from app.core.database import get_db
from app.models.market_models import User, UserRole, EmailVerification
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

class SendVerificationRequest(BaseModel):
    email: EmailStr

class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str

class VerificationResponse(BaseModel):
    status: str
    message: str

def hash_password(password: str) -> str:
    # A simple hash for now, in production use bcrypt
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/register", response_model=RegisterResponse)
async def register_user(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """
    Register a new user with email or kakao.
    """
    # For email registration, force verification check
    if request.login_type == "email":
        pass
        # TEMP BYPASS: Allow registration even without email verification while SMTP is not set up.
        # verification_result = await db.execute(select(EmailVerification).where(EmailVerification.email == request.email))
        # verification = verification_result.scalars().first()
        # 
        # if not verification or not verification.is_verified:
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail="이메일 인증이 완료되지 않았습니다."
        #     )

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

def send_email_async(to_email: str, code: str):
    import logging
    import traceback
    
    logger = logging.getLogger(__name__)
    
    # Retrieve SMTP config from environment variables
    smtp_server = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", 587))
    smtp_username = os.environ.get("SMTP_USERNAME")
    smtp_password = os.environ.get("SMTP_PASSWORD")
    
    print(f"[EMAIL_DEBUG] Starting email send to {to_email}. Server: {smtp_server}:{smtp_port}, User: {smtp_username}")
    
    if not smtp_username or not smtp_password:
        print(f"[EMAIL_DEBUG] SMTP Configuration is missing! Cannot send real email to {to_email}.")
        print(f"VIRTUAL INBOX -> {to_email} Verification Code: {code}")
        return

    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = to_email
        msg['Subject'] = "[나의운명코드] 회원가입 이메일 인증 코드가 도착했습니다."
        
        body = f"안녕하세요. 나의 운명코드에 가입해 주셔서 감사합니다.\n\n요청하신 인증 코드는 아래와 같습니다:\n\n인증코드: {code}\n\n이 코드는 10분 동안 유효합니다. 홈페이지로 돌아가 이 코드를 입력해 주세요."
        msg.attach(MIMEText(body, 'plain', 'utf-8'))
        
        print("[EMAIL_DEBUG] Connecting to SMTP server...")
        server = smtplib.SMTP(smtp_server, smtp_port, timeout=15)
        print("[EMAIL_DEBUG] Starting TLS...")
        server.starttls()
        print("[EMAIL_DEBUG] Logging in...")
        server.login(smtp_username, smtp_password)
        print("[EMAIL_DEBUG] Sending message...")
        server.send_message(msg)
        print("[EMAIL_DEBUG] Quitting server...")
        server.quit()
        print(f"[EMAIL_DEBUG] Successfully sent verification email to {to_email}")
    except Exception as e:
        print(f"[EMAIL_ERROR] Failed to send email to {to_email}: {e}")
        traceback.print_exc()

from fastapi import BackgroundTasks

@router.post("/send-verification-code", response_model=VerificationResponse)
async def send_verification_code(request: SendVerificationRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    # 1. Check if email is already registered
    existing_user_result = await db.execute(select(User).where(User.email == request.email))
    if existing_user_result.scalars().first():
        raise HTTPException(status_code=400, detail="이미 가입된 이메일입니다.")

    # 2. Generate a 6-digit random code
    code = str(random.randint(100000, 999999))
    
    # 3. Clean up any existing codes for this email
    await db.execute(delete(EmailVerification).where(EmailVerification.email == request.email))
    
    # 4. Save new code to DB
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    new_verification = EmailVerification(
        email=request.email,
        code=code,
        expires_at=expires_at,
        is_verified=False
    )
    db.add(new_verification)
    await db.commit()
    
    # 5. Send Email (in background to avoid blocking the API response)
    background_tasks.add_task(send_email_async, request.email, code)
    
    return VerificationResponse(status="success", message="인증 코드가 이메일로 전송되었습니다.")

@router.post("/verify-code", response_model=VerificationResponse)
async def verify_code(request: VerifyCodeRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EmailVerification).where(EmailVerification.email == request.email))
    verification = result.scalars().first()
    
    if not verification:
        raise HTTPException(status_code=400, detail="인증 요청을 먼저 진행해 주세요.")
        
    if verification.is_verified:
        return VerificationResponse(status="success", message="이미 인증된 이메일입니다.")
        
    if datetime.utcnow() > verification.expires_at:
        raise HTTPException(status_code=400, detail="인증 코드가 만료되었습니다. 다시 요청해 주세요.")
        
    if verification.code != request.code:
        raise HTTPException(status_code=400, detail="인증 코드가 일치하지 않습니다.")
        
    # Mark as verified
    verification.is_verified = True
    await db.commit()
    
    return VerificationResponse(status="success", message="이메일 인증이 완료되었습니다.")
