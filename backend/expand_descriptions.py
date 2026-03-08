import os
import requests
import json
import time

try:
    from openai import OpenAI
except ImportError:
    print("Please install openai: pip install openai")
    exit(1)

# Ensure OPENAI_API_KEY is available (from .env or system vars)
from dotenv import load_dotenv
load_dotenv()

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

API_URL = "https://saju-web.onrender.com/api"

def generate_long_description(name, short_desc):
    prompt = f"""
    당신은 신비로운 동양 명리학과 부적에 통달한 최고의 술사입니다.
    사용자가 부적 상점에서 다음 부적을 클릭했을 때 보여질 **매우 길고 상세한 1000자(약 300~400단어) 분량의 상품 설명(효능 및 기운)**을 작성해주세요.
    말투는 진중하고 신비로우며, 전문적인 운세/사주/타로 전문가의 말투를 사용하세요 (~습니다, ~합니다).
    
    부적 이름: {name}
    현재 짧은 요약: {short_desc}
    
    요구사항:
    1. 이 부적이 어떤 사람에게 필요한지 상세한 상황 묘사
    2. 부적에 담긴 음양오행의 원리나 신비로운 기운에 대한 심도 깊은 설명
    3. 이 부적을 소지했을 때 일어날 수 있는 긍정적인 변화와 구체적인 효과
    4. 부적을 대하는 마음가짐이나 보관 방법
    5. 전체적으로 1000자에 가까운 충분한 길이를 확보할 것.
    6. 줄바꿈을 적절히 사용하여 모바일에서도 읽기 좋게 문단을 나눌 것.
    7. Markdown 문법은 사용하지 말고 순수 텍스트(줄바꿈 포함)로만 작성할 것.
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a master of oriental mysticism and talismans."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating description for {name}: {e}")
        return short_desc

def main():
    print("Fetching live products...")
    res = requests.get(f"{API_URL}/store/products?random={time.time()}")
    if res.status_code != 200:
        print("Failed to fetch products.")
        return
        
    products = res.json().get("products", [])
    print(f"Total products to process: {len(products)}")
    
    updated_count = 0
    
    for i, p in enumerate(products):
        pid = p["id"]
        name = p["name"]
        short_desc = p["description"]
        
        # Skip if already expanded (contains Korean honorifics which means we already generated and saved it)
        if "습니다" in short_desc and len(short_desc) > 300:
            print(f"[{i+1}/{len(products)}] Skipping '{name}' - already expanded.")
            continue
            
        print(f"[{i+1}/{len(products)}] Generating for '{name}'...")
        long_desc = generate_long_description(name, short_desc)
        
        # Prepare update payload. The API expects InventoryRequest
        # which has name, theme, price_points, prompt_template (which maps to description), is_active, image_url
        payload = {
            "name": name,
            "theme": p.get("theme", "wealth"),
            "price_points": p.get("price", 9900),
            "prompt_template": long_desc,
            "is_active": p.get("is_active", True),
            "image_url": p.get("image_url", "")
        }
        
        # update via PUT
        r_upd = requests.put(f"{API_URL}/admin/talisman/inventory/{pid}", json=payload)
        if r_upd.status_code == 200:
            print(f"  -> Successfully updated '{name}'")
            updated_count += 1
        else:
            print(f"  -> Failed to update '{name}': {r_upd.text}")
            
    print(f"Done! Updated {updated_count} products.")

if __name__ == "__main__":
    main()
