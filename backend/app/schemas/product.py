from decimal import Decimal
from typing import Optional, Literal

from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    name: str
    type: Literal["GOODS", "SERVICE", "COMBO"]

    category: Optional[str] = None

    sales_price: Decimal = Field(default=0, ge=0)
    purchase_price: Decimal = Field(default=0, ge=0)


class ProductResponse(ProductCreate):
    id: int
    is_active: bool

    class Config:
        from_attributes = True