from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.contact import Contact
from app.models.product import Product
from app.models.purchase_order import PurchaseOrder
from app.models.purchase_order_item import PurchaseOrderItem
from app.models.vendor_bill import VendorBill
from app.models.vendor_bill_item import VendorBillItem
from app.models.account import Account
from app.models.journal import Journal

from app.services.accounting_service import create_journal_entry


# =========================================================
# CREATE PURCHASE ORDER
# =========================================================

def create_purchase_order(db: Session, data):

    vendor = (
        db.query(Contact)
        .filter(
            Contact.id == data.vendor_id,
            Contact.is_active.is_(True)
        )
        .first()
    )

    if not vendor:
        raise HTTPException(
            status_code=400,
            detail="Vendor not found"
        )

    if vendor.type not in ("VENDOR", "BOTH"):
        raise HTTPException(
            status_code=400,
            detail="Selected contact is not a vendor"
        )

    if not data.items:
        raise HTTPException(
            status_code=400,
            detail="Purchase order must contain at least one item"
        )

    order = PurchaseOrder(
        order_number=data.order_number,
        vendor_id=data.vendor_id,
        order_date=data.order_date,
        status="DRAFT",
        subtotal=Decimal("0.00"),
        tax_amount=Decimal("0.00"),
        total_amount=Decimal("0.00"),
    )

    db.add(order)
    db.flush()

    subtotal = Decimal("0.00")
    tax_total = Decimal("0.00")

    for item in data.items:

        product = (
            db.query(Product)
            .filter(
                Product.id == item.product_id,
                Product.is_active.is_(True)
            )
            .first()
        )

        if not product:
            db.rollback()
            raise HTTPException(
                status_code=400,
                detail=f"Product {item.product_id} not found"
            )

        quantity = Decimal(str(item.quantity))
        unit_price = Decimal(str(item.unit_price))
        tax_rate = Decimal(str(item.tax_rate))

        base_amount = quantity * unit_price

        tax_amount = (
            base_amount * tax_rate / Decimal("100")
        )

        line_total = base_amount + tax_amount

        subtotal += base_amount
        tax_total += tax_amount

        order_item = PurchaseOrderItem(
            purchase_order_id=order.id,
            product_id=product.id,
            quantity=quantity,
            unit_price=unit_price,
            tax_rate=tax_rate,
            tax_amount=tax_amount,
            line_total=line_total,
            received_quantity=Decimal("0.00"),
        )

        db.add(order_item)

    order.subtotal = subtotal
    order.tax_amount = tax_total
    order.total_amount = subtotal + tax_total

    db.commit()
    db.refresh(order)

    return order


# =========================================================
# CONFIRM PURCHASE ORDER
# =========================================================

def confirm_purchase_order(db: Session, order_id: int):

    order = (
        db.query(PurchaseOrder)
        .filter(PurchaseOrder.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Purchase order not found"
        )

    if order.status != "DRAFT":
        raise HTTPException(
            status_code=400,
            detail="Only draft orders can be confirmed"
        )

    order.status = "CONFIRMED"

    db.commit()
    db.refresh(order)

    return order


# =========================================================
# RECEIVE GOODS
# =========================================================

def receive_goods(db: Session, order_id: int, data):

    order = (
        db.query(PurchaseOrder)
        .filter(PurchaseOrder.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Purchase order not found"
        )

    if order.status not in ("CONFIRMED", "RECEIVED"):
        raise HTTPException(
            status_code=400,
            detail=(
                "Purchase order must be confirmed "
                "before receiving goods"
            )
        )

    if not data.items:
        raise HTTPException(
            status_code=400,
            detail="At least one item is required for receiving"
        )

    items_by_id = {
        item.id: item
        for item in order.items
    }

    for receive_item in data.items:

        order_item = items_by_id.get(receive_item.item_id)

        if not order_item:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Purchase order item "
                    f"{receive_item.item_id} not found"
                )
            )

        receive_quantity = Decimal(
            str(receive_item.quantity)
        )

        new_received_quantity = (
            Decimal(str(order_item.received_quantity))
            + receive_quantity
        )

        if new_received_quantity > Decimal(
            str(order_item.quantity)
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Cannot receive more than ordered "
                    f"for item {order_item.id}"
                )
            )

        order_item.received_quantity = (
            new_received_quantity
        )

    all_received = all(
        Decimal(str(item.received_quantity))
        >= Decimal(str(item.quantity))
        for item in order.items
    )

    if all_received:
        order.status = "RECEIVED"
    else:
        order.status = "CONFIRMED"

    db.commit()
    db.refresh(order)

    return order


