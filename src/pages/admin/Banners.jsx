import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import AdminSidebar from "../../components/AdminSideBar";
import AdminPageHeader from "../../components/AdminPageHeader";
import Modal from "../../components/Modals";
import Pagination from "../../components/Pagination";
import useDebounce from "../../hooks/useDebounce";

import {
  getAdminBanners,
  createAdminBanner,
  updateAdminBanner,
  toggleAdminBannerStatus,
  deleteAdminBanner,
} from "../../features/admin/bannerSlice";

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/
const PAGE_SIZE = 10;
const IMAGE_MAX_MB = 5;
const TITLE_MIN = 2;
const TITLE_MAX = 80;

// value = what the server filters on
const TABS = [
  { value: "all", label: "All Banners" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const EMPTY_FORM = { title: "", link: "", displayOrder: "", isActive: true };

const inputClass =
  "h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10";

/*
|--------------------------------------------------------------------------
| SMALL COMPONENTS
|--------------------------------------------------------------------------
*/
function Switch({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition disabled:cursor-wait disabled:opacity-60 ${
        checked ? "bg-[#ff5722]" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/* ---------------- Upload / edit window ---------------- */
function BannerFormModal({ banner, saving, serverError, onSubmit, onClose }) {
  const isEdit = Boolean(banner);

  const [values, setValues] = useState(
    banner
      ? {
          title: banner.title,
          link: banner.link || "",
          displayOrder: String(banner.displayOrder),
          isActive: banner.isActive,
        }
      : EMPTY_FORM
  );
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(banner ? banner.image : "");
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  // free the temporary picture address when it is replaced / the window closes
  useEffect(
    () => () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    },
    [preview]
  );

  const setField = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  };

  const handleFile = (e) => {
    const chosen = e.target.files?.[0];
    if (!chosen) return;

    if (!chosen.type.startsWith("image/")) {
      setErrors((er) => ({ ...er, image: "Please choose an image file." }));
      return;
    }
    if (chosen.size > IMAGE_MAX_MB * 1024 * 1024) {
      setErrors((er) => ({ ...er, image: `The image must be under ${IMAGE_MAX_MB} MB.` }));
      return;
    }

    setFile(chosen);
    setPreview(URL.createObjectURL(chosen));
    setErrors((er) => ({ ...er, image: "" }));
  };

  const validate = () => {
    const next = {};
    const title = values.title.trim().replace(/\s+/g, " ");

    if (!title) next.title = "Banner title is required.";
    else if (title.length < TITLE_MIN) next.title = `Title must be at least ${TITLE_MIN} characters.`;
    else if (title.length > TITLE_MAX) next.title = `Title cannot exceed ${TITLE_MAX} characters.`;

    const link = values.link.trim();
    if (link) {
      const shopPath = link.startsWith("/") && !link.startsWith("//");
      let webLink = false;
      try {
        webLink = ["http:", "https:"].includes(new URL(link).protocol);
      } catch {
        webLink = false;
      }
      if (!shopPath && !webLink) next.link = "Enter a link like /shop or https://example.com.";
    }

    if (values.displayOrder !== "") {
      const n = Number(values.displayOrder);
      if (!Number.isInteger(n) || n < 1 || n > 99) next.displayOrder = "Use a whole number from 1 to 99.";
    }

    if (!isEdit && !file) next.image = "Please choose a banner image.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (saving || !validate()) return;
    onSubmit({
      ...values,
      title: values.title.trim().replace(/\s+/g, " "),
      link: values.link.trim(),
      displayOrder: values.displayOrder === "" ? "" : Number(values.displayOrder),
      image: file,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <form
        onSubmit={submit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="banner-form-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id="banner-form-title" className="text-lg font-bold text-gray-900">
            {isEdit ? "Edit Banner" : "Upload New Banner"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Picture */}
        <div className="mb-4">
          <label className="mb-1 block text-xs font-semibold text-gray-600">Banner image</label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={`flex aspect-[7/5] w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-gray-50 transition hover:border-[#ff5722] ${
              errors.image ? "border-red-300" : "border-gray-300"
            }`}
          >
            {preview ? (
              <img src={preview} alt="Banner preview" className="h-full w-full object-cover" />
            ) : (
              <span className="text-center text-sm text-gray-500">
                <i className="fa-solid fa-cloud-arrow-up mb-2 block text-2xl text-gray-400" />
                Click to choose an image
                <span className="mt-1 block text-xs text-gray-400">
                  Use a 7:5 picture (for example 1400 × 1000), up to {IMAGE_MAX_MB} MB
                </span>
              </span>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          {preview && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-2 text-xs font-semibold text-[#ff5722] hover:underline"
            >
              Change image
            </button>
          )}
          {errors.image && <p className="mt-1 text-xs font-medium text-red-500">{errors.image}</p>}
        </div>

        {/* Title */}
        <div className="mb-4">
          <label htmlFor="banner-title" className="mb-1 block text-xs font-semibold text-gray-600">
            Title
          </label>
          <input
            id="banner-title"
            type="text"
            value={values.title}
            onChange={(e) => setField("title", e.target.value)}
            maxLength={TITLE_MAX + 20}
            placeholder="e.g. Pegasus 41 Launch"
            className={inputClass}
          />
          {errors.title && <p className="mt-1 text-xs font-medium text-red-500">{errors.title}</p>}
        </div>

        <div className="mb-4 grid grid-cols-[1fr_130px] gap-3">
          {/* Link */}
          <div>
            <label htmlFor="banner-link" className="mb-1 block text-xs font-semibold text-gray-600">
              Link (optional)
            </label>
            <input
              id="banner-link"
              type="text"
              value={values.link}
              onChange={(e) => setField("link", e.target.value)}
              placeholder="/shop or https://..."
              className={inputClass}
            />
            {errors.link && <p className="mt-1 text-xs font-medium text-red-500">{errors.link}</p>}
          </div>

          {/* Slot */}
          <div>
            <label htmlFor="banner-slot" className="mb-1 block text-xs font-semibold text-gray-600">
              Slot number
            </label>
            <input
              id="banner-slot"
              type="number"
              min="1"
              max="99"
              value={values.displayOrder}
              onChange={(e) => setField("displayOrder", e.target.value)}
              placeholder="Auto"
              className={inputClass}
            />
            {errors.displayOrder && (
              <p className="mt-1 text-xs font-medium text-red-500">{errors.displayOrder}</p>
            )}
          </div>
        </div>

        {/* Visible */}
        <div className="mb-5 flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-800">Visible on landing page</p>
            <p className="text-xs text-gray-500">Switch off to keep the banner saved but hidden.</p>
          </div>
          <Switch
            checked={values.isActive}
            onChange={() => setField("isActive", !values.isActive)}
            label="Visible on landing page"
          />
        </div>

        {serverError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#ff5722] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#f4511e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : isEdit ? "Save changes" : "Upload banner"}
          </button>
        </div>
      </form>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/
function Banners() {
  const dispatch = useDispatch();

  const { banners, pagination, status, error, togglingId } = useSelector(
    (state) => state.adminBanners
  );

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 400);
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // banner being edited, null = new
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleting, setDeleting] = useState(null); // banner waiting for delete confirmation
  const [deleteBusy, setDeleteBusy] = useState(false);

  const [notice, setNotice] = useState(null); // { type: "success" | "error", text }

  /* ---------------- FETCH ---------------- */
  const fetchBanners = (nextPage = page) =>
    dispatch(
      getAdminBanners({
        search: debouncedSearch,
        status: tab,
        page: nextPage,
        limit: PAGE_SIZE,
      })
    );

  useEffect(() => {
    const request = dispatch(
      getAdminBanners({ search: debouncedSearch, status: tab, page, limit: PAGE_SIZE })
    );
    return () => request.abort(); // a newer choice cancels the older request
  }, [dispatch, debouncedSearch, tab, page]);

  // success / error message goes away on its own
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  /* ---------------- HANDLERS ---------------- */
  const openNew = () => {
    setEditing(null);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (banner) => {
    setEditing(banner);
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    setFormError("");

    const action = editing
      ? updateAdminBanner({ bannerId: editing.id, ...values })
      : createAdminBanner(values);

    const result = await dispatch(action);
    setSaving(false);

    if (result.error) {
      setFormError(result.payload || "Something went wrong. Please try again.");
      return;
    }

    setFormOpen(false);
    setEditing(null);
    setNotice({ type: "success", text: result.payload.message });
    // a new banner can land on any page (slots decide the order), so start from the first
    if (!editing) setPage(1);
    fetchBanners(editing ? page : 1);
  };

  const handleToggle = async (banner) => {
    const result = await dispatch(
      toggleAdminBannerStatus({ bannerId: banner.id, isActive: !banner.isActive })
    );
    if (result.error) {
      setNotice({ type: "error", text: result.payload || "Could not change the banner." });
      return;
    }
    setNotice({ type: "success", text: result.payload.message });
    // On the Active / Inactive tabs the row no longer belongs, so reload the list
    if (tab !== "all") fetchBanners();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    const result = await dispatch(deleteAdminBanner(deleting.id));
    setDeleteBusy(false);
    setDeleting(null);

    if (result.error) {
      setNotice({ type: "error", text: result.payload || "Could not delete the banner." });
      return;
    }
    setNotice({ type: "success", text: result.payload.message });

    // deleted the last banner on this page: go back one page
    const nextPage = banners.length === 1 && page > 1 ? page - 1 : page;
    setPage(nextPage);
    fetchBanners(nextPage);
  };

  const isLoading = status === "loading";
  const showSkeleton = isLoading && banners.length === 0;
  const hasFilters = Boolean(debouncedSearch) || tab !== "all";

  /* ---------------- RENDER ---------------- */
  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <AdminSidebar />

      <main className="ml-[214px] min-h-screen">
        {/* HEADER */}
        <AdminPageHeader
          eyebrow="Visuals"
          title="Banner"
          actionLabel="Upload New Banner"
          onAction={openNew}
        />

        <section className="px-12 py-8">
          <h2 className="mb-4 text-lg font-extrabold text-[#111]">Banners</h2>

          {/* SEARCH */}
          <div className="relative mb-5 w-full max-w-[460px]">
            <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search banners"
              className="h-10 w-full rounded-md border border-[#f1d6cc] bg-[#fdf1ec] pl-9 pr-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-500 focus:border-[#ff5722] focus:bg-white"
            />
          </div>

          {/* TABS */}
          <div className="mb-5 flex items-center gap-7 border-b border-gray-200">
            {TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  setTab(t.value);
                  setPage(1);
                }}
                className={`relative pb-3 text-xs font-semibold transition ${
                  tab === t.value ? "text-[#111]" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {t.label}
                {tab === t.value && (
                  <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#ff5722]" />
                )}
              </button>
            ))}
          </div>

          {/* MESSAGE */}
          {notice && (
            <div
              role="status"
              className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
                notice.type === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-600"
              }`}
            >
              {notice.text}
            </div>
          )}

          {/* LIST ERROR */}
          {error && (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <span>{error}</span>
              <button type="button" onClick={() => fetchBanners()} className="font-semibold underline">
                Retry
              </button>
            </div>
          )}

          {/* LIST */}
          <div className={`space-y-3 transition-opacity ${isLoading && !showSkeleton ? "opacity-60" : ""}`}>
            {showSkeleton &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[154px] animate-pulse rounded-lg border border-gray-100 bg-white" />
              ))}

            {!showSkeleton &&
              banners.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <img
                    src={b.image}
                    alt={b.title}
                    className={`h-[120px] w-[168px] shrink-0 rounded-md object-cover ${b.isActive ? "" : "opacity-50 grayscale"}`}
                  />

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-base font-bold ${b.isActive ? "text-[#111]" : "text-gray-500"}`}
                    >
                      {b.title}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-500">
                      <i className="fa-regular fa-eye text-[10px]" />
                      Slot: Hero Slider #{b.displayOrder}
                    </p>
                  </div>

                  <div className="hidden h-9 w-px bg-gray-200 sm:block" />

                  <div className="flex w-[150px] items-center gap-2">
                    <Switch
                      checked={b.isActive}
                      onChange={() => handleToggle(b)}
                      disabled={togglingId === b.id}
                      label={`${b.isActive ? "Hide" : "Show"} ${b.title}`}
                    />
                    <span className="text-[10px] font-medium text-gray-500">
                      {b.isActive ? "Visible on Landing" : "Hidden"}
                    </span>
                  </div>

                  <div className="hidden h-9 w-px bg-gray-200 sm:block" />

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openEdit(b)}
                      className="rounded border border-gray-400 bg-white px-4 py-1.5 text-xs font-semibold text-gray-800 transition hover:bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(b)}
                      aria-label={`Delete ${b.title}`}
                      className="flex h-8 w-8 items-center justify-center rounded text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <i className="fa-regular fa-trash-can text-sm" />
                    </button>
                  </div>
                </div>
              ))}

            {/* EMPTY */}
            {!isLoading && !error && banners.length === 0 && (
              <div className="flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 text-center">
                <i className="fa-regular fa-image text-4xl text-gray-300" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">No banners found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {hasFilters
                    ? "Try a different search or tab."
                    : "Upload your first banner to show it on the landing page."}
                </p>
                {!hasFilters && (
                  <button
                    type="button"
                    onClick={openNew}
                    className="mt-4 rounded-md bg-[#ff5722] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#f4511e]"
                  >
                    Upload new banner
                  </button>
                )}
              </div>
            )}
          </div>

          {/* PAGINATION */}
          {banners.length > 0 && (
            <div className="mt-6 border-t border-[#f1d6cc] pt-4 [&>div]:mt-0">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalResults={pagination.totalItems}
                limit={pagination.limit}
                onPageChange={(next) => setPage(next)}
              />
            </div>
          )}
        </section>
      </main>

      {/* UPLOAD / EDIT WINDOW (opened fresh each time so it starts with the right values) */}
      {formOpen && (
        <BannerFormModal
          key={editing ? editing.id : "new"}
          banner={editing}
          saving={saving}
          serverError={formError}
          onSubmit={handleSubmit}
          onClose={closeForm}
        />
      )}

      {/* DELETE CONFIRMATION */}
      <Modal
        open={Boolean(deleting)}
        title="Delete banner"
        message={`Delete "${deleting?.title || ""}"? It will be removed from the landing page.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onClose={() => !deleteBusy && setDeleting(null)}
        loading={deleteBusy}
        variant="danger"
      />
    </div>
  );
}

export default Banners;
