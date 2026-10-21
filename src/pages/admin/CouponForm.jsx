import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import AdminSidebar from "../../components/AdminSideBar";

import {
  createCoupon,
  updateCoupon,
  getCouponById,
  resetCouponFormState,
} from "../../features/admin/couponSlice";

/*
|--------------------------------------------------------------------------
| VALIDATION RULES  (kept in line with models/coupon.js + adminCouponServices)
|--------------------------------------------------------------------------
*/
const RULES = {
  CODE_MIN: 3,
  CODE_MAX: 40,
  DESCRIPTION_MAX: 500,
};

const CODE_REGEX = /^[A-Z0-9_-]+$/;

/*
|--------------------------------------------------------------------------
| DATE HELPERS
| <input type="date"> gives "YYYY-MM-DD". We convert using LOCAL time so the
| coupon starts at 00:00 and expires at 23:59:59 of the chosen day (sending the
| bare date would make it expire at the *start* of the expiry day).
|--------------------------------------------------------------------------
*/
const pad = (n) => String(n).padStart(2, "0");

const toDateInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const todayInput = () => toDateInput(new Date());

const startOfDayISO = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0).toISOString();
};

const endOfDayISO = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();
};

/*
|--------------------------------------------------------------------------
| FORM <-> API MAPPING
|--------------------------------------------------------------------------
*/
const EMPTY_FORM = {
  couponCode: "",
  discountType: "percentage",
  discountValue: "",
  maximumDiscount: "",
  minimumPurchase: "",
  redemptionLimit: "",
  usageLimitPerUser: "1",
  startDate: todayInput(),
  expiryDate: "",
  description: "",
  isActive: true,
};

const couponToForm = (coupon) => ({
  couponCode: coupon.couponCode || "",
  discountType: coupon.discountType || "percentage",
  discountValue: coupon.discountValue ?? "",
  maximumDiscount: coupon.maximumDiscount ?? "",
  minimumPurchase: coupon.minimumPurchase ? coupon.minimumPurchase : "",
  redemptionLimit: coupon.redemptionLimit ?? "",
  usageLimitPerUser: coupon.usageLimitPerUser ?? 1,
  startDate: toDateInput(coupon.startDate) || todayInput(),
  expiryDate: toDateInput(coupon.expiryDate),
  description: coupon.description || "",
  isActive: Boolean(coupon.isActive),
});

const isBlank = (v) => String(v ?? "").trim() === "";

const buildPayload = (f) => {
  const isPercentage = f.discountType === "percentage";

  return {
    couponCode: f.couponCode.trim().toUpperCase(),
    description: f.description.trim(),
    discountType: f.discountType,
    discountValue: Number(f.discountValue),
    // flat coupons must send null — the backend rejects a maximumDiscount on them
    maximumDiscount:
      isPercentage && !isBlank(f.maximumDiscount) ? Number(f.maximumDiscount) : null,
    minimumPurchase: isBlank(f.minimumPurchase) ? 0 : Number(f.minimumPurchase),
    startDate: startOfDayISO(f.startDate),
    expiryDate: f.expiryDate ? endOfDayISO(f.expiryDate) : null,
    redemptionLimit: isBlank(f.redemptionLimit) ? null : Number(f.redemptionLimit),
    usageLimitPerUser: Number(f.usageLimitPerUser),
    isActive: f.isActive,
  };
};

/*
|--------------------------------------------------------------------------
| VALIDATORS   (data, ctx) => "" | "error message"
|--------------------------------------------------------------------------
*/
const isWholeNumber = (v) => /^\d+$/.test(String(v).trim());

