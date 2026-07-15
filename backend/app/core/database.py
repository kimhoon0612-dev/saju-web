import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool

# Get database URL from environment variable, falling back to local SQLite
raw_db_url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./saju_market.db")

# If using PostgreSQL from Render/Heroku, it often starts with postgres:// or postgresql://
# We need asyncpg driver for async SQLAlchemy
if raw_db_url.startswith("postgres://"):
    DATABASE_URL = raw_db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif raw_db_url.startswith("postgresql://"):
    DATABASE_URL = raw_db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
else:
    DATABASE_URL = raw_db_url

engine = create_async_engine(DATABASE_URL, echo=False, poolclass=NullPool)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
