from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.account import Account
from app.schemas.account import AccountCreate, AccountResponse


router = APIRouter(
    prefix="/accounts",
    tags=["Accounts"]
)


@router.get("/", response_model=List[AccountResponse])
def get_accounts(db: Session = Depends(get_db)):
    accounts = (
        db.query(Account)
        .filter(Account.is_active == True)
        .order_by(Account.id)
        .all()
    )

    return accounts


@router.get("/{account_id}", response_model=AccountResponse)
def get_account(
    account_id: int,
    db: Session = Depends(get_db)
):
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
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )

    return account


@router.post(
    "/",
    response_model=AccountResponse,
    status_code=status.HTTP_201_CREATED
)
def create_account(
    account_data: AccountCreate,
    db: Session = Depends(get_db)
):
    account = Account(
        name=account_data.name,
        type=account_data.type
    )

    db.add(account)
    db.commit()
    db.refresh(account)

    return account


@router.put("/{account_id}", response_model=AccountResponse)
def update_account(
    account_id: int,
    account_data: AccountCreate,
    db: Session = Depends(get_db)
):
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
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )

    account.name = account_data.name
    account.type = account_data.type

    db.commit()
    db.refresh(account)

    return account


@router.patch(
    "/{account_id}/archive",
    response_model=AccountResponse
)
def archive_account(
    account_id: int,
    db: Session = Depends(get_db)
):
    account = (
        db.query(Account)
        .filter(Account.id == account_id)
        .first()
    )

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )

    account.is_active = False

    db.commit()
    db.refresh(account)

    return account