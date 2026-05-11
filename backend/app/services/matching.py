from datetime import date

from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from core.constants import MAX_ACTIVE_CONVERSATIONS_PER_USER
from core.logger import logger
from models.user import User
from models.conversation import (
    Conversation,
    ConversationParticipant,
    ConversationStatus,
)


def _compute_age(dob: date) -> int:
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


async def find_compatible_users(db: AsyncSession, user: User) -> list[User]:
    """
    Find onboarded users who:
    - Match gender criteria in both directions
    - Fall within each other's preferred age range
    - Don't already share a conversation with this user
    """
    my_convo_ids_q = select(ConversationParticipant.conversation_id).where(
        ConversationParticipant.user_id == user.id
    )
    result = await db.execute(my_convo_ids_q)
    my_convo_ids = [row[0] for row in result.all()]

    already_paired_ids = {user.id}
    if my_convo_ids:
        partner_q = select(ConversationParticipant.user_id).where(
            and_(
                ConversationParticipant.conversation_id.in_(my_convo_ids),
                ConversationParticipant.user_id != user.id,
            )
        )
        result = await db.execute(partner_q)
        already_paired_ids.update(row[0] for row in result.all())

    query = select(User).where(
        and_(
            User.onboarded == True,  # noqa: E712
            User.id.notin_(already_paired_ids),
            User.gender == user.match_gender,
            User.match_gender == user.gender,
        )
    )
    result = await db.execute(query)
    candidates = list(result.scalars().all())

    my_age = _compute_age(user.date_of_birth) if user.date_of_birth else None
    if my_age is None:
        return []

    compatible = []
    for candidate in candidates:
        if candidate.date_of_birth is None:
            continue
        their_age = _compute_age(candidate.date_of_birth)

        i_want_them = user.age_range_min <= their_age <= user.age_range_max
        they_want_me = candidate.age_range_min <= my_age <= candidate.age_range_max

        if i_want_them and they_want_me:
            compatible.append(candidate)

    return compatible


async def count_active_conversations(db: AsyncSession, user_id) -> int:
    result = await db.execute(
        select(func.count(ConversationParticipant.id)).where(
            and_(
                ConversationParticipant.user_id == user_id,
                ConversationParticipant.status == ConversationStatus.ACTIVE,
            )
        )
    )
    return result.scalar() or 0


async def create_conversation(
    db: AsyncSession, user_a: User, user_b: User
) -> Conversation:
    convo = Conversation()
    db.add(convo)
    await db.flush()

    db.add(
        ConversationParticipant(
            conversation_id=convo.id,
            user_id=user_a.id,
            status=ConversationStatus.ACTIVE,
        )
    )
    db.add(
        ConversationParticipant(
            conversation_id=convo.id,
            user_id=user_b.id,
            status=ConversationStatus.ACTIVE,
        )
    )

    await db.commit()
    logger.info(f"Created conversation {convo.id} between {user_a.id} and {user_b.id}")
    return convo


async def run_matching_cycle(db: AsyncSession) -> int:
    """Pair all compatible onboarded users who don't yet share a conversation."""
    result = await db.execute(select(User).where(User.onboarded == True))  # noqa: E712
    onboarded_users = result.scalars().all()

    created = 0
    for user in onboarded_users:
        active_count = await count_active_conversations(db, user.id)
        if active_count >= MAX_ACTIVE_CONVERSATIONS_PER_USER:
            continue

        compatible = await find_compatible_users(db, user)
        slots = MAX_ACTIVE_CONVERSATIONS_PER_USER - active_count

        for match in compatible[:slots]:
            match_active = await count_active_conversations(db, match.id)
            if match_active >= MAX_ACTIVE_CONVERSATIONS_PER_USER:
                continue
            await create_conversation(db, user, match)
            created += 1

    if created:
        logger.info(f"Matching cycle: created {created} new conversations")
    return created
