import { useEffect } from "react";
import PaymentCountdown, { clock } from "./PaymentCountdown";
import PaymentAttemptDots from "./PaymentAttemptDots";

/*
  Payment box on the Order Details page of an order that is not paid yet (or whose payment failed).
  Uses order.paymentFlow, the same numbers the payment-failure modal shows:
    - the items are held for 30 minutes from the moment the order was created
    - 4 attempts in total; the 4th (final) one opens after a 2 minute cool-down
    - when the 4th attempt fails or the 30 minutes end, the order is closed as "Payment failed"
*/
function PaymentRetryPanel({ order, retrying, error, onRetry, onCancelPayment, onRefresh }) {
  const flow = order?.paymentFlow;

  // An attempt nobody finished is settled by the server after a few minutes: keep asking while one is
  // running, so the Retry button unlocks by itself (no page reload needed)
  const waitingOnAttempt = Boolean(flow?.attemptInProgress) && (flow?.closedReason ?? null) === null;
  useEffect(() => {
    if (!waitingOnAttempt || !onRefresh) return undefined;
    const timer = setInterval(onRefresh, 10000);
    return () => clearInterval(timer);
  }, [waitingOnAttempt, onRefresh]);

  if (!flow) return null;

  const {
    closedReason,
    canRetry,
    attemptsLeft,
    attemptsUsed,
    failedAttempts,
    maxAttempts,
    nextAttemptIsFinal,
    attemptInProgress,
    cooldownOutlastsHold = false,
    cooldownSecondsLeft = 0,
    secondsLeft,
    holdMinutes = 30,
  } = flow;

  const isClosed = closedReason !== null && closedReason !== undefined;
  const inCooldown = !isClosed && cooldownSecondsLeft > 0;

  if (isClosed) {
    const text =
      closedReason === "exhausted"
        ? `All ${maxAttempts} payment attempts failed. Nothing was charged and the items are back in stock.`
        : closedReason === "expired"
        ? `The ${holdMinutes} minutes to pay for this order ran out. Nothing was charged and the items are back in stock.`
        : "This payment was cancelled and the items are back in stock.";

    return (
      <section className="border-b border-line bg-red-50 px-6 py-5 sm:px-8" role="status">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-red-700">Payment failed</h2>
        <p className="mt-1 text-sm text-red-700">{text}</p>
        <p className="mt-1 text-xs text-red-600">Your cart is still there if you want to place this order again.</p>
      </section>
    );
  }

  const retryLabel = retrying
    ? "Opening payment…"
    : inCooldown
    ? `Final attempt in ${clock(cooldownSecondsLeft)}`
    : nextAttemptIsFinal
    ? "Make final attempt"
    : failedAttempts > 0
    ? "Retry payment"
    : "Pay now";

  return (
    <section className="border-b border-line bg-amber-50 px-6 py-5 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 text-sm text-amber-900">
          <h2 className="text-sm font-extrabold uppercase tracking-wide">
            {failedAttempts > 0 ? "Payment failed - you can try again" : "Payment not completed"}
          </h2>

          <p className="mt-1">
            Items held for <PaymentCountdown seconds={secondsLeft} onDone={onRefresh} />. After that this order is closed
            as Payment failed.
          </p>

          <p className="mt-1 text-xs">
            {attemptsLeft} of {maxAttempts} {attemptsLeft === 1 ? "attempt" : "attempts"} left
            {nextAttemptIsFinal && !inCooldown ? " (final attempt)" : ""}
            {inCooldown && (
              <>
                {" "}- final attempt opens in{" "}
                <PaymentCountdown seconds={cooldownSecondsLeft} onDone={onRefresh} warnBelow={0} />
              </>
            )}
            {attemptInProgress && " - a payment is in progress"}
          </p>

          {cooldownOutlastsHold && (
            <p className="mt-1 text-xs font-semibold text-red-700">
              Heads up: this order will expire before the final attempt opens.
            </p>
          )}

          <div className="mt-2 inline-block">
            <PaymentAttemptDots failed={failedAttempts} used={attemptsUsed} max={maxAttempts} />
          </div>

          {error && (
            <p role="alert" className="mt-2 text-xs font-medium text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying || !canRetry}
            className="rounded-md bg-[#b13600] px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-[#8f2c00] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {retryLabel}
          </button>
          <button
            type="button"
            onClick={onCancelPayment}
            disabled={retrying}
            className="rounded-md border border-amber-300 bg-white px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel payment
          </button>
        </div>
      </div>
    </section>
  );
}

export default PaymentRetryPanel;
