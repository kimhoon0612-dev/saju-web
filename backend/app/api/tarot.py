from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
from app.services.tarot_service import generate_multiple_tarot_readings, stream_multiple_tarot_readings

router = APIRouter(prefix="/api/tarot", tags=["Tarot"])

class TarotMultiDrawRequest(BaseModel):
    categories: List[str]
    type: str

class TarotDrawResponse(BaseModel):
    category: str
    card_name: str
    card_name_kr: str
    emoji: str
    interpretation: str

@router.post("/draw-multiple", response_model=List[TarotDrawResponse])
def draw_multiple_tarot_cards(request: TarotMultiDrawRequest):
    """
    Draws multiple unique Tarot cards and returns LLM-generated interpretations
    for each requested category (e.g., love, career) based on the type (daily, monthly).
    """
    try:
        results = generate_multiple_tarot_readings(request.type, request.categories)
        return [TarotDrawResponse(**res) for res in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/draw-multiple-stream")
def draw_multiple_tarot_cards_stream(request: TarotMultiDrawRequest):
    """
    Streams multiple unique Tarot cards and returns LLM-generated interpretations
    for each requested category as Newline Delimited JSON (NDJSON).
    """
    return StreamingResponse(
        stream_multiple_tarot_readings(request.type, request.categories),
        media_type="application/x-ndjson"
    )
