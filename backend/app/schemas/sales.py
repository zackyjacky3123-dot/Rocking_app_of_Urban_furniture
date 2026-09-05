from datetime import date
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field


class SalesOrderItemCreate(BaseModel):
    product_id: int
    quantity: Decimal = Field(gt=0)
    unit_price: Decimal = Field(ge=0)
    tax_rate: Decimal = Field(default=0, ge=0)


class SalesOrderCreate(BaseModel):
    order_number: str
    customer_id: int
    order_date: date
    items: List[SalesOrderItemCreate]


class SalesOrderItemResponse(SalesOrderItemCreate):
    id: int
    tax_amount: Decimal
    line_total: Decimal

    class Config:
        from_attributes = True


class SalesOrderResponse(BaseModel):
    id: int
    order_number: str
    customer_id: int
    order_date: date
    status: str

    subtotal: Decimal
    tax_amount: Decimal
    total_amount: Decimal

    items: List[SalesOrderItemResponse]

    class Config:
        from_attributes = True


class CustomerInvoiceCreate(BaseModel):
    invoice_number: str
    sales_order_id: int
    invoice_date: date
    due_date: Optional[date] = None


class InvoiceItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: Decimal
    unit_price: Decimal
    tax_rate: Decimal
    tax_amount: Decimal
    line_total: Decimal

    class Config:
        from_attributes = True


class CustomerInvoiceResponse(BaseModel):
    id: int
    invoice_number: str
    sales_order_id: int
    customer_id: int
    invoice_date: date
    due_date: Optional[date]
    status: str

    subtotal: Decimal
    tax_amount: Decimal
    total_amount: Decimal

    journal_entry_id: Optional[int]

    items: List[InvoiceItemResponse]

    class Config:
        from_attributes = True