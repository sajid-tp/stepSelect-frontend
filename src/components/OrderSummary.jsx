import { formatMoney } from "./CartItem";

function OrderSummary({
  itemCount,
  subtotal,
  unavailableCount,
  canCheckout,
  onCheckout,
}) {
  return (
    <aside className="w-full rounded-xl border border-gray-200 bg-white p-6 sm:p-7">
      <h2 className="text-xl font-extrabold leading-tight text-gray-900">
        Order Summary ({itemCount})
      </h2>

      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-gray-600">Subtotal</dt>
          <dd className="font-semibold text-gray-900">{formatMoney(subtotal)}</dd>
        </div>

        <div className="flex items-center justify-between">
          <dt className="text-gray-600">Estimated Shipping</dt>
          <dd className="text-xs font-bold uppercase tracking-wide text-green-700">
            Free
          </dd>
        </div>
      </dl>

      {unavailableCount > 0 && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          {unavailableCount === 1
            ? "1 item is unavailable and not included in the total."
            : `${unavailableCount} items are unavailable and not included in the total.`}
        </p>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-5">
        <span className="text-xl font-extrabold text-gray-900">Total</span>
        <span className="text-2xl font-extrabold text-[#f4511e]">
          {formatMoney(subtotal)}
        </span>
      </div>

      <button
        type="button"
        onClick={onCheckout}
        disabled={!canCheckout}
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#f4511e] px-4 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#e64a19] disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        Proceed to checkout
        <span aria-hidden="true">→</span>
      </button>

      {!canCheckout && unavailableCount > 0 && (
        <p className="mt-3 text-center text-xs text-amber-700">
          Fix the unavailable items to continue.
        </p>
      )}

      <p className="mt-4 text-center text-xs text-gray-500">
        Secure checkout. Free returns within 30 days.
      </p>
    </aside>
  );
}

export default OrderSummary;
