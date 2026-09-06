
from __future__ import annotations

import json
import random
import sys
import time
from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


API_BASE = "http://localhost:8001"
PREFIX = "DEMO26"
RNG = random.Random(260906)

CREATED = {
    "contacts": 0,
    "products": 0,
    "sales_orders": 0,
    "invoices": 0,
    "purchase_orders": 0,
    "bills": 0,
    "customer_payments": 0,
    "vendor_payments": 0,
    "budgets": 0,
    "budget_lines": 0,
    "journals": 0,
}

SKIPPED = {
    "contacts": 0,
    "products": 0,
    "sales_orders": 0,
    "invoices": 0,
    "purchase_orders": 0,
    "bills": 0,
    "payments": 0,
    "budgets": 0,
    "journals": 0,
}


def money_value(value) -> float:
    d = Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return float(d)


def unwrap(data):
    if isinstance(data, list):
        return data
    if not isinstance(data, dict):
        return data
    for key in (
        "items",
        "results",
        "data",
        "orders",
        "invoices",
        "payments",
        "entries",
        "budgets",
        "users",
    ):
        if isinstance(data.get(key), list):
            return data[key]
    return data


def api(method: str, path: str, payload=None, retries: int = 2):
    url = API_BASE.rstrip("/") + path
    body = None if payload is None else json.dumps(payload).encode("utf-8")

    headers = {"Accept": "application/json"}
    if payload is not None:
        headers["Content-Type"] = "application/json"

    last_error = None

    for attempt in range(retries + 1):
        try:
            req = Request(url, data=body, headers=headers, method=method)
            with urlopen(req, timeout=30) as response:
                raw = response.read().decode("utf-8")
                return json.loads(raw) if raw else None

        except HTTPError as exc:
            raw = exc.read().decode("utf-8", errors="replace")
            try:
                detail = json.loads(raw)
            except Exception:
                detail = raw
            message = f"{method} {path} -> HTTP {exc.code}: {detail}"

            # 4xx errors are usually real validation/data issues; don't retry.
            if exc.code < 500:
                raise RuntimeError(message) from exc

            last_error = RuntimeError(message)

        except URLError as exc:
            last_error = RuntimeError(
                f"Cannot reach {API_BASE}. Is FastAPI running on port 8001? {exc}"
            )

        except TimeoutError as exc:
            last_error = RuntimeError(f"Timeout calling {method} {path}: {exc}")

        if attempt < retries:
            time.sleep(1.0 + attempt)

    raise last_error or RuntimeError(f"Request failed: {method} {path}")


def ensure_backend():
    try:
        api("GET", "/accounts/")
    except Exception as exc:
        print("\n[ERROR] Backend check failed.")
        print(exc)
        print("\nStart the backend first:")
        print(r"cd E:\Urban_furniture_2026\backend")
        print(r".\venv\Scripts\Activate.ps1")
        print("uvicorn app.main:app --reload --port 8001")
        sys.exit(1)


def find_by(items, field, value):
    for item in items:
        if str(item.get(field, "")) == str(value):
            return item
    return None


def find_prefix(items, field, prefix=PREFIX):
    return [x for x in items if str(x.get(field, "")).startswith(prefix)]


def date_for_index(index: int, spread_days: int = 180) -> str:
    base = date(2026, 3, 1)
    dt = base + timedelta(days=(index * 17) % spread_days)
    return dt.isoformat()


FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Arjun", "Rohan", "Karan", "Dhruv", "Ishaan",
    "Kabir", "Manav", "Rahul", "Yash", "Neel", "Sahil", "Varun", "Ankit",
    "Aisha", "Ananya", "Diya", "Ira", "Kavya", "Meera", "Nisha", "Riya",
    "Sana", "Tara", "Vanya", "Zoya", "Pooja", "Sneha",
]

LAST_NAMES = [
    "Shah", "Patel", "Mehta", "Desai", "Joshi", "Gandhi", "Trivedi", "Vora",
    "Parekh", "Kapoor", "Malhotra", "Rao", "Iyer", "Nair", "Verma", "Bansal",
]

CITIES = [
    ("Ahmedabad", "Gujarat", "380001"),
    ("Gandhinagar", "Gujarat", "382010"),
    ("Vadodara", "Gujarat", "390001"),
    ("Surat", "Gujarat", "395003"),
    ("Rajkot", "Gujarat", "360001"),
    ("Mumbai", "Maharashtra", "400001"),
    ("Pune", "Maharashtra", "411001"),
    ("Jaipur", "Rajasthan", "302001"),
    ("Delhi", "Delhi", "110001"),
    ("Bengaluru", "Karnataka", "560001"),
]

