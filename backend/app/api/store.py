from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.models.market_models import Product

router = APIRouter(prefix="/api/store", tags=["store"])

@router.get("/products")
async def get_store_products(db: AsyncSession = Depends(get_db)):
    """
    [Client] 활성화된 모든 디지털 굿즈/부적 상품 리스트를 가져옵니다.
    """
    result = await db.execute(
        select(Product).where(Product.is_active == True).order_by(desc(Product.created_at))
    )
    products = result.scalars().all()
    
    return {
        "products": products
    }
