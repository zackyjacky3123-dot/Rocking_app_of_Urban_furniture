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

## ✨ Features
1. Authentication & User Management

The application supports user authentication and role-based user management.

Supported Roles

| Role       | Responsibility                   |
| ---------- | -------------------------------- |
| ADMIN      | Full system administration       |
| ACCOUNTANT | Accounting, payments and reports |
| SALES      | Sales-related operations         |
| PURCHASE   | Purchase-related operations      |

Administrators can manage users and activate or deactivate accounts.

2. Contacts Management

Manage customers and vendors from a centralized contact database.

Contact Information
Name
Email
Phone
Address
Contact type
Active status

3. Product Management

Products can be created and managed centrally.

Product Information
Product name
SKU
Description
Selling price
Purchase price
Active status

Products can then be reused throughout sales and purchase transactions.

💰 Sales Management

The Sales module manages the complete sales lifecycle.

Customer
   ->
Sales Order
   ->
Customer Invoice
   ->
Customer Payment
   ->
Journal Entry
   ->
Ledger
   ->
Financial Reports
Example:-

For a credit sale of ₹29,500:

Debit  → Debtors      ₹29,500
Credit → Sales        ₹29,500

The transaction is recorded using double-entry accounting.


🛒 Purchase Management

The Purchase module manages the complete purchasing lifecycle.

Vendor
   ↓
Purchase Order
   ↓
Confirmation
   ↓
Goods Receipt
   ↓
Vendor Bill
   ↓
Vendor Payment
   ↓
Journal Entry
Example Purchase Entry
Debit  → Purchase Expense   ₹20,000
Credit → Creditors          ₹20,000
Vendor Payment
Debit  → Creditors          ₹20,000
Credit → Bank / Cash        ₹20,000
💳 Payment Management

The Payment module supports:

Customer payments
Vendor payments
Cash payments
Bank payments
Partial payments
Payment validation
Overpayment protection


Customer Payment:- 

Debit  → Bank / Cash
Credit → Debtors
Vendor Payment
Debit  → Creditors
Credit → Bank / Cash

Payments are linked to invoices or vendor bills to maintain a complete accounting trail.

📒 Double-Entry Accounting

The accounting engine follows the fundamental rule:

Total Debit = Total Credit

Every financial transaction must remain balanced.

Example

| Account   |       Debit |      Credit |
| --------- | ----------: | ----------: |
| Debtors   |     ₹10,000 |             |
| Sales     |             |     ₹10,000 |
| **Total** | **₹10,000** | **₹10,000** |


The system validates journal entries to help prevent unbalanced accounting transactions.
