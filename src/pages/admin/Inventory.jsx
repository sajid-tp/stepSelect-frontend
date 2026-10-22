import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import AdminSidebar from "../../components/AdminSideBar";
import Pagination from "../../components/Pagination";
import { formatMoney } from "../../components/CartItem";
import useDebounce from "../../hooks/useDebounce";

import {
  getAdminInventory,
  updateAdminStock,
} from "../../features/admin/inventorySlice";

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/
const PAGE_SIZE = 10;

// value = what the server filters on (stockFilter)
const TABS = [
  { value: "all", label: "All" },
  { value: "in", label: "In stock" },
  { value: "low", label: "Low stock" },
  { value: "out", label: "Out of stock" },
];

// values must match `sorts` in adminInventoryServices.getInventory
const SORT_OPTIONS = [
  { value: "newest", label: "Recently updated" },
  { value: "stock_asc", label: "Stock: low to high" },
  { value: "stock_desc", label: "Stock: high to low" },
  { value: "name", label: "Name A-Z" },
];

const STOCK_STATUS_META = {
  in_stock: { label: "In stock", cls: "bg-green-50 text-green-700" },
  low_stock: { label: "Low stock", cls: "bg-amber-50 text-amber-700" },
  out_of_stock: { label: "Out of stock", cls: "bg-red-50 text-red-600" },
};

const inputClass =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10";

