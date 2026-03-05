from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.tarot_service import generate_tarot_reading

router = APIRouter(prefix="/api/tarot", tags=["Tarot"])

class TarotDrawRequest(BaseModel):
    category: str
    type: str

class TarotDrawResponse(BaseModel):
    card_name: str
    card_name_kr: str
    emoji: str
    interpretation: str

@router.post("/draw", response_model=TarotDrawResponse)
def draw_tarot_card(request: TarotDrawRequest):
    """
    Draws a random Tarot card and returns the LLM-generated interpretation
    based on the requested category (e.g., love, career) and type (daily, monthly).
    """
    try:
        result = generate_tarot_reading(request.type, request.category)
        return TarotDrawResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
