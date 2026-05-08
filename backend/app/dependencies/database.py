from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from core.constants import DATABASE_URL
from core.logger import logger


if DATABASE_URL:
    engine = create_async_engine(DATABASE_URL, echo=False, pool_pre_ping=True)
    AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)
else:
    engine = None
    AsyncSessionLocal = None
    logger.warning("DATABASE_URL is not configured — database features are disabled")


async def get_db() -> AsyncSession:
    if AsyncSessionLocal is None:
        raise RuntimeError(
            "Database is not configured. Set DB_USERNAME, DB_HOST, and DB_NAME."
        )
    async with AsyncSessionLocal() as session:
        yield session