PRODUCT_NAMES = [
    "Executive Office Chair",
    "Ergonomic Work Chair",
    "Visitor Chair",
    "Mesh Back Chair",
    "Premium Lounge Chair",
    "Manager Desk",
    "Executive Desk",
    "Reception Desk",
    "Compact Work Desk",
    "Conference Table",
    "Meeting Table",
    "Round Dining Table",
    "Workstation Pod",
    "Two-Seater Workstation",
    "Four-Seater Workstation",
    "Six-Seater Workstation",
    "Mobile Pedestal",
    "Three Drawer Cabinet",
    "Filing Cabinet",
    "Storage Locker",
    "Open Bookcase",
    "Low Storage Unit",
    "Display Shelf",
    "Reception Sofa",
    "Two-Seater Sofa",
    "Three-Seater Sofa",
    "Cafeteria Chair",
    "Cafeteria Table",
    "Bar Stool",
    "Outdoor Bench",
    "Waiting Bench",
    "Computer Table",
    "Printer Table",
    "Side Table",
    "Coffee Table",
    "Bedside Table",
    "Wooden Partition",
    "Acoustic Screen",
    "Conference Chair",
    "Training Chair",
]

CATEGORIES = [
    "Seating",
    "Desks",
    "Tables",
    "Storage",
    "Reception",
    "Workstations",
    "Cafeteria",
    "Meeting",
    "Accessories",
    "Partitions",
]


def seed_journals():
    accounts = unwrap(api("GET", "/accounts/")) or []
    journals = unwrap(api("GET", "/journals/")) or []

    by_type = {str(x.get("type", "")).upper(): x for x in journals}

    required = [
        ("DEMO Sales Journal", "SALES", 3, 5),       # Debtors / Sales
        ("DEMO Purchase Journal", "PURCHASE", 6, 4), # Expense / Creditors
        ("DEMO Bank Journal", "BANK", 2, 3),         # Bank / Debtors
        ("DEMO Cash Journal", "CASH", 1, 3),         # Cash / Debtors
    ]

    for name, jtype, debit_id, credit_id in required:
        exists = next(
            (
                j for j in journals
                if str(j.get("name", "")).strip().lower() == name.lower()
            ),
            None,
        )
        if exists:
            SKIPPED["journals"] += 1
            continue

        # Only create when the referenced accounts exist.
        if not find_by(accounts, "id", debit_id) or not find_by(accounts, "id", credit_id):
            print(f"[WARN] Skipping journal '{name}': account IDs not available.")
            continue

        api(
            "POST",
            "/journals/",
            {
                "name": name,
                "type": jtype,
                "default_debit_account_id": debit_id,
                "default_credit_account_id": credit_id,
            },
        )
        CREATED["journals"] += 1

    return journals, accounts


def seed_contacts():
    existing = unwrap(api("GET", "/contacts/")) or []
    demo_existing = {
        str(x.get("name", "")): x
        for x in existing
        if str(x.get("name", "")).startswith(PREFIX)
    }

    result = []

    customer_count = 24
    vendor_count = 12
    both_count = 4
    total = customer_count + vendor_count + both_count

    for i in range(1, total + 1):
        first = FIRST_NAMES[(i - 1) % len(FIRST_NAMES)]
        last = LAST_NAMES[((i - 1) * 3) % len(LAST_NAMES)]

        if i <= customer_count:
            ctype = "CUSTOMER"
            label = "Customer"
        elif i <= customer_count + vendor_count:
            ctype = "VENDOR"
            label = "Vendor"
        else:
            ctype = "BOTH"
            label = "CustomerVendor"

        name = f"{PREFIX} {label} {i:02d} - {first} {last}"

        if name in demo_existing:
            SKIPPED["contacts"] += 1
            result.append(demo_existing[name])
            continue

        city, state, pincode = CITIES[(i - 1) % len(CITIES)]

        payload = {
            "name": name,
            "type": ctype,
            "email": f"demo26.contact{i:02d}@urbanfurniture.test",
            "mobile": f"+91 98{(10000000 + i):08d}",
            "city": city,
            "state": state,
            "pincode": pincode,
            "profile_image": "",
        }

        result.append(api("POST", "/contacts/", payload))
        CREATED["contacts"] += 1

    return result