const VALIDATORS = {
  couponCode: (d) => {
    const code = d.couponCode.trim();
    if (!code) return "Coupon code is required.";
    if (code.length < RULES.CODE_MIN)
      return `Coupon code must be at least ${RULES.CODE_MIN} characters.`;
    if (code.length > RULES.CODE_MAX)
      return `Coupon code cannot exceed ${RULES.CODE_MAX} characters.`;
    if (!CODE_REGEX.test(code.toUpperCase()))
      return "Use only letters, numbers, hyphens and underscores.";
    return "";
  },

  discountValue: (d) => {
    if (isBlank(d.discountValue)) return "Discount value is required.";
    const value = Number(d.discountValue);
    if (!Number.isFinite(value) || value <= 0)
      return "Discount value must be greater than 0.";
    if (d.discountType === "percentage" && value > 100)
      return "Percentage discount cannot exceed 100.";
    return "";
  },

  maximumDiscount: (d) => {
    if (d.discountType !== "percentage" || isBlank(d.maximumDiscount)) return "";
    const value = Number(d.maximumDiscount);
    if (!Number.isFinite(value) || value <= 0)
      return "Must be greater than 0 (or leave empty for no cap).";
    return "";
  },

  minimumPurchase: (d) => {
    if (isBlank(d.minimumPurchase)) return "";
    const value = Number(d.minimumPurchase);
    if (!Number.isFinite(value) || value < 0)
      return "Minimum purchase cannot be negative.";
    return "";
  },

  redemptionLimit: (d, ctx) => {
    if (isBlank(d.redemptionLimit)) return "";
    if (!isWholeNumber(d.redemptionLimit) || Number(d.redemptionLimit) < 1)
      return "Enter a whole number of 1 or more (or leave empty for unlimited).";
    if (ctx.usedCount && Number(d.redemptionLimit) < ctx.usedCount)
      return `Already redeemed ${ctx.usedCount} times — limit can't be lower.`;
    return "";
  },

  usageLimitPerUser: (d) => {
    if (isBlank(d.usageLimitPerUser)) return "Per-customer limit is required.";
    if (!isWholeNumber(d.usageLimitPerUser) || Number(d.usageLimitPerUser) < 1)
      return "Enter a whole number of 1 or more.";
    return "";
  },

  startDate: (d) => (d.startDate ? "" : "Start date is required."),

  expiryDate: (d, ctx) => {
    if (!d.expiryDate) return "";
    if (d.startDate && d.expiryDate < d.startDate)
      return "Expiry date must be on or after the start date.";
    if (!ctx.isEditMode && d.expiryDate < todayInput())
      return "Expiry date cannot be in the past.";
    return "";
  },

  description: (d) =>
    d.description.trim().length > RULES.DESCRIPTION_MAX
      ? `Description cannot exceed ${RULES.DESCRIPTION_MAX} characters.`
      : "",
};

/*
|--------------------------------------------------------------------------
| STYLES + SMALL COMPONENTS
|--------------------------------------------------------------------------
*/
const inputClass = (hasError, extra = "") => `
  w-full rounded-md border bg-[#f3f4f6] px-4 py-3 text-sm text-gray-900
  outline-none transition placeholder:text-gray-400
  focus:bg-white focus:ring-2
  disabled:cursor-not-allowed disabled:opacity-60
  ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
      : "border-transparent focus:border-[#ff5722] focus:ring-[#ff5722]/15"
  }
  ${extra}
`;

function Field({ label, htmlFor, required, error, hint, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500"
      >
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[11px] text-gray-400">{hint}</p>
      ) : null}
    </div>
  );
}

