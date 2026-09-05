from datetime import date
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.journal_entry import JournalEntry
from app.models.journal_entry_line import JournalEntryLine


# =========================================================
# HELPER — GET ACCOUNT TOTALS
# =========================================================

def get_account_totals(
    db: Session,
    account_id: int,
    as_of_date: date,
):
    rows = (
        db.query(
            JournalEntryLine.debit,
            JournalEntryLine.credit,
        )
        .join(
            JournalEntry,
            JournalEntryLine.journal_entry_id
            == JournalEntry.id,
        )
        .filter(
            JournalEntryLine.account_id == account_id,
            JournalEntry.entry_date <= as_of_date,
        )
        .all()
    )

    debit_total = sum(
        (
            Decimal(str(row.debit or 0))
            for row in rows
        ),
        Decimal("0.00"),
    )

    credit_total = sum(
        (
            Decimal(str(row.credit or 0))
            for row in rows
        ),
        Decimal("0.00"),
    )

    return debit_total, credit_total


# =========================================================
# BALANCE SHEET
# =========================================================

def get_balance_sheet(
    db: Session,
    as_of_date: date,
):
    # -----------------------------------------------------
    # GET ALL ACTIVE BALANCE SHEET ACCOUNTS
    # -----------------------------------------------------

    accounts = (
        db.query(Account)
        .filter(
            Account.type.in_(
                ["ASSET", "LIABILITY", "CAPITAL"]
            ),
            Account.is_active.is_(True),
        )
        .order_by(Account.id.asc())
        .all()
    )

    asset_accounts = []
    liability_accounts = []
    equity_accounts = []

    total_assets = Decimal("0.00")
    total_liabilities = Decimal("0.00")
    owner_capital = Decimal("0.00")

    # -----------------------------------------------------
    # CALCULATE ACCOUNT BALANCES
    # -----------------------------------------------------

    for account in accounts:

        debit_total, credit_total = get_account_totals(
            db=db,
            account_id=account.id,
            as_of_date=as_of_date,
        )

        # -------------------------------------------------
        # ASSETS
        #
        # Debit increases asset
        # -------------------------------------------------

        if account.type == "ASSET":

            balance = debit_total - credit_total

            if balance != Decimal("0.00"):
                asset_accounts.append({
                    "account_id": account.id,
                    "account_name": account.name,
                    "account_type": account.type,
                    "balance": balance,
                })

                total_assets += balance

        # -------------------------------------------------
        # LIABILITIES
        #
        # Credit increases liability
        # -------------------------------------------------

        elif account.type == "LIABILITY":

            balance = credit_total - debit_total

            if balance != Decimal("0.00"):
                liability_accounts.append({
                    "account_id": account.id,
                    "account_name": account.name,
                    "account_type": account.type,
                    "balance": balance,
                })

                total_liabilities += balance

        # -------------------------------------------------
        # CAPITAL
        #
        # Credit increases capital
        # -------------------------------------------------

        elif account.type == "CAPITAL":

            balance = credit_total - debit_total

            if balance != Decimal("0.00"):
                equity_accounts.append({
                    "account_id": account.id,
                    "account_name": account.name,
                    "account_type": account.type,
                    "balance": balance,
                })

                owner_capital += balance

    # -----------------------------------------------------
    # CALCULATE CURRENT PERIOD / ACCUMULATED PROFIT
    #
    # Income:
    #     Credit - Debit
    #
    # Expense:
    #     Debit - Credit
    # -----------------------------------------------------

    profit_accounts = (
        db.query(Account)
        .filter(
            Account.type.in_(
                ["INCOME", "EXPENSE"]
            ),
            Account.is_active.is_(True),
        )
        .all()
    )

    total_income = Decimal("0.00")
    total_expenses = Decimal("0.00")

    for account in profit_accounts:

        debit_total, credit_total = get_account_totals(
            db=db,
            account_id=account.id,
            as_of_date=as_of_date,
        )

        if account.type == "INCOME":
            total_income += (
                credit_total - debit_total
            )

        elif account.type == "EXPENSE":
            total_expenses += (
                debit_total - credit_total
            )

    current_period_profit = (
        total_income - total_expenses
    )

    # -----------------------------------------------------
    # ADD PROFIT TO EQUITY
    # -----------------------------------------------------

    if current_period_profit != Decimal("0.00"):

        equity_accounts.append({
            "account_id": 0,
            "account_name": "Current Period Profit",
            "account_type": "CAPITAL",
            "balance": current_period_profit,
        })

    total_equity = (
        owner_capital
        + current_period_profit
    )

    # -----------------------------------------------------
    # TOTAL LIABILITIES + EQUITY
    # -----------------------------------------------------

    total_liabilities_and_equity = (
        total_liabilities
        + total_equity
    )

    # -----------------------------------------------------
    # BALANCE CHECK
    # -----------------------------------------------------

    difference = (
        total_assets
        - total_liabilities_and_equity
    )

    is_balanced = (
        abs(difference) <= Decimal("0.01")
    )

    # -----------------------------------------------------
    # RETURN
    # -----------------------------------------------------

    return {
        "as_of_date": as_of_date,

        "asset_accounts": asset_accounts,
        "liability_accounts": liability_accounts,
        "equity_accounts": equity_accounts,

        "total_assets": total_assets,
        "total_liabilities": total_liabilities,

        "owner_capital": owner_capital,
        "current_period_profit": current_period_profit,

        "total_equity": total_equity,

        "total_liabilities_and_equity":
            total_liabilities_and_equity,

        "is_balanced": is_balanced,
    }