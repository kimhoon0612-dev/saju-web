from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.models.market_models import User, Product, PointTransaction
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/market", tags=["market"])

class PurchaseRequest(BaseModel):
    product_id: int
    shipping_name: str
    shipping_phone: str
    shipping_address: str

class PurchaseResponse(BaseModel):
    status: str
    message: str
    remaining_balance: int

@router.post("/purchase", response_model=PurchaseResponse)
async def purchase_product(
    request: PurchaseRequest, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    """
    유저가 보유한 코인(포인트)으로 마켓 상품(부적/굿즈 등)을 결제합니다.
    """
    # 1. Check Product exists
    result = await db.execute(select(Product).where(Product.id == request.product_id, Product.is_active == True))
    product = result.scalars().first()
    
    if not product:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없거나 판매가 중단되었습니다.")
        
    # 2. Check User Balance
    if current_user.point_balance < product.price:
        raise HTTPException(
            status_code=402, 
            detail=f"코인이 부족합니다. (필요: {product.price} 원/코인, 보유: {current_user.point_balance} 코인)"
        )
        
    # 3. Deduct Balance & Create Transaction Log
    current_user.point_balance -= product.price
    
    transaction = PointTransaction(
        user_id=current_user.id,
        amount=-product.price,
        description=f"상품 구매: {product.name} (배송지: {request.shipping_name}, {request.shipping_address})",
        is_escrow_locked=False
    )
    db.add(transaction)
    
    # 4. Save and return
    await db.commit()
    await db.refresh(current_user)
    
    return PurchaseResponse(
        status="success",
        message="성공적으로 구매가 완료되었습니다.",
        remaining_balance=current_user.point_balance
    )
