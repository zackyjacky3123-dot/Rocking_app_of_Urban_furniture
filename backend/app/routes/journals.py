from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.journal import Journal
from app.models.account import Account
from app.schemas.journal import JournalCreate, JournalResponse


router = APIRouter(
    prefix="/journals",
    tags=["Journals"]
)


@router.get("/", response_model=List[JournalResponse])
def get_journals(db: Session = Depends(get_db)):
    journals = (
        db.query(Journal)
        .filter(Journal.is_active == True)
        .order_by(Journal.id)
        .all()
    )

    return journals


@router.get("/{journal_id}", response_model=JournalResponse)
def get_journal(
    journal_id: int,
    db: Session = Depends(get_db)
):
    journal = (
        db.query(Journal)
        .filter(
            Journal.id == journal_id,
            Journal.is_active == True
        )
        .first()
    )

    if not journal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal not found"
        )

    return journal


@router.post(
    "/",
    response_model=JournalResponse,
    status_code=status.HTTP_201_CREATED
)
def create_journal(
    journal_data: JournalCreate,
    db: Session = Depends(get_db)
):
    debit_account = (
        db.query(Account)
        .filter(
            Account.id == journal_data.default_debit_account_id,
            Account.is_active == True
        )
        .first()
    )

    credit_account = (
        db.query(Account)
        .filter(
            Account.id == journal_data.default_credit_account_id,
            Account.is_active == True
        )
        .first()
    )

    if not debit_account:
        raise HTTPException(
            status_code=400,
            detail="Default debit account not found"
        )

    if not credit_account:
        raise HTTPException(
            status_code=400,
            detail="Default credit account not found"
        )

    journal = Journal(
        name=journal_data.name,
        type=journal_data.type,
        default_debit_account_id=journal_data.default_debit_account_id,
        default_credit_account_id=journal_data.default_credit_account_id
    )

    db.add(journal)
    db.commit()
    db.refresh(journal)

    return journal


@router.put("/{journal_id}", response_model=JournalResponse)
def update_journal(
    journal_id: int,
    journal_data: JournalCreate,
    db: Session = Depends(get_db)
):
    journal = (
        db.query(Journal)
        .filter(
            Journal.id == journal_id,
            Journal.is_active == True
        )
        .first()
    )

    if not journal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal not found"
        )

    debit_account = (
        db.query(Account)
        .filter(
            Account.id == journal_data.default_debit_account_id,
            Account.is_active == True
        )
        .first()
    )

    credit_account = (
        db.query(Account)
        .filter(
            Account.id == journal_data.default_credit_account_id,
            Account.is_active == True
        )
        .first()
    )

    if not debit_account or not credit_account:
        raise HTTPException(
            status_code=400,
            detail="Default account not found"
        )

    journal.name = journal_data.name
    journal.type = journal_data.type
    journal.default_debit_account_id = (
        journal_data.default_debit_account_id
    )
    journal.default_credit_account_id = (
        journal_data.default_credit_account_id
    )

    db.commit()
    db.refresh(journal)

    return journal


@router.patch(
    "/{journal_id}/archive",
    response_model=JournalResponse
)
def archive_journal(
    journal_id: int,
    db: Session = Depends(get_db)
):
    journal = (
        db.query(Journal)
        .filter(Journal.id == journal_id)
        .first()
    )

    if not journal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal not found"
        )

    journal.is_active = False

    db.commit()
    db.refresh(journal)

    return journal