/*
|--------------------------------------------------------------------------
| SMALL PIECES
|--------------------------------------------------------------------------
*/
function StockBadge({ status }) {
  const meta = STOCK_STATUS_META[status] || {
    label: status,
    cls: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${meta.cls}`}
    >
      {meta.label}
    </span>
  );
}

function SizeChip({ size }) {
  const cls = size.isOut
    ? "border-red-200 bg-red-50 text-red-600"
    : size.isLow
    ? "border-amber-200 bg-amber-50 text-amber-700"
    : "border-gray-200 bg-white text-gray-700";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs ${cls}`}
      title={`Size ${size.size}: ${size.stock} in stock`}
    >
      <span className="font-semibold">{size.size}</span>
      <span className="opacity-60">×</span>
      <span>{size.stock}</span>
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| UPDATE-STOCK MODAL
|--------------------------------------------------------------------------
| One row per size. Two ways to change a number:
|   "Set exact number"  -> body { size, stock }
|   "Add / remove"      -> body { size, adjust }  (safe while customers are buying)
*/
function StockModal({ item, onClose, onSaved, onError }) {
  const dispatch = useDispatch();

  const [row, setRow] = useState(item); // kept fresh from each server reply
  const [mode, setMode] = useState("set"); // set | adjust
  const [values, setValues] = useState({}); // { [size]: "text" }
  const [busySize, setBusySize] = useState(null);
  const [rowError, setRowError] = useState({}); // { [size]: "message" }

  const setValue = (size, text) => {
    setValues((v) => ({ ...v, [size]: text }));
    setRowError((e) => ({ ...e, [size]: "" }));
  };

  const switchMode = (next) => {
    setMode(next);
    setValues({});
    setRowError({});
  };

  const save = async (s) => {
    const text = String(values[s.size] ?? "").trim();
    const number = Number(text);

    // check on the client first, the server checks again
    let message = "";
    if (text === "" || !Number.isInteger(number)) {
      message = "Enter a whole number.";
    } else if (mode === "set" && number < 0) {
      message = "Stock can't be below 0.";
    } else if (mode === "adjust" && number === 0) {
      message = "Enter a number other than 0.";
    } else if (mode === "adjust" && s.stock + number < 0) {
      message = `Only ${s.stock} in stock, can't remove ${-number}.`;
    }
    if (message) {
      setRowError((e) => ({ ...e, [s.size]: message }));
      return;
    }

    try {
      setBusySize(s.size);
      const payload = { variantId: row.variantId, size: s.size };
      if (mode === "set") payload.stock = number;
      else payload.adjust = number;

      const result = await dispatch(updateAdminStock(payload)).unwrap();

      setRow((old) => ({
        ...old,
        ...result.item,
        productName: result.item.productName || old.productName,
      }));
      setValues((v) => ({ ...v, [s.size]: "" }));
      onSaved(`Size ${s.size} updated.`);
    } catch (err) {
      const text = typeof err === "string" ? err : "Could not update the stock.";
      setRowError((e) => ({ ...e, [s.size]: text }));
      onError(text);
    } finally {
      setBusySize(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busySize) onClose();
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stock-modal-title"
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-[#f7f7f7]">
              {row.image ? (
                <img src={row.image} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0">
              <h2
                id="stock-modal-title"
                className="truncate text-lg font-bold text-gray-900"
              >
                {row.productName || "Product"}
              </h2>
              <p className="text-sm text-gray-500">
                {row.color} · {row.totalStock} pairs in total
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={Boolean(busySize)}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* mode switch */}
        <div className="mt-5 grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1 text-sm font-medium">
          {[
            { value: "set", label: "Set exact number" },
            { value: "adjust", label: "Add / remove" },
          ].map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => switchMode(m.value)}
              className={`rounded-md py-2 transition ${
                mode === m.value
                  ? "bg-white text-[#071a33] shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {mode === "set"
            ? "Type the new stock for a size, for example after counting the shelf."
            : "Type +10 to add 10 pairs (a delivery) or -3 to remove 3 (damaged pairs)."}
        </p>

        {/* sizes */}
        <div className="mt-4 divide-y divide-gray-100 rounded-lg border border-gray-200">
          {row.sizes.map((s) => {
            const busy = busySize === s.size;
            return (
              <div key={s.size} className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 shrink-0">
                    <p className="text-sm font-semibold text-[#071a33]">
                      Size {s.size}
                    </p>
                    <p
                      className={`text-xs ${
                        s.isOut
                          ? "text-red-600"
                          : s.isLow
                          ? "text-amber-600"
                          : "text-gray-500"
                      }`}
                    >
                      {s.stock} in stock
                    </p>
                  </div>

                  <input
                    type="number"
                    step="1"
                    min={mode === "set" ? 0 : undefined}
                    value={values[s.size] ?? ""}
                    onChange={(e) => setValue(s.size, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") save(s);
                    }}
                    disabled={busy}
                    placeholder={mode === "set" ? "New stock" : "e.g. +10 or -3"}
                    className={`${inputClass} flex-1`}
                    aria-label={`Size ${s.size} ${mode === "set" ? "new stock" : "change"}`}
                  />

                  <button
                    type="button"
                    onClick={() => save(s)}
                    disabled={busy || String(values[s.size] ?? "").trim() === ""}
                    className="h-10 shrink-0 rounded-lg bg-[#ff5722] px-4 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#f4511e] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy ? "..." : "Save"}
                  </button>
                </div>
                {rowError[s.size] && (
                  <p className="mt-1.5 text-xs text-red-500">{rowError[s.size]}</p>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={Boolean(busySize)}
          className="mt-5 w-full rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          Done
        </button>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/
function Inventory() {
  const dispatch = useDispatch();

  const { items, summary, lowStockLimit, pagination, status, error } =
    useSelector((state) => state.adminInventory);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 400);

  const [tab, setTab] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [activeId, setActiveId] = useState(null); // variantId being edited
  const [activeItem, setActiveItem] = useState(null);
  const [toast, setToast] = useState(null); // { type, text }

  /* ---------------- FETCH ---------------- */
  const fetchInventory = () =>
    dispatch(
      getAdminInventory({
        search: debouncedSearch,
        stockFilter: tab,
        sort,
        page,
        limit: PAGE_SIZE,
      })
    );

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, debouncedSearch, tab, sort, page]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  /* ---------------- HANDLERS ---------------- */
  const handleTabChange = (value) => {
    setTab(value);
    setPage(1);
  };

  const clearAll = () => {
    setSearch("");
    setTab("all");
    setSort("newest");
    setPage(1);
  };

  const openModal = (item) => {
    setActiveId(item.variantId);
    setActiveItem(item);
  };

  const closeModal = () => {
    setActiveId(null);
    setActiveItem(null);
    fetchInventory(); // refresh cards, filters and order after edits
  };

  const hasFilters = Boolean(debouncedSearch) || tab !== "all" || sort !== "newest";
  const isLoading = status === "loading";
  const showSkeleton = isLoading && items.length === 0;

  const cards = [
    { key: "all", label: "Total variants", value: summary.total, tone: "text-[#071a33]" },
    { key: "in", label: "In stock", value: summary.inStock, tone: "text-green-600" },
    { key: "low", label: "Low stock", value: summary.low, tone: "text-amber-600" },
    { key: "out", label: "Out of stock", value: summary.out, tone: "text-red-600" },
  ];

  /* ---------------- RENDER ---------------- */
  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <AdminSidebar />

      <main className="ml-[214px] min-h-screen">
        {/* HEADER */}
        <header className="border-b border-gray-200 bg-white px-12 py-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            Stock
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#071a33]">
            Inventory <span className="text-[#ff5722]">Management</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {summary.units} pairs across {summary.total} product colours. A colour
            counts as low stock when it has {lowStockLimit} pairs or fewer per size
            on average.
          </p>
        </header>

        <section className="px-12 py-8">
          {/* SUMMARY CARDS (click one to filter) */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cards.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => handleTabChange(c.key)}
                className={`rounded-xl border bg-white p-5 text-left shadow-sm transition hover:border-[#ff5722]/50 ${
                  tab === c.key ? "border-[#ff5722]" : "border-gray-200"
                }`}
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  {c.label}
                </p>
                <p className={`mt-2 text-3xl font-extrabold ${c.tone}`}>{c.value}</p>
              </button>
            ))}
          </div>

          {/* SEARCH + SORT */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full max-w-[460px]">
              <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by product name or colour"
                className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10"
              />
            </div>

            <div className="flex items-center gap-3">
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-sm font-semibold text-[#ff5722] transition hover:underline"
                >
                  Clear
                </button>
              )}
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                aria-label="Sort inventory"
                className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* TABS */}
          <div className="mb-6 flex flex-wrap items-center gap-x-8 gap-y-2 border-b border-gray-200">
            {TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => handleTabChange(t.value)}
                className={`relative pb-3 text-sm font-medium transition ${
                  tab === t.value
                    ? "text-[#071a33]"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {t.label}
                {tab === t.value && (
                  <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#ff5722]" />
                )}
              </button>
            ))}
          </div>

          {/* LIST ERROR */}
          {error && (
            <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <span>{error}</span>
              <button type="button" onClick={fetchInventory} className="font-semibold underline">
                Retry
              </button>
            </div>
          )}

          {/* TABLE */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left">
                <thead className="border-b border-gray-200 bg-[#fafafa]">
                  <tr className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
                    <th className="px-8 py-4">Product</th>
                    <th className="px-4 py-4">Price</th>
                    <th className="px-4 py-4">Stock by size</th>
                    <th className="px-4 py-4">Total</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody
                  className={`divide-y divide-gray-100 transition-opacity ${
                    isLoading && !showSkeleton ? "opacity-60" : ""
                  }`}
                >
                  {showSkeleton &&
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 6 }).map((__, j) => (
                          <td key={j} className="px-4 py-6 first:px-8 last:px-8">
                            <div className="h-4 w-3/4 rounded bg-gray-100" />
                          </td>
                        ))}
                      </tr>
                    ))}

                  {!showSkeleton &&
                    items.map((item) => (
                      <tr key={item.variantId} className="transition hover:bg-gray-50/60">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-[#f7f7f7]">
                              {item.image ? (
                                <img src={item.image} alt="" className="h-full w-full object-cover" />
                              ) : null}
                            </div>
                            <div className="min-w-0">
                              <p className="max-w-[220px] truncate text-sm font-semibold text-[#071a33]">
                                {item.productName || "Unknown product"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.color}
                                {!item.isActive && (
                                  <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gray-500">
                                    Hidden
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-700">
                          {formatMoney(item.price)}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex max-w-[320px] flex-wrap gap-1.5">
                            {item.sizes.map((s) => (
                              <SizeChip key={s.size} size={s} />
                            ))}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold text-[#071a33]">
                          {item.totalStock}
                        </td>

                        <td className="px-4 py-4">
                          <StockBadge status={item.stockStatus} />
                        </td>

                        <td className="px-8 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => openModal(item)}
                            className="text-sm font-semibold text-[#ff5722] transition hover:underline"
                          >
                            Update stock
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* EMPTY */}
            {!isLoading && !error && items.length === 0 && (
              <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
                <i className="fa-solid fa-boxes-stacked text-4xl text-gray-300" />
                <h2 className="mt-4 text-lg font-semibold text-gray-900">
                  Nothing found
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {hasFilters
                    ? "Try a different search or filter."
                    : "Products and their stock will show up here once you add them."}
                </p>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="mt-4 rounded-lg bg-[#ff5722] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#f4511e]"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {/* PAGINATION */}
            {items.length > 0 && (
              <div className="px-8 pb-6 [&>div]:mt-0">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  totalResults={pagination.totalItems}
                  limit={pagination.limit}
                  onPageChange={(next) => {
                    setPage(next);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            )}
          </div>
        </section>
      </main>

      {/* UPDATE STOCK */}
      {activeId && activeItem && (
        <StockModal
          key={activeId}
          item={activeItem}
          onClose={closeModal}
          onSaved={(text) => setToast({ type: "success", text })}
          onError={(text) => setToast({ type: "error", text })}
        />
      )}

      {/* TOAST */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-[110] max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg ${
            toast.type === "error"
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}

export default Inventory;
