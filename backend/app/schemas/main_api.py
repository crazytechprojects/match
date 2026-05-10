from pydantic import BaseModel


class GreetRequest(BaseModel):
    name: str
