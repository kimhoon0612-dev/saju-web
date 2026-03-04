import os
from openai import OpenAI
from typing import Dict, Any

try:
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
except Exception:
    client = None

def generate_digital_goods(saju_params: Dict[str, Any]) -> Dict[str, str]:
    """
    Generates a personalized digital wallpaper using DALL-E 3 based on the user's Saju element.
    Provides curated Unsplash fallbacks if the API key is missing or generation fails.
    """
    day_master_raw = saju_params.get("day_master", "수(水)")
    
    # Determine dominant element
    element = "water" 
    if "목" in day_master_raw or "Wood" in day_master_raw: element = "wood"
    elif "화" in day_master_raw or "Fire" in day_master_raw: element = "fire"
    elif "토" in day_master_raw or "Earth" in day_master_raw: element = "earth"
    elif "금" in day_master_raw or "Metal" in day_master_raw: element = "metal"
    elif "수" in day_master_raw or "Water" in day_master_raw: element = "water"

    # Curated premium Unsplash URLs as reliable fallbacks per element
    fallbacks = {
        "wood": "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1080&auto=format&fit=crop", # Lush green forest
        "fire": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1080&auto=format&fit=crop", # Cosmic red/orange nebula
        "earth": "https://images.unsplash.com/photo-1682687982501-1e58f8101438?q=80&w=1080&auto=format&fit=crop", # Majestic desert/canyon
        "metal": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop", # Abstract sharp gold/silver
        "water": "https://images.unsplash.com/photo-1439405326854-014607f694d7?q=80&w=1080&auto=format&fit=crop"  # Deep tranquil ocean
    }
    
    element_ko = {"wood": "목(木)", "fire": "화(火)", "earth": "토(土)", "metal": "금(金)", "water": "수(水)"}.get(element, "수(水)")

    if not client:
        return {
            "image_url": fallbacks.get(element, fallbacks["water"]),
            "theme": f"당신만의 맞춤형 수호 기운: {element_ko}",
            "description": "당신의 본질적인 에너지를 시각화한 프리미엄 수호 부적입니다. (현재 API 키 미설정으로 최고급 기본 큐레이션아트가 제공됩니다.)"
        }

    prompt = f"A breathtaking, highly aesthetic, minimalist and mystical 3D rendered mobile wallpaper representing the Chinese Five Element: {element} ({element_ko}). It MUST strictly follow a retro-modern cyber-spiritual aesthetic with neon highlights over dark glassmorphism materials. The colors should be heavily associated with {element_ko}. CRITICAL: NO text, no letters, no characters, no words at all. Pure abstract geometry and spiritual energy. High resolution, elegant composition."

    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="hd",
            n=1,
            style="natural"
        )
        return {
            "image_url": response.data[0].url,
            "theme": f"당신만의 맞춤형 사이버 부적: {element_ko}",
            "description": "우주 파동 분석 엔진이 당신의 사주 명식을 심층 분석하여 방금 생성한, 세상에 단 하나뿐인 '프리미엄 디지털 수호 부적'입니다."
        }
    except Exception as e:
        print(f"Error generating image via DALL-E: {e}")
        return {
            "image_url": fallbacks.get(element, fallbacks["water"]),
            "theme": f"당신의 맞춤형 수호 기운: {element_ko}",
            "description": "서버의 양자 파동 연산이 지연되고 있어, 당신의 기운에 가장 어울리는 최고급 큐레이션 아트워크를 우선 제공합니다."
        }
