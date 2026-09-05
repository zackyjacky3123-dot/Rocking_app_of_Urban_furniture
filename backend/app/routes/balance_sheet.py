from datetime import date

from fastapi import (
    APIRouter,
    Depends,
    Query,
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.balance_sheet import (
    BalanceSheetResponse,
)

from app.services.balance_sheet_service import (
    get_balance_sheet,
)


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


# =========================================================
# BALANCE SHEET
# =========================================================

@router.get(
    "/balance-sheet",
    response_model=BalanceSheetResponse,
)
def balance_sheet_report(
    as_of_date: date = Query(
        ...,
        description="Balance sheet date"
    ),
    db: Session = Depends(get_db),
):
    return get_balance_sheet(
        db=db,
        as_of_date=as_of_date,
    )