def seed_products():
    existing = unwrap(api("GET", "/products/")) or []
    by_name = {
        str(x.get("name", "")): x
        for x in existing
        if str(x.get("name", "")).startswith(PREFIX)
    }

    result = []

    for i in range(1, 51):
        base = PRODUCT_NAMES[(i - 1) % len(PRODUCT_NAMES)]
        name = f"{PREFIX} {base} {i:02d}"

        if name in by_name:
            SKIPPED["products"] += 1
            result.append(by_name[name])
            continue

        purchase = 1200 + ((i * 735) % 18500)
        margin = 0.22 + ((i % 5) * 0.035)
        sales = purchase * (1 + margin)

        payload = {
            "name": name,
            "type": "GOODS",
            "category": CATEGORIES[(i - 1) % len(CATEGORIES)],
            "sales_price": money_value(sales),
            "purchase_price": money_value(purchase),
        }

        result.append(api("POST", "/products/", payload))
        CREATED["products"] += 1

    return result


def make_sales_orders(customers, products):
    existing_orders = unwrap(api("GET", "/sales/orders")) or []
    existing_invoices = unwrap(api("GET", "/sales/invoices")) or []

    orders_by_number = {
        str(x.get("order_number", "")): x
        for x in existing_orders
        if str(x.get("order_number", "")).startswith(PREFIX)
    }

    invoice_by_order = {
        str(x.get("sales_order_id")): x
        for x in existing_invoices
    }

    created_orders = []
    invoice_records = []

    for i in range(1, 31):
        order_number = f"{PREFIX}-SO-{i:03d}"
        customer = customers[(i - 1) % len(customers)]

        order = orders_by_number.get(order_number)

        if order:
            SKIPPED["sales_orders"] += 1
        else:
            p1 = products[(i * 2 - 2) % len(products)]
            p2 = products[(i * 2 - 1) % len(products)]

            items = [
                {
                    "product_id": int(p1["id"]),
                    "quantity": 1 + (i % 4),
                    "unit_price": money_value(p1.get("sales_price", 5000)),
                    "tax_rate": 0,
                },
                {
                    "product_id": int(p2["id"]),
                    "quantity": 1 + (i % 3),
                    "unit_price": money_value(p2.get("sales_price", 3500)),
                    "tax_rate": 0,
                },
            ]

            order = api(
                "POST",
                "/sales/orders",
                {
                    "order_number": order_number,
                    "customer_id": int(customer["id"]),
                    "order_date": date_for_index(i),
                    "items": items,
                },
            )
            CREATED["sales_orders"] += 1

        created_orders.append(order)

        # Create invoice for the order unless it already exists.
        if str(order.get("id")) in invoice_by_order:
            SKIPPED["invoices"] += 1
            invoice_records.append(invoice_by_order[str(order.get("id"))])
        else:
            invoice = api(
                "POST",
                "/sales/invoices",
                {
                    "invoice_number": f"{PREFIX}-INV-{i:03d}",
                    "sales_order_id": int(order["id"]),
                    "invoice_date": date_for_index(i + 2),
                },
            )
            CREATED["invoices"] += 1
            invoice_records.append(invoice)

    return created_orders, invoice_records


