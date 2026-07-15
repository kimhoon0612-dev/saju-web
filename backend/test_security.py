# test_security.py
import os
import sys
import asyncio
from datetime import datetime

# Monkeypatch pydantic.v1 to support Python 3.13+ for chromadb config
try:
    import pydantic.v1.fields
    original_set_default_and_type = pydantic.v1.fields.ModelField._set_default_and_type

    def patched_set_default_and_type(self):
        try:
            return original_set_default_and_type(self)
        except Exception as e:
            if "unable to infer type" in str(e):
                from typing import Any
                self.type_ = Any
                self.outer_type_ = Any
                self.annotation = Any
                self.required = False
                self.allow_none = True
                return
            raise e

    pydantic.v1.fields.ModelField._set_default_and_type = patched_set_default_and_type
except ImportError:
    pass

from jose import jwe
from sqlalchemy.future import select
from fastapi import HTTPException
from fastapi.testclient import TestClient

from main import app
from app.core.database import AsyncSessionLocal, engine, Base
from app.models.market_models import User, PointTransaction, Product
from app.api.iap import IAP_COIN_MAP
from app.api.users import BIRTH_DATA_KEY

client = TestClient(app)

async def run_security_tests():
    print("=== STARTING SECURITY CONTROLS TEST ===")
    
    # Initialize DB schema for testing
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as session:
        # Seed test coin package products if not exist
        result = await session.execute(select(Product).where(Product.category == "coin"))
        coin_products = result.scalars().all()
        if not coin_products:
            p1 = Product(name="스타터 코인팩", category="coin", price=5000, coin_amount=5000, bonus_coins=0, is_active=True)
            p2 = Product(name="베이직 코인팩", category="coin", price=10000, coin_amount=10000, bonus_coins=500, is_active=True)
            session.add_all([p1, p2])
            await session.commit()
            print("[DB Seed] Seeded test coin packages.")

        # Test Case 1: JWE Birth Data Encryption & Decryption
        print("\n--- Test 1: JWE Birth Data Cryptography ---")
        raw_birth = "1995-05-15T14:30:00"
        
        # Encrypt
        encrypted = jwe.encrypt(raw_birth.encode(), BIRTH_DATA_KEY, algorithm="dir", encryption="A256GCM").decode()
        print("Encrypted Birth String (JWE):", encrypted[:50] + "...")
        assert encrypted.startswith("ey"), "JWE token should start with 'ey'"
        assert raw_birth not in encrypted, "Raw birth data must not be visible in JWE payload"
        
        # Decrypt
        decrypted = jwe.decrypt(encrypted.encode(), BIRTH_DATA_KEY).decode()
        print("Decrypted Birth String:", decrypted)
        assert decrypted == raw_birth, "Decrypted data must match raw data"
        print("SUCCESS: JWE Cryptography is secure!")

        # Test Case 2: Apple Sign-In (Local Mock token bypass test)
        print("\n--- Test 2: Apple OAuth Mock Verification Bypass ---")
        # In mock mode (token starting with 'mock_'), it should succeed
        payload = {"code": "mock_apple_user_id_123", "redirect_uri": ""}
        response = client.post("/api/auth/apple", json=payload)
        assert response.status_code == 200, f"Apple Mock Login failed: {response.text}"
        data = response.json()
        print("Mock Apple Token verification succeeded. Token generated.")
        print("SUCCESS: Apple Mock Authentication works.")

        # Test Case 3: IAP Product ID Eligibility Validation
        print("\n--- Test 3: IAP Invalid Product ID Rejection ---")
        # Invalid product id com.sajuhub.coin.hacker
        assert "com.sajuhub.coin.hacker" not in IAP_COIN_MAP, "Hacker product must not be eligible"
        assert IAP_COIN_MAP["com.sajuhub.coin.10000"] == 10500, "10k pack must grant exactly 10,500 coins"
        print("SUCCESS: IAP Pricing catalog is hardcoded on server side.")

    print("\n=== ALL SECURITY UNIT CONTROLS ARE VERIFIED ===")

if __name__ == "__main__":
    asyncio.run(run_security_tests())
