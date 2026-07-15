import os
import json
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional
from pydantic import BaseModel
from pywebpush import webpush, WebPushException

from app.core.database import get_db
from app.models.market_models import PushSubscription, User
from app.api.deps import get_current_user_optional, get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

# Path to the VAPID private key we generated
VAPID_PRIVATE_KEY_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "private_key.pem")

# We need the VAPID public key to provide to the frontend.
# Easiest way is to define it if we generated it, or use py_vapid to extract IF it works.
# To avoid cryptography dependency breaking during extraction, let's load it from public_key.pem
VAPID_PUBLIC_KEY_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "public_key.pem")

# The claim email
VAPID_CLAIMS = {
    "sub": "mailto:admin@fatename.com"
}

class SubscriptionKeys(BaseModel):
    p256dh: str
    auth: str

class SubscriptionModel(BaseModel):
    endpoint: str
    keys: SubscriptionKeys

class SendMessageRequest(BaseModel):
    title: str
    body: str
    url: Optional[str] = "/"

@router.get("/vapid-public-key")
async def get_vapid_public_key():
    """
    Returns the VAPID public key in URL-safe base64 format for the frontend to use.
    Since we know how vapid CLI generated it, we can parse public_key.pem.
    """
    try:
        if not os.path.exists(VAPID_PUBLIC_KEY_PATH):
            raise HTTPException(status_code=500, detail="VAPID Keys not generated on server.")
        
        with open(VAPID_PUBLIC_KEY_PATH, "r") as f:
            lines = f.readlines()
            # public_key.pem format:
            # -----BEGIN PUBLIC KEY-----
            # MFkw...
            # -----END PUBLIC KEY-----
            key_data = "".join([l.strip() for l in lines if not l.startswith("-----")])
            
            # The vapid CLI stores the full DER encoded SubjectPublicKeyInfo.
            # In Web Push, the browser needs the uncompressed P-256 public key (starting with 0x04)
            # which is the last 65 bytes of the decoded DER.
            import base64
            der_bytes = base64.b64decode(key_data)
            uncompressed_key = der_bytes[-65:]
            urlsafe_b64 = base64.urlsafe_b64encode(uncompressed_key).decode('utf-8').rstrip('=')
            
            return {"public_key": urlsafe_b64}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error loading public key.")

@router.post("/subscribe")
async def subscribe_notification(
    subscription: SubscriptionModel,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional) # Allows guests too if we want
):
    """
    Save the push subscription data.
    """
    result = await db.execute(select(PushSubscription).where(PushSubscription.endpoint == subscription.endpoint))
    existing_sub = result.scalars().first()

    if existing_sub:
        # Update if exists
        existing_sub.p256dh = subscription.keys.p256dh
        existing_sub.auth = subscription.keys.auth
        if user:
            existing_sub.user_id = user.id
    else:
        new_sub = PushSubscription(
            user_id=user.id if user else None,
            endpoint=subscription.endpoint,
            p256dh=subscription.keys.p256dh,
            auth=subscription.keys.auth
        )
        db.add(new_sub)
    
    await db.commit()
    return {"status": "success", "message": "Subscription saved"}

@router.post("/test-send")
async def test_send_notification(
    msg: SendMessageRequest,
    db: AsyncSession = Depends(get_db)
    # user: User = Depends(get_current_user) - skip auth for simple testing
):
    """
    Send a test notification to all subscriptions (or the targeted user's).
    """
    result = await db.execute(select(PushSubscription))
    subs = result.scalars().all()
    
    if not subs:
        raise HTTPException(status_code=404, detail="No active subscriptions found.")

    payload = json.dumps({
        "title": msg.title,
        "body": msg.body,
        "url": msg.url,
        "icon": "/icon-192x192.png",
        "badge": "/badge.png"
    })

    success_count = 0
    failure_count = 0

    for sub in subs:
        sub_info = {
            "endpoint": sub.endpoint,
            "keys": {
                "p256dh": sub.p256dh,
                "auth": sub.auth
            }
        }
        
        try:
            webpush(
                subscription_info=sub_info,
                data=payload,
                vapid_private_key=VAPID_PRIVATE_KEY_PATH,
                vapid_claims=VAPID_CLAIMS
            )
            success_count += 1
        except WebPushException as ex:
            print("Web Push Error: {}", repr(ex))
            # If 410 Gone, the subscription is expired/unsubscribed. We should delete it.
            if ex.response and ex.response.status_code == 410:
                await db.delete(sub)
            failure_count += 1
        except Exception as e:
            print("Unknown Send Error:", e)
            failure_count += 1
            
    await db.commit()
    return {"status": "success", "sent": success_count, "failed": failure_count}
