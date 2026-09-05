from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class Journal(Base):
    __tablename__ = "journals"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), nullable=False)
    type = Column(String(20), nullable=False)

    default_debit_account_id = Column(
        Integer,
        ForeignKey("accounts.id")
    )

    default_credit_account_id = Column(
        Integer,
        ForeignKey("accounts.id")
    )

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