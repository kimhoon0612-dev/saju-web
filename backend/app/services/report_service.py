from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import os
from openai import OpenAI

try:
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
except Exception:
    client = None

def generate_monthly_report(saju_params: Dict[str, Any], month_theme: str) -> str:
    """
    Generates a classical-literature inspired Monthly Investment/Health report.
    This uses the OpenAI API to synthesize RAG data (mocked here for simplicity) with the user's specific Saju.
    """
    if not client:
        # Fallback if no API key is set during development
        return f"""
# 📜 귀하의 월간 사주 리포트 (테스트)

이달의 테마 기운: **{month_theme}**

> "봄의 나무는 하늘을 찌르고, 가을의 금은 예리함을 뽐내니..." - 적천수

## 💼 투자 및 재물 향방
이번 달은 {month_theme}의 기운이 강하게 작용하여, 새로운 문서운이 들어옵니다. 무리한 확장보다는 내실을 기하는 보수적인 자금 운용이 유리합니다.

## 🌿 건강 및 웰니스
목(木) 기운이 자극받는 시기이므로, 간 건강과 스트레스 관리에 유의하세요. 아침 시간의 가벼운 산책이 백약보다 낫습니다.
"""

    prompt = f"""
    당신은 명리학 고전(적천수, 자평진전, 궁통보감 등)에 정통함과 동시에, 현대 금융 및 라이프스타일 트렌드를 완벽히 이해하고 있는 '최고급 사주/명리 컨설턴트'입니다.
    사용자의 사주 오행 데이터와 이번 달의 운세 기운을 바탕으로, VVIP 고객에게 제공하는 수준의 '상세하고 심도 깊은 프리미엄 월간 리포트'를 작성해주세요.
    
    [사용자 데이터]
    - 일간(Day Master) 정보: {saju_params.get('day_master', '알 수 없음')}
    - 사주 원국 전체 구조(JSON): {saju_params}
    - 이번 달의 주도적 기운: {month_theme}
    
    [필수 구성 및 분량 요구사항 (최소 1000자 이상 구성할 것)]
    1. **서문 및 고전의 지혜 (15%)**: 적천수나 자평진전 등의 구절을 직접 인용(원문 한자 포함)하여, 현재 사용자의 일간과 이번 달 기운의 만남을 철학적으로 깊이 있게 풀이하세요.
    2. **종합 운세 총평 (15%)**: 이번 달의 전반적인 에너지 흐름과 가장 신경 써야 할 테마 한 가지를 명확히 제시하세요.
    3. **💰 투자 및 재물/부동산 (25%)**: (가장 중요한 섹션)
        - 단순히 '좋다/나쁘다'가 아니라, 현금 보유 비율을 늘릴지, 부동산 문서 운이 있는지, 혹은 특정 섹터(주식, 채권 등) 에너지와 맞는지 구체적이고 현실적인 재무 행동 지침을 제시하세요.
        - 오행의 상생상극 원리를 자산 흐름에 빗대어 설명하세요.
    4. **💼 커리어 및 대인관계 (20%)**: 비즈니스 파트너십, 직장 내 포지셔닝, 귀인의 징후 유무를 설명하세요.
    5. **🌿 건강 및 웰니스 (15%)**: 이번 달 취약해질 수 있는 장기(오행 기준)와 이를 보완하기 위한 라이프스타일(추천 컬러, 방향, 음식, 운동 루틴)을 구체화하세요.
    6. **✨ 운명 스케줄러 핵심 조언 (10%)**: 이번 달 반드시 액션을 취해야 할 '베스트 윈도우(Best Window)'와 주의해야 할 시기를 요약 마무리하세요.

    [포맷 및 어조]
    - 풍성한 마크다운(Markdown) 문법을 적극 활용하세요. (h1, h2, 블록인용구, 리스트 떡칠 권장)
    - 문체는 정중하면서도 확신에 차 있으며, 논리 정연하고 전문적인(VVIP 금융/프라이빗 뱅커) 톤 앤 매너를 유지하세요.
    - 추상적인 위로보다는 '구체적이고 실존적인 가이드'를 제공해야 합니다.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a highly sought-after Bazi (Four Pillars of Destiny) master and wealth consultant generating exhaustive, premium monthly reports."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=2500
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating report: {e}")
        return "# 🚨 리포트 생성 오류\n현재 AI 분석 서버에 일시적인 장애가 있습니다. 잠시 후 다시 시도해주세요."