def make_purchase_orders(vendors, products):
    existing_orders = unwrap(api("GET", "/purchase/orders")) or []
    existing_bills = unwrap(api("GET", "/purchase/bills")) or []

    orders_by_number = {
        str(x.get("order_number", "")): x
        for x in existing_orders
        if str(x.get("order_number", "")).startswith(PREFIX)
    }

    bill_by_order = {
        str(x.get("purchase_order_id")): x
        for x in existing_bills
    }

    orders = []
    bills = []

    for i in range(1, 21):
        order_number = f"{PREFIX}-PO-{i:03d}"
        vendor = vendors[(i - 1) % len(vendors)]
        order = orders_by_number.get(order_number)

        if order:
            SKIPPED["purchase_orders"] += 1
        else:
            p1 = products[(i + 7) % len(products)]
            p2 = products[(i + 13) % len(products)]

            items = [
                {
                    "product_id": int(p1["id"]),
                    "quantity": 2 + (i % 5),
                    "unit_cost": money_value(p1.get("purchase_price", 3000)),
                    "tax_rate": 0,
                },
                {
                    "product_id": int(p2["id"]),
                    "quantity": 1 + (i % 4),
                    "unit_cost": money_value(p2.get("purchase_price", 2500)),
                    "tax_rate": 0,
                },
            ]

            order = api(
                "POST",
                "/purchase/orders",
                {
                    "order_number": order_number,
                    "vendor_id": int(vendor["id"]),
                    "order_date": date_for_index(i + 3),
                    "items": items,
                },
            )
            CREATED["purchase_orders"] += 1

        orders.append(order)

        # Confirm and receive the purchase.
        status = str(order.get("status", "")).upper()
        if status not in {"CONFIRMED", "RECEIVED", "BILLED", "PAID"}:
            try:
                order = api("PATCH", f"/purchase/orders/{order['id']}/confirm")
            except Exception as exc:
                # If the backend already auto-confirms or has a different intermediate state,
                # continue and let the bill attempt reveal any real incompatibility.
                print(f"[WARN] Confirm {order_number}: {exc}")

        status = str(order.get("status", "")).upper()
        if status not in {"RECEIVED", "BILLED", "PAID"}:
            try:
                receive_items = []
                for order_item in (order.get("items") or []):
                    ordered_qty = Decimal(str(order_item.get("quantity", "0")))
                    received_qty = Decimal(str(order_item.get("received_quantity", "0")))
                    remaining_qty = ordered_qty - received_qty
                    if remaining_qty > 0:
                        receive_items.append(
                            {
                                "item_id": int(order_item["id"]),
                                "quantity": money_value(remaining_qty),
                            }
                        )

                if receive_items:
                    order = api(
                        "POST",
                        f"/purchase/orders/{order['id']}/receive",
                        {"items": receive_items},
                    )
            except Exception as exc:
                print(f"[WARN] Receive {order_number}: {exc}")

        if str(order.get("id")) in bill_by_order:
            SKIPPED["bills"] += 1
            bills.append(bill_by_order[str(order.get("id"))])
            continue

        try:
            bill = api(
                "POST",
                "/purchase/bills",
                {
                    "bill_number": f"{PREFIX}-BILL-{i:03d}",
                    "purchase_order_id": int(order["id"]),
                    "bill_date": date_for_index(i + 5),
                },
            )
            CREATED["bills"] += 1
            bills.append(bill)
        except Exception as exc:
            print(f"[WARN] Bill {PREFIX}-PO-{i:03d}: {exc}")

    return orders, bills


def seed_payments(customers, vendors, invoices, bills):
    existing = unwrap(api("GET", "/payments/")) or []

    existing_numbers = {
        str(x.get("payment_number", ""))
        for x in existing
        if str(x.get("payment_number", "")).startswith(PREFIX)
    }

    # Customer payments are linked to customer invoices.
    # Use the actual invoice IDs returned by the sales API.
    usable_invoices = [
        inv
        for inv in invoices
        if inv and inv.get("id") and Decimal(str(inv.get("total_amount", "0"))) > 0
    ]

    for i, invoice in enumerate(usable_invoices[:15], start=1):
        payment_number = f"{PREFIX}-CP-{i:03d}"

        if payment_number in existing_numbers:
            SKIPPED["payments"] += 1
            continue

        invoice_total = Decimal(str(invoice["total_amount"]))

        # Keep within outstanding amount. Start with a partial payment,
        # then vary the percentage for realistic dashboard data.
        pct = Decimal("0.35") + Decimal(str((i % 4) * 0.10))
        amount = (invoice_total * pct).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        if amount <= 0:
            continue

        try:
            api(
                "POST",
                "/payments/customer",
                {
                    "payment_number": payment_number,
                    "customer_invoice_id": int(invoice["id"]),
                    "payment_date": date_for_index(i + 30),
                    "amount": float(amount),
                    "payment_method": "BANK" if i % 2 else "CASH",
                    "reference": f"{PREFIX}-RECEIPT-{i:03d}",
                },
            )
            CREATED["customer_payments"] += 1
        except Exception as exc:
            print(f"[WARN] Customer payment {payment_number}: {exc}")

    # Vendor payments are linked to vendor bills.
    usable_bills = [
        bill
        for bill in bills
        if bill and bill.get("id") and Decimal(str(bill.get("total_amount", "0"))) > 0
    ]

    for i, bill in enumerate(usable_bills[:15], start=1):
        payment_number = f"{PREFIX}-VP-{i:03d}"

        if payment_number in existing_numbers:
            SKIPPED["payments"] += 1
            continue

        bill_total = Decimal(str(bill["total_amount"]))

        pct = Decimal("0.40") + Decimal(str((i % 3) * 0.10))
        amount = (bill_total * pct).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        if amount <= 0:
            continue

        try:
            api(
                "POST",
                "/payments/vendor",
                {
                    "payment_number": payment_number,
                    "vendor_bill_id": int(bill["id"]),
                    "payment_date": date_for_index(i + 50),
                    "amount": float(amount),
                    "payment_method": "BANK" if i % 2 else "CASH",
                    "reference": f"{PREFIX}-SETTLEMENT-{i:03d}",
                },
            )
            CREATED["vendor_payments"] += 1
        except Exception as exc:
            print(f"[WARN] Vendor payment {payment_number}: {exc}")

