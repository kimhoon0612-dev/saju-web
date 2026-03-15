from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import asyncio
import time
import os
import shutil

from app.core.database import get_db
from app.models.market_models import Product

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
    category: str = "amulet"
    image_url: str = None
    original_price: int = None
    sales_tags: str = None
    coin_amount: int = 0
    bonus_coins: int = 0

from sqlalchemy import func
from app.models.market_models import Product, PointTransaction
from datetime import datetime, timedelta

@router.get("/stats")
async def get_talisman_stats(db: AsyncSession = Depends(get_db)):
    """
    [Admin] 디지털 상점 매출 통계 요약
    """
    now = datetime.utcnow()
    one_day_ago = now - timedelta(days=1)
    thirty_days_ago = now - timedelta(days=30)
    
    # "구매" 관련 매출을 집계 (예: description에 특정 키워드가 있거나, 양수/음수 amount 기준 - 여기서는 양수 결제라 가정하고 단순히 모든 상점 거래를 합산)
    # MVP 레벨이므로 PointTransaction 전체를 상품/코인 결제로 간주
    
    # Total Revenue
    total_q = await db.execute(select(func.sum(PointTransaction.amount)))
    total_rev = total_q.scalar_one_or_none() or 0
    
    # Monthly Revenue
    monthly_q = await db.execute(select(func.sum(PointTransaction.amount)).where(PointTransaction.created_at >= thirty_days_ago))
    monthly_rev = monthly_q.scalar_one_or_none() or 0
    
    # Daily Revenue
    daily_q = await db.execute(select(func.sum(PointTransaction.amount)).where(PointTransaction.created_at >= one_day_ago))
    daily_rev = daily_q.scalar_one_or_none() or 0
    
    return {
        "status": "success",
        "data": {
            "total_revenue": total_rev,
            "monthly_revenue": monthly_rev,
            "daily_revenue": daily_rev
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
        category=req.category,
        theme=req.theme,
        image_url=req.image_url or "/talismans/wealth.png",
        original_price=req.original_price,
        sales_tags=req.sales_tags,
        coin_amount=req.coin_amount,
        bonus_coins=req.bonus_coins,
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

@router.put("/inventory/{product_id}")
async def update_product(product_id: int, req: InventoryRequest, db: AsyncSession = Depends(get_db)):
    """
    [Admin] 기존 상점 인벤토리 상품 정보 수정
    """
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다.")
        
    product.name = req.name
    product.description = req.prompt_template
    product.price = req.price_points
    product.original_price = req.original_price
    product.sales_tags = req.sales_tags
    product.theme = req.theme
    product.category = req.category
    product.coin_amount = req.coin_amount
    product.bonus_coins = req.bonus_coins
    product.is_active = req.is_active
    
    if req.image_url:
        product.image_url = req.image_url
        
    await db.commit()
    await db.refresh(product)
    
    return {"status": "success", "message": f"상품(ID:{product_id})이 수정되었습니다."}

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

@router.post("/upload")
async def upload_talisman_image(file: UploadFile = File(...)):
    """
    [Admin] 직접 부적 이미지를 업로드하여 프론트엔드 public 폴더에 저장합니다.
    """
    # 프론트엔드의 public/talismans/uploads 폴더 경로 설정
    # backend/app/api 폴더를 기준으로 상대경로를 사용하여 frontend 폴더로 이동합니다.
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    frontend_public_dir = os.path.join(base_dir, "frontend", "public", "talismans", "uploads")
    
    # 폴더가 없으면 생성
    os.makedirs(frontend_public_dir, exist_ok=True)
    
    try:
        # 안전한 파일명 생성 (타임스탬프 추가)
        timestamp = int(time.time())
        safe_filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(frontend_public_dir, safe_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 프론트엔드에서 접근할 수 있는 상대 경로 반환
        public_url = f"/talismans/uploads/{safe_filename}"
        return {"document_url": public_url, "message": "파일이 성공적으로 업로드되었습니다."}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"파일 업로드 실패: {str(e)}")
