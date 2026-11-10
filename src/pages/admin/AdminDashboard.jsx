import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import AdminSidebar from "../../components/AdminSideBar";
import TrendChart, { compact } from "../../components/AdminTrendChart";
import { formatMoney } from "../../components/CartItem";
import { formatDate } from "../../utils/orderFormat";

import { getAdminDashboard } from "../../features/admin/dashboardSlice";

const PERIODS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const DONUT_COLORS = [
  "#e63900", "#a32800", "#1f1f1f", "#4b4b4b", "#c9bcbc",
  "#ff7a45", "#7a1f00", "#8c8c8c", "#f4a58a", "#d9d9d9",
];

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

function Change({ value }) {
  if (value === null || value === undefined) return null;
  const up = value >= 0;
  return (
    <span className={`text-[11px] font-bold ${up ? "text-green-600" : "text-red-500"}`}>
      {up ? "▲" : "▼"} {Math.abs(value)}%
    </span>
  );
}

function StatCard({ icon, tone, value, label, change, note, loading }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
          <i className={`fa-solid ${icon} text-sm`} />
        </span>
        {!loading && <Change value={change} />}
      </div>

      {loading ? (
        <div className="mt-4 h-7 w-24 animate-pulse rounded bg-gray-100" />
      ) : (
        <p className="mt-4 text-[22px] font-extrabold tracking-tight text-[#111]">{value}</p>
      )}
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">{label}</p>
      <p className="mt-1 truncate text-[11px] text-gray-400">{note || "\u00a0"}</p>
    </div>
  );
}

function Card({ title, hint, children, className = "" }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#111]">{title}</h3>
        {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="flex min-h-[140px] items-center justify-center text-center text-sm text-gray-400">
      {text}
    </div>
  );
}

function Skeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-9 animate-pulse rounded bg-gray-50" />
      ))}
    </div>
  );
}

