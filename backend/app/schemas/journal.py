from typing import Literal

from pydantic import BaseModel


class JournalCreate(BaseModel):
    name: str

    type: Literal[
        "SALES",
        "PURCHASE",
        "BANK",
        "CASH"
    ]

    default_debit_account_id: int
    default_credit_account_id: int


class JournalResponse(JournalCreate):
    id: int
    is_active: bool

    class Config:
        from_attributes = True