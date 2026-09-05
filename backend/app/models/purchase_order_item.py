from sqlalchemy import (
    Column,
    Integer,
    Numeric,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from app.database import Base


class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    purchase_order_id = Column(
        Integer,
        ForeignKey(
            "purchase_orders.id",
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

    received_quantity = Column(
        Numeric(12, 2),
        nullable=False,
        default=0
    )

    purchase_order = relationship(
        "PurchaseOrder",
        back_populates="items"
    )