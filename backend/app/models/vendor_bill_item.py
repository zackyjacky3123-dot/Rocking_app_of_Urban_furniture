from sqlalchemy import (
    Column,
    Integer,
    Numeric,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from app.database import Base


class VendorBillItem(Base):
    __tablename__ = "vendor_bill_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    vendor_bill_id = Column(
        Integer,
        ForeignKey(
            "vendor_bills.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False
    )

    quantity = Column(
        Numeric(12, 2),
        nullable=False
    )

    unit_price = Column(
        Numeric(12, 2),
        nullable=False
    )

    tax_rate = Column(
        Numeric(5, 2),
        nullable=False,
        default=0
    )

    tax_amount = Column(
        Numeric(12, 2),
        nullable=False,
        default=0
    )

    line_total = Column(
        Numeric(12, 2),
        nullable=False,
        default=0
    )

    vendor_bill = relationship(
        "VendorBill",
        back_populates="items"
    )