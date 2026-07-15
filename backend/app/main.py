from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routers
from app.api import auth, users, tarot, store, iap, market, physiognomy, experts
from app.api import admin_analytics, admin_auth, admin_experts, admin_goods, admin_market, admin_system, admin_users

app = FastAPI(
    title="FateName API",
    description="Ancient Wisdom Meets Future Intelligence: 명리학 기반 RAG 엔진",
    version="1.0.0",
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 운영 환경에서는 실제 프론트엔드 URL로 변경
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tarot.router)
app.include_router(physiognomy.router)
app.include_router(store.router)
app.include_router(iap.router)
app.include_router(market.router)
app.include_router(experts.router, prefix="/api/experts", tags=["experts"])

# Admin API 라우터 등록
app.include_router(admin_auth.router)
app.include_router(admin_analytics.router)
app.include_router(admin_experts.router)
app.include_router(admin_goods.router)
app.include_router(admin_market.router)
app.include_router(admin_system.router)
app.include_router(admin_users.router)
@app.get("/")
async def root():
    return {"message": "Welcome to FateName API - True Solar Time Engine is ready."}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
