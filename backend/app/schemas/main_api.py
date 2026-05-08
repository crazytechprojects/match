from pydantic import BaseModel


class GreetRequest(BaseModel):
    name: str


class GreetResponse(BaseModel):
    status: str
