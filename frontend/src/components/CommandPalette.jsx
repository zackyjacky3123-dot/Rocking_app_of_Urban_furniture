import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const commands = [
  { label: "Dashboard", path: "/" },
  { label: "Contacts", path: "/contacts" },
  { label: "Products", path: "/products" },
  { label: "Sales", path: "/sales" },
  { label: "Purchase", path: "/purchase" },
  { label: "Payments", path: "/payments" },
  { label: "Accounting", path: "/accounting" },
  { label: "Accounts", path: "/accounts" },
  { label: "Journals", path: "/journals" },
  { label: "Journal Entries", path: "/journal-entries" },
  { label: "Ledger", path: "/ledger" },
  { label: "Profit & Loss", path: "/profit-loss" },
  { label: "Balance Sheet", path: "/balance-sheet" },
  { label: "Budget", path: "/budget" },
  { label: "Budget Report", path: "/budget-report" },
  { label: "Users", path: "/users" },
];

export default function CommandPalette() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handler = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, []);

  const filtered = commands.filter((command) =>
    command.label.toLowerCase().includes(query.toLowerCase())
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 backdrop-blur-sm pt-[12vh]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setOpen(false);
        }
      }}
    >
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <Search size={20} className="text-slate-400" />

          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pages..."
            className="flex-1 bg-transparent outline-none text-white placeholder:text-slate-500"
          />

          <kbd className="px-2 py-1 rounded-md bg-white/10 text-xs text-slate-400">
            ESC
          </kbd>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500">
              No pages found
            </div>
          ) : (
            filtered.map((command) => (
              <button
                key={command.path}
                type="button"
                onClick={() => {
                  navigate(command.path);
                  setOpen(false);
                  setQuery("");
                }}
                className="w-full text-left px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition"
              >
                {command.label}
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-3 border-t border-white/10 text-xs text-slate-500">
          Press Ctrl + K to open search
        </div>
      </div>
    </div>
  );
}