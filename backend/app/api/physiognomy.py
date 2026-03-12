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

class PalmistryResponse(BaseModel):
    life_line: str
    brain_line: str
    heart_line: str
    fate_line: str
    summary: str

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

@router.post("/palmistry", response_model=PalmistryResponse)
async def analyze_palm(request: PhysiognomyRequest):
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
            "당신은 손금(수상) 분석의 최고 권위자입니다. "
            "주어진 손바닥 사진을 보고 다음 4가지 주요 선에 대해 구체적으로 분석해주세요.\n"
            "1. 생명선 (건강, 수명, 기본 체력)\n"
            "2. 두뇌선 (지능, 적성, 사고방식)\n"
            "3. 감정선 (성격, 연애성향, 감정표현)\n"
            "4. 운명선 (직업운, 재물운, 인생의 큰 흐름)\n\n"
            "각 선의 굵기, 길이, 뻗어나간 모양을 관찰하여 유쾌하고 격려가 되는 풀이를 작성해주세요. "
            "마지막으로 전체적인 총평(summary)을 2문장으로 요약해 주세요. "
            "반드시 아래 JSON 형식으로만 응답해야 하며, 다른 텍스트나 마크다운(```json 등)은 절대 포함하지 마세요:\n"
            "{\n"
            '  "life_line": "생명선 분석 내용...",\n'
            '  "brain_line": "두뇌선 분석 내용...",\n'
            '  "heart_line": "감정선 분석 내용...",\n'
            '  "fate_line": "운명선 분석 내용...",\n'
            '  "summary": "전체 총평..."\n'
            "}"
        )

        response = model.generate_content([
            prompt,
            {"mime_type": "image/jpeg", "data": image_bytes}
        ])

        import json
        result_text = response.text.strip()
        
        # Remove markdown JSON blocks if the model still includes them
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
            
        result_text = result_text.strip()
        
        parsed_data = json.loads(result_text)
        
        return PalmistryResponse(
            life_line=parsed_data.get("life_line", "분석 불가"),
            brain_line=parsed_data.get("brain_line", "분석 불가"),
            heart_line=parsed_data.get("heart_line", "분석 불가"),
            fate_line=parsed_data.get("fate_line", "분석 불가"),
            summary=parsed_data.get("summary", "분석 불가")
        )

    except Exception as e:
        print("Palmistry error:", e)
        raise HTTPException(status_code=500, detail=f"손금 분석 중 오류가 발생했습니다: {str(e)}")
