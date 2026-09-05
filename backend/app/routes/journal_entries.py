from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.journal_entry import JournalEntry
from app.schemas.journal_entry import (
    JournalEntryCreate,
    JournalEntryResponse,
)
from app.services.accounting_service import create_journal_entry


router = APIRouter(
    prefix="/journal-entries",
    tags=["Journal Entries"]
)


@router.post(
    "/",
    response_model=JournalEntryResponse,
    status_code=201
)
def create_entry(
    entry_data: JournalEntryCreate,
    db: Session = Depends(get_db)
):
    return create_journal_entry(
        db=db,
        journal_id=entry_data.journal_id,
        entry_date=entry_data.entry_date,
        reference=entry_data.reference,
        description=entry_data.description,
        lines=entry_data.lines,
    )


@router.get(
    "/",
    response_model=List[JournalEntryResponse]
)
def get_entries(
    db: Session = Depends(get_db)
):
    return (
        db.query(JournalEntry)
        .options(joinedload(JournalEntry.lines))
        .order_by(JournalEntry.id.desc())
        .all()
    )


@router.get(
    "/{entry_id}",
    response_model=JournalEntryResponse
)
def get_entry(
    entry_id: int,
    db: Session = Depends(get_db)
):
    entry = (
        db.query(JournalEntry)
        .options(joinedload(JournalEntry.lines))
        .filter(JournalEntry.id == entry_id)
        .first()
    )

    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Journal entry not found"
        )

    return entry