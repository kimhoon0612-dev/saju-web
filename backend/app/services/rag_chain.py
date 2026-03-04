import json
import os
from typing import Dict, Any

from langchain_openai import ChatOpenAI
try:
    from langchain_chroma import Chroma
except Exception as e:
    print(f"ChromaDB import failed: {e}")
    Chroma = None
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None

try:
    from langchain_google_genai import ChatGoogleGenerativeAI
except ImportError:
    ChatGoogleGenerativeAI = None

# 로컬 임베딩용 래퍼 클래스
class LocalHuggingFaceEmbeddings:
    def __init__(self, model_name: str = "jhgan/ko-sbert-nli"):
        self.model = SentenceTransformer(model_name)
        
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return self.model.encode(texts).tolist()

    def embed_query(self, text: str) -> list[float]:
        return self.model.encode(text).tolist()

class SajuRAGChain:
    """
    명리학 RAG (Retrieval-Augmented Generation) 파이프라인.
    
    [Agentic Workflow]
    1. 분석 (Structure Analysis): 사용자의 사주(진태양시 보정 완료)의 구조적 특징 파악 (신강/신약, 조후 등)
    2. 검색 (Hybrid Retrieval): 메타데이터(예: '목'기운 부족) + 의미론적 검색으로 적천수/궁통보감 등 문헌 청크 로드
    3. 생성 (Generation): 고전 문헌을 인용한 현대적이고 실용적인 인사이트 문서 생성
    """

    def __init__(self, llm_model_name: str = "gpt-4o-mini", db_path: str = "./chroma_db"):
        self.llm_model_name = llm_model_name
        self.db_path = db_path
        
        # 실제 운영에서는 os.environ.get("OPENAI_API_KEY") 확인
        # 여기서는 LLM 초기화를 지연시키기 위해 None으로 둠 (API 키 없을 시 대비)
        self.llm = None 
        
        # Load Local Vector DB
        try:
            self.embeddings = LocalHuggingFaceEmbeddings()
            self.vector_store = Chroma(
                collection_name="classical_saju_texts",
                embedding_function=self.embeddings,
                persist_directory=self.db_path
            )
        except Exception as e:
            print(f"Failed to load Vector DB: {e}")
            self.vector_store = None

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
        Step 2: 하이브리드 검색 (Vector DB 호출)
        """
        if not self.vector_store:
            return "[데이터베이스 연결 실패] 적천수: 甲木參天 脫胎要火 (갑목은 성장을 위해 반드시 화가 필요함)"
            
        # 상위 2개 유사 문서 검색
        results = self.vector_store.similarity_search(search_query, k=2)
        
        if not results:
            return "[검색 결과 없음] 관련 고전 문헌을 찾을 수 없습니다."
            
        context_str = ""
        for i, doc in enumerate(results):
            context_str += f"- 출처: {doc.metadata.get('source', '알 수 없음')}\n"
            context_str += f"- 원문: {doc.metadata.get('original_text', '')}\n"
            context_str += f"- 해설: {doc.metadata.get('modern_meaning', '')}\n\n"
            
        return context_str

    def generate_insight(self, saju_matrix: Dict[str, Any]) -> str:
        """
        Step 3: 최종 인사이트 생성 (Volatile Memory 기반)
        """
        # 1. 태그 추출
        query = self.analyze_saju_structure(saju_matrix)
        
        # 2. 관련 문헌 로드
        docs_context = self.retrieve_classical_texts(query)
        
        # 3. LLM 생성 (API 키 예외 처리)
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key or api_key == "":
            print("WARNING: OPENAI_API_KEY is not set. Using Mock RAG Output.")
            # Fallback mock UI
            return f"""오늘의 에너지는 당신의 내재된 잠재력을 끌어올리는 시기입니다. 
당신의 사주 구조 상, 현재의 상황을 극복하기 위해서는 일상의 루틴을 비틀어보는 과감함이 필요합니다.

📌 고전문헌 레퍼런스
{docs_context}"""
            
        if self.llm is None:
            self.llm = ChatOpenAI(model=self.llm_model_name, temperature=0.7)
            
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
        if gemini_api_key and ChatGoogleGenerativeAI is not None:
            llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.7, google_api_key=gemini_api_key)
        else:
            llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7, api_key=openai_api_key)
            
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
