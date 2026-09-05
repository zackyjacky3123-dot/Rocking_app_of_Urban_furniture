from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    Numeric,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class VendorBill(Base):
    __tablename__ = "vendor_bills"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    bill_number = Column(
        String(50),
        unique=True,
        nullable=False
    )

    purchase_order_id = Column(
        Integer,
        ForeignKey("purchase_orders.id"),
        nullable=False
    )

    vendor_id = Column(
        Integer,
        ForeignKey("contacts.id"),
        nullable=False
    )

    bill_date = Column(
        Date,
        nullable=False,
        server_default=func.current_date()
    )

    due_date = Column(Date)

    status = Column(
        String(20),
        nullable=False,
        default="POSTED"
    )

    subtotal = Column(
        Numeric(12, 2),
        nullable=False,
        default=0
    )

    tax_amount = Column(
        Numeric(12, 2),
        nullable=False,
        default=0
    )

    total_amount = Column(
        Numeric(12, 2),
        nullable=False,
        default=0
    )

    journal_entry_id = Column(
        Integer,
        ForeignKey("journal_entries.id")
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now()
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now()
    )

    items = relationship(
        "VendorBillItem",
        back_populates="vendor_bill",
        cascade="all, delete-orphan"
    )