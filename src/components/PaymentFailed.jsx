import { Link } from "react-router-dom";

import { formatMoney } from "./CartItem";
import PaymentCountdown, { clock } from "./PaymentCountdown";
import PaymentAttemptDots from "./PaymentAttemptDots";
import { paymentLabel } from "../utils/orderFormat";

/*
  Payment failed card (shown inside the payment-failure modal).
  Props:
    payment        -> the server's payment status (GET /payments/:orderNumber/status)
    reason         -> why the last attempt failed (text)
    retrying       -> true while the payment window is opening
    error          -> text shown when retry itself was refused
    onRetry        -> "Retry payment" / "Make final attempt" button
    onCancelPayment-> "Cancel payment" button (gives the held items back, then the cart opens)
    onViewOrder    -> "View order" button (an order that is closed as Payment failed stays in Order History)
    onRefresh      -> called when a countdown ends (the new state is loaded from the server)

  The rules (decided by the server):
    - the items are held for 30 minutes from the moment the order was created (retries never extend it)
    - 4 attempts in total: attempts 1-3 straight away, the 4th and final one opens after a 2 minute cool-down
    - when the 4th attempt fails, or the 30 minutes end, the order is closed as "Payment failed" and the items go back in stock
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

function PaymentFailed({ payment, reason, retrying, error, onRetry, onCancelPayment, onViewOrder, onRefresh }) {
  const {
    orderNumber,
    paymentMethod,
    totalAmount,
    canRetry,
    closedReason,
    secondsLeft,
    cooldownSecondsLeft = 0,
    failedAttempts = 0,
    attemptsUsed = 0,
    maxAttempts = 4,
    attemptsLeft = 0,
    nextAttemptIsFinal,
    attemptInProgress,
    holdMinutes = 30,
  } = payment;

  const isClosed = closedReason !== null && closedReason !== undefined;
  const inCooldown = !isClosed && cooldownSecondsLeft > 0;

  const message = isClosed
    ? closedReason === "exhausted"
      ? `All ${maxAttempts} payment attempts failed, so this order is marked as Payment failed. Nothing was charged and the items are back in stock. Your cart is still there if you want to place the order again.`
      : closedReason === "expired"
      ? `The ${holdMinutes} minutes to pay for this order are over, so it is marked as Payment failed and the items are back in stock. Your cart is still there if you want to place the order again.`
      : "This payment was cancelled and the items are back in stock."
    : inCooldown
    ? "Your payment didn't go through. You have one final attempt left, and it opens after a short wait."
    : attemptInProgress
    ? "A payment for this order is still in progress. If you already paid, it will show up here in a moment."
    : "Your payment didn't go through and you have not been charged for this attempt. You can try again below.";

  const retryLabel = retrying
    ? "Opening payment…"
    : inCooldown
    ? `Final attempt in ${clock(cooldownSecondsLeft)}`
    : nextAttemptIsFinal
    ? "Make final attempt"
    : "Retry payment";

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
      <FailureIllustration />

      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#141414]">
        Payment <span className="text-red-600">failed</span>
      </h1>

      <div className="mt-3">
        <PaymentAttemptDots failed={failedAttempts} used={attemptsUsed} max={maxAttempts} />
        <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          {failedAttempts} of {maxAttempts} attempts failed
        </p>
      </div>

      <p className="mt-3 text-sm text-gray-500">{message}</p>

      {reason && !isClosed && (
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

      {!isClosed && (
        <div role="status" className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <p>
            Your items are held for <PaymentCountdown seconds={secondsLeft} onDone={onRefresh} />
          </p>
          <p className="mt-1">
            {attemptsLeft} {attemptsLeft === 1 ? "attempt" : "attempts"} left
            {nextAttemptIsFinal && !inCooldown ? " (this is the final one)" : ""}
          </p>
          {inCooldown && (
            <p className="mt-1">
              Final attempt opens in{" "}
              <PaymentCountdown seconds={cooldownSecondsLeft} onDone={onRefresh} warnBelow={0} />
            </p>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 text-xs font-medium text-red-600">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {!isClosed && (
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying || !canRetry}
            className="w-full rounded-md bg-[#b13600] px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-[#8f2c00] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {retryLabel}
          </button>
        )}

        {isClosed && (
          <button
            type="button"
            onClick={onViewOrder}
            className="w-full rounded-md bg-[#b13600] px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-[#8f2c00]"
          >
            View order
          </button>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          {!isClosed && (
            <button
              type="button"
              onClick={onViewOrder}
              disabled={retrying}
              className="flex-1 rounded-md border border-gray-200 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              View order
            </button>
          )}

          {!isClosed ? (
            <button
              type="button"
              onClick={onCancelPayment}
              disabled={retrying}
              className="flex-1 rounded-md border border-gray-200 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel payment
            </button>
          ) : (
            <Link
              to="/cart"
              className="flex-1 rounded-md border border-gray-200 px-5 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-gray-700 transition hover:bg-gray-50"
            >
              Back to cart
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentFailed;
