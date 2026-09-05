from sqlalchemy import (
    Column,
    Integer,
    Numeric,
    ForeignKey,
    DateTime,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class BudgetLine(Base):
    __tablename__ = "budget_lines"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    budget_id = Column(
        Integer,
        ForeignKey("budgets.id", ondelete="CASCADE"),
        nullable=False
    )

    account_id = Column(
        Integer,
        ForeignKey("accounts.id"),
        nullable=False
    )

    budget_amount = Column(
        Numeric(12, 2),
        nullable=False
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    budget = relationship(
        "Budget",
        back_populates="lines"
    )

    account = relationship(
        "Account"
    )