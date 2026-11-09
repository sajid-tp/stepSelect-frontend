import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import AdminSidebar from "../../components/AdminSideBar";
import AdminTabsSort from "../../components/AdminTabsSort";
import AdminOrderStatusBadge from "../../components/AdminOrderStatusBadge";
import Pagination from "../../components/Pagination";
import { formatMoney } from "../../components/CartItem";
import useDebounce from "../../hooks/useDebounce";
import { formatDate } from "../../utils/orderFormat";

import { getAdminOrders } from "../../features/admin/orderSlice";

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/
const PAGE_SIZE = 10;

// value = what the server filters on (order status)
const TABS = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  // orders that have a product whose return the admin still has to approve / reject
  { value: "return_requested", label: "Returns" },
];

// values must match SORTS in adminOrderServices.getOrders
const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "amount_high", label: "Amount: high to low" },
  { value: "amount_low", label: "Amount: low to high" },
];

const inputClass =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10";

/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/
function Orders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { orders, pagination, pendingReturnOrders, status, error } = useSelector(
    (state) => state.adminOrders
  );

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 400);

  const [tab, setTab] = useState("all");
  const [sort, setSort] = useState("newest");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  /* ---------------- FETCH ---------------- */
  const fetchOrders = () =>
    dispatch(
      getAdminOrders({
        search: debouncedSearch,
        status: tab,
        sort,
        from,
        to,
        page,
        limit: PAGE_SIZE,
      })
    );

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, debouncedSearch, tab, sort, from, to, page]);

  /* ---------------- close the filter menu on outside click ---------------- */
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------------- HANDLERS ---------------- */
  const handleTabChange = (value) => {
    setTab(value);
    setPage(1);
  };

  const clearAll = () => {
    setSearch("");
    setTab("all");
    setSort("newest");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const activeFilterCount = (from ? 1 : 0) + (to ? 1 : 0);
  const hasFilters =
    Boolean(debouncedSearch) || tab !== "all" || sort !== "newest" || activeFilterCount > 0;

  const isLoading = status === "loading";
  const showSkeleton = isLoading && orders.length === 0;

  /* ---------------- RENDER ---------------- */
  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <AdminSidebar />

      <main className="ml-[214px] min-h-screen">
        {/* HEADER */}
        <header className="border-b border-gray-200 bg-white px-12 py-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            Logistics
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#071a33]">
            Order <span className="text-[#ff5722]">Management</span>
          </h1>
        </header>

        <section className="px-12 py-8">
          {/* SEARCH + FILTER */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="relative w-full max-w-[460px]">
              <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by order ID, customer name or email"
                className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10"
              />
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="text-sm font-semibold text-[#ff5722] transition hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          {/* TABS + SORT */}
          <AdminTabsSort
            className="mt-14 mb-8"
            tabs={TABS.map((t) =>
              t.value === "return_requested"
                ? { ...t, badge: pendingReturnOrders }
                : t
            )}
            activeTab={tab}
            onTabChange={handleTabChange}
            sortOptions={SORT_OPTIONS}
            sort={sort}
            onSortChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            sortId="order-sort"
            extra={
              <div className="relative" ref={filterRef}>
                <button
                  type="button"
                  onClick={() => setFilterOpen((o) => !o)}
                  aria-haspopup="dialog"
                  aria-expanded={filterOpen}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  <i className="fa-regular fa-calendar text-xs" />
                  Date range
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ff5722] text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {filterOpen && (
                  <div
                    role="dialog"
                    aria-label="Filter orders by date"
                    className="absolute right-0 z-20 mt-2 w-72 space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="order-from"
                          className="mb-1 block text-xs font-semibold text-gray-600"
                        >
                          From
                        </label>
                        <input
                          id="order-from"
                          type="date"
                          value={from}
                          max={to || undefined}
                          onChange={(e) => {
                            setFrom(e.target.value);
                            setPage(1);
                          }}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="order-to"
                          className="mb-1 block text-xs font-semibold text-gray-600"
                        >
                          To
                        </label>
                        <input
                          id="order-to"
                          type="date"
                          value={to}
                          min={from || undefined}
                          onChange={(e) => {
                            setTo(e.target.value);
                            setPage(1);
                          }}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setFrom("");
                        setTo("");
                        setPage(1);
                      }}
                      disabled={activeFilterCount === 0}
                      className="w-full rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Reset dates
                    </button>
                  </div>
                )}
              </div>
            }
          />

          {/* LIST ERROR */}
          {error && (
            <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <span>{error}</span>
              <button
                type="button"
                onClick={fetchOrders}
                className="font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* TABLE */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b border-gray-200 bg-[#fafafa]">
                  <tr className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
                    <th className="px-8 py-4">Order ID</th>
                    <th className="px-4 py-4">Customer</th>
                    <th className="px-4 py-4">Total amount</th>
                    <th className="px-4 py-4">Placed on</th>
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
                    orders.map((order) => (
                      <tr
                        key={order.id}
                        className="transition hover:bg-gray-50/60"
                      >
                        <td className="px-8 py-5 text-sm font-bold text-[#071a33]">
                          #{order.orderNumber}
                        </td>

                        <td className="px-4 py-5">
                          {order.user ? (
                            <>
                              <p className="text-sm font-semibold text-[#071a33]">
                                {order.user.username}
                              </p>
                              <p className="text-xs text-gray-500">
                                {order.user.email}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm italic text-gray-400">
                              Deleted user
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-5 text-sm font-semibold text-[#071a33]">
                          {formatMoney(order.totalAmount)}
                        </td>

                        <td className="px-4 py-5 text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </td>

                        <td className="px-4 py-5">
                          <div className="flex flex-wrap items-center gap-2">
                            <AdminOrderStatusBadge status={order.status} />

                            {/* a product of this order is waiting for the admin's decision */}
                            {order.returnRequestCount > 0 && (
                              <>
                                <AdminOrderStatusBadge
                                  status="return_requested"
                                  title="Open the order to approve or reject"
                                />
                                {order.returnRequestCount > 1 && (
                                  <span className="text-xs font-semibold text-orange-600">
                                    ×{order.returnRequestCount}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </td>

                        <td className="px-8 py-5 text-right">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                            className="text-sm font-semibold text-[#ff5722] transition hover:underline"
                          >
                            {order.returnRequestCount > 0 ? "Review" : "Edit"}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* EMPTY */}
            {!isLoading && !error && orders.length === 0 && (
              <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
                <i className="fa-solid fa-box-open text-4xl text-gray-300" />
                <h2 className="mt-4 text-lg font-semibold text-gray-900">
                  No orders found
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {hasFilters
                    ? "Try a different search or filter."
                    : "Orders will show up here as customers place them."}
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

            {/* PAGINATION (the shared component, inside the table card) */}
            {orders.length > 0 && (
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
    </div>
  );
}

export default Orders;
