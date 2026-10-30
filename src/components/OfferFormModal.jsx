import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOffer, getOfferOptions, updateOffer } from "../features/admin/offerSlice";
import useDebounce from "../hooks/useDebounce";

const toDateInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const inputClass =
  "h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10";

/*
| Create / edit one offer.  type = "category" | "product"  (decided by the tab the admin is on)
| offer = the row being edited (null when creating)
*/
function OfferFormModal({ open, type, offer, onClose, onSaved }) {
  const dispatch = useDispatch();
  const options = useSelector((state) => state.adminOffers.options);
  const isEdit = Boolean(offer);
  const isCategory = type === "category";

  const [form, setForm] = useState({
    offerName: "",
    targetId: "",
    discountPercent: "",
    startDate: "",
    expiryDate: "",
    isActive: true,
  });
  const [productSearch, setProductSearch] = useState("");
  const debouncedSearch = useDebounce(productSearch.trim(), 300);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // reset the form each time the modal opens
  useEffect(() => {
    if (!open) return;
    setError("");
    setProductSearch("");
    setForm({
      offerName: offer?.offerName || "",
      targetId: offer ? (isCategory ? offer.categoryId : offer.productId) || "" : "",
      discountPercent: offer?.discountPercent ?? "",
      startDate: toDateInput(offer?.startDate) || toDateInput(new Date()),
      expiryDate: toDateInput(offer?.expiryDate),
      isActive: offer ? offer.isActive : true,
    });
  }, [open, offer, isCategory]);

  // category list once; product list follows the search box
  useEffect(() => {
    if (open) dispatch(getOfferOptions({ search: isCategory ? "" : debouncedSearch }));
  }, [dispatch, open, isCategory, debouncedSearch]);

  if (!open) return null;

  const set = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  // When editing, the chosen product may not be in the current search results: keep showing it
  const productChoices = options.products.some((p) => p.id === form.targetId) || !offer?.productId
    ? options.products
    : [{ id: offer.productId, name: offer.targetName, categoryName: "" }, ...options.products];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.offerName.trim()) return setError("Enter an offer name.");
    if (!form.targetId) return setError(isCategory ? "Choose a category." : "Choose a product.");
    const percent = Number(form.discountPercent);
    if (!Number.isInteger(percent) || percent < 1 || percent > 90) {
      return setError("Discount must be a whole number from 1 to 90.");
    }
    if (!form.expiryDate) return setError("Choose an expiry date.");
    if (form.startDate && form.expiryDate < form.startDate) return setError("Expiry date must be after the start date.");

    const payload = {
      offerName: form.offerName.trim(),
      offerType: type,
      [isCategory ? "categoryId" : "productId"]: form.targetId,
      discountPercent: percent,
      startDate: form.startDate || undefined,
      expiryDate: form.expiryDate,
      isActive: form.isActive,
    };

    try {
      setSaving(true);
      if (isEdit) {
        const { offerType, ...changes } = payload; // the type of an offer cannot change
        await dispatch(updateOffer({ offerId: offer.id, offerData: changes })).unwrap();
      } else {
        await dispatch(createOffer(payload)).unwrap();
      }
      onSaved(isEdit ? "Offer updated." : "Offer created.");
    } catch (err) {
      setError(typeof err === "string" ? err : err?.message || "Could not save the offer.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        role="dialog"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
              {isCategory ? "Category offer" : "Product offer"}
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-[#071a33]">{isEdit ? "Edit offer" : "Create new offer"}</h2>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close" className="text-gray-400 hover:text-gray-700">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-gray-600">Offer name</span>
            <input
              className={inputClass}
              value={form.offerName}
              maxLength={80}
              onChange={(e) => set("offerName", e.target.value)}
              placeholder={isCategory ? "e.g. Monsoon Running Sale" : "e.g. Air Runner launch deal"}
            />
          </label>

          {isCategory ? (
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-gray-600">Category</span>
              <select className={inputClass} value={form.targetId} onChange={(e) => set("targetId", e.target.value)}>
                <option value="">Select a category</option>
                {options.categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <span className="mt-1 block text-[11px] text-gray-400">Applies to every shoe in this category.</span>
            </label>
          ) : (
            <div>
              <span className="mb-1 block text-xs font-semibold text-gray-600">Product</span>
              <input
                className={`${inputClass} mb-2`}
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by name"
              />
              <select className={inputClass} value={form.targetId} onChange={(e) => set("targetId", e.target.value)}>
                <option value="">Select a product</option>
                {productChoices.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}{p.categoryName ? ` (${p.categoryName})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-gray-600">Discount (% off, 1 to 90)</span>
            <input
              type="number"
              min="1"
              max="90"
              step="1"
              className={inputClass}
              value={form.discountPercent}
              onChange={(e) => set("discountPercent", e.target.value)}
              placeholder="15"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-gray-600">Starts on</span>
              <input type="date" className={inputClass} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-gray-600">Expires on</span>
              <input type="date" className={inputClass} value={form.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
            Offer is active
          </label>

          <p className="rounded-lg bg-gray-50 px-3 py-2 text-[11px] leading-4 text-gray-500">
            If a shoe has both a product offer and a category offer, the customer gets the larger discount, not both.
          </p>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-lg bg-[#ff5722] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#f4511e] disabled:opacity-60">
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create offer"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default OfferFormModal;