def seed_budgets():
    existing = unwrap(api("GET", "/budgets/")) or []

    existing_names = {
        str(x.get("name", ""))
        for x in existing
        if str(x.get("name", "")).startswith(PREFIX)
    }

    accounts = unwrap(api("GET", "/accounts/")) or []

    account_ids = [
        int(a["id"])
        for a in accounts
        if str(a.get("type", "")).upper() in {"EXPENSE", "INCOME"}
    ]

    if not account_ids:
        print("[WARN] No income/expense accounts available for budgets.")
        return

    for i in range(1, 6):
        name = f"{PREFIX} FY2026 Budget {i:02d}"

        if name in existing_names:
            SKIPPED["budgets"] += 1
            continue

        start_date = date(2026, 1, 1) + timedelta(days=(i - 1) * 31)
        end_date = start_date + timedelta(days=89)

        selected_accounts = account_ids[:]
        RNG.shuffle(selected_accounts)

        line_count = min(3, len(selected_accounts))
        lines = []

        for j in range(line_count):
            account_id = selected_accounts[j]
            amount = 75000 + ((i * 17300 + j * 21500) % 145000)

            lines.append({
                "account_id": account_id,
                "budget_amount": money_value(amount),
            })

        api(
            "POST",
            "/budgets/",
            {
                "name": name,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "lines": lines,
            },
        )

        CREATED["budgets"] += 1
        CREATED["budget_lines"] += len(lines)

def print_summary():
    explicit_created = sum(CREATED.values())
    explicit_skipped = sum(SKIPPED.values())

    print("\n" + "=" * 64)
    print("URBAN FURNITURE — DEMO SEED RESULT")
    print("=" * 64)

    print("\nCreated:")
    for key, value in CREATED.items():
        print(f"  {key:22s} {value:>4}")

    print(f"\nTOTAL EXPLICIT RECORDS CREATED: {explicit_created}")

    if explicit_skipped:
        print("\nSkipped existing demo records:")
        for key, value in SKIPPED.items():
            if value:
                print(f"  {key:22s} {value:>4}")

    print("\nNotes:")
    print("  • Sales invoices / purchase bills may generate journal entries automatically.")
    print("  • Customer/vendor payments may generate additional journal entries automatically.")
    print("  • Therefore the final database row count can exceed the explicit seed count.")
    print("  • Demo records are prefixed with DEMO26 for easy identification.")


def main():
    print("=" * 64)
    print("Urban Furniture Accounting — Demo Data Seeder")
    print("=" * 64)
    print(f"Backend: {API_BASE}")
    print("Target: approximately 240 explicit demo records")
    print()

    ensure_backend()

    seed_journals()
    contacts = seed_contacts()
    products = seed_products()

    customers = [
        c for c in contacts
        if str(c.get("type", "")).upper() in {"CUSTOMER", "BOTH"}
    ]
    vendors = [
        c for c in contacts
        if str(c.get("type", "")).upper() in {"VENDOR", "BOTH"}
    ]

    if not customers:
        raise RuntimeError("No customer contacts available.")
    if not vendors:
        raise RuntimeError("No vendor contacts available.")
    if not products:
        raise RuntimeError("No products available.")

    print("\nCreating sales workflow...")
    _, invoices = make_sales_orders(customers, products)

    print("Creating purchase workflow...")
    _, bills = make_purchase_orders(vendors, products)

    print("Creating payments...")
    seed_payments(customers, vendors, invoices, bills)

    print("Creating budgets...")
    seed_budgets()

    print_summary()


if __name__ == "__main__":
    main()
