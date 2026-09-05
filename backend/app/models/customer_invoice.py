from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    Numeric,
    ForeignKey
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class CustomerInvoice(Base):
    __tablename__ = "customer_invoices"

    id = Column(Integer, primary_key=True, index=True)

    invoice_number = Column(
        String(50),
        unique=True,
        nullable=False
    )

    sales_order_id = Column(
        Integer,
        ForeignKey("sales_orders.id"),
        nullable=False
    )

    customer_id = Column(
        Integer,
        ForeignKey("contacts.id"),
        nullable=False
    )

    invoice_date = Column(
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
        "InvoiceItem",
        back_populates="invoice",
        cascade="all, delete-orphan"
    )