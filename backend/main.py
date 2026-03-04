from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from korean_lunar_calendar import KoreanLunarCalendar

# Local imports (mock implementations currently)
from app.core.bazi_calculator import calculate_true_solar_time, calculate_bazi, get_comprehensive_fortune, SajuMatrix, FortuneCycle
from app.services.rag_chain import SajuRAGChain
from app.services.chat_agent import SajuChatAgent
from app.services.calendar_service import generate_fortune_ics
from app.services.report_service import generate_monthly_report
from app.services.goods_service import generate_digital_goods
from app.services.midjourney_service import generate_talisman_image
from app.services.stamping_service import apply_custom_stamp
from app.services.stt_service import transcribe_audio_gemini
from fastapi.responses import PlainTextResponse
from contextlib import asynccontextmanager
from app.core.database import engine, Base
import app.models.market_models  # Import to register models

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(
    title="FateName API",
    description="Backend API for MZ Saju platform including True Solar Time calculation and RAG insights.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration (Next.js frontend development default port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserBirthRequest(BaseModel):
    birth_time_iso: str  # ISO-8601 format (e.g., "2026-02-23T12:00:00")
    longitude: float     # e.g., 126.978 for Seoul
    is_lunar: bool = False
    is_leap_month: bool = False
    gender: str = "F"    # "M" or "F"

class CalculateResponse(BaseModel):
    original_time: str
    true_solar_time: str
    longitude_offset_min: float
    eot_min: float
    total_correction_min: float
    matrix: Dict[str, Any]
    fortune_cycle: Dict[str, Any]

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage]
    saju_context: Dict[str, Any]

class CalendarSyncRequest(BaseModel):
    date: str
    message: str
    element_type: str = "general"

class ReportRequest(BaseModel):
    saju_params: Dict[str, Any]
    month_theme: str

class DigitalGoodsRequest(BaseModel):
    saju_params: Dict[str, Any]

class TalismanGenerateRequest(BaseModel):
    product_id: str
    wish_text: Optional[str] = None
    birth_data: Optional[str] = None

@app.get("/")
def read_root():
    return {"status": "ok", "message": "FateName API is running."}

@app.post("/api/calculate", response_model=CalculateResponse)
def calculate_user_bazi(request: UserBirthRequest):
    """
    1. 사용자의 태어난 시간과 경도를 받아 진태양시를 보정합니다.
    2. KASI API를 통해 해당일의 간지를 조회합니다.
    3. 최종 명식(Destiny Matrix)을 도출합니다.
    """
    try:
        birth_datetime = datetime.fromisoformat(request.birth_time_iso)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ISO format for birth_time_iso")

    try:
        # 1. 음력 처리 (음력일 경우 양력으로 변환)
        if request.is_lunar:
            calendar = KoreanLunarCalendar()
            # setLunarDate(year, month, day, isIntercalary)
            isValid = calendar.setLunarDate(birth_datetime.year, birth_datetime.month, birth_datetime.day, request.is_leap_month)
            if not isValid:
                raise HTTPException(status_code=400, detail="유효하지 않은 음력 날짜입니다.")
            
            # 양력 날짜로 birth_datetime 교체 (시간은 그대로 유지)
            birth_datetime = birth_datetime.replace(
                year=calendar.solarYear,
                month=calendar.solarMonth,
                day=calendar.solarDay
            )

        # 2. 진태양시 보정
        tst = calculate_true_solar_time(birth_datetime, request.longitude)

        # 3. 사주 매트릭스 도출 (PyEphem 천문 알고리즘 사용)
        # birth_datetime: 기준 KST 표준시
        # 경도를 넘겨 calculate_bazi 내부에서 진태양시를 보정하도록 함
        saju_matrix = calculate_bazi(birth_datetime, request.longitude, request.gender)

        # 4. 오늘의 운세 (Daily Fortune) 도출
        # 현재 한국 표준시 기준 서버 시간
        current_kst = datetime.utcnow() + timedelta(hours=9)
        fortune_cycle = get_comprehensive_fortune(saju_matrix, current_kst)
        
        matrix_dict = saju_matrix.dict()
        matrix_dict['daily_fortune'] = fortune_cycle.iljin.dict() # The actual DailyFortune object string expected by frontend
        matrix_dict['fortune_cycle'] = fortune_cycle.dict() # Embed FortuneCycle directly into matrix so frontend can use it

        return CalculateResponse(
            original_time=birth_datetime.isoformat(),
            true_solar_time=tst.isoformat(),
            longitude_offset_min=(request.longitude - 135.0) * 4.0,
            eot_min=0.0, # Removed complex tracking for the response since frontend doesn't strictly need eot breakdown
            total_correction_min=(tst - birth_datetime).total_seconds() / 60.0,
            matrix=matrix_dict,
            fortune_cycle=fortune_cycle.dict()
        )
    except Exception as e:
        import traceback
        with open("debug_error.log", "w", encoding="utf-8") as f:
            f.write(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Calculation error. Check debug logs.")


@app.post("/api/insight")
def get_daily_insight(matrix: SajuMatrix):
    """
    계산된 사주 매트릭스를 기반으로 RAG 파이프라인을 거쳐 투데이 액션(Insight)을 생성합니다.
    (Memory 의도적 파기: 데이터베이스에 사용자 정보 저장을 수행하지 않습니다)
    """
    rag_chain = SajuRAGChain()
    
    # Pydantic 모델을 Dict로 변환 후 주입
    insight_text = rag_chain.generate_insight(matrix.dict())
    
    return {"insight": insight_text}

@app.post("/api/life-stages")
def get_life_stages(matrix: SajuMatrix):
    """
    사주 매트릭스의 년/월/일/시주를 바탕으로 초년/청년/중년/말년운의 생애주기 분석결과를 반환합니다.
    """
    rag_chain = SajuRAGChain()
    result = rag_chain.generate_life_stages_analysis(matrix.dict())
    return result

@app.post("/api/chat")
def chat_with_agent(request: ChatRequest):
    """
    사용자의 사주 데이터와 이전 대화 기록을 바탕으로 Agentic 챗봇 응답을 생성합니다.
    """
    agent = SajuChatAgent()
    history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history]
    
    result = agent.chat(request.message, history_dicts, request.saju_context)
    return result

