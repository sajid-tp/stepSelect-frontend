import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import AdminSidebar from "../../components/AdminSideBar";
import Pagination from "../../components/Pagination";
import Modal from "../../components/Modals";
import useDebounce from "../../hooks/useDebounce";

import {
  getCoupons,
  toggleCouponStatus,
  deleteCoupon,
} from "../../features/admin/couponSlice";

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/
const PAGE_SIZE = 9; // 3 x 3 grid

const TABS = [
  { value: "all", label: "All coupons" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

// values must match the sortMap in adminCouponServices.getCoupons
const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "code_asc", label: "Code (A → Z)" },
  { value: "code_desc", label: "Code (Z → A)" },
  { value: "expiry_asc", label: "Expiring soonest" },
];

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/
const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const getDisplayStatus = (coupon) => {
  const now = new Date();

  if (!coupon.isActive) return { label: "Inactive", tone: "off" };
  if (coupon.expiryDate && new Date(coupon.expiryDate) < now)
    return { label: "Expired", tone: "expired" };
  if (coupon.startDate && new Date(coupon.startDate) > now)
    return { label: "Scheduled", tone: "scheduled" };

  return { label: "Active", tone: "on" };
};

const STATUS_TEXT = {
  on: "text-green-600",
  off: "text-gray-400",
  expired: "text-red-500",
  scheduled: "text-blue-500",
};

