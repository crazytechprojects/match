from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from core.logger import logger
from dependencies.database import get_db
from dependencies.auth import get_current_user
from models.user import User
from schemas.conversation import (
    ConversationListResponse,
    ConversationDetail,
    SendMessageRequest,
    MessageOut,
)
from services.conversation import (
    list_conversations as list_conversations_service,
    get_conversation as get_conversation_service,
    post_message as post_message_service,
)

router = APIRouter(prefix="/conversations", tags=["conversations"])

VALID_STATUSES = {"green", "yellow", "red"}


@router.get("/list", response_model=ConversationListResponse)
async def list_conversations(
    status: str | None = Query(
        None, description="Filter by status: green, yellow, red"
    ),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        if status and status not in VALID_STATUSES:
            raise HTTPException(
                status_code=400,
                detail="Invalid status filter. Must be green, yellow, or red.",
            )
        return await list_conversations_service(db, current_user, status_filter=status)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[list_conversations] error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal Server Error",
        )


@router.get("/{conversation_id}", response_model=ConversationDetail)
async def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        detail = await get_conversation_service(db, current_user, conversation_id)
        if not detail:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found",
            )
        return detail
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[get_conversation] error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal Server Error",
        )


@router.post("/{conversation_id}/messages", response_model=MessageOut)
async def post_message(
    conversation_id: str,
    body: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        if not body.text.strip():
            raise HTTPException(
                status_code=400,
                detail="Message text cannot be empty",
            )

        result = await post_message_service(
            db, current_user, conversation_id, body.text.strip()
        )
        if result is None:
            raise HTTPException(
                status_code=403,
                detail="Cannot send messages in this conversation. Only green (mutual match) conversations allow human chat.",
            )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[post_message] error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal Server Error",
        )
