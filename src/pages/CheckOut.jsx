import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CouponDropdown from "../components/CouponDropdown";
import CheckoutAddressForm from "../components/CheckoutAddressForm";
import { formatMoney } from "../components/CartItem";

import {
  fetchCheckout,
  applyCoupon,
  removeCoupon,
  placeOrder,
  resetCheckout,
} from "../features/user/checkoutSlice";
import { addAddress, updateAddress } from "../features/user/addressSlice";
import { getCart } from "../features/user/cartSlice";
import { getWishlistIds } from "../features/user/wishlistSlice";
import useOnlinePayment from "../hooks/useOnlinePayment";
import { payWithWallet } from "../features/user/walletSlice";

/*
|--------------------------------------------------------------------------
| STATIC DATA
|--------------------------------------------------------------------------
| The server sends data.paymentMethods: COD, Razorpay (when it has keys or demo mode in
| server/.env) and the customer's wallet. A method that is not in that list is shown greyed
| out. Razorpay opens its popup (see hooks/useOnlinePayment.js). The wallet pays at once.
*/
const PAYMENT_OPTIONS = [
  { id: "COD", label: "Cash on Delivery", note: "Pay when your order arrives" },
  { id: "RAZORPAY", label: "Razorpay", note: "Cards, UPI, Netbanking" },
  { id: "WALLET", label: "My Wallet", note: "Pay from your wallet balance" },
];

const ONLINE_METHODS = ["RAZORPAY"];

const ISSUE_TEXT = {
  UNAVAILABLE: "No longer available",
  OUT_OF_STOCK: "Out of stock",
  INSUFFICIENT_STOCK: "Not enough stock",
};

/*
|--------------------------------------------------------------------------
| SMALL PIECES
|--------------------------------------------------------------------------
*/
function SectionTitle({ icon, children }) {
  return (
    <h2 className="flex items-center gap-2.5 border-b border-gray-100 pb-3 text-[15px] font-extrabold uppercase tracking-wide text-[#141414]">
      {icon && <i className={`${icon} text-[13px] text-[#b13600]`} />}
      {children}
    </h2>
  );
}

