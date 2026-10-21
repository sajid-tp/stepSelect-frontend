import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchAvailableCoupons } from "../features/user/checkoutSlice";
import { formatMoney } from "./CartItem";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const offLabel = (coupon) =>
  coupon.discountType === "percentage"
    ? `${coupon.discountValue}% OFF`
    : `₹${Number(coupon.discountValue).toLocaleString("en-IN")} OFF`;

/*
  "Have a coupon?" control for the checkout page.

  - Clicking the field opens a dropdown with the coupons the customer can use
    (GET /coupons). Coupons the cart doesn't qualify for yet are greyed out
    and say how much more is needed.
  - Picking a coupon fills the field; APPLY sends it to the server.
  - Once applied, the field is replaced by a pill with a Remove button.

  onApply(code) and onRemove() must return a promise that REJECTS with an error
  message string when the server refuses, so it can be shown under the field.
*/
function CouponDropdown({ appliedCoupon, onApply, onRemove, disabled }) {
  const dispatch = useDispatch();

  const { coupons, couponsStatus, couponsError } = useSelector(
    (state) => state.checkout
  );

  const [code, setCode] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  /* ---------- open / close ---------- */
  const openList = () => {
    if (open || disabled) return;
    setOpen(true);
    dispatch(fetchAvailableCoupons()); // always fresh: eligibility depends on the cart
  };

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  /* ---------- actions ---------- */
  const handlePick = (coupon) => {
    if (!coupon.isApplicable) return;
    setCode(coupon.couponCode);
    setError("");
    setOpen(false);
  };

  const handleApply = async () => {
    const value = code.trim().toUpperCase();

    if (!value) {
      setError("Enter or pick a coupon code.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await onApply(value);
      setCode("");
      setOpen(false);
    } catch (message) {
      setError(typeof message === "string" ? message : "Could not apply coupon.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    setError("");
    try {
      await onRemove();
    } catch (message) {
      setError(typeof message === "string" ? message : "Could not remove coupon.");
    } finally {
      setBusy(false);
    }
  };

  /* ---------- APPLIED STATE ---------- */
  if (appliedCoupon) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3 rounded-md border border-green-200 bg-green-50 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <i className="fa-solid fa-circle-check text-green-600" />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold tracking-wide text-gray-900">
                {appliedCoupon.couponCode}
              </p>
              <p className="text-[11px] text-green-700">
                You saved {formatMoney(appliedCoupon.discountAmount)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={busy || disabled}
            className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-[#b13600] hover:underline disabled:opacity-50"
          >
            {busy ? "Removing…" : "Remove"}
          </button>
        </div>

        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  /* ---------- INPUT + DROPDOWN ---------- */
  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <i className="fa-solid fa-tag pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500" />

          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase().replace(/\s/g, ""));
              setError("");
            }}
            onFocus={openList}
            onClick={openList}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApply();
              }
            }}
            placeholder="Have a coupon?"
            disabled={busy || disabled}
            maxLength={40}
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls="coupon-list"
            className="h-10 w-full rounded-md border border-transparent bg-[#f1f1f1] pl-9 pr-8 text-xs font-medium tracking-wide text-gray-900 outline-none transition placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-500 focus:border-[#b13600] focus:bg-white disabled:opacity-60"
          />

          <button
            type="button"
            tabIndex={-1}
            aria-label="Show available coupons"
            onClick={() => (open ? setOpen(false) : openList())}
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-gray-500"
          >
            <i
              className={`fa-solid fa-chevron-down text-[10px] transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        <button
          type="button"
          onClick={handleApply}
          disabled={busy || disabled}
          className="h-10 shrink-0 rounded-md bg-[#141414] px-4 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "…" : "Apply"}
        </button>
      </div>

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}

      {open && (
        <div
          id="coupon-list"
          role="listbox"
          className="absolute left-0 right-0 z-30 mt-2 max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl"
        >
          <p className="sticky top-0 border-b border-gray-100 bg-white px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">
            Available coupons
          </p>

          {couponsStatus === "loading" && coupons.length === 0 && (
            <p className="px-4 py-5 text-center text-xs text-gray-500">
              Loading coupons…
            </p>
          )}

          {couponsStatus === "failed" && (
            <p className="px-4 py-5 text-center text-xs text-red-600">
              {couponsError}
            </p>
          )}

          {couponsStatus === "succeeded" && coupons.length === 0 && (
            <p className="px-4 py-5 text-center text-xs text-gray-500">
              No coupons are available right now.
            </p>
          )}

          {coupons.map((coupon) => (
            <button
              key={coupon.id}
              type="button"
              role="option"
              aria-selected={code === coupon.couponCode}
              aria-disabled={!coupon.isApplicable}
              onClick={() => handlePick(coupon)}
              className={`block w-full border-b border-gray-100 px-4 py-3 text-left last:border-b-0 ${
                coupon.isApplicable
                  ? "hover:bg-[#fff4ef]"
                  : "cursor-not-allowed bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`rounded border border-dashed px-2 py-0.5 text-xs font-bold tracking-wide ${
                    coupon.isApplicable
                      ? "border-[#b13600] text-[#b13600]"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  {coupon.couponCode}
                </span>

                <span
                  className={`text-[11px] font-bold ${
                    coupon.isApplicable ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {offLabel(coupon)}
                </span>
              </div>

              {coupon.description && (
                <p
                  className={`mt-1.5 line-clamp-2 text-[11px] ${
                    coupon.isApplicable ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  {coupon.description}
                </p>
              )}

              <p
                className={`mt-1.5 text-[11px] font-medium ${
                  coupon.isApplicable ? "text-green-700" : "text-amber-700"
                }`}
              >
                {coupon.isApplicable
                  ? `You'll save ${formatMoney(coupon.estimatedDiscount)}`
                  : `Add ${formatMoney(coupon.amountNeeded)} more to unlock`}
              </p>

              <p className="mt-1 text-[10px] text-gray-400">
                {[
                  coupon.minimumPurchase > 0 &&
                    `Min. order ${formatMoney(coupon.minimumPurchase)}`,
                  coupon.discountType === "percentage" &&
                    coupon.maximumDiscount > 0 &&
                    `Up to ${formatMoney(coupon.maximumDiscount)} off`,
                  coupon.expiryDate
                    ? `Valid till ${formatDate(coupon.expiryDate)}`
                    : "No expiry",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CouponDropdown;
