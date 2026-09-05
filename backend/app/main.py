from fastapi import FastAPI
from sqlalchemy import text

from app.database import engine
from app.routes.contacts import router as contacts_router
from app.routes.products import router as products_router
from app.routes.accounts import router as accounts_router
from app.routes.journals import router as journals_router

app = FastAPI(
    title="Urban Furniture Accounting System"
)


@app.get("/")
def root():
    return {
        "message": "Urban Furniture API is running"
    }


@app.get("/db-test")
def db_test():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        value = result.scalar()

    return {
        "database": "connected",
        "result": value
    }


app.include_router(contacts_router)
app.include_router(products_router)
app.include_router(accounts_router)
app.include_router(journals_router)