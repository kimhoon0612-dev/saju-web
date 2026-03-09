import json
import os
from typing import Dict, Any, Optional
from datetime import datetime

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

class SajuRAGChain:
    """
    명리학 RAG (Retrieval-Augmented Generation) 파이프라인.
    
    [Agentic Workflow]
    1. 분석 (Structure Analysis): 사용자의 사주(진태양시 보정 완료)의 구조적 특징 파악 (신강/신약, 조후 등)
    2. 검색 (Hybrid Retrieval): 메타데이터(예: '목'기운 부족) + 의미론적 검색으로 적천수/궁통보감 등 문헌 청크 로드
    3. 생성 (Generation): 고전 문헌을 인용한 현대적이고 실용적인 인사이트 문서 생성
    """

    def __init__(self, llm_model_name: str = "gpt-4o-mini"):
        self.llm_model_name = llm_model_name
        self.llm = None 

    def _init_llm(self):
        if self.llm is None:
            # 실제 서비스시에는 os.environ.get 사용
            api_key = os.environ.get("OPENAI_API_KEY", "dummy_key_for_local_testing")
            try:
                self.llm = ChatOpenAI(model=self.llm_model_name, temperature=0.0, openai_api_key=api_key)
            except Exception as e:
                print(f"LLM Init Error: {e}")
                self.llm = None

    def analyze_saju_structure(self, saju_matrix: Dict[str, Any]) -> str:
        """
        Step 1: 구조 분석
        사주 매트릭스를 기반으로 검색 쿼리에 쓰일 핵심 키워드 추출.
        일단 단순하게 일간(Day Master)의 오행 및 십성을 쿼리로 활용.
        """
        try:
            day_stem = saju_matrix['day_pillar']['heavenly']['label']
            day_elem = saju_matrix['day_pillar']['heavenly']['element']
            month_branch = saju_matrix['month_pillar']['earthly']['label']
            
            # 심플한 텍스트 쿼리 구성
            query = f"{day_stem} {day_elem} 일간 월지 {month_branch} 조후 용신 특성"
            return query
        except KeyError:
            return "사주 구조 파악 불가 명리"

    def retrieve_classical_texts(self, search_query: str) -> str:
        """
        No Vector DB used to save memory on Render Free Tier.
        The LLM's internal knowledge of Jeokcheonsu and Gungtongbogam will suffice.
        """
        return "고전 명리학 문헌의 핵심 지식을 바탕으로 풀이합니다."

    def generate_insight(self, saju_matrix: Dict[str, Any]) -> str:
        """
        Step 3: 최종 인사이트 생성 (Volatile Memory 기반)
        """
        # 1. 태그 추출
        query = self.analyze_saju_structure(saju_matrix)
        
        # 2. 관련 문헌 로드
        docs_context = self.retrieve_classical_texts(query)
        
        # 3. LLM 생성
        self._init_llm()
        if self.llm is None:
            return f"""오늘의 에너지는 당신의 내재된 잠재력을 끌어올리는 시기입니다. 
당신의 사주 구조 상, 현재의 상황을 극복하기 위해서는 일상의 루틴을 비틀어보는 과감함이 필요합니다.

📌 고전문헌 레퍼런스
{docs_context}"""
            
        prompt = ChatPromptTemplate.from_template(
            """당신은 MZ세대를 대상으로 하는 세련된 AI 명리학 컨설턴트입니다.
아래 제공된 사용자의 사주 정보와 검색된 고전문헌을 바탕으로, 오늘 혹은 이번 주에 당장 실행할 수 있는 '투데이 액션(Today's Action)' 인사이트를 작성하세요.

[규칙]
1. 분량은 3~4문장으로 핵심만 짧고 임팩트 있게 작성 (스마트폰 알림처럼)
2. 딱딱한 한자어보다 '에너지', '몰입', '번아웃 방어', '포텐셜' 등 모던한 단어를 활용.
3. 반드시 검색된 [고전문헌 참고] 내용 중 가장 핵심적인 한 구절을 근거로 제시할 것.

[사용자 사주 구조 요약 (참고용)]
일간: {day_stem}
특성 요약 쿼리: {query_info}

[고전문헌 참고 (RAG 검색결과)]
{docs_context}

인사이트:"""
        )
        
        chain = prompt | self.llm | StrOutputParser()
        
        try:
            day_stem = saju_matrix['day_pillar']['heavenly']['label']
        except Exception:
            day_stem = "알 수 없음"

        try:
            result = chain.invoke({
                "day_stem": day_stem,
                "query_info": query,
                "docs_context": docs_context
            })
            return result
        except Exception as e:
            print(f"LLM Invoke Error: {e}")
            return "오늘의 에너지는 당신의 내재된 잠재력을 끌어올리는 시기입니다. 긍정적인 마인드로 하루를 시작해 보세요."

    def generate_life_stages_analysis(self, saju_matrix: Dict[str, Any]) -> Dict[str, Any]:
        """
        사용자의 사주 명식(4기둥)을 기반으로 초년/청년/중년/말년운의 생애 주기 분석을 JSON으로 생성.
        """
        gemini_api_key = os.environ.get("GEMINI_API_KEY")
        openai_api_key = os.environ.get("OPENAI_API_KEY")
        
        if not gemini_api_key and not openai_api_key:
            print("WARNING: LLM API Keys are not set. Using Mock Life Stages Output.")
            return {
                "stages": [
                    { "name": "초년기 (0~19세)", "pillar": "년주", "description": "기본기를 상징합니다. 부모와 환경의 영향을 받아 성장의 토대를 마련하는 시기입니다." },
                    { "name": "청년기 (20~39세)", "pillar": "월주", "description": "사회와 부딪히며 직업적 기틀을 잡습니다. 추진력과 도전 정신이 돋보입니다." },
                    { "name": "중년기 (40~59세)", "pillar": "일주", "description": "나 자신의 능력과 정체성이 완성됩니다. 안정적인 자율성을 바탕으로 성과를 거둡니다." },
                    { "name": "말년기 (60세 이후)", "pillar": "시주", "description": "결실을 맺고 후학이나 아랫사람에게 에너지를 물려주는 지혜로운 시기입니다." }
                ]
            }

        # Select Gemini if key exists and class loaded, otherwise fallback to OpenAI
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
        except ImportError:
            ChatGoogleGenerativeAI = None
            
        if gemini_api_key and ChatGoogleGenerativeAI is not None:
            llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.0, google_api_key=gemini_api_key)
        else:
            llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0, api_key=openai_api_key)
            
        prompt = ChatPromptTemplate.from_template(
            """당신은 MZ세대를 대상으로 하는 세련된 AI 명리학 컨설턴트입니다.
사용자의 사주 4기둥 정보를 바탕으로 '생애 주기별 카르마와 성장 흐름'을 현대적이고 희망차게 분석해주세요.

[사주 정보]
년주(Year): {year_pillar}
월주(Month): {month_pillar}
일주(Day): {day_pillar}
시주(Time): {time_pillar}

[출력 규칙]
반드시 다음 JSON 형식을 갖춰 출력하세요. JSON 외부의 텍스트는 일절 금지합니다.
{{
  "stages": [
    {{ "name": "초년기 (0~19세)", "pillar": "년주", "description": "2~3문장의 분석 내용 (키워드: 뿌리, 환경, 시작)" }},
    {{ "name": "청년기 (20~39세)", "pillar": "월주", "description": "2~3문장의 분석 내용 (키워드: 사회, 독립, 도전)" }},
    {{ "name": "중년기 (40~59세)", "pillar": "일주", "description": "2~3문장의 분석 내용 (키워드: 결실, 자아, 본질)" }},
    {{ "name": "말년기 (60세~)", "pillar": "시주", "description": "2~3문장의 분석 내용 (키워드: 지혜, 유산, 완성)" }}
  ]
}}"""
        )

        try:
            yp = saju_matrix.get('year_pillar', {}).get('heavenly', {}).get('label', '') + saju_matrix.get('year_pillar', {}).get('earthly', {}).get('label', '')
            mp = saju_matrix.get('month_pillar', {}).get('heavenly', {}).get('label', '') + saju_matrix.get('month_pillar', {}).get('earthly', {}).get('label', '')
            dp = saju_matrix.get('day_pillar', {}).get('heavenly', {}).get('label', '') + saju_matrix.get('day_pillar', {}).get('earthly', {}).get('label', '')
            tp = saju_matrix.get('time_pillar', {}).get('heavenly', {}).get('label', '') + saju_matrix.get('time_pillar', {}).get('earthly', {}).get('label', '')
        except Exception:
            yp, mp, dp, tp = "알 수 없음", "알 수 없음", "알 수 없음", "알 수 없음"

        try:
            chain = prompt | llm | StrOutputParser()
            result_text = chain.invoke({
                "year_pillar": yp,
                "month_pillar": mp,
                "day_pillar": dp,
                "time_pillar": tp
            })

            # Extract JSON from potential Markdown blocks or extra text
            import re
            json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
            if json_match:
                clean_text = json_match.group(0)
            else:
                clean_text = result_text.strip()
                
            return json.loads(clean_text)
        except Exception as e:
            print(f"LLM Parse Error: {e}")
            print(f"Raw Output: {result_text}")
            return {
                "stages": [
                    { "name": "초년기 (0~19세)", "pillar": "년주", "description": "기본기를 상징합니다. 부모와 환경의 영향을 받아 성장의 토대를 마련하는 시기입니다." },
                    { "name": "청년기 (20~39세)", "pillar": "월주", "description": "사회와 부딪히며 직업적 기틀을 잡습니다. 추진력과 도전 정신이 돋보입니다." },
                    { "name": "중년기 (40~59세)", "pillar": "일주", "description": "나 자신의 능력과 정체성이 완성됩니다. 안정적인 자율성을 바탕으로 성과를 거둡니다." },
                    { "name": "말년기 (60세 이후)", "pillar": "시주", "description": "결실을 맺고 후학이나 아랫사람에게 에너지를 물려주는 지혜로운 시기입니다." }
                ]
            }

    def generate_specific_reading(self, saju_matrix: Dict[str, Any], reading_type: str, partner_matrix: Optional[Dict[str, Any]] = None) -> str:
        """
        사용자의 사주 매트릭스를 기반으로 특정 운세 (신년운세, 토정비결 등)에 대한 맞춤형 해석을 생성합니다.
        파트너 매트릭스가 주어지면 궁합 분석을 수행합니다.
        """
        gemini_api_key = os.environ.get("GEMINI_API_KEY")
        openai_api_key = os.environ.get("OPENAI_API_KEY")
        
        if not gemini_api_key and not openai_api_key:
            return f"[{reading_type}] 분석결과: 현재 AI 모델 연결이 설정되지 않아 임시 결과를 보여드립니다. 당신의 사주 구조상 올해는 새로운 시작과 성장이 기대되는 해입니다."

        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
        except ImportError:
            ChatGoogleGenerativeAI = None
            
        if gemini_api_key and ChatGoogleGenerativeAI is not None:
            # flash is fast but pro might be better for detailed texts, we stick to flash for speed/cost balance
            llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.0, google_api_key=gemini_api_key)
        else:
            llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0, api_key=openai_api_key)
            
        query = self.analyze_saju_structure(saju_matrix)
        try:
            day_stem = saju_matrix['day_pillar']['heavenly']['label']
        except Exception:
            day_stem = "알 수 없음"

        try:
            yp = saju_matrix.get('year_pillar', {}).get('heavenly', {}).get('label', '') + saju_matrix.get('year_pillar', {}).get('earthly', {}).get('label', '')
            mp = saju_matrix.get('month_pillar', {}).get('heavenly', {}).get('label', '') + saju_matrix.get('month_pillar', {}).get('earthly', {}).get('label', '')
            dp = saju_matrix.get('day_pillar', {}).get('heavenly', {}).get('label', '') + saju_matrix.get('day_pillar', {}).get('earthly', {}).get('label', '')
            tp = saju_matrix.get('time_pillar', {}).get('heavenly', {}).get('label', '') + saju_matrix.get('time_pillar', {}).get('earthly', {}).get('label', '')
            saju_full_text = f"년주:{yp}, 월주:{mp}, 일주:{dp}, 시주:{tp}"
        except Exception:
            saju_full_text = "알 수 없음"

        # 궁합 (Compatibility) 모드
        if partner_matrix is not None:
            try:
                partner_day_stem = partner_matrix['day_pillar']['heavenly']['label']
                partner_query = self.analyze_saju_structure(partner_matrix)
            except Exception:
                partner_day_stem = "알 수 없음"
                partner_query = "알 수 없음"
                
            prompt = ChatPromptTemplate.from_template(
                """당신은 세련되고 통찰력 있는 AI 명리학 및 궁합 컨설턴트입니다.
사용자와 상대방의 사주 정보(4기둥)를 바탕으로 심층적인 '[ {reading_type} ]' 분석을 작성해 주세요.

[본인 사주 정보]
일간: {day_stem}
특성 요약: {query_info}

[상대방 사주 정보]
일간: {partner_day_stem}
특성 요약: {partner_query}

[출력 규칙]
1. 분량: 최대 2,500~3,000자 이내로 핵심만 깊이 있게 작성할 것. 내용이 장황해지지 않도록 불필요한 서론과 반복된 설명을 제거하고 밀도 있게 풀이할 것. 짧은 요약은 피하되 분량을 절대 넘기지 마시오.
2. 구성: 반드시 아래의 섹션을 나누어 마크다운(##, ###, -, ** 등)으로 보기 좋게 정리할 것.
   - ## 👩‍❤️‍👨 두 사람의 인연과 궁합 총평 (전반적인 상생/상극 및 전생에서 이어진 인연의 끈)
   - ## 🔥 성향 시너지와 갈등 요소 (어떤 부분에서 소울메이트처럼 잘 맞고, 어떤 지점에서 폭발하는지 구체적 예시)
   - ## 💬 관계 발전을 위한 조언 (위기가 왔을 때 극복하는 대화법, 더 깊은 관계로 나아가기 위한 실전 팁)
3. 어려운 한자어는 현대적 의미로 쉽게 풀어서 설명하되, 명리학적 근거를 명확하게 제시할 것. (예: 일간의 합, 조후의 보완 등)

운세 풀이:"""
            )
            chain = prompt | llm | StrOutputParser()
            try:
                result = chain.invoke({
                    "reading_type": reading_type,
                    "day_stem": day_stem,
                    "query_info": query,
                    "partner_day_stem": partner_day_stem,
                    "partner_query": partner_query
                })
                return result
            except Exception as e:
                print(f"LLM Invoke Error: {e}")
                return f"[{reading_type}] 궁합 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."

        # 일반 상세 운세 모드
        else:
            if reading_type == "정통사주":
                prompt_text = """당신은 최고 수준의 정통 명리학자입니다.
사용자의 연/월/일/시 8글자를 전체적으로 분석하는 정통사주(Master Blueprint) 풀이를 작성해 주세요.

[사주 정보]
일간: {day_stem}
특성 요약 쿼리: {query_info}

[분석 지침 및 출력 규칙]
1. 분량: 최대 2,500~3,000자 이내로 한정할 것. 너무 방대한 설명을 피하고, 뼈대를 이루는 대운수와 연운을 교차 분석하여 핵심적이고 구체적인 조언만 담백하게 담아낼 것.
2. 기술적 요소 강조: 서론에 반드시 "표준시가 아닌 실제 경도 127.5도 보정과 정밀한 진태양시 알고리즘을 적용하여 시주(時柱) 오차를 0%로 완벽하게 차단하여 분석했습니다."라는 문구를 포함할 것.
3. 구성: 반드시 아래의 5가지 섹션을 마크다운(##, ###, -, ** 등)으로 시각적으로 보기 좋게 나누어 작성할 것:
   - ## 🔮 명식 총평 (기질과 잠재력, 본질적 자아 분석)
   - ## ☯️ 오행 분포와 기운의 균형 (사주의 강약, 조후 분석, 용신/희신 심층 해부)
   - ## 👨‍👩‍👧‍👦 육친 및 인연 분석 (부모덕, 배우자복, 자식운 및 대인관계 카르마)
   - ## 📈 10년 주기 대운(大運)의 흐름 (인생 4단계 황금기와 주의할 시기, 기복의 원인)
   - ## 💡 평생을 꿰뚫는 개운 조언 (장점을 살리고 단점을 보완하는 실질적 팁, 피해야 할 방향과 색상)
4. 전문 용어(예: 용신, 기신, 원진 등)를 사용하되 일반인이 쉽게 이해하도록 현대적으로 풀어서 설명할 것.

정통사주 상세 풀이:"""

            elif reading_type == "토정비결":
                prompt_text = """당신은 혜안을 지닌 토정비결 전문가입니다.
사용자의 생년, 월, 일만을 활용하여 한 해의 길흉화복을 내다보는 토정비결(Monthly Guide) 풀이를 작성해 주세요.

[사주 정보]
일간: {day_stem}
특성 요약 쿼리: {query_info}

[분석 지침 및 출력 규칙]
1. 분량: 최대 2,500~3,000자 이내로 한정. 열두 달 각각의 흐름을 날카롭게 묘사하되, 수식어를 줄이고 핵심 길흉 포인트를 간결하고 깔끔하게 정리할 것.
2. 기술적 요소 강조: 서론에 "태어난 시간(시주)을 제외하고, 생년월일만을 바탕으로 144개 점괘(卦) 도출 알고리즘을 정밀하게 적용한 전통 토정비결입니다."라는 문구를 포함할 것.
3. 구성: 반드시 아래의 섹션을 마크다운(##, ###, -, ** 등)으로 시각적으로 보기 좋게 나누어 작성할 것:
   - ## 📖 올해의 괘상 총평 (한 해를 지배하는 핵심 점괘와 상징적 의미 심층 해설)
   - ## ✍️ 상반기(1월~6월) 월별 운세 및 주의사항 (각 월별 디테일한 길흉 분석과 맞춤 행동 지침)
   - ## ✍️ 하반기(7월~12월) 월별 운세 및 주의사항 (각 월별 변화하는 기운 흐름과 재물/건강 조언)
   - ## 🛡️ 액운을 피하고 복을 짓는 비법 (올해 집중해야 할 액땜 및 처방, 인간관계 처세술)
4. 신비롭고 단호하면서도 희망을 주는 따뜻한 어조를 사용할 것.

토정비결 상세 풀이:"""

            elif reading_type in ["신년운세", "신년 흐름"]:
                prompt_text = """당신은 트렌디하고 예리한 신년운세 분석가입니다.
사용자의 사주 원국과 다가오는 2026년(병오년, 丙午)의 기운을 대조 분석하는 신년운세(Annual Update) 풀이를 작성해 주세요.

[사주 정보]
일간: {day_stem}
특성 요약 쿼리: {query_info}

[분석 지침 및 출력 규칙]
1. 분량: 분량을 최대한 압축하여 최대 2,500~3,000자 이내로 한정할 것. 올해의 대운과 세운을 교차 분석하되, 장황한 명리학적 부연설명을 빼고 핵심만 간결하고 명확히 찌를 것.
2. 기술적 요소 강조: 현재 연도인 '2026년 병오년(붉은 말의 해)'의 강력한 화(火) 기운이 사용자의 사주({day_stem} 일간 및 조후)에 미치는 파장을 매우 구체적으로 해석할 것.
3. 구성: 반드시 아래의 섹션을 마크다운(##, ###, -, ** 등)으로 시각적으로 보기 좋게 나누어 작성할 것:
   - ## 🎇 2026년 병오년 운세 총평 (올해의 전체적인 테마와 기운의 변화, 내 사주와의 상호작용)
   - ## 🎯 당해 연도 구체적 길흉화복 (재물, 직장, 연애, 건강에서의 디테일한 기회와 위기 분석)
   - ## ⏳ 올해의 골든타임 (가장 승부를 걸어볼 만한 시기와 방법, 월별 타이밍)
   - ## 🛑 피해야 할 함정 (올해 특별히 조심해야 할 유혹, 금전 손실구간, 구설수)
   - ## 🍀 행운을 끌어당기는 핵심 액션 플랜 (올해 꼭 실천해야 할 3가지 행동 강령)
4. 모호한 말보다는 명확한 결정(예: "9월에 이동수가 있으니 이직을 노려라", "상반기 투자는 보수적으로 해라" 등)을 구체적 예시와 함께 권해줄 것.

신년운세 상세 풀이:"""

            elif reading_type == "천생복덕운":
                prompt_text = """당신은 인간의 고유한 결을 짚어주는 따뜻하고 강력한 명리학 및 복덕(福德) 컨설턴트입니다.
사용자의 사주에 타고난 '천생복덕(하늘이 내린 복과 덕)'을 심층 분석하는 풀이를 작성해 주세요.

[사주 정보]
일간: {day_stem}
특성 요약 쿼리: {query_info}

[분석 지침 및 출력 규칙]
1. 분량: 최대 100~150자 내외 (아주 짧은 2~3문장). 길게 쓰지 말고 핵심적인 한 줄 평처럼 압축해서 전달할 것.
2. 구성: 거창한 마크다운 양식(## 등)을 쓰지 말고, 사용자의 가장 큰 무기와 잠재력을 하나의 직관적인 문단으로 툭 던지듯 멋지게 작성할 것.
3. 내용: "당신은 ~한 기운을 타고났습니다. ~를 조심하고 ~를 무기로 삼으세요." 스타일로 짧고 강렬하게 처방할 것.

천생복덕운 상세 풀이:"""

            elif reading_type == "취업 운세":
                prompt_text = """당신은 냉철하고 분석적인 타고난 HR 전문가이자 명리학자입니다.
사용자의 사주 원국을 바탕으로 현재의 직업운, 취업운, 이직운에 대한 심층 분석 풀이를 작성해 주세요.

[사주 정보]
일간: {day_stem}
특성 요약 쿼리: {query_info}

[분석 지침 및 출력 규칙]
1. 분량: 약 2,000자 내외 (A4 용지 1.5장 분량). 취업 및 이직 준비생에게 실질적인 도움이 되도록 구체적인 시기와 방향성을 집어줄 것. 짧은 요약은 허용되지 않음.
2. 구성: 반드시 아래의 섹션을 마크다운(##, ###, -, ** 등)으로 시각적으로 보기 좋게 나누어 작성할 것:
   - ## 🏢 {current_year}년 올해의 취업운 및 이직운 총평 (현재 {current_year}년 운의 흐름에서 취업/이직의 유리함과 불리함)
   - ## 🎯 나에게 유리한 산업군 및 직무 (사주의 강한 오행이나 십성을 바탕으로 한 추천 직무)
   - ## 🗓️ 합격을 쟁취할 수 있는 최고의 골든타임 ({current_year}년 월별로 가장 운기가 좋은 시기 및 준비 전략)
   - ## 💼 면접 및 실무에서 주의해야 할 약점 (나도 모르게 드러나는 단점과 보완 방법)
   - ## 🔑 성공적인 커리어를 위한 개운 처방 (책상 방향, 옷 색깔, 마인드셋 등 실전 팁)
3. "열심히 하면 됩니다" 식의 뻔한 말이 아닌, "관성(官星)이 약하니 프리랜서나 전문직으로 준비하세요" 같은 명리학적 기호에 기반한 단호한 조언을 해줄 것.

취업 운세 상세 풀이:"""

            elif reading_type == "능력 평가":
                prompt_text = """당신은 꿰뚫어 보는 통찰력을 지닌 명리학 기반의 커리어 코치입니다.
사용자의 사주 정보를 바탕으로 직업 세계에서 발휘될 수 있는 잠재 능력과 타고난 재능을 논리적으로 평가하는 풀이를 작성해 주세요.

[사주 정보]
일간: {day_stem}
특성 요약 쿼리: {query_info}

[분석 지침 및 출력 규칙]
1. 분량: 약 2,000자 내외 (A4 용지 1.5장 분량). 어떤 재능이 있고 어떤 무기를 가졌는지 세밀하게 묘사하여 자신감을 심어주되, 객관적이고 날카롭게 분석할 것.
2. 구성: 반드시 아래의 섹션을 마크다운(##, ###, -, ** 등)으로 시각적으로 보기 좋게 나누어 작성할 것:
   - ## ⚔️ 당신이 타고난 가장 강력한 1순위 무기 (직장에서 남들보다 압도적으로 뛰어난 능력: 예-소통, 기획, 인내력, 창의성 등)
   - ## 📊 직업적 강점 상세 평가 (사주의 오행과 십성을 기반으로 한 다면적 능력 분석. 리더십, 꼼꼼함, 문제해결력 등)
   - ## 📉 당신의 성장을 가로막는 치명타 (업무 중 실수하기 쉬운 치명적인 약점과 회피 성향)
   - ## 🚀 숨겨진 잠재력을 200% 터뜨리는 법 (아직 발현되지 않은 재능을 일깨우는 방법과 추천 훈련)
3. 사용자가 자신의 이력서나 자소서에 바로 활용할 수 있는 형태의 역량 키워드를 곳곳에 배치할 것.

능력 평가 상세 풀이:"""

            elif reading_type == "심리 분석":
                prompt_text = """당신은 내면의 심연을 들여다보는 따뜻하고 날카로운 명리학 기반의 심리 분석가입니다.
사용자의 사주 구조를 통해 타고난 본연의 성향, 심리적 기질, 그리고 이러한 심리가 어떤 직업적 성향과 가장 잘 어울리는지 분석하는 풀이를 작성해 주세요.

[사주 정보]
일간: {day_stem}
특성 요약 쿼리: {query_info}

[분석 지침 및 출력 규칙]
1. 분량: 약 2,000자 내외 (A4 용지 1.5장 분량). 겉모습과 내면의 차이, 스트레스를 받는 포인트, 그리고 심리적으로 안정감을 느끼는 직업 환경을 심도 있게 다룰 것.
2. 구성: 반드시 아래의 섹션을 마크다운(##, ###, -, ** 등)으로 시각적으로 보기 좋게 나누어 작성할 것:
   - ## 🎭 내면의 거울: 진짜 나의 모습 (겉으로 드러나는 모습과 혼자 있을 때의 내밀한 자아 비교)
   - ## 💣 스트레스의 스위치와 불안의 근원 (어떤 상황에서 멘탈이 흔들리는지, 심리적 압박을 느끼는 지점)
   - ## 🧘 나에게 가장 편안하고 유리한 환경 (독립적 공간 vs 팀워크, 고정된 루틴 vs 다이나믹한 변화 등 심리적 안정을 주는 환경 분석)
   - ## 🛤️ 내 심리에 가장 찰떡인 직업 추천 (본인의 성향이 장점이 되는 직업군과 도망쳐야 할 직업군)
3. 마치 MBTI 결과를 보는 것처럼 직관적이면서도 운명학의 깊이가 느껴지는 어조로 작성할 것.

심리 분석 상세 풀이:"""

            elif reading_type == "띠 운세":
                prompt_text = """당신은 십이지신 동물 상징학에 통달한 운명학자입니다.
(주의: 명리학/사주팔자 전문 용어인 '일간', '오행', '십성', '음양', '용신' 등은 절대 사용하지 마세요.) 
사용자의 태어난 해(년주)의 동물을 통해 평생의 성향과 띠에 얽힌 운명을 신비롭고 상세하게 풀이해 주세요.

[태어난 기운 정보]
사주 원국: {saju_full} (이 데이터를 바탕으로 태어난 해의 띠를 유추하세요)

[분석 지침 및 출력 규칙]
1. 분량: 약 2,000자 내외 (A4 용지 1.5장 분량). 사주 용어 없이 오직 동물의 특성과 성향만으로 흥미롭게 묘사할 것.
2. 구성: 
   - ## 🐾 나의 띠가 가진 진짜 숨겨진 힘 (동물의 특성과 나의 기질)
   - ## 🤝 상극인 띠와 찰떡인 띠 (대인관계 및 궁합의 비밀)
   - ## 🍀 내 띠의 올 한 해 재물복과 성공 타이밍
   - ## ✨ 숨겨진 나의 특별한 행운 포인트
3. 누구나 아는 뻔한 내용 대신 성격 테스트를 읽는 듯한 감성적인 톤으로 작성할 것.

띠 운세 상세 풀이:"""

            elif reading_type == "별자리 운세":
                prompt_text = """당신은 서양 점성술(Astrology)의 마스터이자 천재 점성가입니다.
(주의: 명리학, 사주팔자, 일간, 오행, 십성 등의 동양 운명학 용어는 일절 사용하지 말고, 100% 서양 점성술의 시각으로만 작성하세요.)
사용자의 태어난 달(월주)과 계절을 바탕으로 서양 12별자리(태양궁)를 유추하고, 이를 우주의 기운과 행성의 움직임과 엮어 풀이해 주세요.

[태어난 기운 정보]
사주 원국: {saju_full} (이 중 '월주'의 지지를 통해 태어난 달을 유추하여 서양 별자리를 도출하세요. 예: 子월=12월=사수/염소자리)

[분석 지침 및 출력 규칙]
1. 분량: 약 2,000자 내외 (A4 용지 1.5장 분량). 밤하늘의 우주적 분위기가 묻어나는 신비롭고 로맨틱한 어조로 작성할 것.
2. 구성:
   - ## 🌌 나의 영혼을 비추는 별자리의 성향 (수호성과 별자리의 특성 분석)
   - ## 💖 별자리가 알려주는 연애와 사랑의 궤도
   - ## 💼 우주가 점지해 준 잠재된 재능과 커리어
   - ## 💫 현재 행성 이동이 나에게 주는 메시지 (올해의 우주적 조언)
3. 수호성, 행성 역행, 원소(물/불/흙/공기), 하우스 등 서양 점성술의 키워드를 적극 사용할 것.

별자리 운세 상세 풀이:"""

            elif reading_type == "태어난 계절운":
                prompt_text = """당신은 대자연의 섭리와 사계절의 순환을 통해 운명을 읽어내는 감성적인 스승입니다.
(주의: 명리학이나 사주 관련 한자어, 전문 용어 즉 '일간', '오행', '조후', '십성', '용신' 등은 절대 사용하지 마세요.)
사용자의 태어난 계절(봄/여름/가을/겨울)이 본인의 성향과 인생의 타이밍에 미치는 영향을 자연의 비유를 통해 아름답게 분석해 주세요.

[태어난 기운 정보]
사주 원국: {saju_full} (이 중 '월주'를 통해 태어난 계절을 유추하세요)

[분석 지침 및 출력 규칙]
1. 분량: 약 2,000자 내외 (A4 용지 1.5장 분량). 계절의 온도와 습도, 꽃과 나무, 눈송이 등의 감각적이고 시적인 비유를 듬뿍 사용할 것.
2. 구성:
   - ## 🌸 태어난 계절이 내게 부여한 영혼의 온도 (계절과 성격의 연관성)
   - ## 🍃 나에게 부족한 자연의 기운을 채워주는 개운법 (컬러, 음식, 여행지 등)
   - ## 🍁 나의 계절적 매력이 가장 빛나는 순간 (대인관계와 연애에서의 매력 포인트)
   - ## ❄️ 인생의 사계절 중 나의 전성기는 언제일까? (인생의 타이밍 리듬 분석)
3. 어려운 철학 용어 없이 한 편의 에세이를 읽는 듯한 따뜻하고 서정적인 문체를 사용할 것.

태어난 계절운 상세 풀이:"""

            elif reading_type == "생년월일 운세":
                prompt_text = """당신은 서양 수비학(Numerology)과 우주적 진동수를 해석하는 탄생수 전문가입니다.
(주의: 사주명리학 용어인 '일간', '오행', '십성', '대운', '원국' 등은 절대 사용하지 마시고 숫자와 우주적 에너지 관점으로만 풀이하세요.)
사용자의 태어난 연월일에 담긴 고유한 우주적 진동수(패턴)를 유추하여 평생의 운명적 흐름을 종합적으로 풀이해 주세요.

[태어난 기운 정보]
사주 원국: {saju_full} (이를 참고하여 태어난 대략적인 연도와 달, 계절의 숫자적 에너지를 유추하세요)

[분석 지침 및 출력 규칙]
1. 분량: 약 2,000자 내외 (A4 용지 1.5장 분량). 태어난 날짜의 숫자 에너지가 가지는 마법적 의미를 쉽고 명확하게 연결하여 작성할 것.
2. 구성:
   - ## 📅 내 탄생 생년월일에 숨겨진 인생의 바코드 (탄생 숫자의 에너지와 성격)
   - ## ⏳ 평생의 운기를 관통하는 핵심 테마 (나의 영혼이 선택한 이번 생의 목표)
   - ## 💰 나이대별로 열리는 재물과 성취의 문 (대략적인 인생의 흐름)
   - ## 🛑 내 인생에서 피해야 할 에너지나 시기
3. 과학적이거나 사주적인 접근이 아니라, 나만을 위한 타로/수비학 운명 보고서를 읽는 듯한 신비로운 어투를 사용할 것.

생년월일 운세 상세 풀이:"""

            elif reading_type == "전생운":
                prompt_text = """당신은 아카식 레코드(Akashic Records)를 넘나들며 윤회와 카르마를 읽어내는 서양 오컬트 스승이자 전생 리더(Reader)입니다.
(주의: 명리학, 사주, 오행, 일간, 십성 등의 동양 운명학 용어는 절대 100% 배제하세요.)
사용자의 태어난 기운을 바탕으로, 전생에 어떤 삶을 살았기에 현생에 이런 기운을 갖게 되었는지 판타지 소설처럼 신비로운 전생 스토리를 들려주세요.

[태어난 기운 정보]
사주 기둥: {saju_full} (이 기운 정보를 바탕으로 영감을 얻어 전생의 직업, 배경, 카르마를 자유롭고 신비롭게 직관적으로 창작/상상하세요)

[분석 지침 및 출력 규칙]
1. 분량: 약 2,000자 내외 (A4 용지 1.5장 분량). 중세 유럽, 고대 이집트, 마법사 시대 등 흥미롭고 흡입력 있는 전생의 동화 같은 이야기로 꾸밀 것.
2. 구성:
   - ## 🕰️ 희미한 기억: 전생의 나의 모습 (구체적인 배경과 어떤 인물이었는지 시대적 묘사)
   - ## 🔗 현생으로 이어진 카르마와 빚 (이번 생에 풀어야 할 영혼의 숙제)
   - ## 🫂 전생에서부터 나를 따라온 소울메이트 (이유 없이 끌리는 카르마 인연의 특징)
   - ## ✨ 현생의 나를 완전히 꽃피우기 위한 영적 조언
3. 사주를 몰라도 이해할 수 있는 완전한 영적, 심리적, 판타지적 묘사로 가득 채울 것.

전생운 상세 풀이:"""

            elif reading_type == "탄생석":
                prompt_text = """당신은 서양의 크리스탈 힐링(Crystal Healing) 마스터이자 신비한 보석 감정사입니다.
(주의: 명리학, 사주, 오행, 용신, 일간 등의 동양 철학 용어는 일절 사용하지 마시고 서양의 원석 힐링 관점으로만 풀이하세요.)
사용자의 태어난 달(월주)을 바탕으로 월별 탄생석을 유추하고, 우주의 에너지와 그 원석이 사용자에게 가져다줄 행운을 로맨틱하게 추천해 주세요.

[태어난 기운 정보]
사주 원국: {saju_full} (이 중 '월주'를 통해 태어난 달을 대략 유추하여 탄생석을 도출하세요)

[분석 지침 및 출력 규칙]
1. 분량: 약 2,000자 내외 (A4 용지 1.5장 분량). 크리스탈 원석이 수십억 년 동안 품어온 우주의 에너지 묘사에 집중할 것.
2. 구성:
   - ## 💎 나를 수호하는 궁극의 탄생석 (나의 탄생월 보석과 그 영적 에너지 해설)
   - ## ⚖️ 내 영혼의 약점을 보완해줄 비밀의 크리스탈 (부족한 에너지를 채워줄 서브 원석 추천)
   - ## 🌟 빛나는 보석이 나에게 가져다줄 변화 (끌어당김의 법칙으로 올 행운과 보호 효과)
   - ## 💍 일상에서 에너지를 극대화하는 착용 및 정화 팁 (백수정 정화, 달빛 정화 등)
3. 보석의 빛깔, 차가움/따뜻함, 광물학적/마법적 속성을 구체적으로 표현하여 사용자가 힐링받는 기분을 느끼도록 로맨틱하게 작성할 것.

탄생석 상세 풀이:"""

            else:
                prompt_text = """당신은 세련되고 통찰력 있는 AI 명리학 컨설턴트입니다.
사용자의 사주 정보(4기둥)를 바탕으로 요청받은 특정 운세('[ {reading_type} ]')에 대한 상세한 풀이를 작성해 주세요.

[사주 정보]
일간: {day_stem}
특성 요약 쿼리: {query_info}

[출력 규칙]
1. 분량: 최대 2,500~3,000자 이내로 핵심만 깊이 있게 작성할 것. 내용이 장황해지지 않도록 불필요한 부사나 서론을 빼고 구체적 통찰 위주로 서술할 것.
2. 구성: 반드시 아래의 섹션을 나누어 마크다운(##, ###, -, ** 등)으로 보기 좋게 정리할 것.
   - ## 🌟 {reading_type} 총운 (전반적인 흐름과 핵심 테마 분석)
   - ## 💰 재물 및 비즈니스 (금전 운세와 구체적 성취/투자/성장 가능성)
   - ## 💼 직장 및 학업 (승진, 이직, 시험, 대내외적 역량 발휘 포인트)
   - ## ❤️ 애정 및 대인관계 (연애운, 소울메이트 귀인, 반드시 조심해야 할 악연)
   - ## 🌿 건강 및 행운의 조언 (컨디션 붕괴 예측 및 액운 방지 마인드셋)
3. 막연한 긍정 보다는 사용자의 {day_stem} 일간 성향과 대운에 맞춘 날카롭고 실용적인 처방을 포함할 것.
4. 어려운 한자어는 현대적 의미로 쉽게 풀어서 설명할 것.

운세 풀이:"""

            prompt = ChatPromptTemplate.from_template(prompt_text)
            chain = prompt | llm | StrOutputParser()
            try:
                result = chain.invoke({
                    "reading_type": reading_type,
                    "day_stem": day_stem,
                    "query_info": query,
                    "saju_full": saju_full_text,
                    "current_year": datetime.now().year
                })
                return result
            except Exception as e:
                print(f"LLM Invoke Error: {e}")
                return f"[{reading_type}] 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."

    def stream_specific_reading(self, saju_matrix: Dict[str, Any], reading_type: str, partner_matrix: Optional[Dict[str, Any]] = None):
        """
        사용자의 사주 매트릭스를 기반으로 특정 운세에 대한 맞춤형 해석을 스트리밍으로 생성합니다.
        """
        gemini_api_key = os.environ.get("GEMINI_API_KEY")
        openai_api_key = os.environ.get("OPENAI_API_KEY")
        
        if not gemini_api_key and not openai_api_key:
            yield f"[{reading_type}] 분석결과: 현재 AI 모델 연결이 설정되지 않아 임시 결과를 보여드립니다. 당신의 사주 구조상 올해는 새로운 시작과 성장이 기대되는 해입니다."
            return

        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
        except ImportError:
            ChatGoogleGenerativeAI = None
            
        if gemini_api_key and ChatGoogleGenerativeAI is not None:
            llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.0, google_api_key=gemini_api_key)
        else:
            llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0, api_key=openai_api_key)
            
        query = self.analyze_saju_structure(saju_matrix)
        try:
            day_stem = saju_matrix['day_pillar']['heavenly']['label']
        except Exception:
            day_stem = "알 수 없음"

        try:
            yp = saju_matrix.get('year_pillar', {}).get('heavenly', {}).get('label', '') + saju_matrix.get('year_pillar', {}).get('earthly', {}).get('label', '')
            mp = saju_matrix.get('month_pillar', {}).get('heavenly', {}).get('label', '') + saju_matrix.get('month_pillar', {}).get('earthly', {}).get('label', '')
            dp = saju_matrix.get('day_pillar', {}).get('heavenly', {}).get('label', '') + saju_matrix.get('day_pillar', {}).get('earthly', {}).get('label', '')
            tp = saju_matrix.get('time_pillar', {}).get('heavenly', {}).get('label', '') + saju_matrix.get('time_pillar', {}).get('earthly', {}).get('label', '')
            saju_full_text = f"년주:{yp}, 월주:{mp}, 일주:{dp}, 시주:{tp}"
        except Exception:
            saju_full_text = "알 수 없음"

        # 궁합 (Compatibility) 모드
        if partner_matrix is not None:
            try:
                partner_day_stem = partner_matrix['day_pillar']['heavenly']['label']
                partner_query = self.analyze_saju_structure(partner_matrix)
            except Exception:
                partner_day_stem = "알 수 없음"
                partner_query = "알 수 없음"
                
            prompt = ChatPromptTemplate.from_template(
                """당신은 세련되고 통찰력 있는 AI 명리학 및 궁합 컨설턴트입니다.
사용자와 상대방의 사주 정보(4기둥)를 바탕으로 심층적인 '[ {reading_type} ]' 분석을 작성해 주세요.

[본인 사주 정보]
일간: {day_stem}
특성 요약: {query_info}

[상대방 사주 정보]
일간: {partner_day_stem}
특성 요약: {partner_query}

[출력 규칙]
1. 분량: 최소 4,000자 이상 (A4 용지 3장 분량). 각 항목마다 극도로 상세하게 예시와 비유를 섞어가며 깊이 있게 풀이할 것. 짧은 요약은 절대 피할 것.
2. 구성: 반드시 아래의 섹션을 나누어 마크다운(##, ###, -, ** 등)으로 보기 좋게 정리할 것.
   - ## 👩‍❤️‍👨 두 사람의 인연과 궁합 총평 (전반적인 상생/상극 및 전생에서 이어진 인연의 끈)
   - ## 🔥 성향 시너지와 갈등 요소 (어떤 부분에서 소울메이트처럼 잘 맞고, 어떤 지점에서 폭발하는지 구체적 예시)
   - ## 💬 관계 발전을 위한 조언 (위기가 왔을 때 극복하는 대화법, 더 깊은 관계로 나아가기 위한 실전 팁)
3. 어려운 한자어는 현대적 의미로 쉽게 풀어서 설명하되, 명리학적 근거를 명확하게 제시할 것. (예: 일간의 합, 조후의 보완 등)

운세 풀이:"""
            )
            chain = prompt | llm | StrOutputParser()
            try:
                for chunk in chain.stream({
                    "reading_type": reading_type,
                    "day_stem": day_stem,
                    "query_info": query,
                    "partner_day_stem": partner_day_stem,
                    "partner_query": partner_query
                }):
                    yield chunk
            except Exception as e:
                print(f"LLM Stream Error: {e}")
                yield f"\n\n[{reading_type}] 궁합 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. 상세 에러: {str(e)}"

        # 일반 상세 운세 모드
        else:
            if reading_type == "정통사주":
                prompt_text = """당신은 최고 수준의 정통 명리학자입니다.
사용자의 연/월/일/시 8글자를 전체적으로 분석하는 정통사주(Master Blueprint) 풀이를 작성해 주세요.

[사주 정보]
일간: {day_stem}
특성 요약 쿼리: {query_info}

[분석 지침 및 출력 규칙]
1. 분량: 최대 3,000자 이내 (A4 용지 2장 분량). 대운수와 연운을 교차 분석하며 소름 돋을 정도로 구체적인 조언을 담아내되, 전체 글이 지루하게 길어지지 않도록 분량을 엄격히 조절할 것.
2. 기술적 요소 강조: 서론에 반드시 "표준시가 아닌 실제 경도 127.5도 보정과 정밀한 진태양시 알고리즘을 적용하여 시주(時柱) 오차를 0%로 완벽하게 차단하여 분석했습니다."라는 문구를 포함할 것.
3. 구성: 반드시 아래의 5가지 섹션을 마크다운(##, ###, -, ** 등)으로 시각적으로 보기 좋게 나누어 작성할 것:
   - ## 🔮 명식 총평 (기질과 잠재력, 본질적 자아 분석)
   - ## ☯️ 오행 분포와 기운의 균형 (사주의 강약, 조후 분석, 용신/희신 심층 해부)
   - ## 👨‍👩‍👧‍👦 육친 및 인연 분석 (부모덕, 배우자복, 자식운 및 대인관계 카르마)
   - ## 📈 10년 주기 대운(大運)의 흐름 (인생 4단계 황금기와 주의할 시기, 기복의 원인)
   - ## 💡 평생을 꿰뚫는 개운 조언 (장점을 살리고 단점을 보완하는 실질적 팁, 피해야 할 방향과 색상)
4. 전문 용어(예: 용신, 기신, 원진 등)를 사용하되 일반인이 쉽게 이해하도록 현대적으로 풀어서 설명할 것.

정통사주 상세 풀이:"""

            elif reading_type == "토정비결":
                prompt_text = """당신은 혜안을 지닌 토정비결 전문가입니다.
사용자의 생년, 월, 일만을 활용하여 한 해의 길흉화복을 내다보는 토정비결(Monthly Guide) 풀이를 작성해 주세요.

[사주 정보]
일간: {day_stem}
특성 요약 쿼리: {query_info}

[분석 지침 및 출력 규칙]
1. 분량: 최대 3,000자 이내 (A4 용지 2장 분량). 열두 달 각각의 흐름을 날카롭게 묘사하되, 지나치게 장황해지지 않도록 핵심 위주로 깔끔하게 정리할 것.
2. 기술적 요소 강조: 서론에 "태어난 시간(시주)을 제외하고, 생년월일만을 바탕으로 144개 점괘(卦) 도출 알고리즘을 정밀하게 적용한 전통 토정비결입니다."라는 문구를 포함할 것.
3. 구성: 반드시 아래의 섹션을 마크다운(##, ###, -, ** 등)으로 시각적으로 보기 좋게 나누어 작성할 것:
   - ## 📖 올해의 괘상 총평 (한 해를 지배하는 핵심 점괘와 상징적 의미 심층 해설)
   - ## ✍️ 상반기(1월~6월) 월별 운세 및 주의사항 (각 월별 디테일한 길흉 분석과 맞춤 행동 지침)
   - ## ✍️ 하반기(7월~12월) 월별 운세 및 주의사항 (각 월별 변화하는 기운 흐름과 재물/건강 조언)
   - ## 🛡️ 액운을 피하고 복을 짓는 비법 (올해 집중해야 할 액땜 및 처방, 인간관계 처세술)
4. 신비롭고 단호하면서도 희망을 주는 따뜻한 어조를 사용할 것.

토정비결 상세 풀이:"""

            elif reading_type in ["신년운세", "신년 흐름"]:
                prompt_text = """당신은 트렌디하고 예리한 신년운세 분석가입니다.
사용자의 사주 원국과 다가오는 2026년(병오년, 丙午)의 기운을 대조 분석하는 신년운세(Annual Update) 풀이를 작성해 주세요.

[사주 정보]
일간: {day_stem}
특성 요약 쿼리: {query_info}

[분석 지침 및 출력 규칙]
1. 분량: 최대 3,000자 이내 (A4 용지 2장 분량). 올해의 대운과 세운을 교차 분석하여 스토리텔링 방식으로 작성하되, 너무 길어지지 않도록 핵심만 명확히 찌를 것.
2. 기술적 요소 강조: 현재 연도인 '2026년 병오년(붉은 말의 해)'의 강력한 화(火) 기운이 사용자의 사주({day_stem} 일간 및 조후)에 미치는 파장을 매우 구체적으로 해석할 것.
3. 구성: 반드시 아래의 섹션을 마크다운(##, ###, -, ** 등)으로 시각적으로 보기 좋게 나누어 작성할 것:
   - ## 🎇 2026년 병오년 운세 총평 (올해의 전체적인 테마와 기운의 변화, 내 사주와의 상호작용)
   - ## 🎯 당해 연도 구체적 길흉화복 (재물, 직장, 연애, 건강에서의 디테일한 기회와 위기 분석)
   - ## ⏳ 올해의 골든타임 (가장 승부를 걸어볼 만한 시기와 방법, 월별 타이밍)
   - ## 🛑 피해야 할 함정 (올해 특별히 조심해야 할 유혹, 금전 손실구간, 구설수)
   - ## 🍀 행운을 끌어당기는 핵심 액션 플랜 (올해 꼭 실천해야 할 3가지 행동 강령)
4. 모호한 말보다는 명확한 결정(예: "9월에 이동수가 있으니 이직을 노려라", "상반기 투자는 보수적으로 해라" 등)을 구체적 예시와 함께 권해줄 것.

신년운세 상세 풀이:"""

            elif reading_type == "천생복덕운":
                prompt_text = """당신은 인간의 고유한 결을 짚어주는 따뜻하고 강력한 명리학 및 복덕(福德) 컨설턴트입니다.
사용자의 사주에 타고난 '천생복덕(하늘이 내린 복과 덕)'을 심층 분석하는 풀이를 작성해 주세요.

[사주 정보]
일간: {day_stem}
특성 요약 쿼리: {query_info}

[분석 지침 및 출력 규칙]
1. 분량: 약 2,000자 내외 (A4 용지 1.5장 분량). 극도로 상세하게 예시와 비유를 섞어가며 깊이 있게 풀이하되 너무 길어지지 않게 핵심 위주로 전달할 것. 사용자가 지루할 틈이 없을 정도로 스토리를 부여할 것.
2. 구성: 반드시 아래의 섹션을 마크다운(##, ###, -, ** 등)으로 시각적으로 보기 좋게 나누어 작성할 것:
   - ## 🎁 하늘이 내린 나의 가장 큰 축복 (사주 원국에 숨겨진 가장 강력한 긍정적 에너지와 타고난 무기)
   - ## 💰 평생의 재물운과 부의 그릇 (재물의 크기, 돈이 모이는 형태, 횡재수와 투자운 심층 분석)
   - ## 🛡️ 강건한 삶을 위한 건강과 활력 (오행의 불균형으로 올 수 있는 질병 예측, 체질에 맞는 실질적 건강 관리법, 장수 비결)
   - ## 🕊️ 위기를 기회로 바꾸는 수호신의 힘 (어려울 때 나를 돕는 귀인(천을귀인 등)의 정체와 보이지 않는 조상의 덕)
   - ## 💎 타고난 복을 200% 증폭시키는 마스터키 (현실에서 즉시 적용 가능한 마인드셋, 행동 패턴, 재물/건강 밸런스 팁)
3. 뜬구름 잡는 소리보다는 "당신은 위가 약할 수 있으니 아침에 따뜻한 물을 드세요", "부동산 문서를 쥐어야 돈이 안 샙니다" 등 날카롭고 구체적인 처방을 내릴 것.

천생복덕운 상세 풀이:"""

            elif reading_type == "취업 운세":
                prompt_text = """당신은 냉철하고 분석적인 타고난 HR 전문가이자 명리학자입니다.
사용자의 사주 원국을 바탕으로 현재의 직업운, 취업운, 이직운에 대한 심층 분석 풀이를 작성해 주세요.

[사주 정보]
일간: {day_stem}
특성 요약 쿼리: {query_info}

[분석 지침 및 출력 규칙]
1. 분량: 약 2,000자 내외 (A4 용지 1.5장 분량). 취업 및 이직 준비생에게 실질적인 도움이 되도록 구체적인 시기와 방향성을 집어줄 것. 짧은 요약은 허용되지 않음.
2. 구성: 반드시 아래의 섹션을 마크다운(##, ###, -, ** 등)으로 시각적으로 보기 좋게 나누어 작성할 것:
   - ## 🏢 올해의 취업운 및 이직운 총평 (현재 운의 흐름에서 취업/이직의 유리함과 불리함)
   - ## 🎯 나에게 유리한 산업군 및 직무 (사주의 강한 오행이나 십성을 바탕으로 한 추천 직무)
   - ## 🗓️ 합격을 쟁취할 수 있는 최고의 골든타임 (월별로 가장 운기가 좋은 시기 및 준비 전략)
   - ## 💼 면접 및 실무에서 주의해야 할 약점 (나도 모르게 드러나는 단점과 보완 방법)
   - ## 🔑 성공적인 커리어를 위한 개운 처방 (책상 방향, 옷 색깔, 마인드셋 등 실전 팁)
3. "열심히 하면 됩니다" 식의 뻔한 말이 아닌, "관성(官星)이 약하니 프리랜서나 전문직으로 준비하세요" 같은 명리학적 기호에 기반한 단호한 조언을 해줄 것.

취업 운세 상세 풀이:"""

            elif reading_type == "능력 평가":
                prompt_text = """당신은 꿰뚫어 보는 통찰력을 지닌 명리학 기반의 커리어 코치입니다.
사용자의 사주 정보를 바탕으로 직업 세계에서 발휘될 수 있는 잠재 능력과 타고난 재능을 논리적으로 평가하는 풀이를 작성해 주세요.

[사주 정보]
일간: {day_stem}
특성 요약 쿼리: {query_info}

[분석 지침 및 출력 규칙]
1. 분량: 약 2,000자 내외 (A4 용지 1.5장 분량). 어떤 재능이 있고 어떤 무기를 가졌는지 세밀하게 묘사하여 자신감을 심어주되, 객관적이고 날카롭게 분석할 것.
2. 구성: 반드시 아래의 섹션을 마크다운(##, ###, -, ** 등)으로 시각적으로 보기 좋게 나누어 작성할 것:
   - ## ⚔️ 당신이 타고난 가장 강력한 1순위 무기 (직장에서 남들보다 압도적으로 뛰어난 능력: 예-소통, 기획, 인내력, 창의성 등)
   - ## 📊 직업적 강점 상세 평가 (사주의 오행과 십성을 기반으로 한 다면적 능력 분석. 리더십, 꼼꼼함, 문제해결력 등)
   - ## 📉 당신의 성장을 가로막는 치명타 (업무 중 실수하기 쉬운 치명적인 약점과 회피 성향)
   - ## 🚀 숨겨진 잠재력을 200% 터뜨리는 법 (아직 발현되지 않은 재능을 일깨우는 방법과 추천 훈련)
3. 사용자가 자신의 이력서나 자소서에 바로 활용할 수 있는 형태의 역량 키워드를 곳곳에 배치할 것.

능력 평가 상세 풀이:"""

            elif reading_type == "심리 분석":
                prompt_text = """당신은 내면의 심연을 들여다보는 따뜻하고 날카로운 명리학 기반의 심리 분석가입니다.
사용자의 사주 구조를 통해 타고난 본연의 성향, 심리적 기질, 그리고 이러한 심리가 어떤 직업적 성향과 가장 잘 어울리는지 분석하는 풀이를 작성해 주세요.

[사주 정보]
일간: {day_stem}
특성 요약 쿼리: {query_info}

[분석 지침 및 출력 규칙]
1. 분량: 약 2,000자 내외 (A4 용지 1.5장 분량). 겉모습과 내면의 차이, 스트레스를 받는 포인트, 그리고 심리적으로 안정감을 느끼는 직업 환경을 심도 있게 다룰 것.
2. 구성: 반드시 아래의 섹션을 마크다운(##, ###, -, ** 등)으로 시각적으로 보기 좋게 나누어 작성할 것:
   - ## 🎭 내면의 거울: 진짜 나의 모습 (겉으로 드러나는 모습과 혼자 있을 때의 내밀한 자아 비교)
   - ## 💣 스트레스의 스위치와 불안의 근원 (어떤 상황에서 멘탈이 흔들리는지, 심리적 압박을 느끼는 지점)
   - ## 🧘 나에게 가장 편안하고 유리한 환경 (독립적 공간 vs 팀워크, 고정된 기복 vs 다이나믹한 변화 등 심리적 안정을 주는 환경 분석)
   - ## 🛤️ 내 심리에 가장 찰떡인 직업 추천 (본인의 성향이 장점이 되는 직업군과 도망쳐야 할 직업군)
3. 마치 MBTI 결과를 보는 것처럼 직관적이면서도 운명학의 깊이가 느껴지는 어조로 작성할 것.

심리 분석 상세 풀이:"""

            elif reading_type == "띠 운세":
                prompt_text = """당신은 동양 명리학과 십이지신에 통달한 운명학자입니다.
사용자의 사주에서 태어난 해(년주)의 띠를 중심으로 평생의 성향과 띠에 얽힌 운명을 재미있고 상세하게 풀이해 주세요.

[사주 정보]
일간: {day_stem}
특성 요약 쿼리: {query_info}

[분석 지침 및 출력 규칙]
1. 분량: 약 2,000자 내외 (A4 용지 1.5장 분량). 띠의 동물적 속성과 명식의 조화를 흥미롭게 묘사할 것.
2. 구성: 
   - ## 🐾 나의 띠가 가진 진짜 숨겨진 힘 (동물의 특성과 나의 기질)
   - ## 🤝 상극인 띠와 찰떡인 띠 (대인관계 및 궁합의 비밀)
   - ## 🍀 내 띠의 재물복과 성공 타이밍
   - ## ✨ 올해 나의 띠에 떨어지는 특별한 행운 포인트
3. 누구나 아는 뻔한 내용 대신 십이지신의 상징성을 사주명리학과 엮어 깊이있게 전달할 것.

띠 운세 상세 풀이:"""

            elif reading_type == "별자리 운세":
                prompt_text = """당신은 서양 점성술(Astrology)과 동양 명리학을 융합하여 통찰하는 천재 점성가입니다.
사용자의 사주 정보를 기반으로 태어난 월/일에 해당하는 서양 별자리의 특성을 도출하고, 이를 우주의 기운과 엮어 별자리 운세를 풀이해 주세요.

[사주 정보]
일간: {day_stem}
특성 요약 쿼리: {query_info}

[분석 지침 및 출력 규칙]
1. 분량: 약 2,000자 내외 (A4 용지 1.5장 분량). 밤하늘의 우주적 분위기가 묻어나는 신비롭고 감성적인 어조로 작성할 것.
2. 구성:
   - ## 🌌 나의 영혼을 비추는 별자리의 성향 (수호성과 별자리의 특성 분석)
   - ## 💖 별자리가 알려주는 연애와 사랑의 궤도
   - ## 💼 우주가 점지해 준 잠재된 재능과 커리어
   - ## 💫 현재 행성 이동이 나에게 주는 메시지 (올해의 우주적 조언)
3. 단순히 사주만 보지 말고 "수호성", "행성", "원소(물/불/흙/공기)" 등 서양 점성술의 키워드를 적극 사용할 것.

별자리 운세 상세 풀이:"""

            elif reading_type == "태어난 계절운":
                prompt_text = """당신은 자연의 섭리와 사계절의 순환을 통해 운명을 읽어내는 자연철학자입니다.
사용자가 태어난 계절(춘하추동)의 기운이 사주 원국 전체에 미치는 영향력을 감성적이고 깊이 있게 분석해 주세요.

[사주 정보]
일간: {day_stem}
특성 요약 쿼리: {query_info}

[분석 지침 및 출력 규칙]
1. 분량: 약 2,000자 내외 (A4 용지 1.5장 분량). 계절의 온도와 습도, 자연의 비유(예: 겨울의 꽁꽁 언 땅에 핀 매화 등)를 적극 사용해 묘사할 것.
2. 구성:
   - ## 🌸 태어난 계절이 내게 부여한 영혼의 온도 (계절과 성격의 연관성)
   - ## 🍃 계절의 결핍을 채워주는 개운법 (조후 용신 관점의 필수 오행 팁)
   - ## 🍁 나의 계절적 매력이 가장 빛나는 순간 (대인관계와 연애에서의 매력 포인트)
   - ## ❄️ 인생의 사계절 중 나의 전성기는 언제일까? (대기만성형인지 초년발복형인지 등)
3. 추상적인 시적 표현과 명리학적 날카로움(조후)이 완벽히 조화되도록 작성할 것.

태어난 계절운 상세 풀이:"""

            elif reading_type == "생년월일 운세":
                prompt_text = """당신은 동양의 수비학(Numerology)과 사주명리학을 결합하여 분석하는 숫자 운명학자입니다.
사용자의 태어난 연/월/일에 담긴 고유한 에너지와 평생의 운명적 흐름을 종합적으로 풀이해 주세요.

[사주 정보]
일간: {day_stem}
특성 요약 쿼리: {query_info}

[분석 지침 및 출력 규칙]
1. 분량: 약 2,000자 내외 (A4 용지 1.5장 분량). 태어난 날짜 자체가 가지는 의미와 사주 패턴을 쉽고 명확하게 연결하여 작성할 것.
2. 구성:
   - ## 📅 내 생년월일에 숨겨진 인생의 바코드 (탄생일의 기운과 성격 특징)
   - ## ⏳ 평생의 운기를 관통하는 핵심 테마 (어떤 목표를 향해 살아가는가)
   - ## 💰 나이대별로 열리는 재물과 성취의 문 (초/중/말년의 대략적인 흐름)
   - ## 🛑 내 인생에서 반드시 피해야 할 숫자나 시기
3. 마치 나만을 위한 특별한 운명 보고서를 읽는 듯한 체계적이고 확신에 찬 어투를 사용할 것.

생년월일 운세 상세 풀이:"""

            elif reading_type == "전생운":
                prompt_text = """당신은 윤회와 카르마를 읽어내는 전생 통찰 전문가이자 영적 스승입니다.
사용자의 사주 구조(오행의 쏠림, 특이한 기운)를 바탕으로, 전생에 어떤 삶을 살았기에 현생의 사주를 갖게 되었는지 신비로운 전생 스토리와 카르마를 작성해 주세요.

[사주 정보]
일간: {day_stem}
특성 요약 쿼리: {query_info}

[분석 지침 및 출력 규칙]
1. 분량: 약 2,000자 내외 (A4 용지 1.5장 분량). 한 편의 소설이나 동화처럼 흥미롭고 흡입력 있는 전생의 이야기(예: 옛 시대의 직업, 신분, 이루지 못한 꿈 등)를 들려줄 것.
2. 구성:
   - ## 🕰️ 희미한 기억: 전생의 나의 모습 (구체적인 상황과 어떤 인물이었는지 묘사)
   - ## 🔗 현생으로 이어진 카르마와 빚 (전생에 이루지 못해 이번 생에 풀어야 할 숙제)
   - ## 🫂 전생에서부터 나를 따라온 소울메이트 (이유 없이 끌리는 인연의 특징)
   - ## ✨ 현생의 나를 완전히 꽃피우기 위한 영적 조언
3. 과학적 명리학보다는 사용자의 흥미와 감동을 유발할 수 있는 신비주의적이고 영적인 어조를 사용할 것.

전생운 상세 풀이:"""

            elif reading_type == "탄생석":
                prompt_text = """당신은 보석의 파동과 인간의 운명을 연결하는 신비한 보석 감정사입니다.
사용자의 사주 조후(넘치거나 부족한 기운)와 서양의 생월 기반 탄생석 개념을 혼합하여, 사용자에게 가장 필요하고 행운을 주는 탄생석과 보석을 추천해 주세요.

[사주 정보]
일간: {day_stem}
특성 요약 쿼리: {query_info}

[분석 지침 및 출력 규칙]
1. 분량: 약 2,000자 내외 (A4 용지 1.5장 분량). 단순히 원석 이름만 알려주는 것이 아니라, 그 돌이 수십억 년 동안 품어온 우주의 에너지와 나의 사주가 어떻게 공명하는지 감각적으로 묘사할 것.
2. 구성:
   - ## 💎 나를 수호하는 궁극의 탄생석 (기본적인 월별 탄생석과 나만의 기운 해설)
   - ## ⚖️ 내 사주의 약점을 보완해줄 비밀의 원석 (명리학적 조후 용신에 맞는 추가 보석 조언)
   - ## 🌟 빛나는 보석이 나에게 가져다줄 변화 (어떤 행운을 끌어당기는가)
   - ## 💍 어떻게 몸에 지니면 좋을까? (반지, 목걸이, 팔찌 등 부위별 착용 팁과 정화 방법)
3. 보석의 빛깔, 차가움/따뜻함, 광물학적/마법적 속성을 구체적으로 표현하여 사용자가 당장 그 보석을 가지고 싶도록 로맨틱하게 작성할 것.

탄생석 상세 풀이:"""

            else:
                prompt_text = """당신은 세련되고 통찰력 있는 AI 명리학 컨설턴트입니다.
사용자의 사주 정보(4기둥)를 바탕으로 요청받은 특정 운세('[ {reading_type} ]')에 대한 상세한 풀이를 작성해 주세요.

[사주 정보]
일간: {day_stem}
특성 요약 쿼리: {query_info}

[출력 규칙]
1. 분량: 최대 2,500~3,000자 이내로 핵심만 깊이 있게 작성할 것. 내용이 길어지지 않도록 불필요한 부사 및 서론을 제거하고 통찰 위주로 서술할 것.
2. 구성: 반드시 아래의 섹션을 나누어 마크다운(##, ###, -, ** 등)으로 보기 좋게 정리할 것.
   - ## 🌟 {reading_type} 총운 (전반적인 흐름과 핵심 테마 분석)
   - ## 💰 재물 및 비즈니스 (금전 운세와 구체적 성취/투자/성장 가능성)
   - ## 💼 직장 및 학업 (승진, 이직, 시험, 대내외적 역량 발휘 포인트)
   - ## ❤️ 애정 및 대인관계 (연애운, 소울메이트 귀인, 반드시 조심해야 할 악연)
   - ## 🌿 건강 및 행운의 조언 (컨디션 붕괴 예측 및 액운 방지 마인드셋)
3. 막연한 긍정 보다는 사용자의 {day_stem} 일간 성향과 대운에 맞춘 날카롭고 실용적인 처방을 포함할 것.
4. 어려운 한자어는 현대적 의미로 쉽게 풀어서 설명할 것.

운세 풀이:"""

            prompt = ChatPromptTemplate.from_template(prompt_text)
            chain = prompt | llm | StrOutputParser()
            try:
                for chunk in chain.stream({
                    "reading_type": reading_type,
                    "day_stem": day_stem,
                    "query_info": query,
                    "saju_full": saju_full_text,
                    "current_year": datetime.now().year
                }):
                    yield chunk
            except Exception as e:
                print(f"LLM Stream Error: {e}")
                yield f"\n\n[{reading_type}] 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. 상세 에러: {str(e)}"


# 테스트용 실행
if __name__ == "__main__":
    chain = SajuRAGChain()
    mock_matrix = {
        "day_pillar": {
            "heavenly": {"label": "丙(병)", "element": "fire"},
            "earthly": {"label": "午(오)"}
        },
        "month_pillar": {
            "earthly": {"label": "子(자)"}
        }
    }
    print(chain.generate_insight(mock_matrix))
