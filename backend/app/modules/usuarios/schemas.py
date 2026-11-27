from datetime import datetime, timezone
from typing import Annotated
from pydantic import EmailStr, StringConstraints, field_validator
from sqlmodel import SQLModel, Field


class UserCreate(SQLModel):
    username: Annotated[str, StringConstraints(strip_whitespace=True, min_length=3, max_length=50)]
    full_name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime

    @field_validator("created_at")
    @classmethod
    def con_zona_utc(cls, valor: datetime) -> datetime:
        return valor if valor.tzinfo else valor.replace(tzinfo=timezone.utc)
