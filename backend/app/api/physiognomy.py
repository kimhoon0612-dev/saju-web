import os
import base64
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai

router = APIRouter()

class PhysiognomyRequest(BaseModel):
    image_base64: str

class PhysiognomyResponse(BaseModel):
    result: str

@router.get("/physiognomy/models")
async def list_models():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key: return {"error": "no key"}
    genai.configure(api_key=api_key)
    try:
        models = [m.name for m in genai.list_models()]
        return {"models": models}
    except Exception as e:
        return {"error": str(e)}

@router.post("/physiognomy", response_model=PhysiognomyResponse)
async def analyze_face(request: PhysiognomyRequest):
    try:
        # Get Gemini API key
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API Key is missing.")

        genai.configure(api_key=api_key)
        
        # We need to strip the prefix (e.g., "data:image/jpeg;base64,")
        image_data = request.image_base64
        if "base64," in image_data:
            image_data = image_data.split("base64,")[1]

        image_bytes = base64.b64decode(image_data)
        
        # Prepare the model
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = (
            "당신은 한국의 전통 관상학 및 얼음결 분석을 통달한 명리학자입니다. "
            "주어진 얼굴 사진을 통해 눈, 코, 입, 이마 등의 특징을 관찰하여 현대적이고 유쾌하면서도 "
            "격려가 되는 관상 풀이를 제공해주세요. "
            "재물운과 직업운을 중심으로 3~4문장으로 짧게 요약해서 설명해 주세요. "
            "텍스트만 출력하고 마크다운 문법이나 불필요한 인사말은 제외하세요."
        )

        response = model.generate_content([
            prompt,
            {"mime_type": "image/jpeg", "data": image_bytes}
        ])

        return PhysiognomyResponse(result=response.text.strip())

    except Exception as e:
        print("Physiognomy error:", e)
        raise HTTPException(status_code=500, detail=f"얼굴 분석 중 오류가 발생했습니다: {str(e)}")
