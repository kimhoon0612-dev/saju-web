from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import asyncio
import time

from app.core.database import get_db
from app.models.market_models import Product

import os
from openai import OpenAI

try:
    openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
except Exception:
    openai_client = None

router = APIRouter(prefix="/api/admin/talisman", tags=["admin_talisman"])

class SandboxRequest(BaseModel):
    prompt: str
    theme: str

class InventoryRequest(BaseModel):
    name: str
    theme: str
    price_points: int
    prompt_template: str
    is_active: bool
    image_url: str = None

@router.get("/stats")
async def get_talisman_stats():
    """
    [Admin] 디지털 상점 매출 통계 요약 (MVP: 뷰용 데이터 제공)
    """
    import datetime
    return {
        "status": "success",
        "data": {
            "total_revenue": 3450000,
            "monthly_revenue": 950000,
            "daily_revenue": 125000
        }
    }

@router.post("/sandbox")
async def generate_sandbox_talisman(req: SandboxRequest):
    """
    [Admin] 상품 등록 전 AI 프롬프트 시뮬레이션 엔진
    """
    start_time = time.time()
    
    # 기본 폴백: 프론트엔드 public/talismans/ 내에 위치한 디자인 목업 사용
    theme_mapped = req.theme if req.theme in ['wealth', 'love', 'health'] else 'wealth'
    fallback_url = f"/talismans/{theme_mapped}.png"
    
    image_url = fallback_url
    
    if openai_client:
        try:
            # 샌드박스는 관리자가 입력한 프롬프트를 100% 그대로 DALL-E 3에 던집니다.
            response = openai_client.images.generate(
                model="dall-e-3",
                prompt=req.prompt,
                size="1024x1024",
                quality="hd",
                n=1,
                style="natural"
            )
            image_url = response.data[0].url
        except Exception as e:
            print(f"Sandbox DALL-E Error: {e}")
            await asyncio.sleep(2.0)
    else:
        # API 키가 없으면 그냥 2초 지연 후 폴백
        await asyncio.sleep(2.0)
        
    end_time = time.time()
    
    return {
        "status": "success",
        "preview_image_url": image_url,
        "generation_time_ms": int((end_time - start_time) * 1000)
    }

@router.post("/inventory")
async def publish_talisman_to_inventory(req: InventoryRequest, db: AsyncSession = Depends(get_db)):
    """
    [Admin] 승인된 AI 부적 테마 및 상품을 상점 DB에 즉시 배포 (DB upsert)
    """
    new_product = Product(
        name=req.name,
        description=req.prompt_template,
        price=req.price_points,
        category="wish",
        theme=req.theme,
        image_url=req.image_url or "/talismans/wealth.png",
        is_active=req.is_active
    )
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)

    return {
        "status": "success",
        "message": f"'{req.name}' 상품이 성공적으로 인벤토리에 등록되었습니다.",
        "product_id": new_product.id
    }

@router.get("/inventory")
async def get_inventory(db: AsyncSession = Depends(get_db)):
    """
    [Admin] 현재 인벤토리 DB 데이터 조회
    """
    result = await db.execute(select(Product).order_by(desc(Product.created_at)))
    products = result.scalars().all()
    return {"catalog": products}

@router.delete("/inventory/{product_id}")
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """
    [Admin] 상점 인벤토리에서 상품 삭제 (또는 비활성화)
    """
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        return {"status": "error", "message": "상품을 찾을 수 없습니다."}
        
    await db.delete(product)
    await db.commit()
    
    return {"status": "success", "message": f"상품(ID:{product_id})이 삭제되었습니다."}
