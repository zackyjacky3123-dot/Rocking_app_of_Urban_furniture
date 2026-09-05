from datetime import date
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.journal_entry import JournalEntry
from app.models.journal_entry_line import JournalEntryLine


# =========================================================
# PROFIT & LOSS
# =========================================================

def get_profit_loss(
    db: Session,
    from_date: date,
    to_date: date,
):
    # -----------------------------------------------------
    # DATE VALIDATION
    # -----------------------------------------------------

    if from_date > to_date:
        raise HTTPException(
            status_code=400,
            detail="from_date cannot be greater than to_date"
        )

    # -----------------------------------------------------
    # GET ALL INCOME / EXPENSE ACCOUNTS
    # -----------------------------------------------------

    accounts = (
        db.query(Account)
        .filter(
            Account.type.in_(["INCOME", "EXPENSE"]),
            Account.is_active.is_(True),
        )
        .order_by(Account.id.asc())
        .all()
    )

    revenue_accounts = []
    expense_accounts = []

    total_revenue = Decimal("0.00")
    total_expenses = Decimal("0.00")

    # -----------------------------------------------------
    # CALCULATE EACH ACCOUNT
    # -----------------------------------------------------

    for account in accounts:

        rows = (
            db.query(
                JournalEntryLine.debit,
                JournalEntryLine.credit,
            )
            .join(
                JournalEntry,
                JournalEntryLine.journal_entry_id
                == JournalEntry.id,
            )
            .filter(
                JournalEntryLine.account_id == account.id,
                JournalEntry.entry_date >= from_date,
                JournalEntry.entry_date <= to_date,
            )
            .all()
        )

        debit_total = sum(
            (
                Decimal(str(row.debit or 0))
                for row in rows
            ),
            Decimal("0.00"),
        )

        credit_total = sum(
            (
                Decimal(str(row.credit or 0))
                for row in rows
            ),
            Decimal("0.00"),
        )

        # -------------------------------------------------
        # ACCOUNTING RULE
        #
        # INCOME:
        #   Credit - Debit
        #
        # EXPENSE:
        #   Debit - Credit
        # -------------------------------------------------

        if account.type == "INCOME":
            amount = credit_total - debit_total

            if amount != Decimal("0.00"):
                revenue_accounts.append({
                    "account_id": account.id,
                    "account_name": account.name,
                    "account_type": account.type,
                    "amount": amount,
                })

                total_revenue += amount

        elif account.type == "EXPENSE":
            amount = debit_total - credit_total

            if amount != Decimal("0.00"):
                expense_accounts.append({
                    "account_id": account.id,
                    "account_name": account.name,
                    "account_type": account.type,
                    "amount": amount,
                })

                total_expenses += amount

    # -----------------------------------------------------
    # NET PROFIT
    # -----------------------------------------------------

    net_profit = total_revenue - total_expenses

    # -----------------------------------------------------
    # RETURN REPORT
    # -----------------------------------------------------

    return {
        "from_date": from_date,
        "to_date": to_date,

        "revenue_accounts": revenue_accounts,
        "expense_accounts": expense_accounts,

        "total_revenue": total_revenue,
        "total_expenses": total_expenses,

        "net_profit": net_profit,
    }