from datetime import date
from decimal import Decimal
from typing import List

from pydantic import BaseModel


# =========================================================
# BALANCE SHEET ACCOUNT
# =========================================================

class BalanceSheetAccountResponse(BaseModel):
    account_id: int
    account_name: str
    account_type: str
    balance: Decimal


# =========================================================
# BALANCE SHEET RESPONSE
# =========================================================

class BalanceSheetResponse(BaseModel):
    as_of_date: date

    asset_accounts: List[BalanceSheetAccountResponse]
    liability_accounts: List[BalanceSheetAccountResponse]
    equity_accounts: List[BalanceSheetAccountResponse]

    total_assets: Decimal
    total_liabilities: Decimal

    owner_capital: Decimal
    current_period_profit: Decimal

    total_equity: Decimal

    total_liabilities_and_equity: Decimal

    is_balanced: bool