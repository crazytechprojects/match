from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.user import User
from models.conversation import ConversationParticipant


async def get_agent_status(db: AsyncSession, user: User) -> dict:
    result = await db.execute(
        select(
            ConversationParticipant.status,
            func.count(ConversationParticipant.id),
        )
        .where(ConversationParticipant.user_id == user.id)
        .group_by(ConversationParticipant.status)
    )
    rows = result.all()

    counts = {"green": 0, "yellow": 0, "red": 0, "active": 0}
    total = 0
    for status_val, count in rows:
        counts[status_val.value] = count
        total += count

    is_active = user.onboarded
    if not is_active:
        agent_status = "setup_required"
    elif counts["active"] > 0:
        agent_status = "chatting"
    else:
        agent_status = "idle"

    return {
        "is_active": is_active,
        "status": agent_status,
        "total_conversations": total,
        "active_count": counts["active"],
        "green_count": counts["green"],
        "yellow_count": counts["yellow"],
        "red_count": counts["red"],
    }
