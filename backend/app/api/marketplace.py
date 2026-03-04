from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from livekit.api import AccessToken, VideoGrants
import os

from app.core.database import get_db
from app.services.matching_service import find_matching_experts
from app.services.escrow_service import lock_escrow_points, release_escrow_points
from app.models.market_models import Reservation, ReservationStatus, User

router = APIRouter(prefix="/api/marketplace", tags=["marketplace"])

class MatchRequest(BaseModel):
    saju_matrix: Dict[str, Any]
    concern: Optional[str] = None

class ReserveRequest(BaseModel):
    user_id: int
    expert_id: int
    amount: int
    ai_context_summary: str
    scheduled_time: str # ISO-8601 string

@router.post("/match")
async def match_experts(request: MatchRequest, db: AsyncSession = Depends(get_db)):
    """사주 데이터를 기반으로 부족한 기운을 채워줄 전문가 및 고민 카테고리에 맞는 전문가를 매칭 (Trigger-Based Recommendation 연동)"""
    experts = await find_matching_experts(db, request.saju_matrix, request.concern)
    # AI 챗봇이 trigger_recommendation을 결정하는 단서로 제공
    return {"experts": experts, "trigger_recommendation": True if experts else False}

@router.post("/reserve")
async def reserve_consultation(request: ReserveRequest, db: AsyncSession = Depends(get_db)):
    """
    상담 예약 생성: 예약 확정 시 포인트가 차감되며 에스크로(잠금) 상태가 됩니다.
    이때 AI가 분석한 컨텍스트(사주, 대화 내역)를 전문가 대시보드로 전달(Context Sharing)합니다.
    """
    from datetime import datetime
    try:
        dt = datetime.fromisoformat(request.scheduled_time)
    except Exception:
        raise HTTPException(400, "Invalid scheduled_time format")
        
    res = Reservation(
        user_id=request.user_id,
        expert_id=request.expert_id,
        scheduled_time=dt,
        status=ReservationStatus.CONFIRMED,
        ai_context_summary=request.ai_context_summary
    )
    db.add(res)
    await db.commit()
    await db.refresh(res)
    
    # 에스크로 차감 (포인트 잠금)
    await lock_escrow_points(db, request.user_id, request.amount, res.id)
    
    return {"status": "success", "reservation_id": res.id}

@router.post("/escrow/release/{reservation_id}")
async def finalize_escrow(reservation_id: int, db: AsyncSession = Depends(get_db)):
    """상담 종료 시 에스크로를 해제하고 수수료를 제외한 금액을 전문가에게 정산합니다."""
    res = await db.get(Reservation, reservation_id)
    if not res:
        raise HTTPException(404, "예약을 찾을 수 없습니다.")
        
    if res.status == ReservationStatus.COMPLETED:
        raise HTTPException(400, "이미 정산이 완료된 상담입니다.")
        
    res.status = ReservationStatus.COMPLETED
    db.add(res)
    
    # 정산 진행
    await release_escrow_points(db, reservation_id)
    return {"status": "success", "message": "에스크로 해제 및 정산이 완료되었습니다."}

@router.get("/rtc-token")
async def get_rtc_token(room_name: str, participant_name: str, identity: str):
    """
    WebRTC (LiveKit) 브라우저 클라이언트가 화상/음성/텍스트 상담 방에 조인하기 위한 토큰 발급
    """
    livekit_api_key = os.getenv("LIVEKIT_API_KEY", "devkey")
    livekit_api_secret = os.getenv("LIVEKIT_API_SECRET", "secret")
    
    grant = VideoGrants(room_join=True, room=room_name)
    access_token = AccessToken(livekit_api_key, livekit_api_secret)
    access_token.with_identity(identity).with_name(participant_name).with_grants(grant)
    
    return {"token": access_token.to_jwt()}
