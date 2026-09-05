# Urban Furniture 2026 — Comprehensive Backend Specification & Frontend Implementation Guide

> **Document Purpose**: This document provides an exhaustive, field-level analysis of the Urban Furniture backend codebase. It details all database models, API endpoints, business logic rules, data schemas, validation constraints, and an architectural blueprint for implementing a complete frontend with 100% coverage of backend capabilities.

---

## 1. System Architecture Overview

- **Framework**: FastAPI (Python 3.12)
- **ORM & Database**: SQLAlchemy with PostgreSQL (`psycopg2-binary`)
- **API Base URL**: `http://localhost:8000`
- **CORS Allowed Origins**:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`
  - `http://localhost:5174`
  - `http://127.0.0.1:5174`
- **Core Design Pattern**:
  - Soft-deleting via `is_active: bool = True` across master data entities.
  - Strict Double-Entry Bookkeeping engine ensuring `total_debit == total_credit`.
  - Transactional propagation: Sales Orders $\rightarrow$ Customer Invoices $\rightarrow$ Automatic Journal Entries.

---

## 2. Master Entity & Database Models Reference

### 2.1 Chart of Accounts (`app.models.account.Account`)
- **Table Name**: `accounts`
- **Fields**:
  | Column | Type | Constraints | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | Integer | Primary Key, Indexed | Unique account identifier |
  | `name` | String(150) | `nullable=False` | Display name of the account |
  | `type` | String(20) | `nullable=False` | Classification type |
  | `is_active` | Boolean | `nullable=False`, default=`True` | Soft-delete flag |
  | `created_at` | DateTime | Server default `now()` | Timestamp created |
  | `updated_at` | DateTime | Server default `now()`, onupdate | Timestamp updated |
