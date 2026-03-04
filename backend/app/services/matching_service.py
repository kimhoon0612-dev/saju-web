from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import sqlalchemy
from app.models.market_models import ExpertProfile, User
from typing import Dict, Any, List, Optional

async def find_matching_experts(db: AsyncSession, saju_matrix: Dict[str, Any], concern: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    사용자의 사주 명식을 분석하여 가장 필요한 기운(오행)을 찾고,
    해당 기운의 특성을 지닌 전문가를 찾아 연결하는 'Smart Matching' 알고리즘.
    """
    # MVP 구현: 사용자의 오행 개수에서 가장 적은 오행을 '부족한 기운'으로 판정
    # 실제 환경에서는 형충파해나 조후 용신을 포함한 복합 계산 모델 적용 가능
    elements_count = {"wood": 0, "fire": 0, "earth": 0, "metal": 0, "water": 0}
    
    # 명식의 오행 합산 (간소화)
    for pillar in ["year_pillar", "month_pillar", "day_pillar", "time_pillar"]:
        p = saju_matrix.get(pillar, {})
        he = p.get("heavenly", {}).get("element")
        ee = p.get("earthly", {}).get("element")
        if he in elements_count: elements_count[he] += 1
        if ee in elements_count: elements_count[ee] += 1
        
    # 가장 적은 오행 도출
    weakest_element = min(elements_count, key=elements_count.get)
    element_kor_map = {
        "wood": "목", "fire": "화", "earth": "토", "metal": "금", "water": "수"
    }
    missing_kor = element_kor_map.get(weakest_element, "화")
    
    # Database Query: 해당 기운(Aura)을 보유하거나 사용자의 '고민(concern)' 특화인 전문가 검색
    stmt = select(ExpertProfile)
    
    # Build filter conditions
    conditions = [
        ExpertProfile.aura_element.contains(missing_kor),
        ExpertProfile.specialty.contains("오행보정"),
        ExpertProfile.specialty.contains("균형")
    ]
    
    if concern:
        # If user selected a concern (e.g., '재화/투자', '연애/궁합'), heavily weight it
        conditions.append(ExpertProfile.specialty.contains(concern))
        
    stmt = stmt.filter(sqlalchemy.or_(*conditions)).order_by(ExpertProfile.rating.desc()).limit(3)
    
    result = await db.execute(stmt)
    experts = result.scalars().all()
    
    response_list = []
    for exp in experts:
        response_list.append({
            "expert_id": exp.id,
            "display_name": exp.display_name,
            "specialty": exp.specialty,
            "short_bio": exp.short_bio,
            "aura_element": exp.aura_element,
            "rating": exp.rating,
            "price_per_session": exp.price_per_session,
            "match_reason": f"당신에게 부족한 '{missing_kor}({weakest_element})' 기운을 가진 전문가입니다."
        })
        
    return response_list
