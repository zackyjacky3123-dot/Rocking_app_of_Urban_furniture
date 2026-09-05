from typing import List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from sqlalchemy.orm import (
    Session,
    joinedload,
)

from app.database import get_db

from app.models.purchase_order import PurchaseOrder
from app.models.vendor_bill import VendorBill

from app.schemas.purchase import (
    PurchaseOrderCreate,
    PurchaseOrderResponse,
    ReceivePurchaseRequest,
    VendorBillCreate,
    VendorBillResponse,
)

from app.services.purchase_service import (
    create_purchase_order,
    confirm_purchase_order,
    receive_goods,
    create_vendor_bill,
)


router = APIRouter(
    prefix="/purchase",
    tags=["Purchase"],
)


# =====================================================
# PURCHASE ORDERS
# =====================================================

@router.post(
    "/orders",
    response_model=PurchaseOrderResponse,
    status_code=201,
)
def create_order(
    data: PurchaseOrderCreate,
    db: Session = Depends(get_db),
):
    return create_purchase_order(
        db,
        data
    )


@router.get(
    "/orders",
    response_model=List[PurchaseOrderResponse],
)
def get_orders(
    db: Session = Depends(get_db),
):
    return (
        db.query(PurchaseOrder)
        .options(
            joinedload(PurchaseOrder.items)
        )
        .order_by(PurchaseOrder.id.desc())
        .all()
    )


@router.get(
    "/orders/{order_id}",
    response_model=PurchaseOrderResponse,
)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
):
    order = (
        db.query(PurchaseOrder)
        .options(
            joinedload(PurchaseOrder.items)
        )
        .filter(
            PurchaseOrder.id == order_id
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Purchase order not found",
        )

    return order


@router.patch(
    "/orders/{order_id}/confirm",
    response_model=PurchaseOrderResponse,
)
def confirm_order(
    order_id: int,
    db: Session = Depends(get_db),
):
    return confirm_purchase_order(
        db,
        order_id
    )


@router.post(
    "/orders/{order_id}/receive",
    response_model=PurchaseOrderResponse,
)
def receive_order_goods(
    order_id: int,
    data: ReceivePurchaseRequest,
    db: Session = Depends(get_db),
):
    return receive_goods(
        db,
        order_id,
        data
    )


# =====================================================
# VENDOR BILLS
# =====================================================

@router.post(
    "/bills",
    response_model=VendorBillResponse,
    status_code=201,
)
def create_bill(
    data: VendorBillCreate,
    db: Session = Depends(get_db),
):
    return create_vendor_bill(
        db,
        data
    )


@router.get(
    "/bills",
    response_model=List[VendorBillResponse],
)
def get_bills(
    db: Session = Depends(get_db),
):
    return (
        db.query(VendorBill)
        .options(
            joinedload(VendorBill.items)
        )
        .order_by(VendorBill.id.desc())
        .all()
    )


@router.get(
    "/bills/{bill_id}",
    response_model=VendorBillResponse,
)
def get_bill(
    bill_id: int,
    db: Session = Depends(get_db),
):
    bill = (
        db.query(VendorBill)
        .options(
            joinedload(VendorBill.items)
        )
        .filter(
            VendorBill.id == bill_id
        )
        .first()
    )

    if not bill:
        raise HTTPException(
            status_code=404,
            detail="Vendor bill not found",
        )

    return bill