- **Permitted Account Types**:
  - `ASSET` (e.g., Cash, Bank, Accounts Receivable/Debtors)
  - `LIABILITY` (e.g., Accounts Payable, Tax Payable)
  - `EXPENSE` (e.g., Cost of Goods Sold, Rent, Utilities)
  - `INCOME` (e.g., Sales Revenue, Service Revenue)
  - `CAPITAL` (e.g., Owner's Equity, Share Capital)

---

### 2.2 Contacts (`app.models.contact.Contact`)
- **Table Name**: `contacts`
- **Fields**:
  | Column | Type | Constraints | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | Integer | Primary Key, Indexed | Unique contact identifier |
  | `name` | String(150) | `nullable=False` | Individual or business name |
  | `type` | String(20) | `nullable=False` | Contact classification |
  | `email` | String(150) | `nullable=True` | Validated email address |
  | `mobile` | String(20) | `nullable=True` | Primary contact phone |
  | `city` | String(100) | `nullable=True` | Billing/Shipping City |
  | `state` | String(100) | `nullable=True` | Billing/Shipping State |
  | `pincode` | String(10) | `nullable=True` | Postal/ZIP code |
  | `profile_image`| String | `nullable=True` | URL / avatar reference |
  | `is_active` | Boolean | `nullable=False`, default=`True` | Soft-delete status |
  | `created_at` | DateTime | Server default `now()` | Registration timestamp |
  | `updated_at` | DateTime | Server default `now()`, onupdate | Last modified |
- **Permitted Contact Types**:
  - `CUSTOMER`
  - `VENDOR`
  - `BOTH`

---

### 2.3 Products & Services (`app.models.product.Product`)
- **Table Name**: `products`
- **Fields**:
  | Column | Type | Constraints | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | Integer | Primary Key, Indexed | Unique product identifier |
  | `name` | String(150) | `nullable=False` | Product or service title |
  | `type` | String(20) | `nullable=False` | Item classification |
  | `category` | String(100) | `nullable=True` | Grouping category |
  | `sales_price` | Numeric(12, 2)| `nullable=False`, default=`0` | Selling price ($\ge 0$) |
  | `purchase_price`| Numeric(12, 2)| `nullable=False`, default=`0` | Purchase cost ($\ge 0$) |
  | `is_active` | Boolean | `nullable=False`, default=`True` | Active catalog status |
  | `created_at` | DateTime | Server default `now()` | Added date |
  | `updated_at` | DateTime | Server default `now()`, onupdate | Modified date |
- **Permitted Product Types**:
  - `GOODS` (Physical furniture, e.g., Benches, Lamp posts)
  - `SERVICE` (Installation, Maintenance, Custom design)
  - `COMBO` (Bundled sets, e.g., Bench + Planter combo)

---

### 2.4 Journals (`app.models.journal.Journal`)
- **Table Name**: `journals`
- **Fields**:
  | Column | Type | Constraints | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | Integer | Primary Key, Indexed | Unique journal identifier |
  | `name` | String(150) | `nullable=False` | Name of the journal |
  | `type` | String(20) | `nullable=False` | Operational classification |
  | `default_debit_account_id` | Integer | Foreign Key (`accounts.id`) | Default debit leg |
  | `default_credit_account_id`| Integer | Foreign Key (`accounts.id`) | Default credit leg |
  | `is_active` | Boolean | `nullable=False`, default=`True` | Soft-delete status |
  | `created_at` | DateTime | Server default `now()` | Created timestamp |
  | `updated_at` | DateTime | Server default `now()`, onupdate | Updated timestamp |
- **Permitted Journal Types**:
  - `SALES` (Used for sales invoicing & customer charges)
  - `PURCHASE` (Vendor bills & expenses)
  - `BANK` (Bank payments, receipts, wire transfers)
  - `CASH` (Petty cash payments & counter sales)

---

### 2.5 Double-Entry Ledger (`app.models.journal_entry.JournalEntry` & `JournalEntryLine`)
- **Table Name**: `journal_entries`
  | Column | Type | Constraints | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | Integer | Primary Key, Indexed | Entry voucher # |
  | `journal_id` | Integer | Foreign Key (`journals.id`), `nullable=False` | Parent journal |
  | `entry_date` | Date | `nullable=False`, default=`current_date()` | Transaction date |
  | `reference` | String(100) | `nullable=True` | Invoice #, Check #, Memo |
  | `description`| String(255) | `nullable=True` | Narrative summary |
  | `created_at` | DateTime | Server default `now()` | Logged date |
  | `lines` | Relationship | Cascade `all, delete-orphan` | Associated debit/credit rows |

- **Table Name**: `journal_entry_lines`
  | Column | Type | Constraints | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | Integer | Primary Key, Indexed | Line item ID |
  | `journal_entry_id`| Integer | Foreign Key (`journal_entries.id`, ondelete `CASCADE`) | Parent entry |
  | `account_id` | Integer | Foreign Key (`accounts.id`), `nullable=False` | Target ledger account |
  | `debit` | Numeric(12, 2)| `nullable=False`, default=`0` | Debit amount |
  | `credit` | Numeric(12, 2)| `nullable=False`, default=`0` | Credit amount |

---

### 2.6 Sales Orders (`app.models.sales_order.SalesOrder` & `SalesOrderItem`)
- **Table Name**: `sales_orders`
  | Column | Type | Constraints | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | Integer | Primary Key, Indexed | Internal Order ID |
  | `order_number` | String(50) | Unique, `nullable=False` | Business Order # (e.g. `SO-001`) |
  | `customer_id` | Integer | Foreign Key (`contacts.id`), `nullable=False` | Customer reference |
  | `order_date` | Date | `nullable=False`, default=`current_date()` | Order placement date |
  | `status` | String(20) | `nullable=False`, default=`DRAFT` | `DRAFT`, `INVOICED`, `CANCELLED` |
  | `subtotal` | Numeric(12, 2)| `nullable=False`, default=`0` | Sum of item base prices |
  | `tax_amount` | Numeric(12, 2)| `nullable=False`, default=`0` | Total tax amount |
  | `total_amount` | Numeric(12, 2)| `nullable=False`, default=`0` | Subtotal + Tax |
  | `created_at` / `updated_at` | DateTime | Server defaults | Timestamps |

- **Table Name**: `sales_order_items`
  | Column | Type | Constraints | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | Integer | Primary Key, Indexed | Item ID |
  | `sales_order_id` | Integer | Foreign Key (`sales_orders.id`, ondelete `CASCADE`) | Parent order |
  | `product_id` | Integer | Foreign Key (`products.id`), `nullable=False` | Chosen product |
  | `quantity` | Numeric(12, 2)| `nullable=False` | Quantity ordered |
  | `unit_price` | Numeric(12, 2)| `nullable=False` | Price per unit |
  | `tax_rate` | Numeric(5, 2) | `nullable=False`, default=`0` | Tax percentage (e.g., 18.00) |
  | `tax_amount` | Numeric(12, 2)| `nullable=False`, default=`0` | Calculated tax for line |
  | `line_total` | Numeric(12, 2)| `nullable=False`, default=`0` | Base + Tax |

---

### 2.7 Customer Invoices (`app.models.customer_invoice.CustomerInvoice` & `InvoiceItem`)
- **Table Name**: `customer_invoices`
  | Column | Type | Constraints | Description |
  | :--- | :--- | :--- | :--- |
  | `id` | Integer | Primary Key, Indexed | Internal Invoice ID |
  | `invoice_number` | String(50) | Unique, `nullable=False` | Tax invoice number (e.g. `INV-001`) |
  | `sales_order_id` | Integer | Foreign Key (`sales_orders.id`), `nullable=False` | Source sales order |
  | `customer_id` | Integer | Foreign Key (`contacts.id`), `nullable=False` | Billed customer |
  | `invoice_date` | Date | `nullable=False`, default=`current_date()` | Billing date |
  | `due_date` | Date | `nullable=True` | Payment deadline |
  | `status` | String(20) | `nullable=False`, default=`POSTED` | Invoice status |
  | `subtotal` | Numeric(12, 2)| `nullable=False`, default=`0` | Taxable subtotal |
  | `tax_amount` | Numeric(12, 2)| `nullable=False`, default=`0` | Total tax |
  | `total_amount` | Numeric(12, 2)| `nullable=False`, default=`0` | Gross invoice amount |
  | `journal_entry_id` | Integer | Foreign Key (`journal_entries.id`), nullable | Auto-created accounting entry |

---

## 3. Detailed API Endpoints & Request/Response Contracts

### 3.1 Health & Diagnostic
- `GET /`
  - Response: `{"message": "Urban Furniture API is running"}`
- `GET /db-test`
  - Response: `{"database": "connected", "result": 1}`

---

### 3.2 Accounts API (`/accounts`)
| Method | Endpoint | Status | Description | Request Body | Response Schema |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/accounts/` | 200 | List active accounts | None | `List[AccountResponse]` |
| `GET` | `/accounts/{id}` | 200 / 404 | Get account by ID | None | `AccountResponse` |
| `POST` | `/accounts/` | 201 | Create new account | `AccountCreate` | `AccountResponse` |
| `PUT` | `/accounts/{id}` | 200 / 404 | Update account | `AccountCreate` | `AccountResponse` |
| `PATCH` | `/accounts/{id}/archive` | 200 / 404 | Soft delete account | None | `AccountResponse` |

#### Schemas:
```typescript
// Request: AccountCreate
interface AccountCreate {
  name: string; // Non-empty, max 150 chars
  type: "ASSET" | "LIABILITY" | "EXPENSE" | "INCOME" | "CAPITAL";
}

// Response: AccountResponse
interface AccountResponse {
  id: number;
  name: string;
  type: "ASSET" | "LIABILITY" | "EXPENSE" | "INCOME" | "CAPITAL";
  is_active: boolean;
}
```

---

### 3.3 Contacts API (`/contacts`)
| Method | Endpoint | Status | Description | Request Body | Response Schema |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/contacts/` | 200 | List active contacts | None | `List[ContactResponse]` |
| `GET` | `/contacts/{id}` | 200 / 404 | Get contact by ID | None | `ContactResponse` |
| `POST` | `/contacts/` | 201 | Create new contact | `ContactCreate` | `ContactResponse` |
| `PUT` | `/contacts/{id}` | 200 / 404 | Update contact | `ContactCreate` | `ContactResponse` |
| `PATCH` | `/contacts/{id}/archive` | 200 / 404 | Soft delete contact | None | `ContactResponse` |

#### Schemas:
```typescript
// Request: ContactCreate
interface ContactCreate {
  name: string;
  type: "CUSTOMER" | "VENDOR" | "BOTH";
  email?: string | null;      // Validated Email format if provided
  mobile?: string | null;     // Max 20 chars
  city?: string | null;       // Max 100 chars
  state?: string | null;      // Max 100 chars
  pincode?: string | null;    // Max 10 chars
  profile_image?: string | null;
}

// Response: ContactResponse
interface ContactResponse extends ContactCreate {
  id: number;
  is_active: boolean;
}
```

---

### 3.4 Products API (`/products`)
| Method | Endpoint | Status | Description | Request Body | Response Schema |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/products/` | 200 | List active products | None | `List[ProductResponse]` |
| `GET` | `/products/{id}` | 200 / 404 | Get product by ID | None | `ProductResponse` |
| `POST` | `/products/` | 201 | Create product | `ProductCreate` | `ProductResponse` |
| `PUT` | `/products/{id}` | 200 / 404 | Update product | `ProductCreate` | `ProductResponse` |
| `PATCH` | `/products/{id}/archive` | 200 / 404 | Soft delete product | None | `ProductResponse` |

#### Schemas:
```typescript
// Request: ProductCreate
interface ProductCreate {
  name: string;
  type: "GOODS" | "SERVICE" | "COMBO";
  category?: string | null;
  sales_price: number;    // Decimal, >= 0, default 0
  purchase_price: number; // Decimal, >= 0, default 0
}

// Response: ProductResponse
interface ProductResponse extends ProductCreate {
  id: number;
  is_active: boolean;
}
```

---

### 3.5 Journals API (`/journals`)
| Method | Endpoint | Status | Description | Request Body | Response Schema |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/journals/` | 200 | List active journals | None | `List[JournalResponse]` |
| `GET` | `/journals/{id}` | 200 / 404 | Get journal by ID | None | `JournalResponse` |
| `POST` | `/journals/` | 201 / 400 | Create journal | `JournalCreate` | `JournalResponse` |
| `PUT` | `/journals/{id}` | 200 / 400 | Update journal | `JournalCreate` | `JournalResponse` |
| `PATCH` | `/journals/{id}/archive` | 200 / 404 | Soft delete journal | None | `JournalResponse` |

#### Schemas:
```typescript
// Request: JournalCreate
interface JournalCreate {
  name: string;
  type: "SALES" | "PURCHASE" | "BANK" | "CASH";
  default_debit_account_id: number;  // Must point to an active Account
  default_credit_account_id: number; // Must point to an active Account
}

// Response: JournalResponse
interface JournalResponse extends JournalCreate {
  id: number;
  is_active: boolean;
}
```

---

### 3.6 Journal Entries API (`/journal-entries`)
| Method | Endpoint | Status | Description | Request Body | Response Schema |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/journal-entries/` | 200 | List all entries with lines | None | `List[JournalEntryResponse]` |
| `GET` | `/journal-entries/{id}`| 200 / 404 | Get single entry with lines | None | `JournalEntryResponse` |
| `POST` | `/journal-entries/` | 201 / 400 | Post balanced journal entry | `JournalEntryCreate` | `JournalEntryResponse` |

#### Schemas:
```typescript
interface JournalEntryLineCreate {
  account_id: number;
  debit: number;  // >= 0
  credit: number; // >= 0
}

interface JournalEntryCreate {
  journal_id: number;
  entry_date: string; // ISO date string (YYYY-MM-DD)
  reference?: string | null;
  description?: string | null;
  lines: JournalEntryLineCreate[]; // Minimum 2 lines required
}

interface JournalEntryLineResponse {
  id: number;
  account_id: number;
  debit: number;
  credit: number;
}

interface JournalEntryResponse {
  id: number;
  journal_id: number;
  entry_date: string;
  reference?: string | null;
  description?: string | null;
  lines: JournalEntryLineResponse[];
}
```

---

### 3.7 Sales Services Specifications (`app.services.sales_services`)
The backend provides two complete transactional functions in `sales_services.py` with corresponding schemas in `schemas/sales.py`.

#### A. Sales Order Creation (`create_sales_order`)
- **Schema**:
  ```typescript
  interface SalesOrderItemCreate {
    product_id: number;
    quantity: number;   // > 0
    unit_price: number; // >= 0
    tax_rate: number;   // >= 0 (percentage, e.g., 18 for 18%)
  }

  interface SalesOrderCreate {
    order_number: string;
    customer_id: number;
    order_date: string; // YYYY-MM-DD
    items: SalesOrderItemCreate[]; // Minimum 1 item required
  }

  interface SalesOrderItemResponse extends SalesOrderItemCreate {
    id: number;
    tax_amount: number;
    line_total: number;
  }

  interface SalesOrderResponse {
    id: number;
    order_number: string;
    customer_id: number;
    order_date: string;
    status: "DRAFT" | "INVOICED" | "CANCELLED";
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    items: SalesOrderItemResponse[];
  }
  ```

#### B. Customer Invoice Creation (`create_customer_invoice`)
- **Schema**:
  ```typescript
  interface CustomerInvoiceCreate {
    invoice_number: string;
    sales_order_id: number;
    invoice_date: string;     // YYYY-MM-DD
    due_date?: string | null; // YYYY-MM-DD
  }

  interface InvoiceItemResponse {
    id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    tax_amount: number;
    line_total: number;
  }

  interface CustomerInvoiceResponse {
    id: number;
    invoice_number: string;
    sales_order_id: number;
    customer_id: number;
    invoice_date: string;
    due_date?: string | null;
    status: "POSTED";
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    journal_entry_id?: number | null;
    items: InvoiceItemResponse[];
  }
  ```

---

## 4. Backend Business Logic & Validation Invariants

Any frontend connecting to this system must implement or anticipate the following backend rules:

1. **Double-Entry Balance Constraint**:
   $$\sum \text{Debit} = \sum \text{Credit}$$
   - If `total_debit != total_credit`, the backend returns HTTP 400: `"Journal entry is not balanced. Debit=X, Credit=Y"`.
2. **Single-Side Rule**:
   - A single journal line cannot have both `debit > 0` and `credit > 0`.
   - A single journal line cannot have both `debit == 0` and `credit == 0`.
3. **Minimum Lines**:
   - Journal entry must contain at least 2 lines (`len(lines) >= 2`).
4. **Soft Delete vs Hard Delete**:
   - Master data (Accounts, Contacts, Products, Journals) are **never hard-deleted** via SQL `DELETE`.
   - Archive routes set `is_active = False`. `GET /` endpoints only query `is_active == True`.
5. **Contact Roles**:
   - Only contacts with type `"CUSTOMER"` or `"BOTH"` can be used in Sales Orders. Selecting a `"VENDOR"` contact raises HTTP 400: `"Selected contact is not a customer"`.
6. **Automated Invoice Accounting Posting**:
   - Invoicing an order executes an automated journal entry:
     - **Debit**: Debtors Account (`account_id: 3`) with `order.total_amount`.
     - **Credit**: Sales Account (from Sales Journal's `default_credit_account_id`) with `order.subtotal`.
     - **Credit (if tax > 0)**: `"Tax Payable"` account (`LIABILITY`) with `order.tax_amount`.
   - The Sales Order status automatically transitions from `"DRAFT"` to `"INVOICED"`.
   - Duplicate invoicing of the same Sales Order is rejected (HTTP 400).

---

## 5. Frontend Architecture & Screen Blueprint

To ensure complete coverage, the frontend should be structured around **7 dedicated screens**:

```
Frontend Application (React + Vite + Tailwind + Framer Motion)
├── Topbar (Theme toggle, Global search, Status badges)
├── Sidebar (Navigation links with animated active indicator)
└── Pages
    ├── 1. Dashboard (KPIs, Recharts distribution, Quick Actions)
    ├── 2. Chart of Accounts (/accounts)
    ├── 3. Contacts Directory (/contacts)
    ├── 4. Products & Services Catalog (/products)
    ├── 5. Accounting Journals (/journals)
    ├── 6. General Ledger & Journal Entries (/journal-entries)
    └── 7. Sales Orders & Invoicing (/sales)
```

---

### Screen 1: Executive Dashboard (`/`)
- **Purpose**: High-level financial & operational snapshot.
- **Backend Calls**:
  - `GET /accounts/`
  - `GET /contacts/`
  - `GET /products/`
  - `GET /journals/`
  - `GET /journal-entries/`
- **UI Elements**:
  - **KPI Cards**:
    - Total Active Accounts (categorized by Assets vs Liabilities).
    - Total Customers & Vendors count.
    - Total Catalog Products & Services.
    - Total Journal Entries logged.
  - **Visualizations (Recharts)**:
    - Account Type Distribution (Donut / Pie chart: Asset, Liability, Expense, Income, Capital).
    - Product Breakdown (Bar chart: Goods, Services, Combos).
    - Recent Ledger Activities (Timeline / Mini table of the latest 5 Journal Entries).
  - **Quick Action Buttons**:
    - "New Journal Entry"
    - "New Contact"
    - "New Product"
    - "New Sales Order"

---

### Screen 2: Chart of Accounts (`/accounts`)
- **Purpose**: Manage ledger accounts.
- **Backend Endpoints**: `GET /accounts/`, `POST /accounts/`, `PUT /accounts/{id}`, `PATCH /accounts/{id}/archive`.
- **UI Elements**:
  - **Search & Filter Toolbar**: Search by name; Filter tabs (`ALL`, `ASSET`, `LIABILITY`, `EXPENSE`, `INCOME`, `CAPITAL`).
  - **Data Table**:
    - Columns: ID, Account Name, Type Badge (color-coded), Status Indicator (`Active` / `Archived`), Actions.
  - **Slide-in Drawer Form (Create & Edit)**:
    - Name field (text input, required).
    - Type select dropdown (`ASSET`, `LIABILITY`, `EXPENSE`, `INCOME`, `CAPITAL`).
  - **Archive Confirmation Modal**: Protects against accidental archiving.

---

### Screen 3: Contacts Directory (`/contacts`)
- **Purpose**: Manage Customers, Vendors, and Partners.
- **Backend Endpoints**: `GET /contacts/`, `POST /contacts/`, `PUT /contacts/{id}`, `PATCH /contacts/{id}/archive`.
- **UI Elements**:
  - **Dual View Mode Switch**:
    - **Grid View**: Contact cards displaying avatar initials, badge (`CUSTOMER`, `VENDOR`, `BOTH`), email, phone, city/state, and hover action buttons.
    - **Table View**: Compact data rows for high-density review.
  - **Type Filter Chips**: All, Customers, Vendors, Both.
  - **Search Bar**: Real-time filtering across name, email, phone, and city.
  - **Drawer Form**:
    - Section 1: Basic Info (`name`, `type` dropdown).
    - Section 2: Communication (`email` with RFC email validation, `mobile`).
    - Section 3: Location (`city`, `state`, `pincode`).
    - Section 4: Image (`profile_image` URL input).

---

### Screen 4: Products & Services Catalog (`/products`)
- **Purpose**: Items for sale and purchase.
- **Backend Endpoints**: `GET /products/`, `POST /products/`, `PUT /products/{id}`, `PATCH /products/{id}/archive`.
- **UI Elements**:
  - **Card Grid Layout**:
    - Icon indicating item type (Package for `GOODS`, Wrench/Service for `SERVICE`, Layers for `COMBO`).
    - Title and Category pill.
    - Dual Price Indicators: Sales Price (Green) vs Purchase Price (Rose) with currency formatting ($\text{₹}$).
    - Gross Margin calculation preview: $(\text{Sales Price} - \text{Purchase Price})$.
  - **Drawer Form**:
    - Name input, Type dropdown, Category text input.
    - Sales Price number input (min 0, step 0.01).
    - Purchase Price number input (min 0, step 0.01).

---

### Screen 5: Accounting Journals (`/journals`)
- **Purpose**: Configuration of daybooks and default posting accounts.
- **Backend Endpoints**: `GET /journals/`, `POST /journals/`, `PUT /journals/{id}`, `PATCH /journals/{id}/archive`, plus `GET /accounts/` for dropdown options.
- **UI Elements**:
  - **Journals Table**:
    - Columns: Journal Name, Type badge (`SALES`, `PURCHASE`, `BANK`, `CASH`), Default Debit Account (resolved name), Default Credit Account (resolved name), Status, Actions.
  - **Drawer Form**:
    - Journal Name.
    - Type select.
    - Default Debit Account (Searchable dropdown fed by active accounts).
    - Default Credit Account (Searchable dropdown fed by active accounts).

---

### Screen 6: General Ledger & Journal Entries (`/journal-entries`)
- **Purpose**: The core double-entry accounting screen.
- **Backend Endpoints**: `GET /journal-entries/`, `GET /journal-entries/{id}`, `POST /journal-entries/`.
- **UI Elements**:
  - **Entries Ledger Table**:
    - Columns: Entry ID (`#JE-101`), Date, Reference, Description, Total Lines, Total Amount ($\Sigma \text{Debits}$), View Details Button.
  - **Interactive Double-Entry Creator Drawer/Modal**:
    - **Header**:
      - Journal selector (from `GET /journals/`).
      - Entry Date picker (default today).
      - Reference text field (e.g. Voucher #).
      - Description / Narration memo.
    - **Dynamic Line Items Table**:
      - Add Line Button (+).
      - Row inputs:
        - Account selector (filtered active accounts).
        - Debit amount (numeric input, default 0).
        - Credit amount (numeric input, default 0).
        - Delete line trash icon.
      - **Client-Side Live Validation Bar**:
        - Live calculation: `Total Debit = X.XX`, `Total Credit = Y.YY`.
        - Visual status:
          - $\checkmark$ **Balanced** (Green badge) if `total_debit === total_credit && total_debit > 0`.
          - $\times$ **Out of balance: Difference = ₹Z.ZZ** (Red badge) if unequal.
        - Button validation: Submit disabled unless balanced, $\ge 2$ lines, and no row has both debit and credit.
  - **Entry Inspection Modal**:
    - Clicking any entry opens a printable/clean voucher view showing all lines, debit/credit split, and timestamp.

---

### Screen 7: Sales Orders & Invoicing (`/sales`)
- **Purpose**: Order-to-cash workflow.
- **Backend Functionality**: Utilizes `app.services.sales_services` (and dedicated routes).
- **UI Elements**:
  - **Tab 1: Sales Orders**:
    - Order list: Order #, Customer Name, Date, Status pill (`DRAFT`, `INVOICED`), Total ($\text{₹}$).
    - **Create Order Drawer**:
      - Customer Selector (only shows contacts with type `CUSTOMER` or `BOTH`).
      - Order Number (auto-suggested or manual, e.g., `SO-001`).
      - Order Date.
      - Order Items table: Product dropdown, Quantity, Unit Price, Tax Rate %, calculated Line Total.
      - Dynamic Subtotal, Tax Total, and Grand Total summary.
    - **Action**: "Create Invoice" button on any `DRAFT` order.
  - **Tab 2: Customer Invoices**:
    - Invoice list: Invoice #, Order # reference, Customer, Invoice Date, Due Date, Total, Linked Journal Entry voucher pill.
    - Clicking the Journal Entry voucher pill jumps directly to the General Ledger entry.

---

## 6. Frontend Service Layer Blueprint

All API calls should be organized into an `/api` module:

```
src/api/
├── axios.js            # Axios client with baseURL and error interceptors
├── accounts.js         # getAccounts, getAccount, createAccount, updateAccount, archiveAccount
├── contacts.js         # getContacts, getContact, createContact, updateContact, archiveContact
├── products.js         # getProducts, getProduct, createProduct, updateProduct, archiveProduct
├── journals.js         # getJournals, getJournal, createJournal, updateJournal, archiveJournal
├── journalEntries.js   # getJournalEntries, getJournalEntry, createJournalEntry
└── sales.js            # getSalesOrders, createSalesOrder, createInvoice
```

### Axios Client Pattern (`src/api/axios.js`):
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail || 'An unexpected error occurred';
    return Promise.reject(new Error(detail));
  }
);

