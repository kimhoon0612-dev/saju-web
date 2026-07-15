from fastapi import APIRouter, Header, HTTPException
from typing import Optional
import os

router = APIRouter(prefix="/api/admin/auth", tags=["admin_auth"])

import sys

ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY")
is_production = os.getenv("ENV", "development").lower() == "production"

if not ADMIN_SECRET_KEY:
    if is_production:
        print("[CRITICAL SECURITY WARNING] ADMIN_SECRET_KEY must be set in production environment!")
        sys.exit("CRITICAL ERROR: ADMIN_SECRET_KEY is missing in production mode.")
    else:
        # Fallback only for non-production environments
        ADMIN_SECRET_KEY = "saju_admin_2026!"

async def verify_admin(x_admin_token: Optional[str] = Header(None)):
    """
    Dependency to verify the custom admin token in the header.
    Throws 401 Unauthorized if missing or incorrect.
    """
    if not x_admin_token or x_admin_token != ADMIN_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing Admin Token")
    return True
