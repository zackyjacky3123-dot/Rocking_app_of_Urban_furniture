from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from app.models.budget import Budget
from app.models.budget_line import BudgetLine
from app.models.account import Account


# =========================================================
# CREATE BUDGET
# =========================================================

def create_budget(
    db: Session,
    data
):
    # -----------------------------------------------------
    # DATE VALIDATION
    # -----------------------------------------------------

    if data.start_date > data.end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date cannot be greater than end_date"
        )

    # -----------------------------------------------------
    # AT LEAST ONE LINE
    # -----------------------------------------------------

    if not data.lines:
        raise HTTPException(
            status_code=400,
            detail="Budget must contain at least one line"
        )

    # -----------------------------------------------------
    # CREATE BUDGET
    # -----------------------------------------------------

    budget = Budget(
        name=data.name,
        start_date=data.start_date,
        end_date=data.end_date,
        status="DRAFT",
    )

    db.add(budget)
    db.flush()

    seen_accounts = set()

    # -----------------------------------------------------
    # CREATE BUDGET LINES
    # -----------------------------------------------------

    for line in data.lines:

        if line.account_id in seen_accounts:
            db.rollback()

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Account {line.account_id} "
                    f"appears more than once in budget"
                )
            )

        seen_accounts.add(line.account_id)

        account = (
            db.query(Account)
            .filter(
                Account.id == line.account_id,
                Account.is_active.is_(True)
            )
            .first()
        )

        if not account:
            db.rollback()

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Account {line.account_id} not found"
                )
            )

        # -------------------------------------------------
        # BUDGET ONLY FOR INCOME / EXPENSE
        # -------------------------------------------------

        if account.type not in ("INCOME", "EXPENSE"):
            db.rollback()

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Account '{account.name}' "
                    f"cannot be used for a budget. "
                    f"Only INCOME and EXPENSE accounts "
                    f"are allowed."
                )
            )

        amount = Decimal(
            str(line.budget_amount)
        )

        budget_line = BudgetLine(
            budget_id=budget.id,
            account_id=account.id,
            budget_amount=amount,
        )

        db.add(budget_line)

    db.commit()
    db.refresh(budget)

    return budget


# =========================================================
# GET ALL BUDGETS
# =========================================================

def get_all_budgets(
    db: Session
):
    return (
        db.query(Budget)
        .options(
            joinedload(Budget.lines)
        )
        .order_by(Budget.id.desc())
        .all()
    )


# =========================================================
# GET BUDGET
# =========================================================

def get_budget(
    db: Session,
    budget_id: int
):
    budget = (
        db.query(Budget)
        .options(
            joinedload(Budget.lines)
        )
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

    return budget


# =========================================================
# ACTIVATE BUDGET
# =========================================================

def activate_budget(
    db: Session,
    budget_id: int
):
    budget = get_budget(
        db,
        budget_id
    )

    if budget.status != "DRAFT":
        raise HTTPException(
            status_code=400,
            detail="Only draft budgets can be activated"
        )

    if not budget.lines:
        raise HTTPException(
            status_code=400,
            detail="Budget must contain at least one line"
        )

    budget.status = "ACTIVE"

    db.commit()
    db.refresh(budget)

    return budget


# =========================================================
# CLOSE BUDGET
# =========================================================

def close_budget(
    db: Session,
    budget_id: int
):
    budget = get_budget(
        db,
        budget_id
    )

    if budget.status != "ACTIVE":
        raise HTTPException(
            status_code=400,
            detail="Only active budgets can be closed"
        )

    budget.status = "CLOSED"

    db.commit()
    db.refresh(budget)

    return budget