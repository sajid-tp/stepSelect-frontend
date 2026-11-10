import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import AdminSidebar from "../../components/AdminSideBar";
import AdminOrderStatusBadge from "../../components/AdminOrderStatusBadge";
import Pagination from "../../components/Pagination";
import { formatMoney } from "../../components/CartItem";
import useDebounce from "../../hooks/useDebounce";
import { formatDate } from "../../utils/orderFormat";
import TrendChart, { compact } from "../../components/AdminTrendChart";

import {
  getSalesReport,
  downloadSalesReport,
  clearSalesExportError,
} from "../../features/admin/salesReportSlice";

const PAGE_SIZE = 10;

const PERIODS = [
  { value: "daily", label: "Today" },
  { value: "weekly", label: "Last 7 days" },
  { value: "monthly", label: "Last 30 days" },
  { value: "yearly", label: "This year" },
];

const CATEGORY_COLORS = ["#ff5722", "#3b82f6", "#a855f7", "#10b981", "#9ca3af"];

const inputClass =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10";

const rupees = (value) =>
  `₹${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;

const todayText = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const dayText = (ymd) => formatDate(`${ymd}T00:00:00`);

function ChangeBadge({ value, neutral = false }) {
  if (value === null || value === undefined) {
    return (
      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
        New
      </span>
    );
  }
  const up = value >= 0;
  const tone = neutral
    ? "bg-amber-50 text-amber-700"
    : up
      ? "bg-green-50 text-green-600"
      : "bg-red-50 text-red-500";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${tone}`}
    >
      <i className={`fa-solid ${up ? "fa-arrow-trend-up" : "fa-arrow-trend-down"} text-[9px]`} />
      {up ? "+" : ""}
      {value}%
    </span>
  );
}

function StatCard({ label, value, change, neutral, barColor, barPercent, caption, loading }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-500">
          {label}
        </p>
        {!loading && <ChangeBadge value={change} neutral={neutral} />}
      </div>

      {loading ? (
        <div className="mt-3 h-7 w-28 animate-pulse rounded bg-gray-100" />
      ) : (
        <p className="mt-2 text-[22px] font-extrabold tracking-tight text-[#111]">
          {value}
        </p>
      )}

      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(Math.max(barPercent || 0, 0), 100)}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
      <p className="mt-2 truncate text-[11px] text-gray-400">{caption || "\u00a0"}</p>
    </div>
  );
}

function CardShell({ title, children, className = "" }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
      <h3 className="mb-4 text-sm font-bold text-[#111]">{title}</h3>
      {children}
    </div>
  );
}

