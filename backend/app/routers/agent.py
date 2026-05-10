from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from core.logger import logger
from dependencies.database import get_db
from dependencies.auth import get_current_user
from models.user import User
from schemas.agent import AgentStatusOut
from services.agent import get_agent_status as get_agent_status_service

router = APIRouter(prefix="/agent", tags=["agent"])


@router.get("/status", response_model=AgentStatusOut)
async def get_agent_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await get_agent_status_service(db, current_user)
    except Exception as e:
        logger.error(f"[get_agent_status] error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal Server Error",
        )
