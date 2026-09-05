from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.payment import Payment
from app.models.customer_invoice import CustomerInvoice
from app.models.vendor_bill import VendorBill
from app.models.account import Account
from app.models.journal import Journal

from app.services.accounting_service import create_journal_entry


# =========================================================
# HELPER: GET PAYMENT JOURNAL
# =========================================================

def get_payment_journal_and_account(
    db: Session,
    payment_method: str
):
    if payment_method == "BANK":

        journal = (
            db.query(Journal)
            .filter(
                Journal.type == "BANK",
                Journal.is_active.is_(True)
            )
            .first()
        )

        account = (
            db.query(Account)
            .filter(
                Account.name == "Bank",
                Account.type == "ASSET",
                Account.is_active.is_(True)
            )
            .first()
        )

    elif payment_method == "CASH":

        journal = (
            db.query(Journal)
            .filter(
                Journal.type == "CASH",
                Journal.is_active.is_(True)
            )
            .first()
        )

        account = (
            db.query(Account)
            .filter(
                Account.name == "Cash",
                Account.type == "ASSET",
                Account.is_active.is_(True)
            )
            .first()
        )

    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid payment method"
        )

    if not journal:
        raise HTTPException(
            status_code=400,
            detail=f"{payment_method.title()} Journal not found"
        )

    if not account:
        raise HTTPException(
            status_code=400,
            detail=f"{payment_method.title()} account not found"
        )

    return journal, account


# =========================================================
# CUSTOMER PAYMENT
# =========================================================

def create_customer_payment(
    db: Session,
    data
):

    # -----------------------------------------------------
    # FIND INVOICE
    # -----------------------------------------------------

    invoice = (
        db.query(CustomerInvoice)
        .filter(
            CustomerInvoice.id
            == data.customer_invoice_id
        )
        .first()
    )

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Customer invoice not found"
        )

    if invoice.status == "CANCELLED":
        raise HTTPException(
            status_code=400,
            detail="Cannot pay a cancelled invoice"
        )

    if invoice.status == "DRAFT":
        raise HTTPException(
            status_code=400,
            detail="Invoice must be posted before payment"
        )

    # -----------------------------------------------------
    # CHECK DUPLICATE PAYMENT NUMBER
    # -----------------------------------------------------

    existing_payment = (
        db.query(Payment)
        .filter(
            Payment.payment_number
            == data.payment_number
        )
        .first()
    )

    if existing_payment:
        raise HTTPException(
            status_code=400,
            detail="Payment number already exists"
        )

    # -----------------------------------------------------
    # CALCULATE ALREADY PAID
    # -----------------------------------------------------

    already_paid = (
        db.query(Payment)
        .filter(
            Payment.customer_invoice_id
            == invoice.id,
            Payment.payment_type == "CUSTOMER",
            Payment.status == "POSTED"
        )
        .all()
    )

    paid_amount = sum(
        (
            Decimal(str(payment.amount))
            for payment in already_paid
        ),
        Decimal("0.00")
    )

    invoice_total = Decimal(
        str(invoice.total_amount)
    )

    outstanding = (
        invoice_total - paid_amount
    )

    payment_amount = Decimal(
        str(data.amount)
    )

    # -----------------------------------------------------
    # OVERPAYMENT CHECK
    # -----------------------------------------------------

    if payment_amount > outstanding:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Payment exceeds outstanding amount. "
                f"Outstanding: {outstanding}"
            )
        )

    # -----------------------------------------------------
    # GET BANK/CASH
    # -----------------------------------------------------

    payment_journal, payment_account = (
        get_payment_journal_and_account(
            db,
            data.payment_method
        )
    )

    # -----------------------------------------------------
    # GET DEBTORS
    # -----------------------------------------------------

    debtors = (
        db.query(Account)
        .filter(
            Account.name == "Debtors",
            Account.type == "ASSET",
            Account.is_active.is_(True)
        )
        .first()
    )

    if not debtors:
        raise HTTPException(
            status_code=400,
            detail="Debtors account not found"
        )

    # -----------------------------------------------------
    # CREATE PAYMENT
    # -----------------------------------------------------

    payment = Payment(
        payment_number=data.payment_number,
        payment_type="CUSTOMER",
        customer_invoice_id=invoice.id,
        vendor_bill_id=None,
        payment_date=data.payment_date,
        amount=payment_amount,
        payment_method=data.payment_method,
        reference=data.reference,
        status="POSTED",
    )

    db.add(payment)
    db.flush()

    # -----------------------------------------------------
    # ACCOUNTING
    #
    # Customer pays us:
    #
    # Bank/Cash      DR
    # Debtors        CR
    # -----------------------------------------------------

    accounting_lines = [
        {
            "account_id": payment_account.id,
            "debit": payment_amount,
            "credit": Decimal("0.00"),
        },
        {
            "account_id": debtors.id,
            "debit": Decimal("0.00"),
            "credit": payment_amount,
        },
    ]

    journal_entry = create_journal_entry(
        db=db,
        journal_id=payment_journal.id,
        entry_date=data.payment_date,
        reference=data.payment_number,
        description=(
            f"Customer payment "
            f"{data.payment_number}"
        ),
        lines=accounting_lines,
        source_type="CUSTOMER_PAYMENT",
        source_id=payment.id,
    )

    payment.journal_entry_id = journal_entry.id

    # -----------------------------------------------------
    # UPDATE INVOICE STATUS
    # -----------------------------------------------------

    new_paid_amount = (
        paid_amount + payment_amount
    )

    if new_paid_amount >= invoice_total:
        invoice.status = "PAID"

    db.commit()
    db.refresh(payment)

    return payment


