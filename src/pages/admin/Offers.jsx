import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import AdminSidebar from "../../components/AdminSideBar";
import Pagination from "../../components/Pagination";
import Modal from "../../components/Modals";
import OfferFormModal from "../../components/OfferFormModal";
import useDebounce from "../../hooks/useDebounce";
import {
  getOffers,
  toggleOfferStatus,
  deleteOffer,
  getReferralProgram,
  saveReferralProgram,
} from "../../features/admin/offerSlice";

const PAGE_SIZE = 10;

const TABS = [
  { value: "category", label: "Category Offers" },
  { value: "product", label: "Product Offers" },
  { value: "referral", label: "Referral Offers" },
];

const STATUS_FILTERS = [
  { value: "all", label: "All offers" },
  { value: "active", label: "Active" },
  { value: "scheduled", label: "Scheduled" },
  { value: "inactive", label: "Switched off" },
  { value: "expired", label: "Expired" },
];

const STATUS_TEXT = {
  active: "text-green-600",
  scheduled: "text-blue-500",
  inactive: "text-gray-400",
  expired: "text-red-500",
};
const STATUS_LABEL = { active: "Active", scheduled: "Scheduled", inactive: "Off", expired: "Expired" };

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const errorText = (err) => (typeof err === "string" ? err : err?.message || "Something went wrong.");

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
        checked ? "bg-green-500" : "bg-gray-300"
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

