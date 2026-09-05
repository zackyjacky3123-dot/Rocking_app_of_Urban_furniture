from typing import Literal

from pydantic import BaseModel


class AccountCreate(BaseModel):
    name: str
    type: Literal[
        "ASSET",
        "LIABILITY",
        "EXPENSE",
        "INCOME",
        "CAPITAL"
    ]


class AccountResponse(AccountCreate):
    id: int
    is_active: bool

    class Config:
        from_attributes = True