# =========================================================
# VENDOR PAYMENT
# =========================================================

def create_vendor_payment(
    db: Session,
    data
):

    # -----------------------------------------------------
    # FIND BILL
    # -----------------------------------------------------

    bill = (
        db.query(VendorBill)
        .filter(
            VendorBill.id == data.vendor_bill_id
        )
        .first()
    )

    if not bill:
        raise HTTPException(
            status_code=404,
            detail="Vendor bill not found"
        )

    if bill.status == "CANCELLED":
        raise HTTPException(
            status_code=400,
            detail="Cannot pay a cancelled vendor bill"
        )

    if bill.status == "DRAFT":
        raise HTTPException(
            status_code=400,
            detail="Vendor bill must be posted before payment"
        )

    # -----------------------------------------------------
    # CHECK DUPLICATE PAYMENT NUMBER
    # -----------------------------------------------------

    existing_payment = (
        db.query(Payment)
        .filter(
            Payment.payment_number
            == data.payment_number
        )
        .first()
    )

    if existing_payment:
        raise HTTPException(
            status_code=400,
            detail="Payment number already exists"
        )

    # -----------------------------------------------------
    # CALCULATE ALREADY PAID
    # -----------------------------------------------------

    already_paid = (
        db.query(Payment)
        .filter(
            Payment.vendor_bill_id == bill.id,
            Payment.payment_type == "VENDOR",
            Payment.status == "POSTED"
        )
        .all()
    )

    paid_amount = sum(
        (
            Decimal(str(payment.amount))
            for payment in already_paid
        ),
        Decimal("0.00")
    )

    bill_total = Decimal(
        str(bill.total_amount)
    )

    outstanding = (
        bill_total - paid_amount
    )

    payment_amount = Decimal(
        str(data.amount)
    )

    # -----------------------------------------------------
    # OVERPAYMENT CHECK
    # -----------------------------------------------------

    if payment_amount > outstanding:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Payment exceeds outstanding amount. "
                f"Outstanding: {outstanding}"
            )
        )

    # -----------------------------------------------------
    # GET BANK/CASH
    # -----------------------------------------------------

    payment_journal, payment_account = (
        get_payment_journal_and_account(
            db,
            data.payment_method
        )
    )

    # -----------------------------------------------------
    # GET CREDITORS
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # CREATE PAYMENT
    # -----------------------------------------------------

    payment = Payment(
        payment_number=data.payment_number,
        payment_type="VENDOR",
        customer_invoice_id=None,
        vendor_bill_id=bill.id,
        payment_date=data.payment_date,
        amount=payment_amount,
        payment_method=data.payment_method,
        reference=data.reference,
        status="POSTED",
    )

    db.add(payment)
    db.flush()

    # -----------------------------------------------------
    # ACCOUNTING
    #
    # We pay vendor:
    #
    # Creditors       DR
    # Bank/Cash        CR
    # -----------------------------------------------------

    accounting_lines = [
        {
            "account_id": creditors.id,
            "debit": payment_amount,
            "credit": Decimal("0.00"),
        },
        {
            "account_id": payment_account.id,
            "debit": Decimal("0.00"),
            "credit": payment_amount,
        },
    ]

    journal_entry = create_journal_entry(
        db=db,
        journal_id=payment_journal.id,
        entry_date=data.payment_date,
        reference=data.payment_number,
        description=(
            f"Vendor payment "
            f"{data.payment_number}"
        ),
        lines=accounting_lines,
        source_type="VENDOR_PAYMENT",
        source_id=payment.id,
    )

    payment.journal_entry_id = journal_entry.id

    # -----------------------------------------------------
    # UPDATE BILL STATUS
    # -----------------------------------------------------

    new_paid_amount = (
        paid_amount + payment_amount
    )

    if new_paid_amount >= bill_total:
        bill.status = "PAID"

    db.commit()
    db.refresh(payment)

    return payment


# =========================================================
# GET PAYMENTS
# =========================================================

def get_all_payments(
    db: Session
):

    return (
        db.query(Payment)
        .order_by(Payment.id.desc())
        .all()
    )


# =========================================================
# GET PAYMENT BY ID
# =========================================================

def get_payment(
    db: Session,
    payment_id: int
):

    payment = (
        db.query(Payment)
        .filter(
            Payment.id == payment_id
        )
        .first()
    )

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    return payment