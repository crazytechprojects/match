from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from core.logger import logger
from dependencies.database import get_db
from dependencies.auth import get_current_user
from models.user import User
from schemas.profile import ProfileUpdate
from services.profile import (
    get_profile as get_profile_service,
    update_profile as update_profile_service,
)

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/get")
async def get_profile(current_user: User = Depends(get_current_user)):
    try:
        return await get_profile_service(current_user)
    except Exception as e:
        logger.error(f"[get_profile] error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal Server Error",
        )


@router.put("/update")
async def update_profile(
    body: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await update_profile_service(db, current_user, body)
    except Exception as e:
        logger.error(f"[update_profile] error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal Server Error",
        )
