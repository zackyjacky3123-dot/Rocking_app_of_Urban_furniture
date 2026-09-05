from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    journal_id = Column(
        Integer,
        ForeignKey("journals.id"),
        nullable=False
    )

    entry_date = Column(
        Date,
        nullable=False,
        server_default=func.current_date()
    )

    reference = Column(
        String(100),
        nullable=True
    )

    description = Column(
        String(255),
        nullable=True
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now()
    )

    lines = relationship(
        "JournalEntryLine",
        back_populates="journal_entry",
        cascade="all, delete-orphan"
    )
    source_type = Column(String(50), nullable=True)
    source_id = Column(Integer, nullable=True)