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
    agent_status = "active" if is_active else "setup_required"

    return {
        "is_active": is_active,
        "status": agent_status,
        "total_conversations": total,
        "green_count": counts["green"],
        "yellow_count": counts["yellow"],
        "red_count": counts["red"],
    }