function TopProducts({ products }) {
  if (!products.length) return <Empty text="No products sold in this period." />;

  return (
    <ol className="space-y-3">
      {products.map((p, i) => (
        <li key={p.id} className="flex items-center gap-3">
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
              i < 3 ? "bg-[#ff5722] text-white" : "bg-gray-100 text-gray-500"
            }`}
          >
            {i + 1}
          </span>

          {p.image ? (
            <img src={p.image} alt="" className="h-10 w-10 shrink-0 rounded-md border border-gray-100 object-cover" />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-300">
              <i className="fa-solid fa-shoe-prints" />
            </span>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="truncate text-sm font-semibold text-[#111]">{p.name}</p>
              <p className="shrink-0 text-xs font-bold text-[#111]">{p.units} sold</p>
            </div>
            <div className="mt-1.5 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-[#e63900]" style={{ width: `${p.percentOfTop}%` }} />
              </div>
              <p className="w-20 shrink-0 text-right text-[11px] text-gray-500">{rupees(p.revenue)}</p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function TopCategories({ categories }) {
  if (!categories.length) return <Empty text="No category sales in this period." />;

  const R = 52;
  const C = 2 * Math.PI * R;
  const total = categories.reduce((sum, c) => sum + c.units, 0);
  let offset = 0;

  return (
    <div>
      <div className="relative mx-auto h-[140px] w-[140px]">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle cx="70" cy="70" r={R} fill="none" stroke="#f3f4f6" strokeWidth="20" />
          {categories.map((c, i) => {
            const length = (c.units / total) * C;
            const segment = (
              <circle
                key={c.id + c.name}
                cx="70"
                cy="70"
                r={R}
                fill="none"
                stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
                strokeWidth="20"
                strokeDasharray={`${Math.max(length - 1.5, 0)} ${C}`}
                strokeDashoffset={-offset}
              />
            );
            offset += length;
            return segment;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-extrabold text-[#111]">{total}</span>
          <span className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">units sold</span>
        </div>
      </div>

      <ol className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {categories.map((c, i) => (
          <li key={c.id + c.name} className="flex items-center justify-between gap-2 text-xs">
            <span className="flex min-w-0 items-center gap-2 text-gray-700">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
              />
              <span className="shrink-0 text-gray-400">{i + 1}.</span>
              <span className="truncate">{c.name}</span>
            </span>
            <span className="shrink-0 font-semibold text-gray-600">{c.units}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function TopBrands({ brands }) {
  if (!brands.length) return <Empty text="No brand sales in this period." />;

  const total = brands.reduce((sum, b) => sum + b.units, 0);

  return (
    <ol className="space-y-3.5">
      {brands.map((b, i) => (
        <li key={b.id + b.name}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="min-w-0 truncate text-gray-700">
              <span className="mr-2 text-gray-400">{i + 1}.</span>
              {b.name}
            </span>
            <span className="shrink-0 font-semibold text-gray-700">
              {b.units} sold · {Math.round((b.units / total) * 100)}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-[#e63900]" style={{ width: `${b.percentOfTop}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

function AdminDashboard() {
  const dispatch = useDispatch();

  const { data, status, error } = useSelector((state) => state.adminDashboard);

  const [period, setPeriod] = useState("weekly");
  const [range, setRange] = useState({ from: "", to: "" });
  const [draft, setDraft] = useState({ from: "", to: "" });
  const [rangeOpen, setRangeOpen] = useState(false);
  const [rangeError, setRangeError] = useState("");
  const rangeRef = useRef(null);

  const customReady = period !== "custom" || (range.from && range.to);

  useEffect(() => {
    if (!customReady) return undefined;
    const request = dispatch(getAdminDashboard({ period, from: range.from, to: range.to }));
    return () => request.abort();
  }, [dispatch, period, range, customReady]);

  useEffect(() => {
    const handler = (e) => {
      if (rangeRef.current && !rangeRef.current.contains(e.target)) setRangeOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const choosePeriod = (value) => {
    setPeriod(value);
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
    setRangeOpen(false);
  };

  const retry = () =>
    dispatch(getAdminDashboard({ period, from: range.from, to: range.to }));

  const loading = status === "loading";
  const firstLoad = loading && !data;
  const summary = data?.summary;

  const rangeText = data
    ? data.range.from === data.range.to
      ? dayText(data.range.from)
      : `${dayText(data.range.from)} – ${dayText(data.range.to)}`
    : "";

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <AdminSidebar />

      <main className="ml-[214px] min-h-screen">
        <header className="border-b border-gray-200 bg-white px-10 py-5">
          <h1 className="text-xl font-extrabold tracking-tight text-[#111]">Dashboard</h1>
          {rangeText && (
            <p className="mt-0.5 text-xs text-gray-500">
              Showing {data.range.label.toLowerCase()} · {rangeText}
            </p>
          )}
        </header>

        <section className="mx-auto max-w-[1180px] px-10 py-7">
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
              Choose a start and end date to see the dashboard.
            </div>
          )}

          <div className={`transition-opacity ${loading && data ? "opacity-60" : ""}`}>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                loading={firstLoad}
                icon="fa-indian-rupee-sign"
                tone="bg-orange-50 text-[#ff5722]"
                value={rupees(summary?.revenue)}
                label="Total revenue"
                change={summary?.changes.revenue}
                note={summary ? `Avg. order ${rupees(summary.averageOrderValue)}` : ""}
              />
              <StatCard
                loading={firstLoad}
                icon="fa-bag-shopping"
                tone="bg-blue-50 text-blue-600"
                value={(summary?.orders ?? 0).toLocaleString("en-IN")}
                label="Total orders"
                change={summary?.changes.orders}
                note={summary ? `${rupees(summary.totalDiscount)} given in discounts` : ""}
              />
              <StatCard
                loading={firstLoad}
                icon="fa-box"
                tone="bg-green-50 text-green-600"
                value={(summary?.unitsSold ?? 0).toLocaleString("en-IN")}
                label="Items sold"
                note="Cancelled and returned excluded"
              />
              <StatCard
                loading={firstLoad}
                icon="fa-user-group"
                tone="bg-purple-50 text-purple-600"
                value={(summary?.totalUsers ?? 0).toLocaleString("en-IN")}
                label="Registered users"
                note={summary ? `${summary.newUsers} joined in this period` : ""}
              />
            </div>

            <Card
              title="Revenue Trends"
              hint={data ? data.range.label : ""}
              className="mb-6"
            >
              <div className="mb-4 flex flex-wrap items-center gap-1.5">
                {PERIODS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => choosePeriod(p.value)}
                    className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide transition ${
                      period === p.value ? "bg-[#ff5722] text-white" : "text-gray-600 hover:bg-gray-100"
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
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide transition ${
                      period === "custom"
                        ? "border-[#ff5722] bg-[#ff5722] text-white"
                        : "border-gray-300 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <i className="fa-regular fa-calendar text-xs" />
                    Custom
                  </button>

                  {rangeOpen && (
                    <div
                      role="dialog"
                      aria-label="Choose a custom date range"
                      className="absolute left-0 z-20 mt-2 w-72 space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="db-from" className="mb-1 block text-xs font-semibold text-gray-600">
                            From
                          </label>
                          <input
                            id="db-from"
                            type="date"
                            value={draft.from}
                            max={draft.to || todayText()}
                            onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label htmlFor="db-to" className="mb-1 block text-xs font-semibold text-gray-600">
                            To
                          </label>
                          <input
                            id="db-to"
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

              {data ? (
                <TrendChart trend={data.trend} unit={data.range.unit} />
              ) : (
                <div className="h-[270px] animate-pulse rounded bg-gray-50" />
              )}
            </Card>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card title="Best Selling Products" hint="Top 10 · by units sold">
                {data ? <TopProducts products={data.topProducts} /> : <Skeleton rows={6} />}
              </Card>

              <div className="space-y-5">
                <Card title="Best Selling Categories" hint="Top 10 · by units sold">
                  {data ? <TopCategories categories={data.topCategories} /> : <Skeleton rows={4} />}
                </Card>

                <Card title="Best Selling Brands" hint="Top 10 · by units sold">
                  {data ? <TopBrands brands={data.topBrands} /> : <Skeleton rows={4} />}
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
