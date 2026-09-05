from datetime import date
from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session

from app.models.contact import Contact
from app.models.product import Product
from app.models.sales_order import SalesOrder
from app.models.customer_invoice import CustomerInvoice
from app.models.purchase_order import PurchaseOrder
from app.models.vendor_bill import VendorBill
from app.models.payment import Payment
from app.models.account import Account
from app.models.journal_entry import JournalEntry
from app.models.journal_entry_line import JournalEntryLine


# =========================================================
# HELPER
# =========================================================

def decimal_value(value) -> Decimal:
    return Decimal(str(value or 0))


# =========================================================
# DASHBOARD SUMMARY
# =========================================================

def get_dashboard_summary(
    db: Session,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
):
    # -----------------------------------------------------
    # CUSTOMER / VENDOR COUNTS
    # -----------------------------------------------------

    total_customers = (
        db.query(Contact)
        .filter(
            Contact.type.in_(["CUSTOMER", "BOTH"]),
            Contact.is_active.is_(True)
        )
        .count()
    )

    total_vendors = (
        db.query(Contact)
        .filter(
            Contact.type.in_(["VENDOR", "BOTH"]),
            Contact.is_active.is_(True)
        )
        .count()
    )

    # -----------------------------------------------------
    # PRODUCT COUNT
    # -----------------------------------------------------

    total_products = (
        db.query(Product)
        .filter(
            Product.is_active.is_(True)
        )
        .count()
    )

    # -----------------------------------------------------
    # SALES ORDERS
    # -----------------------------------------------------

    sales_order_query = db.query(SalesOrder)

    if from_date:
        sales_order_query = sales_order_query.filter(
            SalesOrder.order_date >= from_date
        )

    if to_date:
        sales_order_query = sales_order_query.filter(
            SalesOrder.order_date <= to_date
        )

    total_sales_orders = sales_order_query.count()

    # -----------------------------------------------------
    # PURCHASE ORDERS
    # -----------------------------------------------------

    purchase_order_query = db.query(PurchaseOrder)

    if from_date:
        purchase_order_query = purchase_order_query.filter(
            PurchaseOrder.order_date >= from_date
        )

    if to_date:
        purchase_order_query = purchase_order_query.filter(
            PurchaseOrder.order_date <= to_date
        )

    total_purchase_orders = purchase_order_query.count()

    # -----------------------------------------------------
    # CUSTOMER INVOICES
    # -----------------------------------------------------

    invoice_query = db.query(CustomerInvoice)

    if from_date:
        invoice_query = invoice_query.filter(
            CustomerInvoice.invoice_date >= from_date
        )

    if to_date:
        invoice_query = invoice_query.filter(
            CustomerInvoice.invoice_date <= to_date
        )

    total_customer_invoices = invoice_query.count()

    # -----------------------------------------------------
    # VENDOR BILLS
    # -----------------------------------------------------

    bill_query = db.query(VendorBill)

    if from_date:
        bill_query = bill_query.filter(
            VendorBill.bill_date >= from_date
        )

    if to_date:
        bill_query = bill_query.filter(
            VendorBill.bill_date <= to_date
        )

    total_vendor_bills = bill_query.count()

    # -----------------------------------------------------
    # TOTAL SALES
    # -----------------------------------------------------

    invoice_total_query = db.query(
        CustomerInvoice.total_amount
    )

    if from_date:
        invoice_total_query = invoice_total_query.filter(
            CustomerInvoice.invoice_date >= from_date
        )

    if to_date:
        invoice_total_query = invoice_total_query.filter(
            CustomerInvoice.invoice_date <= to_date
        )

    invoice_totals = invoice_total_query.all()

    total_sales = sum(
        (
            decimal_value(row[0])
            for row in invoice_totals
        ),
        Decimal("0.00")
    )

    # -----------------------------------------------------
    # TOTAL PURCHASES
    # -----------------------------------------------------

    bill_total_query = db.query(
        VendorBill.total_amount
    )

    if from_date:
        bill_total_query = bill_total_query.filter(
            VendorBill.bill_date >= from_date
        )

    if to_date:
        bill_total_query = bill_total_query.filter(
            VendorBill.bill_date <= to_date
        )

    bill_totals = bill_total_query.all()

    total_purchases = sum(
        (
            decimal_value(row[0])
            for row in bill_totals
        ),
        Decimal("0.00")
    )

    # -----------------------------------------------------
    # CUSTOMER PAYMENTS
    # -----------------------------------------------------

    customer_payment_query = db.query(
        Payment.amount
    ).filter(
        Payment.payment_type == "CUSTOMER",
        Payment.status == "POSTED"
    )

    if from_date:
        customer_payment_query = (
            customer_payment_query.filter(
                Payment.payment_date >= from_date
            )
        )

    if to_date:
        customer_payment_query = (
            customer_payment_query.filter(
                Payment.payment_date <= to_date
            )
        )

    customer_payment_rows = (
        customer_payment_query.all()
    )

    total_customer_payments = sum(
        (
            decimal_value(row[0])
            for row in customer_payment_rows
        ),
        Decimal("0.00")
    )

    # -----------------------------------------------------
    # VENDOR PAYMENTS
    # -----------------------------------------------------

    vendor_payment_query = db.query(
        Payment.amount
    ).filter(
        Payment.payment_type == "VENDOR",
        Payment.status == "POSTED"
    )

    if from_date:
        vendor_payment_query = (
            vendor_payment_query.filter(
                Payment.payment_date >= from_date
            )
        )

    if to_date:
        vendor_payment_query = (
            vendor_payment_query.filter(
                Payment.payment_date <= to_date
            )
        )

    vendor_payment_rows = (
        vendor_payment_query.all()
    )

    total_vendor_payments = sum(
        (
            decimal_value(row[0])
            for row in vendor_payment_rows
        ),
        Decimal("0.00")
    )

    # =====================================================
    # RECEIVABLES
    # =====================================================

    all_invoices = (
        db.query(CustomerInvoice)
        .filter(
            CustomerInvoice.status != "CANCELLED"
        )
        .all()
    )

    receivables = Decimal("0.00")

    for invoice in all_invoices:

        payments = (
            db.query(Payment.amount)
            .filter(
                Payment.customer_invoice_id == invoice.id,
                Payment.payment_type == "CUSTOMER",
                Payment.status == "POSTED"
            )
            .all()
        )

        paid_amount = sum(
            (
                decimal_value(row[0])
                for row in payments
            ),
            Decimal("0.00")
        )

        outstanding = (
            decimal_value(invoice.total_amount)
            - paid_amount
        )

        if outstanding > Decimal("0.00"):
            receivables += outstanding

    # =====================================================
    # PAYABLES
    # =====================================================

    all_bills = (
        db.query(VendorBill)
        .filter(
            VendorBill.status != "CANCELLED"
        )
        .all()
    )

    payables = Decimal("0.00")

    for bill in all_bills:

        payments = (
            db.query(Payment.amount)
            .filter(
                Payment.vendor_bill_id == bill.id,
                Payment.payment_type == "VENDOR",
                Payment.status == "POSTED"
            )
            .all()
        )

        paid_amount = sum(
            (
                decimal_value(row[0])
                for row in payments
            ),
            Decimal("0.00")
        )

        outstanding = (
            decimal_value(bill.total_amount)
            - paid_amount
        )

        if outstanding > Decimal("0.00"):
            payables += outstanding

    # =====================================================
    # ACCOUNT BALANCES
    # =====================================================

    def get_account_balance(account_name: str):

        account = (
            db.query(Account)
            .filter(
                Account.name == account_name,
                Account.is_active.is_(True)
            )
            .first()
        )

        if not account:
            return Decimal("0.00")

        query = (
            db.query(
                JournalEntryLine.debit,
                JournalEntryLine.credit
            )
            .join(
                JournalEntry,
                JournalEntryLine.journal_entry_id
                == JournalEntry.id
            )
            .filter(
                JournalEntryLine.account_id
                == account.id
            )
        )

        if to_date:
            query = query.filter(
                JournalEntry.entry_date <= to_date
            )

        rows = query.all()

        debit_total = sum(
            (
                decimal_value(row[0])
                for row in rows
            ),
            Decimal("0.00")
        )

        credit_total = sum(
            (
                decimal_value(row[1])
                for row in rows
            ),
            Decimal("0.00")
        )

        if account.type in ("ASSET", "EXPENSE"):
            return debit_total - credit_total

        return credit_total - debit_total

    # -----------------------------------------------------
    # CASH
    # -----------------------------------------------------

    cash_balance = get_account_balance("Cash")

    # -----------------------------------------------------
    # BANK
    # -----------------------------------------------------

    bank_balance = get_account_balance("Bank")

    # =====================================================
    # REVENUE / EXPENSE
    # =====================================================

    income_query = (
        db.query(
            JournalEntryLine.debit,
            JournalEntryLine.credit
        )
        .join(
            JournalEntry,
            JournalEntryLine.journal_entry_id
            == JournalEntry.id
        )
        .join(
            Account,
            JournalEntryLine.account_id
            == Account.id
        )
        .filter(
            Account.type == "INCOME"
        )
    )

    if from_date:
        income_query = income_query.filter(
            JournalEntry.entry_date >= from_date
        )

    if to_date:
        income_query = income_query.filter(
            JournalEntry.entry_date <= to_date
        )

    income_rows = income_query.all()

    total_revenue = sum(
        (
            decimal_value(row[1])
            - decimal_value(row[0])
            for row in income_rows
        ),
        Decimal("0.00")
    )

    # -----------------------------------------------------
    # EXPENSE
    # -----------------------------------------------------

    expense_query = (
        db.query(
            JournalEntryLine.debit,
            JournalEntryLine.credit
        )
        .join(
            JournalEntry,
            JournalEntryLine.journal_entry_id
            == JournalEntry.id
        )
        .join(
            Account,
            JournalEntryLine.account_id
            == Account.id
        )
        .filter(
            Account.type == "EXPENSE"
        )
    )

    if from_date:
        expense_query = expense_query.filter(
            JournalEntry.entry_date >= from_date
        )

    if to_date:
        expense_query = expense_query.filter(
            JournalEntry.entry_date <= to_date
        )

    expense_rows = expense_query.all()

    total_expenses = sum(
        (
            decimal_value(row[0])
            - decimal_value(row[1])
            for row in expense_rows
        ),
        Decimal("0.00")
    )

    # -----------------------------------------------------
    # PROFIT
    # -----------------------------------------------------

    net_profit = (
        total_revenue
        - total_expenses
    )

    # =====================================================
    # RETURN
    # =====================================================

    return {
        "from_date": from_date,
        "to_date": to_date,

        "total_customers": total_customers,
        "total_vendors": total_vendors,
        "total_products": total_products,

        "total_sales_orders": total_sales_orders,
        "total_purchase_orders": total_purchase_orders,

        "total_customer_invoices":
            total_customer_invoices,

        "total_vendor_bills":
            total_vendor_bills,

        "total_sales": total_sales,
        "total_purchases": total_purchases,

        "total_customer_payments":
            total_customer_payments,

        "total_vendor_payments":
            total_vendor_payments,

        "receivables": receivables,
        "payables": payables,

        "cash_balance": cash_balance,
        "bank_balance": bank_balance,

        "total_revenue": total_revenue,
        "total_expenses": total_expenses,

        "net_profit": net_profit,
    }