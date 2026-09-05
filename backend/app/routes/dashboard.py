from datetime import date
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    Query,
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.dashboard import (
    DashboardSummaryResponse,
)

from app.services.dashboard_service import (
    get_dashboard_summary,
)


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


# =========================================================
# DASHBOARD SUMMARY
# =========================================================

@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
)
def dashboard_summary(
    from_date: Optional[date] = Query(
        default=None
    ),
    to_date: Optional[date] = Query(
        default=None
    ),
    db: Session = Depends(get_db),
):
    return get_dashboard_summary(
        db=db,
        from_date=from_date,
        to_date=to_date,
    )