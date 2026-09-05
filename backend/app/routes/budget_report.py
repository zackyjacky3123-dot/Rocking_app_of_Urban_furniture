from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.budget import (
    BudgetReportResponse,
)

from app.services.budget_report_service import (
    get_budget_report,
)


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


# =========================================================
# BUDGET REPORT
# =========================================================

@router.get(
    "/budget/{budget_id}",
    response_model=BudgetReportResponse,
)
def budget_report(
    budget_id: int,
    db: Session = Depends(get_db),
):
    return get_budget_report(
        db,
        budget_id
    )