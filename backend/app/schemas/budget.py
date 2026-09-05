from datetime import date
from decimal import Decimal
from typing import List

from pydantic import BaseModel, Field


# =========================================================
# BUDGET LINE CREATE
# =========================================================

class BudgetLineCreate(BaseModel):

    account_id: int

    budget_amount: Decimal = Field(
        ...,
        ge=0
    )


# =========================================================
# BUDGET CREATE
# =========================================================

class BudgetCreate(BaseModel):

    name: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    start_date: date

    end_date: date

    lines: List[BudgetLineCreate]


# =========================================================
# BUDGET LINE RESPONSE
# =========================================================

class BudgetLineResponse(BaseModel):

    id: int

    account_id: int

    budget_amount: Decimal

    class Config:
        from_attributes = True


# =========================================================
# BUDGET RESPONSE
# =========================================================

class BudgetResponse(BaseModel):

    id: int

    name: str

    start_date: date

    end_date: date

    status: str

    lines: List[BudgetLineResponse]

    class Config:
        from_attributes = True


# =========================================================
# BUDGET REPORT LINE
# =========================================================

class BudgetReportLineResponse(BaseModel):

    account_id: int

    account_name: str

    account_type: str

    budget_amount: Decimal

    actual_amount: Decimal

    variance: Decimal

    utilization_percent: Decimal


# =========================================================
# BUDGET REPORT
# =========================================================

class BudgetReportResponse(BaseModel):

    budget_id: int

    budget_name: str

    start_date: date

    end_date: date

    status: str

    lines: List[BudgetReportLineResponse]

    total_budget: Decimal

    total_actual: Decimal

    total_variance: Decimal