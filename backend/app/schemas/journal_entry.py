from datetime import date
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field


class JournalEntryLineCreate(BaseModel):
    account_id: int

    debit: Decimal = Field(default=Decimal("0.00"), ge=0)
    credit: Decimal = Field(default=Decimal("0.00"), ge=0)


class JournalEntryCreate(BaseModel):
    journal_id: int

    entry_date: date
    reference: Optional[str] = None
    description: Optional[str] = None

    lines: List[JournalEntryLineCreate]


class JournalEntryLineResponse(BaseModel):
    id: int
    account_id: int
    debit: Decimal
    credit: Decimal

    class Config:
        from_attributes = True


class JournalEntryResponse(BaseModel):
    id: int
    journal_id: int
    entry_date: date
    reference: Optional[str]
    description: Optional[str]

    lines: List[JournalEntryLineResponse]

    class Config:
        from_attributes = True