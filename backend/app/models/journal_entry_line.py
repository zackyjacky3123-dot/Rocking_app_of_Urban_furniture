from sqlalchemy import (
    Column,
    Integer,
    Numeric,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from app.database import Base


class JournalEntryLine(Base):
    __tablename__ = "journal_entry_lines"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    journal_entry_id = Column(
        Integer,
        ForeignKey(
            "journal_entries.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    account_id = Column(
        Integer,
        ForeignKey("accounts.id"),
        nullable=False
    )

    debit = Column(
        Numeric(12, 2),
        nullable=False,
        default=0
    )

    credit = Column(
        Numeric(12, 2),
        nullable=False,
        default=0
    )

    journal_entry = relationship(
        "JournalEntry",
        back_populates="lines"
    )