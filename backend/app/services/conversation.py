import uuid
from datetime import datetime

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.user import User
from models.conversation import (
    Conversation,
    ConversationParticipant,
    ConversationStatus,
    Message,
    MessageSenderType,
)


async def list_conversations(
    db: AsyncSession,
    user: User,
    status_filter: str | None = None,
) -> dict:
    base_query = (
        select(ConversationParticipant)
        .where(ConversationParticipant.user_id == user.id)
        .options(
            selectinload(ConversationParticipant.conversation).selectinload(
                Conversation.messages
            ),
            selectinload(ConversationParticipant.conversation)
            .selectinload(Conversation.participants)
            .selectinload(ConversationParticipant.user),
        )
    )

    result = await db.execute(base_query)
    participations = result.scalars().all()

    summaries = []
    counts = {"green": 0, "yellow": 0, "red": 0}

    for p in participations:
        convo = p.conversation
        user_status = p.status.value

        if user_status in counts:
            counts[user_status] += 1

        if status_filter and user_status != status_filter:
            continue

        match_user = _get_other_user(convo, user.id)
        last_msg = convo.messages[-1] if convo.messages else None

        summaries.append({
            "id": str(convo.id),
            "status": user_status,
            "match_name": match_user.name if match_user else None,
            "match_age": None,
            "match_gender": match_user.gender if match_user else None,
            "last_message": last_msg.text if last_msg else None,
            "last_message_time": last_msg.created_at if last_msg else None,
            "unread": False,
            "human_chat_started": convo.human_chat_started,
            "message_count": len(convo.messages),
        })

    summaries.sort(key=lambda s: s["last_message_time"] or datetime.min, reverse=True)

    return {
        "conversations": summaries,
        "total": len(participations),
        "green_count": counts["green"],
        "yellow_count": counts["yellow"],
        "red_count": counts["red"],
    }


async def get_conversation(
    db: AsyncSession,
    user: User,
    conversation_id: str,
) -> dict | None:
    result = await db.execute(
        select(ConversationParticipant)
        .where(
            and_(
                ConversationParticipant.user_id == user.id,
                ConversationParticipant.conversation_id == uuid.UUID(conversation_id),
            )
        )
        .options(
            selectinload(ConversationParticipant.conversation).selectinload(
                Conversation.messages
            ),
            selectinload(ConversationParticipant.conversation)
            .selectinload(Conversation.participants)
            .selectinload(ConversationParticipant.user),
        )
    )

    participation = result.scalar_one_or_none()
    if not participation:
        return None

    convo = participation.conversation
    match_user = _get_other_user(convo, user.id)

    messages_out = []
    for msg in convo.messages:
        if not msg.is_ai:
            sender_type = (
                "human-self" if msg.sender_user_id == user.id else "human-match"
            )
        else:
            sender_type = "my-agent" if msg.sender_user_id == user.id else "their-agent"

        messages_out.append({
            "id": str(msg.id),
            "sender_type": sender_type,
            "text": msg.text,
            "is_ai": msg.is_ai,
            "created_at": msg.created_at,
        })

    return {
        "id": str(convo.id),
        "status": participation.status.value,
        "match_name": match_user.name if match_user else None,
        "match_age": None,
        "match_gender": match_user.gender if match_user else None,
        "human_chat_started": convo.human_chat_started,
        "messages": messages_out,
    }


async def post_message(
    db: AsyncSession,
    user: User,
    conversation_id: str,
    text: str,
) -> dict | None:
    result = await db.execute(
        select(ConversationParticipant)
        .where(
            and_(
                ConversationParticipant.user_id == user.id,
                ConversationParticipant.conversation_id == uuid.UUID(conversation_id),
            )
        )
        .options(selectinload(ConversationParticipant.conversation))
    )

    participation = result.scalar_one_or_none()
    if not participation:
        return None

    if participation.status != ConversationStatus.GREEN:
        return None

    convo = participation.conversation
    if not convo.human_chat_started:
        convo.human_chat_started = True

    message = Message(
        conversation_id=convo.id,
        sender_user_id=user.id,
        sender_type=MessageSenderType.HUMAN_SELF,
        text=text,
        is_ai=False,
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)

    return {
        "id": str(message.id),
        "sender_type": "human-self",
        "text": message.text,
        "is_ai": False,
        "created_at": message.created_at,
    }


def _get_other_user(
    conversation: Conversation, current_user_id: uuid.UUID
) -> User | None:
    for p in conversation.participants:
        if p.user_id != current_user_id:
            return p.user
    return None
