# Urban Furniture Accounting System 2026

> A full-stack ERP-style accounting and business management system designed for furniture businesses, integrating sales, purchases, payments, double-entry accounting, financial reporting, budgets, analytics, and role-based access into one platform.

---

## 📌 Overview

**Urban Furniture Accounting System 2026** is a full-stack ERP and accounting application built to manage the complete financial and operational workflow of a furniture business.

The system connects day-to-day business transactions with accounting automatically, allowing users to move from a transaction such as a sale or purchase all the way to the final financial reports.

### Core Workflow

```text
Sales → Customer Invoice → Payment → Journal Entry → Ledger → Profit & Loss / Balance Sheet

Purchase Order → Confirm → Receive → Vendor Bill → Vendor Payment → Journal Entry → Ledger → Financial Reports
```

# 🎯 Problem Statement
Furniture businesses often manage their operations using disconnected tools such as spreadsheets, billing systems, manual records, and separate accounting software. This can lead to:

Duplicate data entry

Accounting inconsistencies

Difficulty tracking receivables and payables

Manual financial calculations

Limited business visibility

Increased risk of errors

Difficult budget monitoring

Lack of centralized reporting

The Urban Furniture Accounting System solves this by bringing business operations, accounting, payments, budgets, and reporting into one integrated platform.

# 💡 Solution
The application provides a centralized ERP-style environment where users can manage:

Customers & Vendors

Products & Sales

Invoices & Purchases

Vendor Bills & Payments

Accounting & Ledgers

Financial Reports & Budgets

Dashboard Analytics

Users and Roles

The Key Idea:
Business Transaction ➡️ Accounting Automation ➡️ Financial Reporting

# System Architecture 

┌───────────────────────┐
                    │         User          │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │    React Frontend     │
                    │       Port 5173       │
                    └───────────┬───────────┘
                                │
                           REST API
                                │
                                ▼
                    ┌───────────────────────┐
                    │    FastAPI Backend    │
                    │       Port 8001       │
                    └───────────┬───────────┘
                                │
                         SQLAlchemy ORM
                                │
                                ▼
                    ┌───────────────────────┐
                    │      PostgreSQL       │
                    │    urban_furniture    │
                    └───────────────────────┘



# 🛠️ Technology Stack
**Frontend**

React, Vite, Tailwind CSS

React Router, Axios

Lucide Icons, Recharts, React Hot Toast

**Backend**

Python, FastAPI

SQLAlchemy, Pydantic, Uvicorn

**Database**

PostgreSQL

**Version Control**

Git & GitHub



