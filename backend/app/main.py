from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

@app.get("/")
async def root():
    return {"message": "Welcome to FateName API - True Solar Time Engine is ready."}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