/* ---------------------------------------------------------------
   Referral tab: programme rules + numbers
--------------------------------------------------------------- */
function ReferralTab({ setToast }) {
  const dispatch = useDispatch();
  const { referral, referralStatus, referralError } = useSelector((s) => s.adminOffers);
  const [form, setForm] = useState({ isActive: true, referredDiscount: "", minOrderAmount: "", referrerReward: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    dispatch(getReferralProgram());
  }, [dispatch]);

  useEffect(() => {
    if (referral) setForm({ ...referral.program });
  }, [referral]);

  const set = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");
    const numbers = ["referredDiscount", "minOrderAmount", "referrerReward"].map((k) => Number(form[k]));
    if (numbers.some((n) => !Number.isFinite(n) || n < 0)) return setFormError("Enter valid amounts (0 or more).");
    if (numbers[0] > numbers[1]) return setFormError("The friend discount cannot be more than the minimum order amount.");

    try {
      setSaving(true);
      await dispatch(
        saveReferralProgram({
          isActive: Boolean(form.isActive),
          referredDiscount: numbers[0],
          minOrderAmount: numbers[1],
          referrerReward: numbers[2],
        })
      ).unwrap();
      setToast({ type: "success", text: "Referral programme saved." });
    } catch (err) {
      setFormError(errorText(err));
    } finally {
      setSaving(false);
    }
  };

  if (referralStatus === "failed" && !referral) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">{referralError}</div>;
  }
  if (!referral) return <div className="h-64 animate-pulse rounded-xl border border-gray-200 bg-white" />;

  const { stats } = referral;
  const inputClass =
    "h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <form onSubmit={handleSave} className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#071a33]">Referral programme</h2>
            <p className="mt-1 text-xs text-gray-500">
              Customers share a referral code or an invite link. Both ways link the new customer to the referrer.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${form.isActive ? "text-green-600" : "text-gray-400"}`}>
              {form.isActive ? "On" : "Off"}
            </span>
            <Switch checked={Boolean(form.isActive)} onChange={() => set("isActive", !form.isActive)} label="Referral programme on or off" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-gray-600">Friend gets (₹ off)</span>
            <input type="number" min="0" className={inputClass} value={form.referredDiscount} onChange={(e) => set("referredDiscount", e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-gray-600">On first order of (₹ min)</span>
            <input type="number" min="0" className={inputClass} value={form.minOrderAmount} onChange={(e) => set("minOrderAmount", e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-gray-600">Referrer earns (₹ wallet)</span>
            <input type="number" min="0" className={inputClass} value={form.referrerReward} onChange={(e) => set("referrerReward", e.target.value)} />
          </label>
        </div>

        <ul className="mt-5 space-y-1.5 rounded-lg bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-500">
          <li>The friend's discount is applied automatically on their first order, after product and category offers.</li>
          <li>The referrer is paid in their wallet when that order is marked delivered, once per friend.</li>
          <li>Changes affect new orders only. Orders already placed keep the amounts they were placed with.</li>
        </ul>

        {formError && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>}

        <div className="mt-5 flex justify-end">
          <button type="submit" disabled={saving} className="rounded-lg bg-[#ff5722] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#f4511e] disabled:opacity-60">
            {saving ? "Saving..." : "Save programme"}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {[
          { label: "Customers referred", value: stats.totalReferred },
          { label: "Rewards paid", value: stats.rewardsPaidCount },
          { label: "Wallet credit given", value: money(stats.rewardsPaidAmount) },
        ].map((tile) => (
          <div key={tile.label} className="rounded-xl border border-gray-200 bg-white px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">{tile.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-[#071a33]">{tile.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   Page
--------------------------------------------------------------- */
function Offers() {
  const dispatch = useDispatch();
  const { offers, totalResults, totalPages, currentPage, limit, status, error } = useSelector((s) => s.adminOffers);

  const [tab, setTab] = useState("category");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 400);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null); // offer pending delete
  const [togglingId, setTogglingId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const isOfferTab = tab !== "referral";

  const fetchOffers = () =>
    dispatch(getOffers({ type: tab, search: debouncedSearch, status: statusFilter, page, limit: PAGE_SIZE }));

  useEffect(() => {
    if (isOfferTab) fetchOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, tab, debouncedSearch, statusFilter, page]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const changeTab = (value) => {
    setTab(value);
    setPage(1);
    setSearch("");
    setStatusFilter("all");
  };

  const handleToggle = async (offer) => {
    try {
      setTogglingId(offer.id);
      const result = await dispatch(toggleOfferStatus(offer.id)).unwrap();
      setToast({ type: "success", text: `${result.offerName} ${result.isActive ? "switched on" : "switched off"}.` });
    } catch (err) {
      setToast({ type: "error", text: errorText(err) });
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;
    try {
      setDeleting(true);
      await dispatch(deleteOffer(selected.id)).unwrap();
      setToast({ type: "success", text: `${selected.offerName} deleted.` });
      setSelected(null);
      if (offers.length === 1 && page > 1) setPage((p) => p - 1);
      else fetchOffers();
    } catch (err) {
      setToast({ type: "error", text: errorText(err) });
      setSelected(null);
    } finally {
      setDeleting(false);
    }
  };

  const isLoading = status === "loading";
  const hasFilters = Boolean(debouncedSearch) || statusFilter !== "all";
  const targetHeading = tab === "category" ? "Category" : "Product";

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <AdminSidebar />

      <main className="ml-[214px] min-h-screen">
        {/* HEADER */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-12 py-7">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Incentives</p>
            <h1 className="mt-1 text-3xl font-extrabold leading-tight tracking-tight text-[#071a33]">
              Offers <span className="text-[#ff5722]">Management</span>
            </h1>
          </div>

          {isOfferTab && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-md bg-[#ff5722] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#f4511e] hover:shadow-md"
            >
              <span className="text-base leading-none">+</span>
              Create new offer
            </button>
          )}
        </header>

        <section className="px-12 py-8">
          {/* TABS */}
          <div className="mb-6 inline-flex rounded-lg border border-gray-200 bg-white p-1">
            {TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => changeTab(t.value)}
                className={`rounded-md px-6 py-2.5 text-xs font-bold uppercase tracking-wide transition ${
                  tab === t.value ? "bg-[#ff5722] text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {!isOfferTab ? (
            <ReferralTab setToast={setToast} />
          ) : (
            <>
              {/* SEARCH + FILTER */}
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
                    placeholder={`Search by offer or ${targetHeading.toLowerCase()} name`}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10"
                  />
                </div>

                <div className="relative" ref={filterRef}>
                  <button
                    type="button"
                    onClick={() => setFilterOpen((o) => !o)}
                    aria-haspopup="menu"
                    aria-expanded={filterOpen}
                    className="inline-flex h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    <i className="fa-solid fa-filter text-xs" />
                    Filter
                    {statusFilter !== "all" && <span className="h-2 w-2 rounded-full bg-[#ff5722]" />}
                  </button>

                  {filterOpen && (
                    <div role="menu" className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                      {STATUS_FILTERS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          role="menuitemradio"
                          aria-checked={statusFilter === opt.value}
                          onClick={() => {
                            setStatusFilter(opt.value);
                            setPage(1);
                            setFilterOpen(false);
                          }}
                          className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition hover:bg-gray-50 ${
                            statusFilter === opt.value ? "font-semibold text-[#ff5722]" : "text-gray-700"
                          }`}
                        >
                          {opt.label}
                          {statusFilter === opt.value && <i className="fa-solid fa-check text-xs" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  <span>{error}</span>
                  <button type="button" onClick={fetchOffers} className="font-semibold underline">Retry</button>
                </div>
              )}

              {/* TABLE */}
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <table className="w-full text-left">
                  <thead className="border-b border-gray-200 bg-[#fafbfd]">
                    <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">
                      <th className="px-6 py-4">Offer name</th>
                      <th className="px-4 py-4">{targetHeading}</th>
                      <th className="px-4 py-4">Discount</th>
                      <th className="px-4 py-4">Expiry date</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody className={`transition-opacity ${isLoading ? "opacity-60" : ""}`}>
                    {isLoading && offers.length === 0 &&
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-gray-100">
                          <td colSpan={6} className="px-6 py-5"><div className="h-5 animate-pulse rounded bg-gray-100" /></td>
                        </tr>
                      ))}

                    {offers.map((offer) => {
                      const dimmed = offer.status === "expired" || offer.status === "inactive";
                      return (
                        <tr key={offer.id} className={`border-b border-gray-100 last:border-0 ${dimmed ? "text-gray-500" : ""}`}>
                          <td className="px-6 py-5 text-sm font-bold text-[#071a33]">{offer.offerName}</td>
                          <td className="px-4 py-5 text-sm text-gray-600">{offer.targetName}</td>
                          <td className="px-4 py-5">
                            <span className="inline-block rounded-full border border-green-600 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
                              {offer.discountPercent}% OFF
                            </span>
                          </td>
                          <td className="px-4 py-5 text-sm text-gray-700">
                            <i className="fa-regular fa-calendar mr-2 text-xs text-gray-400" />
                            {formatDate(offer.expiryDate)}
                          </td>
                          <td className="px-4 py-5">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={offer.isActive && offer.status !== "expired"}
                                disabled={togglingId === offer.id || offer.status === "expired"}
                                onChange={() => handleToggle(offer)}
                                label={`${offer.isActive ? "Switch off" : "Switch on"} ${offer.offerName}`}
                              />
                              <span className={`text-xs font-semibold ${STATUS_TEXT[offer.status]}`}>{STATUS_LABEL[offer.status]}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                aria-label={`Edit ${offer.offerName}`}
                                onClick={() => {
                                  setEditing(offer);
                                  setFormOpen(true);
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:bg-gray-50"
                              >
                                <i className="fa-solid fa-pen text-[11px]" />
                              </button>
                              <button
                                type="button"
                                aria-label={`Delete ${offer.offerName}`}
                                onClick={() => setSelected(offer)}
                                className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                              >
                                <i className="fa-solid fa-trash text-[11px]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {!isLoading && offers.length === 0 && !error && (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <p className="text-base font-semibold text-gray-900">No {tab} offers found</p>
                          <p className="mt-1 text-sm text-gray-500">
                            {hasFilters ? "Try a different search or filter." : "Create your first offer to get started."}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination currentPage={currentPage} totalPages={totalPages} totalResults={totalResults} limit={limit} onPageChange={setPage} />
            </>
          )}
        </section>
      </main>

      <OfferFormModal
        open={formOpen}
        type={tab === "product" ? "product" : "category"}
        offer={editing}
        onClose={() => setFormOpen(false)}
        onSaved={(text) => {
          setFormOpen(false);
          setToast({ type: "success", text });
          fetchOffers();
        }}
      />

      <Modal
        open={Boolean(selected)}
        title="Delete offer?"
        message={selected ? `Delete "${selected.offerName}"? Prices go back to normal straight away. This cannot be undone.` : ""}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (!deleting) setSelected(null);
        }}
      />

      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-[110] max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg ${
            toast.type === "error" ? "border-red-200 bg-red-50 text-red-600" : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}

export default Offers;
