import os
import random
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# 78 Tarot Cards (Major & Minor Arcana) - For MVP, just Major Arcana + a few famous ones are enough.
TAROT_CARDS = [
    {"name": "The Fool", "name_kr": "바보", "emoji": "🃏"},
    {"name": "The Magician", "name_kr": "마법사", "emoji": "🪄"},
    {"name": "The High Priestess", "name_kr": "여사제", "emoji": "📜"},
    {"name": "The Empress", "name_kr": "여황제", "emoji": "👸"},
    {"name": "The Emperor", "name_kr": "황제", "emoji": "🤴"},
    {"name": "The Hierophant", "name_kr": "교황", "emoji": "🕍"},
    {"name": "The Lovers", "name_kr": "연인", "emoji": "💑"},
    {"name": "The Chariot", "name_kr": "전차", "emoji": "🛷"},
    {"name": "Strength", "name_kr": "힘", "emoji": "🦁"},
    {"name": "The Hermit", "name_kr": "은둔자", "emoji": "🏮"},
    {"name": "Wheel of Fortune", "name_kr": "운명의 수레바퀴", "emoji": "🎡"},
    {"name": "Justice", "name_kr": "정의", "emoji": "⚖️"},
    {"name": "The Hanged Man", "name_kr": "매달린 사람", "emoji": "🧗"},
    {"name": "Death", "name_kr": "죽음", "emoji": "💀"},
    {"name": "Temperance", "name_kr": "절제", "emoji": "🍷"},
    {"name": "The Devil", "name_kr": "악마", "emoji": "👿"},
    {"name": "The Tower", "name_kr": "탑", "emoji": "🗼"},
    {"name": "The Star", "name_kr": "별", "emoji": "⭐"},
    {"name": "The Moon", "name_kr": "달", "emoji": "🌙"},
    {"name": "The Sun", "name_kr": "태양", "emoji": "☀️"},
    {"name": "Judgement", "name_kr": "심판", "emoji": "📯"},
    {"name": "The World", "name_kr": "세계", "emoji": "🌍"}
]

def generate_multiple_tarot_readings(reading_type: str, categories: list[str]) -> list[dict]:
    """
    Draws N unique random Tarot cards and generates interpretations for each given category using an LLM.
    """
    if not categories:
        return []

    # Draw unique cards
    drawn_cards = random.sample(TAROT_CARDS, len(categories))
    
    api_key_openai = os.environ.get("OPENAI_API_KEY")
    api_key_gemini = os.environ.get("GOOGLE_API_KEY")

    llm = None
    if api_key_openai:
        try:
            from langchain_openai import ChatOpenAI
            llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
        except Exception:
            pass
    elif api_key_gemini:
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.7)
        except Exception:
            pass

    import concurrent.futures

    def process_category(i, category):
        drawn_card = drawn_cards[i]
        
        if not llm:
            # Fallback
            return {
                "category": category,
                "card_name": drawn_card["name"],
                "card_name_kr": drawn_card["name_kr"],
                "emoji": drawn_card["emoji"],
                "interpretation": f"[{reading_type} - {category} 운세]\n\n당신이 뽑은 카드는 '{drawn_card['name_kr']}' 입니다. 뜻밖의 행운이 찾아올 수 있습니다. 기회를 받아들이세요."
            }

        try:
            prompt = ChatPromptTemplate.from_template(
                "당신은 공감 능력이 뛰어나고 통찰력 있는 전문 타로 리더입니다.\n"
                "사용자가 뽑은 타로 카드는 '{card_name_kr}' ({card_name}) 입니다.\n"
                "상담 종류(유효기간): {reading_type} (예: daily, monthly)\n"
                "질문 주제: {category}\n\n"
                "[작성 규칙]\n"
                "1. 부드럽고 따뜻한 존댓말로 작성해주세요.\n"
                "2. 앞부분에 뽑은 카드의 일반적인 상징 의미를 가볍게 설명하고,\n"
                "3. 곧바로 주제({category})와 연관지어 구체적이고 현실적인 조언과 처방을 3~4문단으로 작성해주세요.\n"
                "4. 불필요한 인사말이나 서론은 생략하고 바로 본론으로 들어가주세요."
            )

            chain = prompt | llm | StrOutputParser()
            
            reading_duration = "오늘 하루" if reading_type == "daily" else "이번 한 달"
            interpretation = chain.invoke({
                "card_name": drawn_card["name"],
                "card_name_kr": drawn_card["name_kr"],
                "reading_type": reading_duration,
                "category": category
            })

            return {
                "category": category,
                "card_name": drawn_card["name"],
                "card_name_kr": drawn_card["name_kr"],
                "emoji": drawn_card["emoji"],
                "interpretation": interpretation
            }

        except Exception as e:
            print(f"Tarot LLM Error for {category}: {e}")
            return {
                "category": category,
                "card_name": drawn_card["name"],
                "card_name_kr": drawn_card["name_kr"],
                "emoji": drawn_card["emoji"],
                "interpretation": f"선택하신 '{drawn_card['name_kr']}' 카드는 운명적인 흐름을 뜻합니다. 직관을 믿고 나아가세요. (로딩 시스템 에러: {str(e)})"
            }

    with concurrent.futures.ThreadPoolExecutor(max_workers=min(10, len(categories))) as executor:
        futures = [executor.submit(process_category, i, category) for i, category in enumerate(categories)]
        results = [future.result() for future in futures]

    return results
