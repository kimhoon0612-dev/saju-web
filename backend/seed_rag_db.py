import os
from langchain_chroma import Chroma
from app.services.rag_chain import LocalHuggingFaceEmbeddings

def seed_database():
    print("Initializing Local HuggingFace Embeddings...")
    embeddings = LocalHuggingFaceEmbeddings()
    
    # 더미 고전문헌 데이터 (적천수, 명리정종 등)
    classical_texts = [
        {
            "id": "doc1",
            "text": "甲木參天 脫胎要火 (갑목참천 탈태요화): 갑목은 하늘을 찌를 듯이 높이 자라며, 진정한 변화와 성장을 위해서는 반드시 화(火)의 기운이 필요하다.",
            "source": "적천수 (滴天髓)",
            "original_text": "甲木參天 脫胎要火",
            "modern_meaning": "갑목 일간은 성장을 멈추지 않는 강건함을 가지며, 불의 기운(식상)을 만나야 자신의 재능을 꽃피우고 결실을 맺을 수 있다."
        },
        {
            "id": "doc2",
            "text": "乙木雖柔 刲羊解牛 (을목수유 규양해우): 을목은 비록 부드럽고 약해 보이나, 흙(미토, 축토)을 파고들어 뿌리를 내릴 수 있는 끈질긴 생명력이 있다.",
            "source": "적천수 (滴天髓)",
            "original_text": "乙木雖柔 刲羊解牛",
            "modern_meaning": "을목 일간은 외유내강형으로, 척박한 환경 속에서도 끝까지 살아남아 현실적인 재물(토)을 취하는 능력이 탁월하다."
        },
        {
            "id": "doc3",
            "text": "丙火猛烈 欺霜侮雪 (병화맹렬 기상모설): 병화는 맹렬하여 서리를 업신여기고 눈을 깔본다. 그만큼 강한 양기로 어둠을 물리친다.",
            "source": "적천수 (滴天髓)",
            "original_text": "丙火猛烈 欺霜侮雪",
            "modern_meaning": "병화 일간은 열정과 추진력이 뛰어나며, 어떤 고난(수 기운)이 와도 굴하지 않고 긍정적으로 돌파하는 능력이 있다."
        },
        {
            "id": "doc4",
            "text": "丁火柔中 內性昭融 (정화유중 내성소융): 정화는 부드러운 불이나, 그 안의 성질은 온 세상을 녹일 만큼 밝고 따뜻하다.",
            "source": "적천수 (滴天髓)",
            "original_text": "丁火柔中 內性昭融",
            "modern_meaning": "정화 일간은 겉으로는 온화하지만 내면의 뜨거운 집념과 헌신으로 사람들을 감화시키고 문명을 밝힌다."
        },
        {
            "id": "doc5",
            "text": "금수상관 희견관 (金水傷官 喜見官): 금수 상관격은 너무 차가우니 따뜻한 관성(화)을 보는 것을 기뻐한다.",
            "source": "명리정종 (命理正宗)",
            "original_text": "金水傷官 喜見官",
            "modern_meaning": "경금, 신금 일간이 겨울에 태어나 상관격이 된 경우, 지나치게 차가운 이성을 제어해줄 따뜻한 열정(관성, 화)이 있어야 조후가 맞아 크게 성공한다."
        }
    ]

    print("Creating Chroma Vector Store in './chroma_db'...")
    
    # Create texts and metadatas lists
    texts = [doc["text"] for doc in classical_texts]
    metadatas = [
        {
            "source": doc["source"],
            "original_text": doc["original_text"],
            "modern_meaning": doc["modern_meaning"]
        } for doc in classical_texts
    ]
    ids = [doc["id"] for doc in classical_texts]

    # Initialize Chroma
    vector_store = Chroma.from_texts(
        texts=texts,
        embedding=embeddings,
        metadatas=metadatas,
        ids=ids,
        collection_name="classical_saju_texts",
        persist_directory="./chroma_db"
    )
    
    print("Database seeding successfully completed!")

if __name__ == "__main__":
    seed_database()