@app.post("/api/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    Accepts an audio file from the frontend (via MediaRecorder), 
    and returns transcribed text using Gemini 1.5 Flash.
    """
    audio_bytes = await audio.read()
    mime_type = audio.content_type or "audio/webm"
    text = transcribe_audio_gemini(audio_bytes, mime_type=mime_type)
    return {"text": text}

@app.post("/api/calendar/sync")
def sync_to_calendar(request: CalendarSyncRequest):
    """
    Generates a .ics string payload for calendar integration from a specific fortune message.
    """
    ics_data = generate_fortune_ics(request.date, request.message, request.element_type)
    
    return PlainTextResponse(
        content=ics_data,
        media_type="text/calendar",
        headers={"Content-Disposition": f"attachment; filename=fatename_schedule_{request.date}.ics"}
    )

@app.post("/api/reports/monthly")
def get_monthly_premium_report(request: ReportRequest):
    """
    Generates a premium monthly report (Wealth & Health) based on classical texts and the user's Saju.
    """
    report_md = generate_monthly_report(request.saju_params, request.month_theme)
    return {"report_markdown": report_md}

@app.post("/api/goods/generate")
def create_digital_goods(request: DigitalGoodsRequest):
    """
    Generates a personalized digital wallpaper using DALL-E based on the user's Saju element.
    """
    goods_data = generate_digital_goods(request.saju_params)
    return goods_data

@app.post("/api/store/generate")
async def store_generate_talisman(request: TalismanGenerateRequest):
    """
    Generates a high-quality digital talisman via Midjourney based on the product type,
    and then heavily stamps the user's volatile wish_text onto the image using Pillow.
    No permanent database storage is used for the wish text.
    """
    # 1. Determine element theme from product ID (simple map for MVP)
    theme = "water"
    if "wood" in request.product_id: theme = "wood"
    elif "fire" in request.product_id: theme = "fire"
    elif "wealth" in request.product_id: theme = "metal" # wealth ~ metal/earth
    elif "love" in request.product_id: theme = "fire" # love ~ fire/peach blossom
    elif "dragon" in request.product_id: theme = "wood" # dragon ~ wood
    
    # 2. Start Midjourney pipeline
    base_image_url = await generate_talisman_image(request.product_id, theme, request.wish_text)
    
    # 3. Apply custom stamping (Volatile memory processing)
    if request.wish_text:
        final_image_data = await apply_custom_stamp(base_image_url, request.wish_text)
    else:
        final_image_data = base_image_url
        
    return {
        "status": "success",
        "image_url": final_image_data,
        "product_id": request.product_id,
        "stamping_applied": bool(request.wish_text)
    }

from app.api.marketplace import router as marketplace_router
from app.api.admin_analytics import router as admin_analytics_router
from app.api.admin_goods import router as admin_goods_router
from app.api.admin_market import router as admin_market_router
from app.api.admin_system import router as admin_system_router
from app.api.store import router as store_router

app.include_router(marketplace_router)
app.include_router(admin_analytics_router)
app.include_router(admin_goods_router)
app.include_router(admin_market_router)
app.include_router(admin_system_router)
app.include_router(store_router)

