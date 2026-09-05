from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class LedgerLineResponse(BaseModel):
    account_id: int
    account_name: str

    entry_id: int
    journal_id: int
    journal_name: str

    entry_date: date
    reference: Optional[str] = None
    description: Optional[str] = None

    debit: Decimal
    credit: Decimal
    balance: Decimal

    class Config:
        from_attributes = True