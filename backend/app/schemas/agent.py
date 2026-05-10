from pydantic import BaseModel


class AgentStatusOut(BaseModel):
    is_active: bool
    status: str
    total_conversations: int
    green_count: int
    yellow_count: int
    red_count: int
