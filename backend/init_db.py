import asyncio
from sqlalchemy.future import select
from app.core.database import engine, Base, AsyncSessionLocal
from app.models.market_models import VirtualExpert

async def init_db():
    print("Creating tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    print("Seeding experts...")
    async with AsyncSessionLocal() as session:
        # Check if empty
        result = await session.execute(select(VirtualExpert))
        experts = result.scalars().all()
        if not experts:
            expert1 = VirtualExpert(
                category="운세",
                display_name="백운거사",
                code="EXPERT_BAEK",
                tags="정통명리,궁합,합격운",
                rating=4.9,
                reviews_count=1240,
                avg_minutes=15,
                total_consults=5200,
                image_url="https://images.unsplash.com/photo-1544253107-160de4e9c700?w=500&h=600&fit=crop",
                is_online=True,
                banner_text="20년 경력의 명쾌한 해답",
                is_free_available=False,
                introduction_text="정통 명리학을 바탕으로 당신의 운명을 속 시원하게 풀어드립니다."
            )
            expert2 = VirtualExpert(
                category="타로",
                display_name="타로마스터 루나",
                code="EXPERT_LUNA",
                tags="연애운,재회,속마음",
                rating=5.0,
                reviews_count=850,
                avg_minutes=10,
                total_consults=3100,
                image_url="https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?w=500&h=600&fit=crop",
                is_online=False,
                banner_text="당신의 연애 세포를 깨워드립니다",
                is_free_available=True,
                introduction_text="따뜻한 위로와 명확한 카드의 조언으로 연애의 방향을 찾아드립니다."
            )
            expert3 = VirtualExpert(
                category="운세",
                display_name="천상선녀",
                code="EXPERT_CHUN",
                tags="신점,사업운,재물운",
                rating=4.8,
                reviews_count=3200,
                avg_minutes=20,
                total_consults=8500,
                image_url="https://images.unsplash.com/photo-1510467610486-da242ee926bb?w=500&h=600&fit=crop",
                is_online=True,
                banner_text="영험한 기운으로 미래를 봅니다",
                is_free_available=False,
                introduction_text="답답한 마음을 풀어드리는 선녀의 맑은 기운을 경험하세요."
            )
            session.add_all([expert1, expert2, expert3])
            await session.commit()
            print("Successfully seeded placeholder experts.")
        else:
            print("Experts already exist. Skipping seed.")

if __name__ == "__main__":
    asyncio.run(init_db())
