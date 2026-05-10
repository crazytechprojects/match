from sqlalchemy.ext.asyncio import AsyncSession

from models.user import User
from schemas.profile import ProfileUpdate


async def get_profile(user: User) -> User:
    return user


async def update_profile(db: AsyncSession, user: User, data: ProfileUpdate) -> User:
    update_fields = data.model_dump(exclude_unset=True)

    for field, value in update_fields.items():
        setattr(user, field, value)

    has_required = all(
        [
            user.gender,
            user.match_gender,
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
    return user
