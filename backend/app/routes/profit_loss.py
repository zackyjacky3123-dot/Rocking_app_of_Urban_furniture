from datetime import date

from fastapi import (
    APIRouter,
    Depends,
    Query,
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.profit_loss import ProfitLossResponse

from app.services.profit_loss_service import get_profit_loss


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


# =========================================================
# PROFIT & LOSS
# =========================================================

@router.get(
    "/profit-loss",
    response_model=ProfitLossResponse,
)
def profit_loss_report(
    from_date: date = Query(
        ...,
        description="Start date"
    ),
    to_date: date = Query(
        ...,
        description="End date"
    ),
    db: Session = Depends(get_db),
):
    return get_profit_loss(
        db=db,
        from_date=from_date,
        to_date=to_date,
    )