# =========================================================
# CREATE VENDOR BILL
# =========================================================

def create_vendor_bill(db: Session, data):

    order = (
        db.query(PurchaseOrder)
        .filter(
            PurchaseOrder.id == data.purchase_order_id
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Purchase order not found"
        )

    if order.status != "RECEIVED":
        raise HTTPException(
            status_code=400,
            detail=(
                "Purchase order must be fully received "
                "before creating vendor bill"
            )
        )

    existing_bill = (
        db.query(VendorBill)
        .filter(
            VendorBill.purchase_order_id == order.id
        )
        .first()
    )

    if existing_bill:
        raise HTTPException(
            status_code=400,
            detail="Purchase order already has a vendor bill"
        )

    purchase_journal = (
        db.query(Journal)
        .filter(
            Journal.type == "PURCHASE",
            Journal.is_active.is_(True)
        )
        .first()
    )

    if not purchase_journal:
        raise HTTPException(
            status_code=400,
            detail="Purchase Journal not found"
        )

    purchase_expense = (
        db.query(Account)
        .filter(
            Account.name == "Purchase Expense",
            Account.type == "EXPENSE",
            Account.is_active.is_(True)
        )
        .first()
    )

    if not purchase_expense:
        raise HTTPException(
            status_code=400,
            detail="Purchase Expense account not found"
        )

    creditors = (
        db.query(Account)
        .filter(
            Account.name == "Creditors",
            Account.type == "LIABILITY",
            Account.is_active.is_(True)
        )
        .first()
    )

    if not creditors:
        raise HTTPException(
            status_code=400,
            detail="Creditors account not found"
        )

    bill = VendorBill(
        bill_number=data.bill_number,
        purchase_order_id=order.id,
        vendor_id=order.vendor_id,
        bill_date=data.bill_date,
        due_date=data.due_date,
        status="POSTED",
        subtotal=order.subtotal,
        tax_amount=order.tax_amount,
        total_amount=order.total_amount,
    )

    db.add(bill)
    db.flush()

    for order_item in order.items:

        bill_item = VendorBillItem(
            vendor_bill_id=bill.id,
            product_id=order_item.product_id,
            quantity=order_item.quantity,
            unit_price=order_item.unit_price,
            tax_rate=order_item.tax_rate,
            tax_amount=order_item.tax_amount,
            line_total=order_item.line_total,
        )

        db.add(bill_item)

    db.flush()

    accounting_lines = [
        {
            "account_id": purchase_expense.id,
            "debit": order.total_amount,
            "credit": Decimal("0.00"),
        },
        {
            "account_id": creditors.id,
            "debit": Decimal("0.00"),
            "credit": order.total_amount,
        },
    ]

    journal_entry = create_journal_entry(
        db=db,
        journal_id=purchase_journal.id,
        entry_date=data.bill_date,
        reference=data.bill_number,
        description=f"Vendor bill {data.bill_number}",
        lines=accounting_lines,
        source_type="VENDOR_BILL",
        source_id=bill.id,
    )

    bill.journal_entry_id = journal_entry.id

    order.status = "BILLED"

    db.commit()
    db.refresh(bill)

    return bill