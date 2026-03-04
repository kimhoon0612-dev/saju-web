# FateName: Ancient Wisdom Meets Future Intelligence

고전 명리학과 생성형 AI(RAG), 그리고 진태양시 정밀 보정 엔진을 통합한 MZ세대 타겟 라이프 테크 솔루션입니다.

## Repo Structure

```text
FateName/
├── frontend/             # Next.js, Vanilla CSS / Tailwind (MZ향 Glassmorphism UI)
│   ├── components/       # UI 컴포넌트 (Destiny Matrix Card 등)
│   ├── hooks/            # 프론트엔드 비즈니스 로직
│   └── stores/           # Zustand 엣지 상태 관리
├── backend/              # FastAPI, LangChain, KASI API 연동
│   ├── app/
│   │   ├── api/          # RESTful Endpoint (명식 산출, AI 조언 생성)
│   │   ├── core/         # 진태양시 보정 핵심 알고리즘 및 휘발성 메모리 파이프라인
│   │   └── services/     # RAG VectorDB 연동 및 프롬프트 체이닝
├── docs/                 # 아키텍처 및 기획 문서
│   └── architecture_trust.md  # 개인정보 보호 아키텍처
└── docker-compose.yml    # Redis, 백엔드 서비스 테스트용 컨테이너 (예정)
```

## 핵심 아키텍처
1. **Precision:** KASI 연동 및 진태양시 보정
2. **Intelligence:** 고전문헌 RAG 기반의 3-Step 생성 AI 
3. **Trust:** 생년월일 데이터 즉시 파기 (Volatile Memory Processing)
