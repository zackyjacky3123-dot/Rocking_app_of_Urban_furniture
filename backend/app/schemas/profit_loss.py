from datetime import date
from decimal import Decimal
from typing import List

from pydantic import BaseModel


# =========================================================
# ACCOUNT LINE
# =========================================================

class ProfitLossAccountResponse(BaseModel):
    account_id: int
    account_name: str
    account_type: str
    amount: Decimal


# =========================================================
# PROFIT & LOSS RESPONSE
# =========================================================

class ProfitLossResponse(BaseModel):
    from_date: date
    to_date: date

    revenue_accounts: List[ProfitLossAccountResponse]
    expense_accounts: List[ProfitLossAccountResponse]

    total_revenue: Decimal
    total_expenses: Decimal

    net_profit: Decimal