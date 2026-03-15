import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, update
from app.models.market_models import VirtualExpert

DATABASE_URL = "sqlite+aiosqlite:///./saju.db"

async def fix_images():
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        images = [
            "https://randomuser.me/api/portraits/women/44.jpg",
            "https://randomuser.me/api/portraits/men/32.jpg",
            "https://randomuser.me/api/portraits/women/68.jpg",
            "https://randomuser.me/api/portraits/men/90.jpg",
            "https://randomuser.me/api/portraits/women/24.jpg",
        ]
        result = await session.execute(select(VirtualExpert).order_by(VirtualExpert.id))
        experts = result.scalars().all()
        for i, expert in enumerate(experts):
            if i < len(images):
                expert.image_url = images[i]
                session.add(expert)
        await session.commit()
    print("Fixed Expert Images successfully!")

if __name__ == "__main__":
    asyncio.run(fix_images())