function AddressCard({ address, selected, onSelect, onEdit }) {
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`cursor-pointer rounded-lg border p-4 transition ${
        selected
          ? "border-[#c4572a] bg-[#ffddd0]"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
              selected ? "border-[#b13600]" : "border-gray-300"
            }`}
          >
            {selected && <span className="h-2 w-2 rounded-full bg-[#b13600]" />}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold text-gray-900">{address.name}</p>

              {address.addressType && (
                <span className="rounded bg-white/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-gray-600">
                  {address.addressType}
                </span>
              )}
            </div>

            <p className="mt-1.5 text-[11px] leading-[17px] text-gray-600">
              {address.detailedAddress}
              <br />
              {[address.city, address.pinCode].filter(Boolean).join(" - ")}
              {address.country ? `, ${address.country}` : ""}
            </p>

            <p className="mt-1 text-[11px] text-gray-600">+91 {address.phoneNumber}</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {address.isDefault && (
            <span className="rounded-sm bg-[#b13600] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">
              Default
            </span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-[10px] font-bold uppercase tracking-wide text-[#b13600] hover:underline"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentOption({ option, selected, enabled, onSelect }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={!enabled}
      onClick={onSelect}
      className={`flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3.5 text-left transition ${
        selected
          ? "border-[#c4572a] bg-[#ffddd0]"
          : "border-gray-200 bg-white"
      } ${enabled ? (selected ? "" : "hover:border-gray-300") : "cursor-not-allowed opacity-60"}`}
    >
      <span className="flex items-center gap-3">
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
            selected ? "border-[#b13600]" : "border-gray-300"
          }`}
        >
          {selected && <span className="h-2 w-2 rounded-full bg-[#b13600]" />}
        </span>
        <span className="text-xs font-bold text-gray-900">{option.label}</span>
      </span>

      {selected ? (
        <i className="fa-regular fa-circle-check text-sm text-[#b13600]" />
      ) : (
        <span className="text-right text-[10px] text-gray-500">{option.note}</span>
      )}
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/
function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data, status, refreshing, error } = useSelector(
    (state) => state.checkout
  );

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [formMode, setFormMode] = useState(null); // null | { address: null | addressObject }
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");

  const { payNow, goToSuccess } = useOnlinePayment();

  /* ---------- load ---------- */
  useEffect(() => {
    dispatch(resetCheckout()); // never flash a previous visit's data
    dispatch(fetchCheckout());
  }, [dispatch]);

  /* ---------- keep a valid address selected (default first) ---------- */
  useEffect(() => {
    if (!data) return;

    const ids = data.addresses.map((a) => a.id);

    setSelectedAddressId((previous) =>
      previous && ids.includes(previous)
        ? previous
        : data.defaultAddressId || ids[0] || null
    );
  }, [data]);

  /* ---------- coupon ---------- */
  const handleApplyCoupon = (code) => dispatch(applyCoupon(code)).unwrap();
  const handleRemoveCoupon = () => dispatch(removeCoupon()).unwrap();

  /* ---------- address add / edit ---------- */
  const handleSaveAddress = async (values) => {
    if (formMode?.address) {
      await dispatch(
        updateAddress({ id: formMode.address.id, ...values })
      ).unwrap();
      await dispatch(fetchCheckout());
    } else {
      const created = await dispatch(addAddress(values)).unwrap();
      await dispatch(fetchCheckout());
      setSelectedAddressId(created.id);
    }

    setFormMode(null);
  };

  /* ---------- place order ---------- */
  const handlePlaceOrder = async () => {
    setPlacing(true);
    setPlaceError("");

    try {
      // Razorpay: create the order, open the payment, then the success / failed page
      if (ONLINE_METHODS.includes(paymentMethod)) {
        await payNow({ addressId: selectedAddressId, gateway: paymentMethod });
        return; // payNow moves to the right page by itself
      }

      // Wallet: the server takes the money and marks the order paid in one go
      if (paymentMethod === "WALLET") {
        const payment = await dispatch(payWithWallet({ addressId: selectedAddressId })).unwrap();
        goToSuccess(payment.orderNumber); // refreshes the cart / wishlist and opens the success page
        return;
      }

      const order = await dispatch(
        placeOrder({ addressId: selectedAddressId, paymentMethod })
      ).unwrap();

      dispatch(getCart()); // the server emptied the cart; refresh the navbar badge
      dispatch(getWishlistIds()); // ...and took the bought pairs off the wishlist: keep the hearts in sync
      navigate(`/order-success/${order.orderNumber}`, {
        replace: true,
        state: { order },
      });
    } catch (message) {
      setPlaceError(
        typeof message === "string" ? message : "Could not place your order."
      );
      dispatch(fetchCheckout()); // stock / coupon may have changed: show the truth
      setPlacing(false);
    }
  };

  /* ---------- derived ---------- */
  const isLoading = status === "idle" || status === "loading";
  const addresses = data?.addresses ?? [];
  const items = data?.items ?? [];
  const pricing = data?.pricing;

  const hasItemIssue = items.some((item) => item.issue);
  const formOpen = Boolean(formMode) || (data && addresses.length === 0);

  const walletBalance = data?.walletBalance ?? 0;
  const walletTooLow =
    paymentMethod === "WALLET" && Boolean(pricing) && walletBalance < pricing.totalAmount;

  const canPlace =
    Boolean(data?.canPlaceOrder) &&
    Boolean(selectedAddressId) &&
    !hasItemIssue &&
    !walletTooLow &&
    !placing &&
    !refreshing;

  let placeHint = "";
  if (hasItemIssue) placeHint = "Some items in your cart are unavailable.";
  else if (!selectedAddressId) placeHint = "Select or add a delivery address.";

  /* ---------- render ---------- */
  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      <Navbar />

      <main className="mx-auto w-full max-w-[1080px] flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="mb-8 text-3xl font-extrabold uppercase tracking-tight text-[#141414] sm:text-[34px]">
          Checkout
        </h1>

        {/* ORDER / PAGE ERRORS */}
        {placeError && (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span>{placeError}</span>
            <button
              type="button"
              onClick={() => setPlaceError("")}
              className="shrink-0 font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {data?.couponMessage && (
          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {data.couponMessage}
          </div>
        )}

        {/* LOADING */}
        {isLoading && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-6">
              <div className="h-72 animate-pulse rounded-lg border border-gray-200 bg-white" />
              <div className="h-60 animate-pulse rounded-lg border border-gray-200 bg-white" />
            </div>
            <div className="h-96 animate-pulse rounded-lg border border-gray-200 bg-white" />
          </div>
        )}

        {/* LOAD FAILED */}
        {!isLoading && status === "failed" && (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-red-100 bg-red-50 px-6 text-center">
            <h2 className="text-base font-semibold text-red-700">
              We couldn't load your checkout
            </h2>
            <p className="mt-2 max-w-md text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => dispatch(fetchCheckout())}
              className="mt-5 rounded-md bg-[#b13600] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#8f2c00]"
            >
              Try again
            </button>
          </div>
        )}

        {/* EMPTY CART */}
        {!isLoading && data && items.length === 0 && (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-gray-200 bg-white px-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Your cart is empty
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Add something to your cart before checking out.
            </p>
            <Link
              to="/shop"
              className="mt-5 rounded-md bg-[#b13600] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#8f2c00]"
            >
              Browse shoes
            </Link>
          </div>
        )}

        {/* CONTENT */}
        {!isLoading && data && items.length > 0 && (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* ============ LEFT COLUMN ============ */}
            <div className="min-w-0 space-y-6">
              {/* SHIPPING ADDRESS */}
              <section className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
                <SectionTitle icon="fa-solid fa-location-dot">
                  Shipping Address
                </SectionTitle>

                {addresses.length > 0 && (
                  <div role="radiogroup" className="mt-5 space-y-3">
                    {addresses.map((address) => (
                      <AddressCard
                        key={address.id}
                        address={address}
                        selected={selectedAddressId === address.id}
                        onSelect={() => setSelectedAddressId(address.id)}
                        onEdit={() => setFormMode({ address })}
                      />
                    ))}
                  </div>
                )}

                {/* ADD NEW LINK */}
                {addresses.length > 0 && !formOpen && (
                  <div className="mt-4 flex justify-end border-b border-gray-100 pb-4">
                    <button
                      type="button"
                      onClick={() => setFormMode({ address: null })}
                      className="text-[11px] font-bold text-[#b13600] hover:underline"
                    >
                      + Add New Address
                    </button>
                  </div>
                )}

                {/* ADD / EDIT FORM */}
                {formOpen && (
                  <div
                    className={
                      addresses.length > 0
                        ? "mt-5 border-t border-gray-100 pt-5"
                        : "mt-5"
                    }
                  >
                    {addresses.length === 0 && (
                      <p className="mb-4 rounded-md bg-[#fff4ef] px-3 py-2 text-xs text-[#8f2c00]">
                        You don't have a saved address yet. Add one to continue.
                      </p>
                    )}

                    <CheckoutAddressForm
                      key={formMode?.address?.id || "new"}
                      address={formMode?.address || null}
                      canCancel={addresses.length > 0}
                      onSave={handleSaveAddress}
                      onCancel={() => setFormMode(null)}
                    />
                  </div>
                )}
              </section>

              {/* PAYMENT METHOD */}
              <section className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
                <SectionTitle icon="fa-regular fa-credit-card">
                  Payment Method
                </SectionTitle>

                <div role="radiogroup" className="mt-5 space-y-3">
                  {PAYMENT_OPTIONS.map((option) => {
                    const enabled = data.paymentMethods.includes(option.id);

                    let shownOption = option;
                    if (!enabled) {
                      shownOption = { ...option, note: "Not available right now" };
                    } else if (option.id === "WALLET") {
                      shownOption = { ...option, note: `Balance ${formatMoney(walletBalance)}` };
                    }

                    return (
                      <PaymentOption
                        key={option.id}
                        option={shownOption}
                        enabled={enabled}
                        selected={paymentMethod === option.id}
                        onSelect={() => enabled && setPaymentMethod(option.id)}
                      />
                    );
                  })}
                </div>
              </section>
            </div>

            {/* ============ ORDER REVIEW ============ */}
            <aside
              className={`rounded-lg border border-gray-200 bg-white p-5 transition-opacity sm:p-6 lg:sticky lg:top-6 ${
                refreshing ? "opacity-70" : ""
              }`}
            >
              <SectionTitle>Order Review</SectionTitle>

              {/* ITEMS */}
              <ul className="mt-4 space-y-3.5">
                {items.map((item) => (
                  <li
                    key={`${item.variantId}-${item.size}`}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold text-gray-800">
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-[10px] text-gray-500">
                        {[
                          item.color,
                          item.size && `Size ${item.size}`,
                          `Qty ${item.quantity}`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      {item.issue && (
                        <p className="mt-0.5 text-[10px] font-semibold text-red-600">
                          {ISSUE_TEXT[item.issue] || "Unavailable"}
                        </p>
                      )}
                    </div>

                    <span className="shrink-0 text-[11px] font-bold text-gray-900">
                      {formatMoney(item.itemTotal)}
                    </span>
                  </li>
                ))}
              </ul>

              {hasItemIssue && (
                <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                  Some items can't be ordered.{" "}
                  <Link to="/cart" className="font-bold underline">
                    Update your cart
                  </Link>
                </p>
              )}

              {/* COUPON */}
              <div className="mt-6">
                <CouponDropdown
                  appliedCoupon={data.coupon}
                  onApply={handleApplyCoupon}
                  onRemove={handleRemoveCoupon}
                  disabled={placing}
                />
              </div>

              {/* PRICING */}
              <dl className="mt-5 space-y-2.5 border-t border-gray-100 pt-4 text-[11px] text-gray-600">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="font-semibold text-gray-900">
                    {formatMoney(pricing.subtotal)}
                  </dd>
                </div>

                {pricing.discountTotal > 0 && (
                  <div className="flex justify-between">
                    <dt>Product discount</dt>
                    <dd className="font-semibold text-green-700">
                      − {formatMoney(pricing.discountTotal)}
                    </dd>
                  </div>
                )}

                {pricing.couponDiscount > 0 && (
                  <div className="flex justify-between">
                    <dt>Coupon{data.coupon ? ` (${data.coupon.couponCode})` : ""}</dt>
                    <dd className="font-semibold text-green-700">
                      − {formatMoney(pricing.couponDiscount)}
                    </dd>
                  </div>
                )}

                {pricing.taxTotal > 0 && (
                  <div className="flex justify-between">
                    <dt>Tax ({pricing.taxPercent}%)</dt>
                    <dd className="font-semibold text-gray-900">
                      {formatMoney(pricing.taxTotal)}
                    </dd>
                  </div>
                )}

                <div className="flex justify-between">
                  <dt>Shipping</dt>
                  <dd
                    className={`font-semibold ${
                      pricing.shippingFee === 0 ? "text-green-700" : "text-gray-900"
                    }`}
                  >
                    {pricing.shippingFee === 0 ? "Free" : formatMoney(pricing.shippingFee)}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex items-baseline justify-between border-t border-gray-100 pt-5">
                <span className="text-lg font-extrabold uppercase text-[#141414]">
                  Total
                </span>
                <span className="text-xl font-extrabold text-[#b13600]">
                  {formatMoney(pricing.totalAmount)}
                </span>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={!canPlace}
                className="mt-6 flex h-12 w-full items-center justify-center rounded-md bg-[#b13600] px-4 text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-[#8f2c00] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {placing
                  ? ONLINE_METHODS.includes(paymentMethod)
                    ? "Opening payment…"
                    : paymentMethod === "WALLET"
                      ? "Paying…"
                      : "Placing order…"
                  : ONLINE_METHODS.includes(paymentMethod)
                    ? "Pay Now"
                    : paymentMethod === "WALLET"
                      ? "Pay from Wallet"
                      : "Place Order Now"}
              </button>

              {placeHint && (
                <p className="mt-3 text-center text-[11px] text-amber-700">
                  {placeHint}
                </p>
              )}

              {walletTooLow && (
                <p className="mt-3 text-center text-[11px] text-amber-700">
                  Your wallet balance ({formatMoney(walletBalance)}) is not enough for this order.{" "}
                  <Link to="/profile/wallet" className="font-bold underline">
                    Add money
                  </Link>
                </p>
              )}

              <Link
                to="/cart"
                className="mt-4 block text-center text-[11px] font-semibold text-gray-500 hover:text-gray-900"
              >
                ← Back to cart
              </Link>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Checkout;