function Adornment({ children }) {
  return (
    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
      {children}
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/
function CouponForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { couponId } = useParams();

  const isEditMode = Boolean(couponId);
  const couponFromState = location.state?.coupon;

  const {
    createStatus,
    createError,
    updateStatus,
    updateError,
    current,
    currentStatus,
    currentError,
  } = useSelector((state) => state.adminCoupons);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [usedCount, setUsedCount] = useState(0);
  const [errors, setErrors] = useState({});
  const [loaded, setLoaded] = useState(!isEditMode);

  const isSubmitting = createStatus === "loading" || updateStatus === "loading";
  const serverError = isEditMode ? updateError : createError;
  const isPercentage = formData.discountType === "percentage";

  /* ---------- reset slice state on mount ---------- */
  useEffect(() => {
    dispatch(resetCouponFormState());
  }, [dispatch]);

  /* ---------- EDIT: fill from router state, otherwise fetch by id ---------- */
  useEffect(() => {
    if (!isEditMode) return;

    if (couponFromState && couponFromState.id === couponId) {
      setFormData(couponToForm(couponFromState));
      setUsedCount(couponFromState.redemptions || 0);
      setLoaded(true);
    } else {
      dispatch(getCouponById(couponId));
    }
  }, [dispatch, isEditMode, couponId, couponFromState]);

  useEffect(() => {
    if (isEditMode && !couponFromState && current && current.id === couponId) {
      setFormData(couponToForm(current));
      setUsedCount(current.redemptions || 0);
      setLoaded(true);
    }
  }, [isEditMode, couponFromState, current, couponId]);

  /* ---------- helpers ---------- */
  const ctx = { isEditMode, usedCount };

  const setField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "couponCode") {
      // codes are stored upper-case with no spaces
      setField(name, value.toUpperCase().replace(/\s/g, ""));
      return;
    }
    setField(name, value);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    const validate = VALIDATORS[name];
    if (!validate) return;
    setErrors((prev) => ({ ...prev, [name]: validate(formData, ctx) }));
  };

  const handleTypeChange = (e) => {
    const discountType = e.target.value;

    setFormData((prev) => ({
      ...prev,
      discountType,
      // a flat coupon can't have a cap
      maximumDiscount: discountType === "flat" ? "" : prev.maximumDiscount,
    }));
    setErrors((prev) => ({ ...prev, discountValue: "", maximumDiscount: "" }));
  };

  const validateForm = () => {
    const next = {};
    Object.keys(VALIDATORS).forEach((field) => {
      const message = VALIDATORS[field](formData, ctx);
      if (message) next[field] = message;
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /* ---------- submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = buildPayload(formData);

    try {
      if (isEditMode) {
        await dispatch(updateCoupon({ couponId, couponData: payload })).unwrap();
      } else {
        await dispatch(createCoupon(payload)).unwrap();
      }
      navigate("/admin/coupons");
    } catch (err) {
      const message = typeof err === "string" ? err : err?.message || "";
      // surface duplicate-code errors right on the field as well
      if (/already exists/i.test(message)) {
        setErrors((prev) => ({ ...prev, couponCode: message }));
      }
    }
  };

  /* ---------- EDIT: loading / failed states ---------- */
  if (isEditMode && !loaded) {
    return (
      <div className="min-h-screen bg-[#f7f9fc]">
        <AdminSidebar />
        <main className="ml-[214px] flex min-h-screen items-center justify-center px-8">
          {currentStatus === "failed" ? (
            <div className="max-w-md text-center">
              <h1 className="text-xl font-bold text-gray-900">
                Couldn’t load this coupon
              </h1>
              <p className="mt-2 text-sm text-gray-500">{currentError}</p>
              <button
                type="button"
                onClick={() => navigate("/admin/coupons")}
                className="mt-6 rounded-lg bg-[#ff5722] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e64a19]"
              >
                Back to Coupons
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Loading coupon…</p>
          )}
        </main>
      </div>
    );
  }

  /* ---------- RENDER ---------- */
  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <AdminSidebar />

      <main className="ml-[214px] min-h-screen px-10 py-10">
        <div className="mx-auto w-full max-w-3xl">
          {/* HEADER */}
          <button
            type="button"
            onClick={() => navigate("/admin/coupons")}
            className="mb-5 text-xs font-medium text-gray-500 transition hover:text-gray-900"
          >
            ← Back to Coupons
          </button>

          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            Campaigns
          </p>
          <h1 className="mb-7 mt-1 text-4xl font-extrabold tracking-tight text-[#071a33]">
            {isEditMode ? "Edit" : "Create New"}{" "}
            <span className="text-[#ff5722]">Coupon</span>
          </h1>

          {/* FORM CARD */}
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            {serverError && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
                {/* CODE */}
                <Field
                  label="Coupon Code"
                  htmlFor="couponCode"
                  required
                  error={errors.couponCode}
                  hint="Letters, numbers, - and _ only. Saved in capitals."
                >
                  <input
                    id="couponCode"
                    name="couponCode"
                    type="text"
                    value={formData.couponCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={RULES.CODE_MAX}
                    placeholder="e.g. STEP10"
                    disabled={isSubmitting}
                    autoComplete="off"
                    className={inputClass(errors.couponCode, "font-semibold tracking-wide")}
                  />
                </Field>

                {/* DISCOUNT TYPE */}
                <Field label="Discount Type" htmlFor="discountType" required>
                  <div className="relative">
                    <select
                      id="discountType"
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleTypeChange}
                      disabled={isSubmitting}
                      className={inputClass(false, "cursor-pointer appearance-none pr-10")}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                    <i className="fa-solid fa-chevron-down pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-500" />
                  </div>
                </Field>

                {/* DISCOUNT VALUE */}
                <Field
                  label="Discount Value"
                  htmlFor="discountValue"
                  required
                  error={errors.discountValue}
                >
                  <div className="relative">
                    <Adornment>{isPercentage ? "%" : "₹"}</Adornment>
                    <input
                      id="discountValue"
                      name="discountValue"
                      type="number"
                      min="0"
                      step="any"
                      inputMode="decimal"
                      value={formData.discountValue}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={isPercentage ? "e.g. 10" : "e.g. 500"}
                      disabled={isSubmitting}
                      className={inputClass(errors.discountValue, "pl-9")}
                    />
                  </div>
                </Field>

                {/* MAX DISCOUNT */}
                <Field
                  label="Max Discount"
                  htmlFor="maximumDiscount"
                  error={errors.maximumDiscount}
                  hint={
                    isPercentage
                      ? "Optional cap on the discount amount."
                      : "Only applies to percentage coupons."
                  }
                >
                  <div className="relative">
                    <Adornment>₹</Adornment>
                    <input
                      id="maximumDiscount"
                      name="maximumDiscount"
                      type="number"
                      min="0"
                      step="any"
                      inputMode="decimal"
                      value={formData.maximumDiscount}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. 500"
                      disabled={isSubmitting || !isPercentage}
                      className={inputClass(errors.maximumDiscount, "pl-9")}
                    />
                  </div>
                </Field>

                {/* MIN PURCHASE */}
                <Field
                  label="Min Purchase"
                  htmlFor="minimumPurchase"
                  error={errors.minimumPurchase}
                  hint="Cart value needed to use this coupon. Empty = none."
                >
                  <div className="relative">
                    <Adornment>₹</Adornment>
                    <input
                      id="minimumPurchase"
                      name="minimumPurchase"
                      type="number"
                      min="0"
                      step="any"
                      inputMode="decimal"
                      value={formData.minimumPurchase}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. 1500"
                      disabled={isSubmitting}
                      className={inputClass(errors.minimumPurchase, "pl-9")}
                    />
                  </div>
                </Field>

                {/* REDEMPTIONS LIMIT */}
                <Field
                  label="Redemptions Limit"
                  htmlFor="redemptionLimit"
                  error={errors.redemptionLimit}
                  hint={
                    isEditMode
                      ? `Used ${usedCount} time${usedCount === 1 ? "" : "s"} so far. Empty = unlimited.`
                      : "Total uses across all customers. Empty = unlimited."
                  }
                >
                  <input
                    id="redemptionLimit"
                    name="redemptionLimit"
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={formData.redemptionLimit}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. 1000"
                    disabled={isSubmitting}
                    className={inputClass(errors.redemptionLimit)}
                  />
                </Field>

                {/* START DATE  (extra field) */}
                <Field
                  label="Start Date"
                  htmlFor="startDate"
                  required
                  error={errors.startDate}
                  hint="Coupon becomes usable from the start of this day."
                >
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    className={inputClass(errors.startDate)}
                  />
                </Field>

                {/* EXPIRY DATE */}
                <Field
                  label="Expiry Date"
                  htmlFor="expiryDate"
                  error={errors.expiryDate}
                  hint="Valid until the end of this day. Empty = no expiry."
                >
                  <input
                    id="expiryDate"
                    name="expiryDate"
                    type="date"
                    min={formData.startDate || undefined}
                    value={formData.expiryDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    className={inputClass(errors.expiryDate)}
                  />
                </Field>

                {/* PER-USER LIMIT  (extra field) */}
                <Field
                  label="Uses Per Customer"
                  htmlFor="usageLimitPerUser"
                  required
                  error={errors.usageLimitPerUser}
                  hint="How many times one customer can redeem it."
                >
                  <input
                    id="usageLimitPerUser"
                    name="usageLimitPerUser"
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={formData.usageLimitPerUser}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. 1"
                    disabled={isSubmitting}
                    className={inputClass(errors.usageLimitPerUser)}
                  />
                </Field>
              </div>

              {/* DESCRIPTION */}
              <div className="mt-6">
                <Field
                  label="Campaign Description"
                  htmlFor="description"
                  error={errors.description}
                >
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={RULES.DESCRIPTION_MAX}
                    placeholder="Brief details about this marketing campaign…"
                    disabled={isSubmitting}
                    className={inputClass(errors.description, "resize-none")}
                  />
                  <p className="mt-1.5 text-right text-[11px] text-gray-400">
                    {formData.description.length}/{RULES.DESCRIPTION_MAX}
                  </p>
                </Field>
              </div>

              {/* ACTIVE TOGGLE */}
              <div className="mt-6 flex items-center justify-between rounded-lg bg-[#f3f4f6] px-5 py-4">
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {isEditMode ? "Coupon is active" : "Activate Immediately"}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {isEditMode
                      ? "Turn off to stop customers from using this coupon."
                      : "Coupon goes live as soon as it’s launched (from the start date)."}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.isActive}
                  aria-label="Active"
                  disabled={isSubmitting}
                  onClick={() => setField("isActive", !formData.isActive)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
                    formData.isActive ? "bg-[#ff5722]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                      formData.isActive ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* ACTIONS */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-8 w-full rounded-md bg-[#ff5722] py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#e64a19] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? isEditMode
                    ? "Saving…"
                    : "Launching…"
                  : isEditMode
                    ? "Save Changes"
                    : "Launch Coupon Campaign"}
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => navigate("/admin/coupons")}
                className="mt-3 w-full rounded-md py-2.5 text-xs font-semibold text-gray-500 transition hover:text-gray-900 disabled:opacity-50"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CouponForm;
