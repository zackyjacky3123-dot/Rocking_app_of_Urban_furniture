from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import engine

# Routes
from app.routes.contacts import router as contacts_router
from app.routes.products import router as products_router
from app.routes.accounts import router as accounts_router
from app.routes.journals import router as journals_router
from app.routes.journal_entries import router as journal_entries_router
from app.routes.sales import router as sales_router
from app.routes.purchase import router as purchase_router
from app.routes.payments import router as payments_router
from app.routes.ledger import router as ledger_router
from app.routes.profit_loss import router as profit_loss_router
from app.routes.balance_sheet import router as balance_sheet_router
from app.routes.budget import router as budget_router
from app.routes.budget_report import router as budget_report_router
from app.routes.dashboard import router as dashboard_router
from app.models.user import User
# Models
from app.models.budget import Budget
from app.models.budget_line import BudgetLine
from app.routes.users import router as users_router


app = FastAPI(
    title="Urban Furniture Accounting System"
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# ROOT
# =====================================================

@app.get("/")
def root():
    return {
        "message": "Urban Furniture API is running"
    }


# =====================================================
# DATABASE TEST
# =====================================================

@app.get("/db-test")
def db_test():

    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT 1")
        )

        value = result.scalar()

    return {
        "database": "connected",
        "result": value
    }


# =====================================================
# ROUTERS
# =====================================================

app.include_router(contacts_router)
app.include_router(products_router)
app.include_router(accounts_router)
app.include_router(journals_router)
app.include_router(journal_entries_router)
app.include_router(sales_router)
app.include_router(purchase_router)
app.include_router(payments_router)
app.include_router(ledger_router)
app.include_router(profit_loss_router)
app.include_router(balance_sheet_router)
app.include_router(budget_router)
app.include_router(budget_report_router)
app.include_router(dashboard_router)
app.include_router(users_router)