from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


# =========================================================
# CUSTOMER PAYMENT
# =========================================================

class CustomerPaymentCreate(BaseModel):

    payment_number: str = Field(
        ...,
        min_length=1,
        max_length=50
    )

    customer_invoice_id: int

    payment_date: date

    amount: Decimal = Field(
        ...,
        gt=0
    )

    payment_method: str = Field(
        ...,
        pattern="^(BANK|CASH)$"
    )

    reference: Optional[str] = Field(
        default=None,
        max_length=100
    )


# =========================================================
# VENDOR PAYMENT
# =========================================================

class VendorPaymentCreate(BaseModel):

    payment_number: str = Field(
        ...,
        min_length=1,
        max_length=50
    )

    vendor_bill_id: int

    payment_date: date

    amount: Decimal = Field(
        ...,
        gt=0
    )

    payment_method: str = Field(
        ...,
        pattern="^(BANK|CASH)$"
    )

    reference: Optional[str] = Field(
        default=None,
        max_length=100
    )


# =========================================================
# RESPONSE
# =========================================================

class PaymentResponse(BaseModel):

    id: int

    payment_number: str

    payment_type: str

    customer_invoice_id: Optional[int] = None

    vendor_bill_id: Optional[int] = None

    payment_date: date

    amount: Decimal

    payment_method: str

    reference: Optional[str] = None

    status: str

    journal_entry_id: Optional[int] = None

    class Config:
        from_attributes = True