from pydantic import BaseModel
from datetime import datetime


class MessageOut(BaseModel):
    id: str
    sender_type: str
    text: str
    is_ai: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationSummary(BaseModel):
    id: str
    status: str
    match_name: str | None = None
    match_age: int | None = None
    match_gender: str | None = None
    last_message: str | None = None
    last_message_time: datetime | None = None
    unread: bool = False
    human_chat_started: bool = False
    message_count: int = 0


class ConversationDetail(BaseModel):
    id: str
    status: str
    match_name: str | None = None
    match_age: int | None = None
    match_gender: str | None = None
    human_chat_started: bool = False
    messages: list[MessageOut] = []


class SendMessageRequest(BaseModel):
    text: str


class ConversationListResponse(BaseModel):
    conversations: list[ConversationSummary]
    total: int
    green_count: int
    yellow_count: int
    red_count: int
