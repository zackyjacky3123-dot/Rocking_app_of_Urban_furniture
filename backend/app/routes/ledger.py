from typing import List, Optional
from datetime import date

from fastapi import (
    APIRouter,
    Depends,
    Query,
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.ledger import LedgerLineResponse

from app.services.ledger_service import (
    get_account_ledger,
    get_all_ledger,
)


router = APIRouter(
    prefix="/ledger",
    tags=["Ledger"],
)


# =========================================================
# COMPLETE LEDGER
# =========================================================

@router.get(
    "/",
    response_model=List[LedgerLineResponse],
)
def get_ledger(
    from_date: Optional[date] = Query(
        default=None
    ),
    to_date: Optional[date] = Query(
        default=None
    ),
    db: Session = Depends(get_db),
):
    return get_all_ledger(
        db=db,
        from_date=from_date,
        to_date=to_date,
    )


# =========================================================
# LEDGER FOR ONE ACCOUNT
# =========================================================

@router.get(
    "/{account_id}",
    response_model=List[LedgerLineResponse],
)
def get_account_ledger_route(
    account_id: int,
    from_date: Optional[date] = Query(
        default=None
    ),
    to_date: Optional[date] = Query(
        default=None
    ),
    db: Session = Depends(get_db),
):
    return get_account_ledger(
        db=db,
        account_id=account_id,
        from_date=from_date,
        to_date=to_date,
    )