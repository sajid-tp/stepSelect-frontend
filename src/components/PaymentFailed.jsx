import { Link } from "react-router-dom";

import { formatMoney } from "./CartItem";
import { paymentLabel } from "../utils/orderFormat";

/*
  Payment failed / rejected card.
  Props:
    payment       -> the server's payment status { orderNumber, paymentMethod, totalAmount, canRetry, holdMinutes }
    reason        -> why it failed (text)
    retrying      -> true while the payment window is opening
    error         -> text shown when retry itself failed
    onRetry       -> "Retry payment" button
    onBackToCart  -> "Back to cart" button (the page gives the held shoes back first, then redirects)
  The "Back to checkout" button is a plain link.
*/

// Little drawing: a card with a cross badge
function FailureIllustration() {
  return (
    <svg viewBox="0 0 200 160" className="mx-auto h-36 w-44" role="img" aria-label="Payment failed">
      <ellipse cx="100" cy="146" rx="62" ry="8" fill="#f1ece8" />
      <circle cx="28" cy="48" r="4" fill="#fbbf24" />
      <circle cx="172" cy="40" r="4" fill="#f4511e" />
      <path d="M40 92l8 8M48 92l-8 8" stroke="#d1d5db" strokeWidth="3" strokeLinecap="round" />
      <path d="M160 100l8 8M168 100l-8 8" stroke="#d1d5db" strokeWidth="3" strokeLinecap="round" />
      {/* card */}
      <rect x="40" y="46" width="112" height="76" rx="10" fill="#fff4ef" stroke="#b13600" strokeWidth="3" />
      <rect x="40" y="64" width="112" height="16" fill="#b13600" />
      <rect x="54" y="96" width="34" height="8" rx="3" fill="#eab4ae" />
      <rect x="54" y="110" width="52" height="6" rx="3" fill="#f6d9d6" />
      {/* badge */}
      <circle cx="148" cy="52" r="22" fill="#dc2626" />
      <path d="M139 43l18 18M157 43l-18 18" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function PaymentFailed({ payment, reason, retrying, error, onRetry, onBackToCart }) {
  const { orderNumber, paymentMethod, totalAmount, canRetry, holdMinutes } = payment;

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
      <FailureIllustration />

      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#141414]">
        Payment <span className="text-red-600">failed</span>
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        {canRetry
          ? "Your payment didn't go through and you have not been charged for this attempt. You can try again below."
          : "Your payment didn't go through and this attempt has expired. Please go back and place the order again."}
      </p>

      {reason && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
        >
          {reason}
        </p>
      )}

      <dl className="mt-5 space-y-3 rounded-lg bg-[#fafafa] px-5 py-4 text-left text-xs">
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">Order number</dt>
          <dd className="font-bold tracking-wide text-gray-900">{orderNumber}</dd>
        </div>

        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">Payment method</dt>
          <dd className="font-semibold text-gray-900">{paymentLabel(paymentMethod)}</dd>
        </div>

        <div className="flex justify-between gap-4 border-t border-gray-200 pt-3">
          <dt className="font-bold text-gray-900">Amount due</dt>
          <dd className="text-base font-extrabold text-[#b13600]">{formatMoney(totalAmount)}</dd>
        </div>
      </dl>

      {canRetry && (
        <p className="mt-3 text-[11px] text-gray-500">
          Your items are being held for {holdMinutes} minutes.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {canRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className="w-full rounded-md bg-[#b13600] px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-[#8f2c00] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {retrying ? "Opening payment…" : "Retry payment"}
          </button>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/checkout"
            className="flex-1 rounded-md border border-gray-200 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-700 transition hover:bg-gray-50"
          >
            Change payment method
          </Link>
          <button
            type="button"
            onClick={onBackToCart}
            disabled={retrying}
            className="flex-1 rounded-md border border-gray-200 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Back to cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentFailed;
