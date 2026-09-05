from datetime import date
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field


class PurchaseOrderItemCreate(BaseModel):
    product_id: int
    quantity: Decimal = Field(gt=0)
    unit_price: Decimal = Field(ge=0)
    tax_rate: Decimal = Field(default=0, ge=0)


class PurchaseOrderCreate(BaseModel):
    order_number: str
    vendor_id: int
    order_date: date

    items: List[PurchaseOrderItemCreate]


class PurchaseOrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: Decimal
    unit_price: Decimal
    tax_rate: Decimal
    tax_amount: Decimal
    line_total: Decimal
    received_quantity: Decimal

    class Config:
        from_attributes = True


class PurchaseOrderResponse(BaseModel):
    id: int
    order_number: str
    vendor_id: int
    order_date: date
    status: str

    subtotal: Decimal
    tax_amount: Decimal
    total_amount: Decimal

    items: List[PurchaseOrderItemResponse]

    class Config:
        from_attributes = True


class ReceiveItemRequest(BaseModel):
    item_id: int
    quantity: Decimal = Field(gt=0)


class ReceivePurchaseRequest(BaseModel):
    items: List[ReceiveItemRequest]


class VendorBillCreate(BaseModel):
    bill_number: str
    purchase_order_id: int
    bill_date: date
    due_date: Optional[date] = None


class VendorBillItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: Decimal
    unit_price: Decimal
    tax_rate: Decimal
    tax_amount: Decimal
    line_total: Decimal

    class Config:
        from_attributes = True


class VendorBillResponse(BaseModel):
    id: int
    bill_number: str
    purchase_order_id: int
    vendor_id: int
    bill_date: date
    due_date: Optional[date]
    status: str

    subtotal: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    journal_entry_id: Optional[int]

    items: List[VendorBillItemResponse]

    class Config:
        from_attributes = True