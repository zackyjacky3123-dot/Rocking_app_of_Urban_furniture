from decimal import Decimal
from datetime import date
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.journal_entry import JournalEntry
from app.models.journal_entry_line import JournalEntryLine
from app.models.journal import Journal


# =========================================================
# GET LEDGER FOR ONE ACCOUNT
# =========================================================

def get_account_ledger(
    db: Session,
    account_id: int,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
):
    # -----------------------------------------------------
    # CHECK ACCOUNT
    # -----------------------------------------------------

    account = (
        db.query(Account)
        .filter(Account.id == account_id)
        .first()
    )

    if not account:
        raise HTTPException(
            status_code=404,
            detail="Account not found"
        )

    # -----------------------------------------------------
    # BUILD QUERY
    # -----------------------------------------------------

    query = (
        db.query(
            JournalEntryLine,
            JournalEntry,
            Journal,
        )
        .join(
            JournalEntry,
            JournalEntryLine.journal_entry_id
            == JournalEntry.id
        )
        .join(
            Journal,
            JournalEntry.journal_id
            == Journal.id
        )
        .filter(
            JournalEntryLine.account_id == account_id
        )
    )

    # -----------------------------------------------------
    # DATE FILTER
    # -----------------------------------------------------

    if from_date:
        query = query.filter(
            JournalEntry.entry_date >= from_date
        )

    if to_date:
        query = query.filter(
            JournalEntry.entry_date <= to_date
        )

    # -----------------------------------------------------
    # ORDER
    # -----------------------------------------------------

    query = query.order_by(
        JournalEntry.entry_date.asc(),
        JournalEntry.id.asc(),
        JournalEntryLine.id.asc(),
    )

    rows = query.all()

    # -----------------------------------------------------
    # RUNNING BALANCE
    # -----------------------------------------------------

    balance = Decimal("0.00")

    result = []

    for line, entry, journal in rows:

        debit = Decimal(str(line.debit or 0))
        credit = Decimal(str(line.credit or 0))

        # -------------------------------------------------
        # ACCOUNTING BALANCE
        #
        # Asset / Expense:
        #     Debit increases balance
        #
        # Liability / Income / Capital:
        #     Credit increases balance
        # -------------------------------------------------

        if account.type in ("ASSET", "EXPENSE"):
            balance += debit - credit
        else:
            balance += credit - debit

        result.append({
            "account_id": account.id,
            "account_name": account.name,

            "entry_id": entry.id,
            "journal_id": journal.id,
            "journal_name": journal.name,

            "entry_date": entry.entry_date,
            "reference": entry.reference,
            "description": entry.description,

            "debit": debit,
            "credit": credit,
            "balance": balance,
        })

    return result


# =========================================================
# GET COMPLETE LEDGER
# =========================================================

def get_all_ledger(
    db: Session,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
):
    accounts = (
        db.query(Account)
        .filter(Account.is_active.is_(True))
        .order_by(Account.id.asc())
        .all()
    )

    result = []

    for account in accounts:

        lines = get_account_ledger(
            db=db,
            account_id=account.id,
            from_date=from_date,
            to_date=to_date,
        )

        result.extend(lines)

    return result