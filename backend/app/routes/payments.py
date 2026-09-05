from typing import List

from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.payment import (
    CustomerPaymentCreate,
    VendorPaymentCreate,
    PaymentResponse,
)

from app.services.payment_service import (
    create_customer_payment,
    create_vendor_payment,
    get_all_payments,
    get_payment,
)


router = APIRouter(
    prefix="/payments",
    tags=["Payments"],
)


# =========================================================
# CUSTOMER PAYMENT
# =========================================================

@router.post(
    "/customer",
    response_model=PaymentResponse,
    status_code=201,
)
def create_customer_payment_route(
    data: CustomerPaymentCreate,
    db: Session = Depends(get_db),
):

    return create_customer_payment(
        db,
        data
    )


# =========================================================
# VENDOR PAYMENT
# =========================================================

@router.post(
    "/vendor",
    response_model=PaymentResponse,
    status_code=201,
)
def create_vendor_payment_route(
    data: VendorPaymentCreate,
    db: Session = Depends(get_db),
):

    return create_vendor_payment(
        db,
        data
    )


# =========================================================
# GET ALL PAYMENTS
# =========================================================

@router.get(
    "/",
    response_model=List[PaymentResponse],
)
def list_payments(
    db: Session = Depends(get_db),
):

    return get_all_payments(db)


# =========================================================
# GET PAYMENT BY ID
# =========================================================

@router.get(
    "/{payment_id}",
    response_model=PaymentResponse,
)
def payment_detail(
    payment_id: int,
    db: Session = Depends(get_db),
):

    return get_payment(
        db,
        payment_id
    )