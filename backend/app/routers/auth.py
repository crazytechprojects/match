from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address

from core.logger import logger
from dependencies.database import get_db
from schemas.auth import SignUpRequest, LoginRequest, AuthResponse
from services.auth import (
    get_user_by_email,
    create_user,
    verify_password,
    create_access_token,
)

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED
)
@limiter.limit("5/minute")
async def signup(
    request: Request, body: SignUpRequest, db: AsyncSession = Depends(get_db)
):
    try:
        existing = await get_user_by_email(db, body.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

        user = await create_user(db, body.email, body.password)
        token = create_access_token({"sub": str(user.id), "email": user.email})
        return AuthResponse(access_token=token)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[signup] error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error",
        )


@router.post("/login", response_model=AuthResponse)
@limiter.limit("5/minute")
async def login(
    request: Request, body: LoginRequest, db: AsyncSession = Depends(get_db)
):
    try:
        user = await get_user_by_email(db, body.email)
        if not user or not verify_password(body.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        token = create_access_token({"sub": str(user.id), "email": user.email})
        return AuthResponse(access_token=token)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[login] error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error",
        )
