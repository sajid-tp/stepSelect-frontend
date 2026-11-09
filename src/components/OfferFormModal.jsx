import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOffer, getOfferOptions, updateOffer } from "../features/admin/offerSlice";
import useDebounce from "../hooks/useDebounce";

// Same numbers as OFFER_NAME_LIMITS in server/src/constants/offerConstants.js - change both together.
const NAME_MIN = 2;
const NAME_MAX = 80;

const toDateInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const inputClass = (hasError) =>
  `h-11 w-full rounded-lg border bg-white px-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:ring-2 ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
      : "border-gray-200 focus:border-[#ff5722] focus:ring-[#ff5722]/10"
  }`;

// the message that sits right under a field (same look as the coupon form)
const FieldError = ({ message }) =>
  message ? <p className="mt-1 text-xs text-red-500">{message}</p> : null;

const todayInput = () => toDateInput(new Date());

// Checks one field. Returns "" when it is fine, otherwise the message to show under it.
// (kept in line with the checks in server/src/services/admin/adminOfferServices.js)
const validateField = (name, form, { isCategory, isEdit }) => {
  switch (name) {
    case "offerName": {
      const len = form.offerName.trim().length;
      if (!len) return "Enter an offer name.";
      if (len < NAME_MIN) return `Offer name must be at least ${NAME_MIN} characters.`;
      if (len > NAME_MAX) return `Offer name cannot exceed ${NAME_MAX} characters.`;
      return "";
    }
    case "targetId":
      return form.targetId ? "" : isCategory ? "Choose a category." : "Choose a product.";
    case "discountPercent": {
      if (String(form.discountPercent).trim() === "") return "Enter the discount percentage.";
      const percent = Number(form.discountPercent);
      if (!Number.isInteger(percent) || percent < 1 || percent > 90)
        return "Discount must be a whole number from 1 to 90.";
      return "";
    }
    case "startDate":
      return "";
    case "expiryDate":
      if (!form.expiryDate) return "Choose an expiry date.";
      if (form.startDate && form.expiryDate < form.startDate)
        return "Expiry date must be on or after the start date.";
      if (!isEdit && form.expiryDate < todayInput()) return "Expiry date cannot be in the past.";
      return "";
    default:
      return "";
  }
};

const FIELDS = ["offerName", "targetId", "discountPercent", "startDate", "expiryDate"];

// Put a server message under the field it is about; anything else stays in the box at the bottom.
const serverErrorField = (message) => {
  if (/already covers/i.test(message)) return "targetId";
  if (/offer name/i.test(message)) return "offerName";
  if (/discount/i.test(message)) return "discountPercent";
  if (/expiry/i.test(message)) return "expiryDate";
  if (/category|product/i.test(message)) return "targetId";
  return null;
};

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
  const [errors, setErrors] = useState({}); // { [field]: message } shown under each field
  const [error, setError] = useState(""); // errors that belong to no single field (server / network)
  const errorRef = useRef(null);

  // The popup scrolls on small screens and the message sits near the bottom, so bring it into view
  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [error]);

  // reset the form each time the modal opens
  useEffect(() => {
    if (!open) return;
    setError("");
    setErrors({});
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

  const set = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    // the admin is fixing this field, so drop its message (and any server message)
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
    setError("");
  };

  // check a field when the admin leaves it
  const handleBlur = (name) => () =>
    setErrors((prev) => ({ ...prev, [name]: validateField(name, form, { isCategory, isEdit }) }));

  // When editing, the chosen product may not be in the current search results: keep showing it
  const productChoices = options.products.some((p) => p.id === form.targetId) || !offer?.productId
    ? options.products
    : [{ id: offer.productId, name: offer.targetName, categoryName: "" }, ...options.products];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // check every field at once so each wrong one shows its own message
    const found = {};
    FIELDS.forEach((name) => {
      const message = validateField(name, form, { isCategory, isEdit });
      if (message) found[name] = message;
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const percent = Number(form.discountPercent);

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
      const message = typeof err === "string" ? err : err?.message || "Could not save the offer.";
      const field = serverErrorField(message);
      if (field) setErrors((prev) => ({ ...prev, [field]: message }));
      else setError(message);
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
              className={inputClass(errors.offerName)}
              value={form.offerName}
              maxLength={NAME_MAX}
              onChange={(e) => set("offerName", e.target.value)}
              onBlur={handleBlur("offerName")}
              placeholder={isCategory ? "e.g. Monsoon Running Sale" : "e.g. Air Runner launch deal"}
            />
            <div className="mt-1 flex justify-between">
              {errors.offerName ? (
                <p className="text-xs text-red-500">{errors.offerName}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-gray-400">
                {form.offerName.length}/{NAME_MAX}
              </p>
            </div>
          </label>

          {isCategory ? (
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-gray-600">Category</span>
              <select
                className={inputClass(errors.targetId)}
                value={form.targetId}
                onChange={(e) => set("targetId", e.target.value)}
                onBlur={handleBlur("targetId")}
              >
                <option value="">Select a category</option>
                {options.categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.targetId ? (
                <FieldError message={errors.targetId} />
              ) : (
                <span className="mt-1 block text-[11px] text-gray-400">Applies to every shoe in this category.</span>
              )}
            </label>
          ) : (
            <div>
              <span className="mb-1 block text-xs font-semibold text-gray-600">Product</span>
              <input
                className={`${inputClass(false)} mb-2`}
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by name"
              />
              <select
                className={inputClass(errors.targetId)}
                value={form.targetId}
                onChange={(e) => set("targetId", e.target.value)}
                onBlur={handleBlur("targetId")}
              >
                <option value="">Select a product</option>
                {productChoices.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}{p.categoryName ? ` (${p.categoryName})` : ""}
                  </option>
                ))}
              </select>
              <FieldError message={errors.targetId} />
            </div>
          )}

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-gray-600">Discount (% off, 1 to 90)</span>
            <input
              type="number"
              min="1"
              max="90"
              step="1"
              className={inputClass(errors.discountPercent)}
              value={form.discountPercent}
              onChange={(e) => set("discountPercent", e.target.value)}
              onBlur={handleBlur("discountPercent")}
              placeholder="15"
            />
            <FieldError message={errors.discountPercent} />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-gray-600">Starts on</span>
              <input
                type="date"
                className={inputClass(errors.startDate)}
                value={form.startDate}
                onChange={(e) => {
                  set("startDate", e.target.value);
                  // the expiry check depends on the start date, so clear its date-order message too
                  setErrors((prev) => (prev.expiryDate ? { ...prev, expiryDate: "" } : prev));
                }}
              />
              <FieldError message={errors.startDate} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-gray-600">Expires on</span>
              <input
                type="date"
                className={inputClass(errors.expiryDate)}
                value={form.expiryDate}
                onChange={(e) => set("expiryDate", e.target.value)}
                onBlur={handleBlur("expiryDate")}
              />
              <FieldError message={errors.expiryDate} />
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
          <p ref={errorRef} role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
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