function CategoryDonut({ categories }) {
  const R = 58;
  const C = 2 * Math.PI * R;

  if (!categories || categories.length === 0) {
    return (
      <div className="flex min-h-[220px] items-center justify-center text-sm text-gray-400">
        No category sales yet.
      </div>
    );
  }

  let offset = 0;
  const top = categories[0];

  return (
    <div>
      <div className="relative mx-auto h-[150px] w-[150px]">
        <svg viewBox="0 0 150 150" className="h-full w-full -rotate-90">
          <circle cx="75" cy="75" r={R} fill="none" stroke="#f3f4f6" strokeWidth="18" />
          {categories.map((c, i) => {
            const length = (c.percent / 100) * C;
            const segment = (
              <circle
                key={c.name}
                cx="75"
                cy="75"
                r={R}
                fill="none"
                stroke={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                strokeWidth="18"
                strokeDasharray={`${Math.max(length - 1.5, 0)} ${C}`}
                strokeDashoffset={-offset}
              />
            );
            offset += length;
            return segment;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold text-[#111]">{Math.round(top.percent)}%</span>
          <span className="max-w-[80px] truncate text-[9px] font-semibold uppercase tracking-wide text-gray-400">
            {top.name}
          </span>
        </div>
      </div>

      <ul className="mt-5 space-y-2.5">
        {categories.map((c, i) => (
          <li key={c.name} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex min-w-0 items-center gap-2 text-gray-700">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
              />
              <span className="truncate">{c.name}</span>
            </span>
            <span className="shrink-0 font-semibold text-gray-600">₹{compact(c.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DiscountBreakdown({ discounts }) {
  const rows = [
    { label: "Offer discounts", value: discounts.offer, color: "#ff5722" },
    { label: "Coupon deductions", value: discounts.coupon, color: "#a855f7" },
    { label: "Referral offers", value: discounts.referral, color: "#3b82f6" },
  ];

  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Total discount given
          </p>
          <p className="mt-1 text-2xl font-extrabold text-[#111]">{rupees(discounts.total)}</p>
        </div>
        <p className="text-xs text-gray-400">
          {discounts.couponOrders} order{discounts.couponOrders === 1 ? "" : "s"} used a coupon
        </p>
      </div>

      <div className="space-y-3">
        {rows.map((r) => {
          const pct = discounts.total > 0 ? (r.value / discounts.total) * 100 : 0;
          return (
            <div key={r.label}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-gray-600">{r.label}</span>
                <span className="font-semibold text-gray-800">{formatMoney(r.value)}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: r.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CouponUsage({ coupons }) {
  if (!coupons || coupons.length === 0) {
    return (
      <div className="flex min-h-[140px] items-center justify-center text-sm text-gray-400">
        No coupons were used in this period.
      </div>
    );
  }
  return (
    <table className="w-full text-left text-xs">
      <thead>
        <tr className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
          <th className="pb-2">Coupon</th>
          <th className="pb-2 text-right">Orders</th>
          <th className="pb-2 text-right">Deducted</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {coupons.map((c) => (
          <tr key={c.code}>
            <td className="py-2.5 font-semibold text-[#111]">{c.code}</td>
            <td className="py-2.5 text-right text-gray-600">{c.orders}</td>
            <td className="py-2.5 text-right font-semibold text-gray-800">{formatMoney(c.amount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SalesReport() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { report, status, error, exporting, exportError } = useSelector(
    (state) => state.adminSalesReport
  );

  const [period, setPeriod] = useState("daily");
  const [range, setRange] = useState({ from: "", to: "" });
  const [draft, setDraft] = useState({ from: "", to: "" });
  const [rangeOpen, setRangeOpen] = useState(false);
  const [rangeError, setRangeError] = useState("");
  const rangeRef = useRef(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 400);
  const [page, setPage] = useState(1);

  const customReady = period !== "custom" || (range.from && range.to);

  useEffect(() => {
    if (!customReady) return undefined;
    const request = dispatch(
      getSalesReport({
        period,
        from: range.from,
        to: range.to,
        search: debouncedSearch,
        page,
        limit: PAGE_SIZE,
      })
    );
    return () => request.abort();
  }, [dispatch, period, range, debouncedSearch, page, customReady]);

  useEffect(() => {
    const handler = (e) => {
      if (rangeRef.current && !rangeRef.current.contains(e.target)) setRangeOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const choosePeriod = (value) => {
    setPeriod(value);
    setPage(1);
    setRangeOpen(false);
  };

  const applyRange = () => {
    if (!draft.from || !draft.to) {
      setRangeError("Please choose both dates.");
      return;
    }
    if (draft.to < draft.from) {
      setRangeError("The end date cannot be before the start date.");
      return;
    }
    setRangeError("");
    setRange(draft);
    setPeriod("custom");
    setPage(1);
    setRangeOpen(false);
  };

  const handleExport = (format) =>
    dispatch(
      downloadSalesReport({
        format,
        period,
        from: range.from,
        to: range.to,
        search: debouncedSearch,
      })
    );

  const retry = () =>
    dispatch(
      getSalesReport({ period, from: range.from, to: range.to, search: debouncedSearch, page, limit: PAGE_SIZE })
    );

  const loading = status === "loading";
  const firstLoad = loading && !report;
  const summary = report?.summary;
  const orders = report?.orders || [];
  const pagination = report?.pagination || { page: 1, limit: PAGE_SIZE, totalItems: 0, totalPages: 1 };

  const netShare = summary && summary.gross > 0 ? (summary.revenue / summary.gross) * 100 : 0;
  const couponShare = summary && summary.orders > 0 ? (summary.couponOrders / summary.orders) * 100 : 0;
  const couponOfDiscount =
    summary && summary.totalDiscount > 0 ? (summary.couponDiscount / summary.totalDiscount) * 100 : 0;

  const rangeText = report
    ? report.range.from === report.range.to
      ? dayText(report.range.from)
      : `${dayText(report.range.from)} – ${dayText(report.range.to)}`
    : "";

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <AdminSidebar />

      <main className="ml-[214px] min-h-screen">
        <section className="mx-auto max-w-[1180px] px-10 py-9">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                Analytics
              </p>
              <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-[#111]">
                Sales <span className="text-[#ff5722]">Overview</span>
              </h1>
              {rangeText && (
                <p className="mt-1 text-xs text-gray-500">
                  {report.range.label} · {rangeText}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {[
                { format: "pdf", label: "Export PDF", icon: "fa-file-pdf" },
                { format: "excel", label: "Export Excel", icon: "fa-file-excel" },
              ].map((b) => (
                <button
                  key={b.format}
                  type="button"
                  onClick={() => handleExport(b.format)}
                  disabled={Boolean(exporting) || !customReady}
                  className="inline-flex h-9 items-center gap-2 rounded border-2 border-[#222] bg-white px-4 text-[11px] font-bold uppercase tracking-wide text-[#222] transition hover:bg-[#222] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <i
                    className={`fa-solid ${exporting === b.format ? "fa-spinner fa-spin" : b.icon} text-xs`}
                  />
                  {exporting === b.format ? "Preparing..." : b.label}
                </button>
              ))}
            </div>
          </div>

          {exportError && (
            <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <span>{exportError}</span>
              <button type="button" onClick={() => dispatch(clearSalesExportError())} className="font-semibold underline">
                Dismiss
              </button>
            </div>
          )}

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-1.5">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => choosePeriod(p.value)}
                  className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-wide transition ${
                    period === p.value
                      ? "bg-[#ff5722] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p.label}
                </button>
              ))}

              <div className="relative" ref={rangeRef}>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(range.from ? range : { from: todayText(), to: todayText() });
                    setRangeError("");
                    setRangeOpen((o) => !o);
                  }}
                  aria-haspopup="dialog"
                  aria-expanded={rangeOpen}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-wide transition ${
                    period === "custom"
                      ? "border-[#ff5722] bg-[#ff5722] text-white"
                      : "border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <i className="fa-regular fa-calendar text-xs" />
                  Custom range
                </button>

                {rangeOpen && (
                  <div
                    role="dialog"
                    aria-label="Choose a custom date range"
                    className="absolute left-0 z-20 mt-2 w-72 space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="sr-from" className="mb-1 block text-xs font-semibold text-gray-600">
                          From
                        </label>
                        <input
                          id="sr-from"
                          type="date"
                          value={draft.from}
                          max={draft.to || todayText()}
                          onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="sr-to" className="mb-1 block text-xs font-semibold text-gray-600">
                          To
                        </label>
                        <input
                          id="sr-to"
                          type="date"
                          value={draft.to}
                          min={draft.from || undefined}
                          max={todayText()}
                          onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {rangeError && <p className="text-xs font-medium text-red-500">{rangeError}</p>}

                    <button
                      type="button"
                      onClick={applyRange}
                      className="w-full rounded-lg bg-[#ff5722] py-2 text-sm font-semibold text-white transition hover:bg-[#f4511e]"
                    >
                      Apply range
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="relative w-full max-w-[260px]">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search order or customer..."
                className="h-9 w-full rounded-md border border-gray-200 bg-[#f6f6f6] pl-3 pr-9 text-xs text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#ff5722] focus:bg-white"
              />
              <i className="fa-solid fa-magnifying-glass pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <span>{error}</span>
              <button type="button" onClick={retry} className="font-semibold underline">
                Retry
              </button>
            </div>
          )}

          {period === "custom" && !customReady && (
            <div className="mb-6 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-500">
              Choose a start and end date to see the report.
            </div>
          )}

          <div className={`transition-opacity ${loading && report ? "opacity-60" : ""}`}>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total revenue"
                loading={firstLoad}
                value={rupees(summary?.revenue)}
                change={summary?.changes.revenue}
                barColor="#ff5722"
                barPercent={netShare}
                caption={summary ? `${Math.round(netShare)}% of ${rupees(summary.gross)} gross sales` : ""}
              />
              <StatCard
                label="Total orders"
                loading={firstLoad}
                value={(summary?.orders ?? 0).toLocaleString("en-IN")}
                change={summary?.changes.orders}
                barColor="#3b82f6"
                barPercent={couponShare}
                caption={summary ? `${summary.couponOrders} used a coupon` : ""}
              />
              <StatCard
                label="Avg. order value"
                loading={firstLoad}
                value={rupees(summary?.averageOrderValue)}
                change={summary?.changes.averageOrderValue}
                barColor="#22c55e"
                barPercent={netShare}
                caption="Per order, after discounts"
              />
              <StatCard
                label="Total discount"
                loading={firstLoad}
                value={rupees(summary?.totalDiscount)}
                change={summary?.changes.totalDiscount}
                neutral
                barColor="#a855f7"
                barPercent={couponOfDiscount}
                caption={summary ? `${rupees(summary.couponDiscount)} from coupons` : ""}
              />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
              <CardShell title="Sales over Time">
                {report ? (
                  <TrendChart trend={report.trend} unit={report.range.unit} />
                ) : (
                  <div className="h-[270px] animate-pulse rounded bg-gray-50" />
                )}
              </CardShell>

              <CardShell title="Sales by Category">
                {report ? (
                  <CategoryDonut categories={report.categories} />
                ) : (
                  <div className="h-[220px] animate-pulse rounded bg-gray-50" />
                )}
              </CardShell>
            </div>

            {report && (
              <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
                <CardShell title="Discount Breakdown">
                  <DiscountBreakdown discounts={report.discounts} />
                </CardShell>
                <CardShell title="Coupon Deductions">
                  <CouponUsage coupons={report.discounts.coupons} />
                </CardShell>
              </div>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h3 className="text-sm font-bold text-[#111]">Sales Orders</h3>
                <p className="text-[11px] text-gray-400">Cancelled and unpaid orders are not counted</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-left">
                  <thead className="border-b border-gray-200 bg-[#fafafa]">
                    <tr className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
                      <th className="px-6 py-3.5">Order</th>
                      <th className="px-3 py-3.5">Customer</th>
                      <th className="px-3 py-3.5">Date</th>
                      <th className="px-3 py-3.5 text-right">Items</th>
                      <th className="px-3 py-3.5 text-right">Gross</th>
                      <th className="px-3 py-3.5 text-right">Discount</th>
                      <th className="px-3 py-3.5 text-right">Coupon</th>
                      <th className="px-3 py-3.5 text-right">Order amount</th>
                      <th className="px-6 py-3.5">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {firstLoad &&
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          {Array.from({ length: 9 }).map((__, j) => (
                            <td key={j} className="px-3 py-5 first:px-6 last:px-6">
                              <div className="h-4 w-3/4 rounded bg-gray-100" />
                            </td>
                          ))}
                        </tr>
                      ))}

                    {orders.map((o) => (
                      <tr key={o.id} className="transition hover:bg-gray-50/60">
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/orders/${o.id}`)}
                            className="text-sm font-bold text-[#071a33] transition hover:text-[#ff5722] hover:underline"
                          >
                            #{o.orderNumber}
                          </button>
                        </td>
                        <td className="px-3 py-4">
                          <p className="text-sm font-semibold text-[#071a33]">{o.customer}</p>
                          {o.email && <p className="text-xs text-gray-500">{o.email}</p>}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-600">{formatDate(o.createdAt)}</td>
                        <td className="px-3 py-4 text-right text-sm text-gray-600">{o.itemCount}</td>
                        <td className="px-3 py-4 text-right text-sm text-gray-600">{formatMoney(o.gross)}</td>
                        <td className="px-3 py-4 text-right text-sm text-gray-600">
                          {o.offerDiscount + o.referralDiscount > 0
                            ? `-${formatMoney(o.offerDiscount + o.referralDiscount)}`
                            : "—"}
                        </td>
                        <td className="px-3 py-4 text-right text-sm">
                          {o.couponDiscount > 0 ? (
                            <>
                              <span className="text-gray-700">-{formatMoney(o.couponDiscount)}</span>
                              {o.couponCode && (
                                <span className="block text-[10px] font-semibold uppercase text-[#ff5722]">
                                  {o.couponCode}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-4 text-right text-sm font-bold text-[#071a33]">
                          {formatMoney(o.totalAmount)}
                        </td>
                        <td className="px-6 py-4">
                          <AdminOrderStatusBadge status={o.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!loading && !error && report && orders.length === 0 && (
                <div className="flex min-h-[200px] flex-col items-center justify-center px-6 text-center">
                  <i className="fa-solid fa-chart-line text-4xl text-gray-300" />
                  <h2 className="mt-4 text-lg font-semibold text-gray-900">No sales found</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {debouncedSearch
                      ? "Try a different search."
                      : "There are no sales in this period. Try a wider date range."}
                  </p>
                </div>
              )}

              {orders.length > 0 && (
                <div className="px-6 pb-6 [&>div]:mt-0">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    totalResults={pagination.totalItems}
                    limit={pagination.limit}
                    onPageChange={(next) => setPage(next)}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SalesReport;
