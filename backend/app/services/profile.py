import asyncio

from sqlalchemy.ext.asyncio import AsyncSession

from core.logger import logger
from dependencies.database import AsyncSessionLocal
from models.user import User
from schemas.profile import ProfileUpdate
from services.matching import find_compatible_users, create_conversation


async def get_profile(user: User) -> User:
    return user


async def update_profile(db: AsyncSession, user: User, data: ProfileUpdate) -> User:
    update_fields = data.model_dump(exclude_unset=True)

    for field, value in update_fields.items():
        setattr(user, field, value)

    was_onboarded = user.onboarded

    has_required = all(
        [
            user.gender,
            user.match_gender,
            user.date_of_birth is not None,
            user.age_range_min is not None,
            user.age_range_max is not None,
            user.self_description,
            user.match_description,
        ]
    )
    if has_required:
        user.onboarded = True

    await db.commit()
    await db.refresh(user)

    if not was_onboarded and user.onboarded:
        asyncio.create_task(_match_new_user(user.id))

    return user


async def _match_new_user(user_id) -> None:
    """Run matching immediately after a user finishes onboarding."""
    if AsyncSessionLocal is None:
        return
    try:
        async with AsyncSessionLocal() as db:
            from sqlalchemy import select

            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if user is None:
                return
            compatible = await find_compatible_users(db, user)
            for match in compatible:
                await create_conversation(db, user, match)
            if compatible:
                logger.info(
                    f"Immediate matching for {user_id}: "
                    f"created {len(compatible)} conversations"
                )
    except Exception as e:
        logger.error(f"Immediate matching failed for {user_id}: {e}")
