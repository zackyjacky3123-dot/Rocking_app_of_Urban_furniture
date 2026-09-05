from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.contact import Contact
from app.models.product import Product
from app.models.sales_order import SalesOrder
from app.models.sales_order_item import SalesOrderItem
from app.models.customer_invoice import CustomerInvoice
from app.models.invoice_item import InvoiceItem
from app.models.account import Account
from app.models.journal import Journal

from app.services.accounting_service import create_journal_entry


def create_sales_order(
    db: Session,
    data
):
    # --------------------------------------------
    # 1. Validate customer
    # --------------------------------------------
    customer = (
        db.query(Contact)
        .filter(
            Contact.id == data.customer_id,
            Contact.is_active.is_(True)
        )
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=400,
            detail="Customer not found"
        )

    if customer.type not in ("CUSTOMER", "BOTH"):
        raise HTTPException(
            status_code=400,
            detail="Selected contact is not a customer"
        )

    # --------------------------------------------
    # 2. Validate items
    # --------------------------------------------
    if not data.items:
        raise HTTPException(
            status_code=400,
            detail="Sales order must contain at least one item"
        )

    # --------------------------------------------
    # 3. Create order
    # --------------------------------------------
    order = SalesOrder(
        order_number=data.order_number,
        customer_id=data.customer_id,
        order_date=data.order_date,
        status="DRAFT"
    )

    db.add(order)
    db.flush()

    subtotal = Decimal("0.00")
    tax_total = Decimal("0.00")

    # --------------------------------------------
    # 4. Create order items + calculate totals
    # --------------------------------------------
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
            raise HTTPException(
                status_code=400,
                detail=f"Product {item.product_id} not found"
            )

        base_amount = (
            item.quantity * item.unit_price
        )

        tax_amount = (
            base_amount
            * item.tax_rate
            / Decimal("100")
        )

        line_total = base_amount + tax_amount

        subtotal += base_amount
        tax_total += tax_amount

        order_item = SalesOrderItem(
            sales_order_id=order.id,
            product_id=product.id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            tax_rate=item.tax_rate,
            tax_amount=tax_amount,
            line_total=line_total
        )

        db.add(order_item)

    order.subtotal = subtotal
    order.tax_amount = tax_total
    order.total_amount = subtotal + tax_total

    db.commit()
    db.refresh(order)

    return order


def create_customer_invoice(
    db: Session,
    data
):
    # --------------------------------------------
    # 1. Find Sales Order
    # --------------------------------------------
    order = (
        db.query(SalesOrder)
        .filter(
            SalesOrder.id == data.sales_order_id
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Sales order not found"
        )

    # --------------------------------------------
    # 2. Validate order status
    # --------------------------------------------
    if order.status in ("CANCELLED", "INVOICED"):
        raise HTTPException(
            status_code=400,
            detail="Sales order cannot be invoiced"
        )

    if not order.items:
        raise HTTPException(
            status_code=400,
            detail="Sales order has no items"
        )

    # --------------------------------------------
    # 3. Prevent duplicate invoice
    # --------------------------------------------
    existing_invoice = (
        db.query(CustomerInvoice)
        .filter(
            CustomerInvoice.sales_order_id == order.id
        )
        .first()
    )

    if existing_invoice:
        raise HTTPException(
            status_code=400,
            detail="Sales order already has an invoice"
        )

    # --------------------------------------------
    # 4. Find Sales Journal
    # --------------------------------------------
    sales_journal = (
        db.query(Journal)
        .filter(
            Journal.type == "SALES",
            Journal.is_active.is_(True)
        )
        .first()
    )

    if not sales_journal:
        raise HTTPException(
            status_code=400,
            detail="Sales Journal not found"
        )

    # --------------------------------------------
    # 5. Find Debtors account
    # --------------------------------------------
    debtors_account = (
        db.query(Account)
        .filter(
            Account.name == "Debtors",
            Account.type == "ASSET",
            Account.is_active.is_(True)
        )
        .first()
    )

    if not debtors_account:
        raise HTTPException(
            status_code=400,
            detail="Debtors account not found"
        )

    # --------------------------------------------
    # 6. Find Tax Payable account
    # --------------------------------------------
    tax_account = (
        db.query(Account)
        .filter(
            Account.name == "Tax Payable",
            Account.type == "LIABILITY",
            Account.is_active.is_(True)
        )
        .first()
    )

    if order.tax_amount > 0 and not tax_account:
        raise HTTPException(
            status_code=400,
            detail="Tax Payable account not found"
        )

    # --------------------------------------------
    # 7. Create invoice
    # --------------------------------------------
    invoice = CustomerInvoice(
        invoice_number=data.invoice_number,
        sales_order_id=order.id,
        customer_id=order.customer_id,
        invoice_date=data.invoice_date,
        due_date=data.due_date,
        status="POSTED",
        subtotal=order.subtotal,
        tax_amount=order.tax_amount,
        total_amount=order.total_amount
    )

    db.add(invoice)
    db.flush()

    # --------------------------------------------
    # 8. Copy order items to invoice items
    # --------------------------------------------
    for order_item in order.items:

        invoice_item = InvoiceItem(
            customer_invoice_id=invoice.id,
            product_id=order_item.product_id,
            quantity=order_item.quantity,
            unit_price=order_item.unit_price,
            tax_rate=order_item.tax_rate,
            tax_amount=order_item.tax_amount,
            line_total=order_item.line_total
        )

        db.add(invoice_item)

    db.flush()

    # --------------------------------------------
    # 9. Create accounting entry
    # --------------------------------------------
    accounting_lines = [
        {
            "account_id": debtors_account.id,
            "debit": order.total_amount,
            "credit": Decimal("0.00")
        },
        {
            "account_id": sales_journal.default_credit_account_id,
            "debit": Decimal("0.00"),
            "credit": order.subtotal
        }
    ]

    if order.tax_amount > 0:

        accounting_lines.append(
            {
                "account_id": tax_account.id,
                "debit": Decimal("0.00"),
                "credit": order.tax_amount
            }
        )

    journal_entry = create_journal_entry(
    db=db,
    journal_id=sales_journal.id,
    entry_date=data.invoice_date,
    reference=data.invoice_number,
    description=f"Customer invoice {data.invoice_number}",
    lines=accounting_lines,
    source_type="CUSTOMER_INVOICE",
    source_id=invoice.id
)

    # --------------------------------------------
    # 10. Link invoice to Journal Entry
    # --------------------------------------------
    invoice.journal_entry_id = journal_entry.id

    # --------------------------------------------
    # 11. Update order status
    # --------------------------------------------
    order.status = "INVOICED"

    db.commit()
    db.refresh(invoice)

    return invoice