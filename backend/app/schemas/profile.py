from pydantic import BaseModel


class ProfileUpdate(BaseModel):
    name: str | None = None
    gender: str | None = None
    match_gender: str | None = None
    age_range_min: int | None = None
    age_range_max: int | None = None
    self_description: str | None = None
    match_description: str | None = None
