from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Numeric,
    ForeignKey,
    DateTime,
    CheckConstraint,
)
from sqlalchemy.sql import func

from app.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    payment_number = Column(
        String(50),
        unique=True,
        nullable=False
    )

    payment_type = Column(
        String(20),
        nullable=False
    )

    customer_invoice_id = Column(
        Integer,
        ForeignKey("customer_invoices.id"),
        nullable=True
    )

    vendor_bill_id = Column(
        Integer,
        ForeignKey("vendor_bills.id"),
        nullable=True
    )

    payment_date = Column(
        Date,
        nullable=False
    )

    amount = Column(
        Numeric(12, 2),
        nullable=False
    )

    payment_method = Column(
        String(20),
        nullable=False
    )

    reference = Column(
        String(100),
        nullable=True
    )

    status = Column(
        String(20),
        nullable=False,
        default="POSTED"
    )

    journal_entry_id = Column(
        Integer,
        ForeignKey("journal_entries.id"),
        nullable=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    __table_args__ = (
        CheckConstraint(
            "amount > 0",
            name="check_payment_amount_positive"
        ),
        CheckConstraint(
            "payment_type IN ('CUSTOMER', 'VENDOR')",
            name="check_payment_type"
        ),
        CheckConstraint(
            "payment_method IN ('BANK', 'CASH')",
            name="check_payment_method"
        ),
        CheckConstraint(
            """
            (
                customer_invoice_id IS NOT NULL
                AND vendor_bill_id IS NULL
            )
            OR
            (
                customer_invoice_id IS NULL
                AND vendor_bill_id IS NOT NULL
            )
            """,
            name="check_payment_one_source"
        ),
    )