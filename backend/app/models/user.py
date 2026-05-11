import uuid
from datetime import date
from sqlalchemy import String, Boolean, Integer, Text, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from models.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(
        String(320), unique=True, nullable=False, index=True
    )
    password: Mapped[str] = mapped_column(String(128), nullable=False)

    name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    match_gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    age_range_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    age_range_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    self_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    match_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    onboarded: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    conversations = relationship(
        "ConversationParticipant", back_populates="user", lazy="selectin"
    )
