from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.sales_order import SalesOrder
from app.models.customer_invoice import CustomerInvoice

from app.schemas.sales import (
    SalesOrderCreate,
    SalesOrderResponse,
    CustomerInvoiceCreate,
    CustomerInvoiceResponse,
)

from app.services.sales_service import (
    create_sales_order,
    create_customer_invoice,
)


router = APIRouter(
    prefix="/sales",
    tags=["Sales"],
)


# =========================================================
# SALES ORDERS
# =========================================================

@router.post(
    "/orders",
    response_model=SalesOrderResponse,
    status_code=201,
)
def create_order(
    data: SalesOrderCreate,
    db: Session = Depends(get_db),
):
    return create_sales_order(db, data)


@router.get(
    "/orders",
    response_model=List[SalesOrderResponse],
)
def get_orders(
    db: Session = Depends(get_db),
):
    return (
        db.query(SalesOrder)
        .options(
            joinedload(SalesOrder.items)
        )
        .order_by(SalesOrder.id.desc())
        .all()
    )


@router.get(
    "/orders/{order_id}",
    response_model=SalesOrderResponse,
)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
):
    order = (
        db.query(SalesOrder)
        .options(
            joinedload(SalesOrder.items)
        )
        .filter(SalesOrder.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Sales order not found",
        )

    return order


# =========================================================
# CUSTOMER INVOICES
# =========================================================

@router.post(
    "/invoices",
    response_model=CustomerInvoiceResponse,
    status_code=201,
)
def create_invoice(
    data: CustomerInvoiceCreate,
    db: Session = Depends(get_db),
):
    return create_customer_invoice(db, data)


@router.get(
    "/invoices",
    response_model=List[CustomerInvoiceResponse],
)
def get_invoices(
    db: Session = Depends(get_db),
):
    return (
        db.query(CustomerInvoice)
        .options(
            joinedload(CustomerInvoice.items)
        )
        .order_by(CustomerInvoice.id.desc())
        .all()
    )


@router.get(
    "/invoices/{invoice_id}",
    response_model=CustomerInvoiceResponse,
)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
):
    invoice = (
        db.query(CustomerInvoice)
        .options(
            joinedload(CustomerInvoice.items)
        )
        .filter(CustomerInvoice.id == invoice_id)
        .first()
    )

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Customer invoice not found",
        )

    return invoice