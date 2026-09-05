from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.budget import Budget
from app.models.budget_line import BudgetLine
from app.models.journal_entry import JournalEntry
from app.models.journal_entry_line import JournalEntryLine


# =========================================================
# BUDGET REPORT
# =========================================================

def get_budget_report(
    db: Session,
    budget_id: int
):
    # -----------------------------------------------------
    # GET BUDGET
    # -----------------------------------------------------

    budget = (
        db.query(Budget)
        .filter(
            Budget.id == budget_id
        )
        .first()
    )

    if not budget:
        raise HTTPException(
            status_code=404,
            detail="Budget not found"
        )

    # -----------------------------------------------------
    # GET BUDGET LINES + ACCOUNT
    # -----------------------------------------------------

    budget_lines = (
        db.query(BudgetLine)
        .filter(
            BudgetLine.budget_id == budget.id
        )
        .all()
    )

    result_lines = []

    total_budget = Decimal("0.00")
    total_actual = Decimal("0.00")

    # -----------------------------------------------------
    # CALCULATE ACTUAL VS BUDGET
    # -----------------------------------------------------

    for budget_line in budget_lines:

        account = budget_line.account

        # -------------------------------------------------
        # GET JOURNAL ACTUALS
        # -------------------------------------------------

        rows = (
            db.query(
                JournalEntryLine.debit,
                JournalEntryLine.credit,
            )
            .join(
                JournalEntry,
                JournalEntryLine.journal_entry_id
                == JournalEntry.id
            )
            .filter(
                JournalEntryLine.account_id
                == account.id,

                JournalEntry.entry_date
                >= budget.start_date,

                JournalEntry.entry_date
                <= budget.end_date,
            )
            .all()
        )

        debit_total = sum(
            (
                Decimal(str(row.debit or 0))
                for row in rows
            ),
            Decimal("0.00")
        )

        credit_total = sum(
            (
                Decimal(str(row.credit or 0))
                for row in rows
            ),
            Decimal("0.00")
        )

        # -------------------------------------------------
        # ACCOUNTING SIGN
        #
        # EXPENSE:
        #     Debit - Credit
        #
        # INCOME:
        #     Credit - Debit
        # -------------------------------------------------

        if account.type == "EXPENSE":

            actual_amount = (
                debit_total - credit_total
            )

        else:

            actual_amount = (
                credit_total - debit_total
            )

        budget_amount = Decimal(
            str(budget_line.budget_amount)
        )

        # -------------------------------------------------
        # VARIANCE
        #
        # Positive = actual greater than budget
        # Negative = actual less than budget
        # -------------------------------------------------

        variance = (
            actual_amount - budget_amount
        )

        # -------------------------------------------------
        # UTILIZATION
        # -------------------------------------------------

        if budget_amount > Decimal("0.00"):

            utilization_percent = (
                actual_amount
                / budget_amount
                * Decimal("100")
            )

        else:

            utilization_percent = Decimal("0.00")

        result_lines.append({
            "account_id": account.id,
            "account_name": account.name,
            "account_type": account.type,

            "budget_amount": budget_amount,

            "actual_amount": actual_amount,

            "variance": variance,

            "utilization_percent":
                utilization_percent,
        })

        total_budget += budget_amount
        total_actual += actual_amount

    # -----------------------------------------------------
    # TOTAL VARIANCE
    # -----------------------------------------------------

    total_variance = (
        total_actual - total_budget
    )

    # -----------------------------------------------------
    # RETURN
    # -----------------------------------------------------

    return {
        "budget_id": budget.id,
        "budget_name": budget.name,

        "start_date": budget.start_date,
        "end_date": budget.end_date,

        "status": budget.status,

        "lines": result_lines,

        "total_budget": total_budget,
        "total_actual": total_actual,
        "total_variance": total_variance,
    }