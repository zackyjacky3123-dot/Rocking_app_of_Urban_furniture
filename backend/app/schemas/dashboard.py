from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):

    from_date: Optional[date] = None
    to_date: Optional[date] = None

    # =====================================================
    # TRANSACTION COUNTS
    # =====================================================

    total_customers: int
    total_vendors: int
    total_products: int

    total_sales_orders: int
    total_purchase_orders: int

    total_customer_invoices: int
    total_vendor_bills: int

    # =====================================================
    # SALES / PURCHASES
    # =====================================================

    total_sales: Decimal
    total_purchases: Decimal

    # =====================================================
    # PAYMENTS
    # =====================================================

    total_customer_payments: Decimal
    total_vendor_payments: Decimal

    # =====================================================
    # RECEIVABLES / PAYABLES
    # =====================================================

    receivables: Decimal
    payables: Decimal

    # =====================================================
    # CASH / BANK
    # =====================================================

    cash_balance: Decimal
    bank_balance: Decimal

    # =====================================================
    # FINANCIAL SUMMARY
    # =====================================================

    total_revenue: Decimal
    total_expenses: Decimal
    net_profit: Decimal