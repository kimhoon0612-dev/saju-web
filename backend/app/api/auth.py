import os
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.security import create_access_token
from app.models.market_models import User, UserRole

router = APIRouter(prefix="/api/auth", tags=["auth"])


class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    name: str


class SocialLoginRequest(BaseModel):
    code: str           # 카카오/Apple OAuth 인가 코드
    redirect_uri: str   # 리다이렉트 URI (카카오 앱 설정과 일치해야 함)


# ─────────────────────────────────────────
# 카카오 소셜 로그인 (메인 로그인 방식)
# ─────────────────────────────────────────
@router.post("/kakao", response_model=Token)
async def login_kakao(request: SocialLoginRequest, db: AsyncSession = Depends(get_db)):
    """
    카카오 소셜 로그인.
    인가 코드(code)를 카카오 토큰으로 교환 후 사용자 프로필을 조회하여
    DB에 신규 가입 또는 기존 유저로 JWT를 발급합니다.
    """
    client_id = os.environ.get("KAKAO_REST_API_KEY")
    if not client_id:
        raise HTTPException(status_code=500, detail="KAKAO_REST_API_KEY가 서버에 설정되지 않았습니다.")

    # 1. 인가코드 → 카카오 액세스 토큰 교환
    token_url = "https://kauth.kakao.com/oauth/token"
    token_data = {
        "grant_type": "authorization_code",
        "client_id": client_id,
        "redirect_uri": request.redirect_uri,
        "code": request.code
    }

    async with httpx.AsyncClient() as client:
        token_response = await client.post(token_url, data=token_data)

    if token_response.status_code != 200:
        print("[Kakao Auth Error]", token_response.text)
        raise HTTPException(status_code=400, detail=f"카카오 토큰 발급 실패: {token_response.text}")

    kakao_access_token = token_response.json().get("access_token")

    # 2. 카카오 유저 프로필 조회
    user_url = "https://kapi.kakao.com/v2/user/me"
    headers = {"Authorization": f"Bearer {kakao_access_token}"}

    async with httpx.AsyncClient() as client:
        user_response = await client.get(user_url, headers=headers)

    if user_response.status_code != 200:
        raise HTTPException(status_code=400, detail="카카오 사용자 프로필 조회 실패")

    kakao_user_data = user_response.json()
    kakao_id = str(kakao_user_data.get("id"))
    kakao_account = kakao_user_data.get("kakao_account", {})
    kakao_profile = kakao_account.get("profile", {})

    user_email = kakao_account.get("email", f"kakao_{kakao_id}@kakaomapping.com")
    user_name = kakao_profile.get("nickname", f"카카오유저{kakao_id[-4:]}")

    # 3. DB 조회 및 자동 가입
    result = await db.execute(select(User).where(User.email == user_email))
    user = result.scalars().first()

    if not user:
        user = User(
            username=user_email,
            email=user_email,
            name=user_name,
            role=UserRole.USER
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    # 4. JWT 발급 (7일 유효)
    access_token = create_access_token(
        subject=str(user.id), expires_delta=timedelta(days=7)
    )
    return {"access_token": access_token, "token_type": "bearer", "user_id": user.id, "name": user.name}


# ─────────────────────────────────────────
# Apple 소셜 로그인 (iOS App Store 필수)
# ─────────────────────────────────────────
@router.post("/apple", response_model=Token)
async def login_apple(request: SocialLoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Apple 소셜 로그인.
    실제 배포 환경에서는 Apple 인증서(JWKS)로 서명 검증을 진행합니다.
    로컬 테스트 시에는 token이 'mock_'로 시작하거나 APPLE_LOGIN_TEST_MODE가 활성화된 경우 검증을 우회합니다.
    """
    apple_user_id = None
    user_email = None
    user_name = "Apple 유저"

    # 로컬 테스트 우회 모드 확인
    test_mode = os.environ.get("APPLE_LOGIN_TEST_MODE", "false").lower() in ("true", "1")
    is_mock = request.code.startswith("mock_") if request.code else False

    if test_mode or is_mock:
        # 테스트 모드: code를 apple_user_id로 바로 매핑
        apple_user_id = request.code or "unknown"
        user_email = f"apple_{apple_user_id[:12]}@appleid.apple.com"
    else:
        # 상용 환경: Apple JWT 서명 검증
        if not request.code:
            raise HTTPException(status_code=400, detail="Apple Identity Token (JWT)이 누락되었습니다.")
        
        try:
            # 1. Apple JWKS(공개키 목록) 가져오기
            jwks_url = "https://appleid.apple.com/auth/keys"
            async with httpx.AsyncClient() as client:
                resp = await client.get(jwks_url)
                resp.raise_for_status()
                jwks = resp.json()
            
            # 2. JWT 서명 및 클레임 검증
            apple_client_id = os.environ.get("APPLE_CLIENT_ID")
            options = {"verify_aud": bool(apple_client_id)}
            
            from jose import jwt
            
            payload = jwt.decode(
                request.code, # 클라이언트는 identityToken을 'code' 필드에 담아 전달
                jwks,
                algorithms=["RS256"],
                audience=apple_client_id if apple_client_id else None,
                issuer="https://appleid.apple.com",
                options=options
            )
            
            apple_user_id = payload.get("sub")
            user_email = payload.get("email")
            
            if not apple_user_id:
                raise HTTPException(status_code=400, detail="Apple Token에서 유저 ID(sub)를 추출할 수 없습니다.")
                
            if not user_email:
                user_email = f"apple_{apple_user_id[:12]}@appleid.apple.com"
                
        except Exception as e:
            print("[Apple Token Verification Error]", e)
            raise HTTPException(status_code=401, detail=f"Apple 로그인 검증 실패: {str(e)}")

    # 3. DB 조회 및 자동 가입
    result = await db.execute(select(User).where(User.email == user_email))
    user = result.scalars().first()

    if not user:
        user = User(
            username=user_email,
            email=user_email,
            name=user_name,
            role=UserRole.USER
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    access_token = create_access_token(subject=str(user.id), expires_delta=timedelta(days=7))
    return {"access_token": access_token, "token_type": "bearer", "user_id": user.id, "name": user.name}
