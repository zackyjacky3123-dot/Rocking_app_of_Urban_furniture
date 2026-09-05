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


class SalesOrder(Base):
    __tablename__ = "sales_orders"

    id = Column(Integer, primary_key=True, index=True)

    order_number = Column(
        String(50),
        unique=True,
        nullable=False
    )

    customer_id = Column(
        Integer,
        ForeignKey("contacts.id"),
        nullable=False
    )

    order_date = Column(
        Date,
        nullable=False,
        server_default=func.current_date()
    )

    status = Column(
        String(20),
        nullable=False,
        default="DRAFT"
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
        "SalesOrderItem",
        back_populates="sales_order",
        cascade="all, delete-orphan"
    )