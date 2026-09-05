from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.journal import Journal
from app.models.journal_entry import JournalEntry
from app.models.journal_entry_line import JournalEntryLine


def create_journal_entry(
    db: Session,
    journal_id: int,
    entry_date,
    reference,
    description,
    lines,
    source_type=None,
    source_id=None
):
    # -------------------------------------------------
    # 1. Validate Journal
    # -------------------------------------------------
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
            status_code=400,
            detail="Journal not found"
        )

    # -------------------------------------------------
    # 2. Validate at least two lines
    # -------------------------------------------------
    if len(lines) < 2:
        raise HTTPException(
            status_code=400,
            detail="A journal entry must contain at least two lines"
        )

    total_debit = Decimal("0.00")
    total_credit = Decimal("0.00")

    validated_lines = []

    # -------------------------------------------------
    # 3. Validate each line
    # -------------------------------------------------
    for line in lines:

        # Sales Service sends dictionaries,
        # while Journal Entry API sends Pydantic objects.
        if isinstance(line, dict):
            account_id = line["account_id"]
            debit = Decimal(str(line["debit"]))
            credit = Decimal(str(line["credit"]))
        else:
            account_id = line.account_id
            debit = Decimal(str(line.debit))
            credit = Decimal(str(line.credit))

        # ---------------------------------------------
        # Validate Account
        # ---------------------------------------------
        account = (
            db.query(Account)
            .filter(
                Account.id == account_id,
                Account.is_active == True
            )
            .first()
        )

        if not account:
            raise HTTPException(
                status_code=400,
                detail=f"Account {account_id} not found"
            )

        # ---------------------------------------------
        # Validate negative values
        # ---------------------------------------------
        if debit < 0 or credit < 0:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Account {account_id} "
                    "cannot have negative values"
                )
            )

        # ---------------------------------------------
        # A line cannot have both debit and credit
        # ---------------------------------------------
        if debit > 0 and credit > 0:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Account {account_id} "
                    "cannot have both debit and credit"
                )
            )

        # ---------------------------------------------
        # A line must have one side
        # ---------------------------------------------
        if debit == 0 and credit == 0:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Account {account_id} "
                    "must have either debit or credit"
                )
            )

        total_debit += debit
        total_credit += credit

        validated_lines.append(
            {
                "account_id": account.id,
                "debit": debit,
                "credit": credit
            }
        )

    # -------------------------------------------------
    # 4. Double-entry validation
    # -------------------------------------------------
    if total_debit != total_credit:
        raise HTTPException(
            status_code=400,
            detail=(
                "Journal entry is not balanced. "
                f"Debit={total_debit}, Credit={total_credit}"
            )
        )

    # -------------------------------------------------
    # 5. Create Journal Entry
    # -------------------------------------------------
    journal_entry = JournalEntry(
    journal_id=journal_id,
    entry_date=entry_date,
    reference=reference,
    description=description,
    source_type=source_type,
    source_id=source_id
)

    db.add(journal_entry)
    db.flush()

    # -------------------------------------------------
    # 6. Create Journal Entry Lines
    # -------------------------------------------------
    for line in validated_lines:

        journal_entry_line = JournalEntryLine(
            journal_entry_id=journal_entry.id,
            account_id=line["account_id"],
            debit=line["debit"],
            credit=line["credit"]
        )

        db.add(journal_entry_line)

    # -------------------------------------------------
    # 7. Save everything together
    # -------------------------------------------------
    try:
        db.commit()
        db.refresh(journal_entry)

        return journal_entry

    except Exception:
        db.rollback()
        raise