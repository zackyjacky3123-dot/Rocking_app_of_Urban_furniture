from typing import List

from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.budget import (
    BudgetCreate,
    BudgetResponse,
)

from app.services.budget_service import (
    create_budget,
    get_all_budgets,
    get_budget,
    activate_budget,
    close_budget,
)


router = APIRouter(
    prefix="/budgets",
    tags=["Budgets"],
)


# =========================================================
# CREATE BUDGET
# =========================================================

@router.post(
    "/",
    response_model=BudgetResponse,
    status_code=201,
)
def create_budget_route(
    data: BudgetCreate,
    db: Session = Depends(get_db),
):
    return create_budget(
        db,
        data
    )


# =========================================================
# GET ALL BUDGETS
# =========================================================

@router.get(
    "/",
    response_model=List[BudgetResponse],
)
def get_budgets(
    db: Session = Depends(get_db),
):
    return get_all_budgets(db)


# =========================================================
# GET BUDGET
# =========================================================

@router.get(
    "/{budget_id}",
    response_model=BudgetResponse,
)
def get_budget_route(
    budget_id: int,
    db: Session = Depends(get_db),
):
    return get_budget(
        db,
        budget_id
    )


# =========================================================
# ACTIVATE
# =========================================================

@router.patch(
    "/{budget_id}/activate",
    response_model=BudgetResponse,
)
def activate_budget_route(
    budget_id: int,
    db: Session = Depends(get_db),
):
    return activate_budget(
        db,
        budget_id
    )


# =========================================================
# CLOSE
# =========================================================

@router.patch(
    "/{budget_id}/close",
    response_model=BudgetResponse,
)
def close_budget_route(
    budget_id: int,
    db: Session = Depends(get_db),
):
    return close_budget(
        db,
        budget_id
    )