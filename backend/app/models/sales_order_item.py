from sqlalchemy import (
    Column,
    Integer,
    Numeric,
    ForeignKey
)
from sqlalchemy.orm import relationship

from app.database import Base


class SalesOrderItem(Base):
    __tablename__ = "sales_order_items"

    id = Column(Integer, primary_key=True, index=True)

    sales_order_id = Column(
        Integer,
        ForeignKey(
            "sales_orders.id",
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

    sales_order = relationship(
        "SalesOrder",
        back_populates="items"
    )