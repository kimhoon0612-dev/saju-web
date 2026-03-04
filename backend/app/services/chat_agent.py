import os
from typing import List, Dict, Any

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from app.services.rag_chain import SajuRAGChain

class SajuChatAgent:
    """
    1:1 Life Coaching AI Chatbot Engine.
    Combines the user's permanent Saju, current Daewun, and today's Fortune 
    to provide highly contextualized, agentic coaching.
    """
    def __init__(self, llm_model_name: str = "gpt-4o-mini"):
        self.rag_engine = SajuRAGChain()
        self.llm_model_name = llm_model_name
        self.llm = None

    def _build_context_string(self, saju_data: Dict[str, Any]) -> str:
        try:
            matrix = saju_data.get('matrix', {})
            daily = saju_data.get('daily_fortune', {})
            
            day_stem = matrix.get('day_pillar', {}).get('heavenly', {}).get('label', '알 수 없음')
            day_elem = matrix.get('day_pillar', {}).get('heavenly', {}).get('element', '알 수 없음')
            
            daily_h = daily.get('heavenly', {}).get('label', '')
            daily_e = daily.get('earthly', {}).get('label', '')
            
            return f"일간(본질): {day_stem}({day_elem}), 오늘의 기운: {daily_h}{daily_e}"
        except Exception:
            return "사주 정보 파악 요망"

    def chat(self, user_message: str, chat_history: List[Dict[str, str]], saju_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes a chat message using the chat history and Saju context.
        Returns the AI response and the classical citations used (XAI).
        """
        api_key = os.environ.get("OPENAI_API_KEY")

        # 1. RAG Retrieve (Use user message & basic Saju context for search)
        query = f"{user_message} {self._build_context_string(saju_context)}"
        docs_context = self.rag_engine.retrieve_classical_texts(query)

        # 2. Extract context strings for the prompt
        context_str = self._build_context_string(saju_context)
        
        # 3. Fallback if no API key
        if not api_key or api_key == "":
            print("WARNING: OPENAI_API_KEY is not set. Using Mock Chat Output.")
            mock_reply = "API 키가 등록되지 않아 모의(Mock) 응답을 드립니다. 선생님의 사주 구조와 현재 대운을 볼 때, 지금 고민하시는 문제는 너무 조급하게 생각하지 않으셔도 좋습니다. 시간의 흐름에 맡기며 현재의 오행(에너지)을 조화롭게 쓰는 데 집중해 보세요!"
            return {
                "reply": mock_reply,
                "citations": docs_context,
                "expert_consultation_recommended": False
            }

        # 4. LLM Generation
        if self.llm is None:
            self.llm = ChatOpenAI(model=self.llm_model_name, temperature=0.7)

        system_prompt = """당신은 MZ세대를 대상으로 하는 세련되고 통찰력 있는 '1:1 AI 라이프 코치(FateName Agent)'입니다.
사용자의 사주팔자(운명의 매트릭스)와 현재 운의 흐름(대운/세운/일진)을 바탕으로 맞춤형 조언을 제공합니다.

[페르소나 가이드]
1. 정중하면서도 친근한 톤앤매너 유지 (예: "~하는 흐름이네요", "~해 보시는 건 어떨까요?")
2. 사주 용어(편관, 겁재 등)를 쓰되 반드시 현대적이고 쉬운 말로 풀어서 설명할 것. (예: "편관의 기운이 강하니, 책임감이 막중해지는 시기네요")
3. 모호하고 추상적인 위로보다는 구체적이고 실용적인 행동 지침(Actionable Advice)을 줄 것.
4. 모든 조언은 XAI(설명 가능한 AI) 원칙에 따라, [검색된 고전문헌]이나 사용자의 사주 구조를 근거로 논리적으로 설명할 것.
5. [중요] 만약 사용자의 상황이 매우 복잡하거나 깊은 심리적 갈등, 중대한 진로 고민 등 '인간 전문가(역술가/타로마스터)'의 심층 상담이 꼭 필요하다고 판단되면, 답변 맨 마지막에 반드시 `[EXPERT_RECOMMENDATION]` 이라는 특수 태그를 기입할 것.

[사용자 운명 컨텍스트]
{context_str}

[검색된 고전문헌 참고 (RAG)]
{docs_context}
"""

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{message}")
        ])

        # Convert history format
        formatted_history = []
        for msg in chat_history:
            if msg.get("role") == "user":
                formatted_history.append(HumanMessage(content=msg.get("content", "")))
            elif msg.get("role") == "ai":
                formatted_history.append(AIMessage(content=msg.get("content", "")))

        chain = prompt | self.llm

        response = chain.invoke({
            "context_str": context_str,
            "docs_context": docs_context,
            "history": formatted_history,
            "message": user_message
        })

        reply_text = response.content
        trigger_expert = False
        if "[EXPERT_RECOMMENDATION]" in reply_text:
            trigger_expert = True
            reply_text = reply_text.replace("[EXPERT_RECOMMENDATION]", "").strip()

        return {
            "reply": reply_text,
            "citations": docs_context,
            "expert_consultation_recommended": trigger_expert
        }
