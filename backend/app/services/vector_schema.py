import json
import os
import chromadb
from typing import List, Optional
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

class SajuDocument(BaseModel):
    id: str
    original_text: str
    modern_meaning: str
    keyword_tags: List[str]
    source: str

# Mock Classical Literature Data (적천수, 궁통보감 등)
SEED_DATA = [
    SajuDocument(
        id="txt_001",
        original_text="甲木參天 脫胎要火",
        modern_meaning="갑목(큰 나무)은 위로 뻗어나가는 에너지가 강하며, 온전한 잠재력을 발휘하려면 화(火) 기운의 자극과 발산이 필수적입니다.",
        keyword_tags=["갑목", "목", "조후용신", "화", "성장", "표현력"],
        source="적천수"
    ),
    SajuDocument(
        id="txt_002",
        original_text="乙木雖柔 刲羊解牛",
        modern_meaning="을목(화초)은 겉보기엔 부드럽고 유연하지만, 척박한 토양(미토, 축토)을 파고들어 생명력을 피워내는 무서운 생존력과 적응력을 지닙니다.",
        keyword_tags=["을목", "목", "토", "적응력", "끈기", "유연성"],
        source="적천수"
    ),
    SajuDocument(
        id="txt_003",
        original_text="丙火猛烈 欺霜侮雪",
        modern_meaning="병화(태양)의 에너지는 맹렬하여 어떠한 시련이나 난관(서리와 눈)도 두려워하지 않고 돌파하는 강력한 추진력을 갖습니다.",
        keyword_tags=["병화", "화", "리더십", "추진력", "수", "극복"],
        source="적천수"
    ),
    SajuDocument(
        id="txt_004",
        original_text="水多木漂",
        modern_meaning="수(水) 기운이 지나치게 많으면 목(木)이 뿌리를 내리지 못하고 부유하게 됩니다. 유연함도 좋지만, 중심을 잡고 정착하는 결단력(토 기운)이 필요합니다.",
        keyword_tags=["수다목표", "수", "목", "정체성", "불안정", "토"],
        source="명리통용"
    ),
    SajuDocument(
        id="txt_005",
        original_text="火炎土燥",
        modern_meaning="열기가 너무 강해 땅이 마른 형국입니다. 넘치는 열정을 잠시 식히고, 이성적이고 차분한 휴식(수 기운)을 통해 번아웃을 예방해야 합니다.",
        keyword_tags=["화염토조", "화", "토", "수", "휴식", "번아웃"],
        source="조후론"
    ),
    SajuDocument(
        id="txt_006",
        original_text="金冷水寒",
        modern_meaning="금수(金水) 기운이 차가우면 얼어붙기 쉽습니다. 내면의 아이디어나 기획력은 눈부시지만, 이를 밖으로 꺼내어 실행에 옮기는 따뜻한 불씨(화 기운)와 네트워킹이 필요합니다.",
        keyword_tags=["금냉수한", "금", "수", "화", "실행력", "네트워킹", "아이디어"],
        source="궁통보감"
    ),
    SajuDocument(
        id="txt_007",
        original_text="身弱殺重",
        modern_meaning="내가 감당해야 할 책임과 압박(편관)이 큰 시기입니다. 정면돌파보다는 자기계발(인성)을 통해 내공을 쌓거나, 신뢰할 수 있는 동료(비견)의 도움을 받는 것이 현명합니다.",
        keyword_tags=["신약살중", "편관", "인성", "비견", "스트레스", "자기계발", "조력자"],
        source="자평진전"
    ),
]

def init_vector_db(db_path: str = "./chroma_db"):
    """
    ChromaDB를 초기화하고 mock 문헌 데이터를 임베딩하여 로드합니다.
    Local sentence-transformer 모델(다국어 지원)을 사용하여 비용 없이 시드 생성.
    """
    print("Initialize Local ChromaDB...")
    client = chromadb.PersistentClient(path=db_path)
    
    # Collection creation
    collection_name = "classical_saju_texts"
    
    # Use get_or_create_collection to elegantly handle existing
    collection = client.get_or_create_collection(name=collection_name)
    existing_count = collection.count()
    
    if existing_count > 0:
        print(f"Collection '{collection_name}' already exists with {existing_count} items. Skipping initial embedding.")
        return collection

    # Use a lightweight multi-lingual sentence transformer for local embeddings
    # This prevents requiring OpenAI API key just for DB seeding
    print("Loading SentenceTransformer model for embeddings (jhgan/ko-sbert-nli)...")
    model = SentenceTransformer("jhgan/ko-sbert-nli")

    print(f"Embedding and inserting {len(SEED_DATA)} documents...")
    documents = []
    metadatas = []
    ids = []
    embeddings = []

    for doc in SEED_DATA:
        # We embed a combination of keywords + modern meaning for best retrieval
        content_to_embed = f"[{','.join(doc.keyword_tags)}] {doc.modern_meaning}"
        
        documents.append(doc.original_text + " | " + doc.modern_meaning)
        metadatas.append({
            "source": doc.source,
            "original_text": doc.original_text,
            "modern_meaning": doc.modern_meaning,
            "keywords": ",".join(doc.keyword_tags)
        })
        ids.append(doc.id)
        
        vec = model.encode(content_to_embed)
        embeddings.append(vec.tolist())

    collection.add(
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas,
        ids=ids
    )
    print("Vector DB Initialization Complete.")
    return collection

if __name__ == "__main__":
    init_vector_db()
