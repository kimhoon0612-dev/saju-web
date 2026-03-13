import asyncio
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.models.market_models import VirtualExpert

async def check():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(VirtualExpert))
        experts = result.scalars().all()
        print(f"Total experts: {len(experts)}")
        for e in experts:
            print(f"- {e.display_name} ({e.category}): tags={e.tags}")

asyncio.run(check())