export default api;
```

---

## 7. Recommended Backend Route Enhancements (To Complete the Stack)

While `sales_services.py` contains the business logic for Sales Orders and Invoices, dedicated REST routes should be exposed in the backend router to allow standard HTTP consumption by the frontend:

1. **`app/routes/sales.py`**:
   - `POST /sales/orders/` $\rightarrow$ calls `create_sales_order`
   - `GET /sales/orders/` $\rightarrow$ queries `SalesOrder` with items
   - `GET /sales/orders/{id}` $\rightarrow$ queries single order
   - `POST /sales/invoices/` $\rightarrow$ calls `create_customer_invoice`
   - `GET /sales/invoices/` $\rightarrow$ queries `CustomerInvoice` with items
2. **Mounting in `app/main.py`**:
   - `app.include_router(sales_router)`
3. **Hardcoded Debtors Account Configuration**:
   - Note that `sales_services.py` (line 243) currently assigns `"account_id": 3` for Debtors. In a production setup, this should be dynamically retrieved by querying the active Account with name `"Accounts Receivable"` or `"Debtors"`, or configured on the Sales Journal.

---

## 8. Summary Checklist for Frontend Implementation

- [x] **Theme System**: Dark/Light mode toggle persisted in `localStorage`.
- [x] **Navigation**: Collapsible sidebar with active route indicator for all sections.
- [x] **Accounts Management**: Full CRUD + Filter by 5 account types + Archive modal.
- [x] **Contacts Management**: Grid/Table view + Badge chips (`CUSTOMER`/`VENDOR`/`BOTH`) + Details drawer.
- [x] **Products Management**: Catalog view with sales/purchase prices + Category filters.
- [x] **Journals Management**: Daybook configurations with linked debit/credit accounts.
- [x] **Journal Entries**: Double-entry ledger list + Balanced line-item validator + Transaction creation.
- [x] **Feedback & Notifications**: Toast alerts on successful mutations or backend validation failures.