/*
|--------------------------------------------------------------------------
| SMALL UI PIECES
|--------------------------------------------------------------------------
*/
function Switch({ checked, disabled, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? "bg-[#ff5722]" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
          checked ? "left-[18px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function CouponCard({ coupon, toggling, deleting, onEdit, onToggle, onDelete }) {
  const display = getDisplayStatus(coupon);
  const isPercentage = coupon.discountType === "percentage";
  const dimmed = display.tone === "off" || display.tone === "expired";

  const limit = coupon.redemptionLimit;
  const usedPct = limit ? Math.min((coupon.redemptions / limit) * 100, 100) : 0;
  // independent of isActive: an inactive coupon can also be past its expiry
  const expired = Boolean(coupon.expiryDate) && new Date(coupon.expiryDate) < new Date();

  const fineprint = [
    coupon.minimumPurchase > 0 && `Min. order ${formatMoney(coupon.minimumPurchase)}`,
    isPercentage &&
      coupon.maximumDiscount != null &&
      `Up to ${formatMoney(coupon.maximumDiscount)} off`,
    `${coupon.usageLimitPerUser}× per customer`,
  ].filter(Boolean);

  return (
    <div
      className={`flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md ${
        dimmed ? "opacity-80" : ""
      }`}
    >
      {/* TOP: status toggle */}
      <div className="flex items-center gap-2">
        <span
          className={`text-[10px] font-bold uppercase tracking-[0.14em] ${STATUS_TEXT[display.tone]}`}
        >
          {display.label}
        </span>
        <Switch
          checked={coupon.isActive}
          disabled={toggling}
          onChange={() => onToggle(coupon)}
          label={`${coupon.isActive ? "Deactivate" : "Activate"} ${coupon.couponCode}`}
        />
      </div>

      {/* CODE + DISCOUNT */}
      <div className="mt-4 flex items-start justify-between gap-3">
        <span className="inline-flex max-w-[60%] items-center gap-1.5 rounded-md border border-dashed border-gray-300 bg-gray-50 px-2.5 py-1.5">
          <i className="fa-solid fa-ticket shrink-0 text-[11px] text-gray-400" />
          <span className="truncate text-[13px] font-bold tracking-wide text-[#071a33]">
            {coupon.couponCode}
          </span>
        </span>

        <div className="text-right leading-none">
          <p className="text-[26px] font-extrabold tracking-tight text-[#071a33]">
            {isPercentage
              ? `${coupon.discountValue}%`
              : formatMoney(coupon.discountValue)}
          </p>
          <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            Off
          </p>
        </div>
      </div>

      {/* DESCRIPTION */}
      <p className="mt-3 line-clamp-2 min-h-[36px] text-xs italic leading-[18px] text-gray-500">
        {coupon.description ? `“${coupon.description}”` : "No description added."}
      </p>

      {/* STATS */}
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 px-3 py-2.5">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-400">
            Redemptions
          </p>
          <p className="mt-0.5 text-sm font-bold text-[#071a33]">
            {coupon.redemptions}
            <span className="font-medium text-gray-400">
              {" "}/ {limit ?? "∞"}
            </span>
          </p>
          {limit && (
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-[#ff5722]"
                style={{ width: `${usedPct}%` }}
              />
            </div>
          )}
        </div>

        <div className="text-right">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-400">
            {expired ? "Expired on" : "Ends on"}
          </p>
          <p
            className={`mt-0.5 text-sm font-bold ${
              expired ? "text-red-500" : "text-[#071a33]"
            }`}
          >
            {coupon.expiryDate ? formatDate(coupon.expiryDate) : "No Expiry"}
          </p>
        </div>
      </div>

      <p className="mt-2.5 text-[11px] leading-4 text-gray-400">
        {fineprint.join(" · ")}
      </p>

      {/* ACTIONS */}
      <div className="mt-auto flex items-center gap-2 pt-4">
        <button
          type="button"
          onClick={() => onEdit(coupon)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-200"
        >
          <i className="fa-solid fa-pen text-[10px]" />
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete(coupon)}
          disabled={deleting}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <i className="fa-solid fa-trash text-[10px]" />
          {deleting ? "Deleting..." : "Delete"}
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
function Coupons() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    coupons,
    totalResults,
    totalPages,
    currentPage,
    limit,
    status,
    error,
  } = useSelector((state) => state.adminCoupons);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 400);

  const [tab, setTab] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selected, setSelected] = useState(null); // coupon pending delete
  const [toast, setToast] = useState(null); // { type: "success" | "error", text }

  /* ---------------- FETCH ---------------- */
  const fetchCoupons = () =>
    dispatch(
      getCoupons({
        search: debouncedSearch,
        status: tab,
        sort,
        page,
        limit: PAGE_SIZE,
      })
    );

  useEffect(() => {
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, debouncedSearch, tab, sort, page]);

  /* ---------------- TOAST auto-dismiss ---------------- */
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  /* ---------------- close sort menu on outside click ---------------- */
  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const errorText = (err) =>
    typeof err === "string" ? err : err?.message || "Something went wrong.";

  /* ---------------- HANDLERS ---------------- */
  const handleTabChange = (value) => {
    setTab(value);
    setPage(1);
  };

  const handleSortChange = (value) => {
    setSort(value);
    setPage(1);
    setSortOpen(false);
  };

  const handleEdit = (coupon) =>
    navigate(`/admin/coupons/edit/${coupon.id}`, { state: { coupon } });

  const handleToggle = async (coupon) => {
    try {
      setTogglingId(coupon.id);
      const result = await dispatch(toggleCouponStatus(coupon.id)).unwrap();

      setToast({
        type: "success",
        text: `${result.couponCode} ${result.isActive ? "activated" : "deactivated"}.`,
      });

      // On the Active / Inactive tabs the card no longer belongs there
      if (tab !== "all") fetchCoupons();
    } catch (err) {
      setToast({ type: "error", text: errorText(err) });
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;

    try {
      setDeletingId(selected.id);
      await dispatch(deleteCoupon(selected.id)).unwrap();

      setToast({ type: "success", text: `${selected.couponCode} deleted.` });
      setSelected(null);

      // keep pagination correct after removing the last card on a page
      if (coupons.length === 1 && page > 1) setPage((p) => p - 1);
      else fetchCoupons();
    } catch (err) {
      setToast({ type: "error", text: errorText(err) });
      setSelected(null);
    } finally {
      setDeletingId(null);
    }
  };

  const isLoading = status === "loading";
  const hasFilters = Boolean(debouncedSearch) || tab !== "all";

  /* ---------------- RENDER ---------------- */
  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <AdminSidebar />

      <main className="ml-[214px] min-h-screen">
        {/* HEADER */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-12 py-7">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
              Incentives
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#071a33]">
              Coupons
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/coupons/new")}
            className="inline-flex items-center gap-2 rounded-md bg-[#ff5722] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#f4511e] hover:shadow-md"
          >
            <span className="text-base leading-none">+</span>
            Add Coupon
          </button>
        </header>

        <section className="px-12 py-8">
          {/* SEARCH + SORT */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="relative w-full max-w-[420px]">
              <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by code or description"
                className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10"
              />
            </div>

            <div className="relative" ref={sortRef}>
              <button
                type="button"
                onClick={() => setSortOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={sortOpen}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <i className="fa-solid fa-arrow-down-wide-short text-xs" />
                Sort
              </button>

              {sortOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      role="menuitemradio"
                      aria-checked={sort === opt.value}
                      onClick={() => handleSortChange(opt.value)}
                      className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition hover:bg-gray-50 ${
                        sort === opt.value
                          ? "font-semibold text-[#ff5722]"
                          : "text-gray-700"
                      }`}
                    >
                      {opt.label}
                      {sort === opt.value && (
                        <i className="fa-solid fa-check text-xs" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* TABS */}
          <div className="mb-8 flex items-center gap-8 border-b border-gray-200">
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
              <button
                type="button"
                onClick={fetchCoupons}
                className="font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* LOADING / EMPTY / GRID */}
          {isLoading && coupons.length === 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[300px] animate-pulse rounded-xl border border-gray-200 bg-white"
                />
              ))}
            </div>
          ) : coupons.length === 0 && !error ? (
            <div className="flex min-h-[380px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ffe1d6] text-[#ff5722]">
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M4 6h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4V6Z" />
                  <path d="M9 9h6M9 15h6" />
                </svg>
              </div>
              <h2 className="mt-5 text-lg font-semibold text-gray-900">
                No coupons found
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                {hasFilters
                  ? "Try a different search or filter."
                  : "Create your first coupon to get started."}
              </p>
              {!hasFilters && (
                <button
                  type="button"
                  onClick={() => navigate("/admin/coupons/new")}
                  className="mt-5 rounded-lg bg-[#ff5722] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#f4511e]"
                >
                  Add Coupon
                </button>
              )}
            </div>
          ) : (
            <>
              <div
                className={`grid grid-cols-1 gap-5 transition-opacity md:grid-cols-2 xl:grid-cols-3 ${
                  isLoading ? "opacity-60" : ""
                }`}
              >
                {coupons.map((coupon) => (
                  <CouponCard
                    key={coupon.id}
                    coupon={coupon}
                    toggling={togglingId === coupon.id}
                    deleting={deletingId === coupon.id}
                    onEdit={handleEdit}
                    onToggle={handleToggle}
                    onDelete={setSelected}
                  />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalResults={totalResults}
                limit={limit}
                onPageChange={setPage}
              />
            </>
          )}
        </section>
      </main>

      {/* DELETE MODAL */}
      <Modal
        open={Boolean(selected)}
        title="Delete coupon?"
        message={
          selected
            ? `Are you sure you want to delete "${selected.couponCode}"? Customers will no longer be able to use it. This cannot be undone.`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deletingId !== null}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (deletingId === null) setSelected(null);
        }}
      />

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

export default Coupons;
