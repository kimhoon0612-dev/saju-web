import os
import base64
import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.models.market_models import User, PointTransaction, Product
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/payments", tags=["payments"])

TOSS_SECRET_KEY = os.environ.get("TOSS_SECRET_KEY", "test_sk_Z1aOwX7K8mOQO0Dla1lD8yQxzvNP") # 테스트 시크릿 키 (공개키가 아님)

class VerifyTossRequest(BaseModel):
    paymentKey: str
    orderId: str
    amount: int
    coin_reward: int

class VerifyResponse(BaseModel):
    status: str
    message: str
    added_coins: int
    new_balance: int

@router.post("/verify/toss", response_model=VerifyResponse)
async def verify_toss_payment(
    req: VerifyTossRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Verify Toss Payments success response and grant coins.
    """
    
    # 1. Check uniqueness of orderId to prevent duplicate processing
    result = await db.execute(
        select(PointTransaction).where(PointTransaction.description.like(f"%{req.orderId}%"))
    )
    existing_tx = result.scalars().first()
    if existing_tx:
        raise HTTPException(status_code=400, detail="Payment already processed.")

    # 2. Server-to-Server Validation with Toss API
    url = "https://api.tosspayments.com/v1/payments/confirm"
    
    # Toss Basic Auth requires "[secretKey]:" in base64
    auth_string = f"{TOSS_SECRET_KEY}:"
    encoded_auth = base64.b64encode(auth_string.encode()).decode('utf-8')
    headers = {
        "Authorization": f"Basic {encoded_auth}",
        "Content-Type": "application/json"
    }
    payload = {
        "paymentKey": req.paymentKey,
        "orderId": req.orderId,
        "amount": req.amount
    }

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(url, json=payload, headers=headers)
            resp_data = resp.json()
            
            # If development environment or explicit test override, we can bypass the strict status checks 
            # In Toss, a successful confirm returns status = 'DONE'
            if resp.status_code != 200:
                print(f"Toss Verify Failed: {resp_data}")
                raise HTTPException(status_code=400, detail=resp_data.get('message', 'Payment verification failed.'))
                
        except Exception as e:
            print("Payment validation exception:", e)
            raise HTTPException(status_code=500, detail="Error communicating with payment gateway.")

    # 3. Validation Successful -> Retrieve Product from DB based on verified amount to prevent manipulation
    result = await db.execute(
        select(Product).where(
            Product.category == "coin",
            Product.price == req.amount,
            Product.is_active == True
        )
    )
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=400, detail="유효하지 않은 결제 금액 또는 코인 상품 정보입니다.")
        
    added_amount = product.coin_amount + product.bonus_coins
    current_user.point_balance += added_amount
    
    # 4. Record the Point Transaction Log
    transaction = PointTransaction(
        user_id=current_user.id,
        amount=added_amount,
        description=f"코인 패키지 결제 (Toss): {req.orderId} (제품: {product.name})",
        is_escrow_locked=False
    )
    
    db.add(transaction)
    await db.commit()
    await db.refresh(current_user)
    
    return VerifyResponse(
        status="success",
        message="Coins successfully added to your account",
        added_coins=added_amount,
        new_balance=current_user.point_balance
    )
