from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.market_models import Product
from typing import Optional

router = APIRouter(prefix="/api/store", tags=["store"])

@router.get("/products")
async def get_store_products(category: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    """
    [Client] 활성화된 모든 디지털 굿즈/부적/코인 상품 리스트를 반환합니다.
    category 파라미터로 필터링 가능: amulet | coin | elemental | wish 등
    """
    query = select(Product).where(Product.is_active == True).order_by(desc(Product.created_at))
    if category:
        query = query.where(Product.category == category)
    result = await db.execute(query)
    products = result.scalars().all()
    
    return {
        "products": [
            {
                "id": str(p.id),
                "name": p.name,
                "description": p.description,
                "price": p.price,
                "category": p.category,
                "elementTheme": p.theme,
                "imageUrl": p.image_url or "/talismans/wealth.png",
                "original_price": p.original_price,
                "sales_tags": p.sales_tags,
                "coin_amount": p.coin_amount or 0,
                "bonus_coins": p.bonus_coins or 0,
                "is_active": p.is_active,
            }
            for p in products
        ]
    }
