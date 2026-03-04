from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from typing import Dict, Any, List
import random
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.market_models import User, PointTransaction, Reservation

router = APIRouter(prefix="/api/admin", tags=["admin"])

# TODO: In a production environment, implement actual JWT-based admin role verification dependency
# async def get_current_admin(user: User = Depends(get_current_user)):
#     if user.role != Role.ADMIN:
#         raise HTTPException(status_code=403, detail="Not enough permissions")
#     return user

@router.get("/analytics/traffic")
async def get_traffic_analytics(db: AsyncSession = Depends(get_db)):
    """
    [Admin] 실시간 동시 접속자 수, DAU, MAU 및 트래픽 소스 분석
    """
    # Note: For MVP, returning simulated/mock analytics data.
    # In production, this would query Redis (for real-time concurrent users), 
    # and access logs or a time-series DB like ClickHouse for DAU/MAU.
    
    return {
        "current_concurrent_users": random.randint(120, 300),
        "dau": random.randint(4000, 5000),
        "mau": random.randint(110000, 130000),
        "traffic_sources": [
            {"source": "organic_search", "percentage": 45},
            {"source": "social_media", "percentage": 30},
            {"source": "direct", "percentage": 25}
        ],
        "top_content": [
            {"name": "일일 운세 (Daily Guide)", "avg_retention_seconds": 185},
            {"name": "전문가 매칭 (Expert Lounge)", "avg_retention_seconds": 340},
            {"name": "디지털 부적 상점", "avg_retention_seconds": 110}
        ]
    }

@router.get("/analytics/revenue")
async def get_revenue_analytics(
    start_date: str = Query(None, description="YYYY-MM-DD"),
    end_date: str = Query(None, description="YYYY-MM-DD"),
    db: AsyncSession = Depends(get_db)
):
    """
    [Admin] 구독, 부적, 상담 수수료 등 실시간 매출 집계
    """
    # Example logic querying actual Escrow PointTransactions for expert consultation
    # and simulating other revenue streams for the MVP.
    
    # Query real completed escrow transactions (expert fees)
    stmt = select(func.sum(PointTransaction.amount)).where(
        PointTransaction.description.like("%상담 수익금%")
    )
    result = await db.execute(stmt)
    real_expert_fees = result.scalar_one_or_none() or 0
    
    # Total revenue combining real + simulated data
    base_subscriptions = 5000000
    base_talismans = 3500000
    total_expert_revenue = 6500000 + real_expert_fees
    
    return {
        "total_revenue": base_subscriptions + base_talismans + total_expert_revenue,
        "breakdown": {
            "subscriptions": base_subscriptions,
            "digital_talismans": base_talismans,
            "expert_fees": total_expert_revenue
        },
        "currency": "KRW",
        "real_time_escrow_settled": real_expert_fees
    }
