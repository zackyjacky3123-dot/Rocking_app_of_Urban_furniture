from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime
from sqlalchemy.sql import func

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), nullable=False)
    type = Column(String(20), nullable=False)
    category = Column(String(100))

    sales_price = Column(Numeric(12, 2), nullable=False, default=0)
    purchase_price = Column(Numeric(12, 2), nullable=False, default=0)

    is_active = Column(Boolean, nullable=False, default=True)

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )