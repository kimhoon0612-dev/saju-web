import os
import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.models.market_models import User, PointTransaction
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/iap", tags=["iap"])

class ReceiptVerificationRequest(BaseModel):
    platform: str # "ios" or "android"
    receipt_data: str # Base64 encoded receipt from iOS/Android SDK
    product_id: str # e.g., "com.sajuhub.coin.100"
    coin_reward: int # Expected coin reward amount

class ReceiptVerificationResponse(BaseModel):
    status: str
    message: str
    added_coins: int
    new_balance: int

APPLE_SHARED_SECRET = os.environ.get("APPLE_SHARED_SECRET", "dummy_apple_secret")

# Server-side pricing catalog for IAP to prevent client manipulation
IAP_COIN_MAP = {
    "com.sajuhub.coin.5000": 5000,
    "com.sajuhub.coin.10000": 10500,  # 10,000 + 500 bonus
    "com.sajuhub.coin.30000": 32000,  # 30,000 + 2,000 bonus
    "com.sajuhub.coin.50000": 55000,  # 50,000 + 5,000 bonus
    "com.sajuhub.coin.100000": 115000, # 100,000 + 15,000 bonus
    "com.sajuhub.coin.100": 100,      # for backward compatibility and tests
}

@router.post("/verify", response_model=ReceiptVerificationResponse)
async def verify_receipt(request: ReceiptVerificationRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """
    Verify App Store / Play Store receipt and grant coins to user.
    Enforces transaction_id uniqueness to prevent replay attacks, and uses server-side coin mapping.
    """
    # 1. Verify product eligibility
    if request.product_id not in IAP_COIN_MAP:
        raise HTTPException(status_code=400, detail="등록되지 않은 인앱 상품 ID 입니다.")
        
    added_amount = IAP_COIN_MAP[request.product_id]
    transaction_id = None
    
    if request.platform.lower() != "ios":
        # Google Play verify logic requires Service Account token (not implemented in MVP yet)
        if request.receipt_data.startswith("mock_"):
            transaction_id = f"mock_android_tx_{request.receipt_data[5:]}"
        else:
            raise HTTPException(status_code=400, detail="Only iOS IAP verification is currently implemented for real receipts.")

    if request.platform.lower() == "ios":
        payload = {
            "receipt-data": request.receipt_data,
            "password": APPLE_SHARED_SECRET,
            "exclude-old-transactions": True
        }
        
        url = "https://sandbox.itunes.apple.com/verifyReceipt"
        
        # If mock receipt from dev env, skip real http call
        if request.receipt_data.startswith("mock_"):
            transaction_id = f"mock_ios_tx_{request.receipt_data[5:]}"
        else:
            async with httpx.AsyncClient() as client:
                try:
                    resp = await client.post(url, json=payload)
                    resp_data = resp.json()
                    
                    status = resp_data.get('status')
                    if status != 0:
                        raise HTTPException(status_code=400, detail=f"Apple verification failed with status {status}")
                        
                    receipt = resp_data.get('receipt', {})
                    in_app = receipt.get('in_app', [])
                    
                    found_product = False
                    for item in in_app:
                        if item.get('product_id') == request.product_id:
                            found_product = True
                            transaction_id = item.get('transaction_id')
                            break
                            
                    if not found_product:
                        raise HTTPException(status_code=400, detail="Requested product not found in receipt.")
                
                except Exception as e:
                    print("Apple validation exception:", e)
                    raise HTTPException(status_code=500, detail="Error communicating with Apple servers.")

    # 2. Check for Replay Attack (transaction_id uniqueness check)
    if transaction_id:
        tx_check = await db.execute(
            select(PointTransaction).where(PointTransaction.description.like(f"%TX: {transaction_id}%"))
        )
        if tx_check.scalars().first():
            raise HTTPException(status_code=400, detail="이미 처리 완료된 결제 거래 영수증(Replay Attack)입니다.")
    else:
        raise HTTPException(status_code=400, detail="거래 식별번호(Transaction ID)를 획득하지 못했습니다.")

    try:
        # 3. Grant coins (using verified server amount)
        current_user.point_balance += added_amount
        
        # 4. Record transaction log
        transaction = PointTransaction(
            user_id=current_user.id,
            amount=added_amount,
            description=f"In-App Purchase ({request.platform}): {request.product_id} (TX: {transaction_id})",
            is_escrow_locked=False
        )
        
        db.add(transaction)
        await db.commit()
        await db.refresh(current_user)
        
        return ReceiptVerificationResponse(
            status="success",
            message="Coins successfully added to your account",
            added_coins=added_amount,
            new_balance=current_user.point_balance
        )
    except Exception as e:
        await db.rollback()
        print("DB Transaction Failed for IAP:", e)
        raise HTTPException(status_code=500, detail="Database transaction failed during coin grant.")
