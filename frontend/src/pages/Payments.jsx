import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

import {
  getPayments,
  createCustomerPayment,
  createVendorPayment,
} from "../api/payments";

import { getContacts } from "../api/contacts";
import { getAccounts } from "../api/accounts";

import {
  Card,
  Button,
  Input,
  Select,
  Modal,
  PageHeader,
  Table,
  RefreshButton,
} from "../components/ui";

import Badge from "../components/Badge";
import { listify, money, dateFmt } from "../utils";

export default function Payments() {
  const [tab, setTab] = useState("all");

  const [payments, setPayments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState("customer");

  const [form, setForm] = useState({
    contact_id: "",
    amount: "",
    payment_method: "BANK",
    account_id: "",
    payment_date: new Date().toISOString().slice(0, 10),
    reference: "",
  });

  const load = async () => {
    try {
      const [paymentsResponse, contactsResponse, accountsResponse] =
        await Promise.all([
          getPayments(),
          getContacts(),
          getAccounts(),
        ]);

      setPayments(listify(paymentsResponse));
      setContacts(listify(contactsResponse));
      setAccounts(listify(accountsResponse));
    } catch (error) {
      toast.error(error?.message || "Failed to load payments");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const bankAccounts = useMemo(() => {
    return accounts.filter(
      (account) =>
        String(account.type || "").toUpperCase() === "ASSET"
    );
  }, [accounts]);

  const availableContacts = useMemo(() => {
    const wantedTypes =
      kind === "customer"
        ? ["CUSTOMER", "BOTH"]
        : ["VENDOR", "BOTH"];

    return contacts.filter((contact) =>
      wantedTypes.includes(
        String(contact.type || "").toUpperCase()
      )
    );
  }, [contacts, kind]);

  const filteredPayments = useMemo(() => {
    if (tab === "all") return payments;

    return payments.filter((payment) => {
      const paymentType = String(
        payment.payment_type || payment.type || ""
      ).toLowerCase();

      return paymentType.includes(tab);
    });
  }, [payments, tab]);

  const openPaymentModal = (paymentKind = "customer") => {
    setKind(paymentKind);

    setForm({
      contact_id: "",
      amount: "",
      payment_method: "BANK",
      account_id: "",
      payment_date: new Date().toISOString().slice(0, 10),
      reference: "",
    });

    setOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!form.contact_id) {
      toast.error("Please select a party");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      toast.error("Enter a valid payment amount");
      return;
    }

    if (!form.account_id) {
      toast.error("Please select a Cash / Bank account");
      return;
    }

    try {
      const body = {
        contact_id: Number(form.contact_id),
        amount: Number(form.amount),
        payment_method: form.payment_method,
        account_id: Number(form.account_id),
        payment_date: form.payment_date,
        reference: form.reference || null,
      };

      if (kind === "customer") {
        await createCustomerPayment(body);
      } else {
        await createVendorPayment(body);
      }

      toast.success(
        kind === "customer"
          ? "Customer payment recorded successfully"
          : "Vendor payment recorded successfully"
      );

      setOpen(false);
      await load();
    } catch (error) {
      toast.error(error?.message || "Unable to record payment");
    }
  };

  const columns = [
    {
      key: "id",
      label: "Payment",
      render: (row) => `#PAY-${row.id}`,
    },
    {
      key: "payment_date",
      label: "Date",
      render: (row) =>
        dateFmt(row.payment_date || row.date),
    },
    {
      key: "contact_id",
      label: "Party",
      render: (row) => {
        const contact = contacts.find(
          (item) => item.id === row.contact_id
        );

        return (
          contact?.name ||
          row.contact_name ||
          `#${row.contact_id || "—"}`
        );
      },
    },
    {
      key: "payment_type",
      label: "Type",
      render: (row) => {
        const type = String(
          row.payment_type || row.type || "PAYMENT"
        );

        const isVendor = type.toLowerCase().includes("vendor");

        return (
          <Badge tone={isVendor ? "amber" : "green"}>
            {type}
          </Badge>
        );
      },
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => money(row.amount),
    },
    {
      key: "payment_method",
      label: "Method",
      render: (row) => row.payment_method || "—",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Badge tone="green">
          {row.status || "POSTED"}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Payments"
        description="Record customer receipts and vendor settlements"
      >
        <RefreshButton onClick={load} />

        <Button
          icon={Plus}
          onClick={() => openPaymentModal("customer")}
        >
          Record Payment
        </Button>
      </PageHeader>

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          ["all", "All Payments"],
          ["customer", "Customer Payments"],
          ["vendor", "Vendor Payments"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition ${
              tab === key
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "glass text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Card>
        <Table
          columns={columns}
          rows={filteredPayments}
        />
      </Card>

      <Modal
        open={open}
        title={
          kind === "customer"
            ? "Record Customer Payment"
            : "Record Vendor Payment"
        }
        onClose={() => setOpen(false)}
      >
        <form
          onSubmit={submit}
          className="space-y-4"
        >
          <Select
            label={
              kind === "customer"
                ? "Customer"
                : "Vendor"
            }
            value={form.contact_id}
            onChange={(event) =>
              setForm({
                ...form,
                contact_id: event.target.value,
              })
            }
            required
          >
            <option value="">
              Select party
            </option>

            {availableContacts.map((contact) => (
              <option
                value={contact.id}
                key={contact.id}
              >
                {contact.name}
              </option>
            ))}
          </Select>

          <Input
            label="Amount"
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={(event) =>
              setForm({
                ...form,
                amount: event.target.value,
              })
            }
            required
          />

          <Select
            label="Payment Method"
            value={form.payment_method}
            onChange={(event) =>
              setForm({
                ...form,
                payment_method: event.target.value,
              })
            }
          >
            <option value="BANK">BANK</option>
            <option value="CASH">CASH</option>
          </Select>

          <Select
            label="Cash / Bank Account"
            value={form.account_id}
            onChange={(event) =>
              setForm({
                ...form,
                account_id: event.target.value,
              })
            }
            required
          >
            <option value="">
              Select account
            </option>

            {bankAccounts.map((account) => (
              <option
                value={account.id}
                key={account.id}
              >
                {account.name}
              </option>
            ))}
          </Select>

          <Input
            label="Payment Date"
            type="date"
            value={form.payment_date}
            onChange={(event) =>
              setForm({
                ...form,
                payment_date: event.target.value,
              })
            }
          />

          <Input
            label="Reference"
            value={form.reference}
            onChange={(event) =>
              setForm({
                ...form,
                reference: event.target.value,
              })
            }
          />

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setKind(
                  kind === "customer"
                    ? "vendor"
                    : "customer"
                )
              }
            >
              Switch to{" "}
              {kind === "customer"
                ? "Vendor"
                : "Customer"}
            </Button>

            <Button type="submit">
              Post Payment
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}