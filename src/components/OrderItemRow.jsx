import { Link } from "react-router-dom";

import OrderStatusBadge from "./OrderStatusBadge";
import { formatMoney } from "./CartItem";
import {
  REVIEWABLE_ITEM_STATUSES,
  TRACKABLE_ITEM_STATUSES,
} from "../utils/orderFormat";

const primaryBtn =
  "rounded bg-[#b13600] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white transition hover:bg-[#8f2c00] disabled:cursor-not-allowed disabled:opacity-50";

const darkBtn =
  "rounded bg-gray-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50";

/*
  One product line on the Order Details page.
  Which buttons show depends on the ITEM status (the server also sends canCancel / canReturn):

    pending                       -> Cancel
    shipped / out for delivery    -> Track Item
    delivered                     -> Track Item, Return, Rate & Review
    return requested              -> Track Item, Rate & Review
    cancelled / returned          -> no buttons
*/
function OrderItemRow({
  item,
  orderStatus,
  disabled,
  onTrack,
  onCancel,
  onReturn,
  onReview,
}) {
  const remaining = item.remainingQuantity ?? item.quantity;
  const cancelledQty = item.cancelledQuantity || 0;
  const isCancelled = item.status === "cancelled";

  const lineTotal = isCancelled
    ? item.itemTotal
    : item.remainingTotal ?? item.itemTotal;

  const canTrack = TRACKABLE_ITEM_STATUSES.includes(item.status);
  const canReview = REVIEWABLE_ITEM_STATUSES.includes(item.status);

  const variantText = [item.color, item.size ? `Size ${item.size}` : null]
    .filter(Boolean)
    .join(" | ");

  // The order badge already says "Delivered" etc., so only show the item badge when it differs
  const showItemBadge = item.status !== orderStatus;

  return (
    <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 gap-4">
        {/* IMAGE */}
        <Link
          to={item.productId ? `/products/${item.productId}` : "#"}
          className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-[#f7f7f7]"
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.name || "Product"}
              className={`h-full w-full object-cover ${
                isCancelled ? "opacity-50" : ""
              }`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
              No image
            </div>
          )}
        </Link>

        {/* TEXT + BUTTONS */}
        <div className="min-w-0">
          <Link
            to={item.productId ? `/products/${item.productId}` : "#"}
            className="block truncate text-sm font-semibold text-ink hover:underline"
          >
            {item.name}
          </Link>

          {variantText && (
            <p className="mt-0.5 text-xs text-muted">{variantText}</p>
          )}

          {showItemBadge && (
            <OrderStatusBadge status={item.status} className="mt-2" />
          )}

          {isCancelled && item.cancelReason && (
            <p className="mt-1 text-xs text-muted">
              Reason: {item.cancelReason}
            </p>
          )}

          {item.status === "return_requested" && item.returnReason && (
            <p className="mt-1 text-xs text-muted">
              Return reason: {item.returnReason}
            </p>
          )}

          {item.returnRejectReason && item.status !== "return_requested" && (
            <p className="mt-1 text-xs text-red-600">
              Return rejected: {item.returnRejectReason}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {item.canCancel && (
              <button
                type="button"
                disabled={disabled}
                onClick={onCancel}
                className={primaryBtn}
              >
                Cancel item
              </button>
            )}

            {canTrack && (
              <button
                type="button"
                disabled={disabled}
                onClick={onTrack}
                className={primaryBtn}
              >
                Track item
              </button>
            )}

            {item.canReturn && (
              <button
                type="button"
                disabled={disabled}
                onClick={onReturn}
                className={primaryBtn}
              >
                Return item
              </button>
            )}

            {canReview && (
              <button
                type="button"
                disabled={disabled}
                onClick={onReview}
                className={darkBtn}
              >
                <i className="fa-solid fa-star mr-1 text-yellow-400" />
                Rate &amp; review
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PRICE + QTY */}
      <div className="shrink-0 text-left sm:text-right">
        <p
          className={`text-sm font-bold ${
            isCancelled ? "text-gray-400 line-through" : "text-ink"
          }`}
        >
          {formatMoney(lineTotal)}
        </p>

        <p className="mt-0.5 text-xs text-muted">
          Qty: {isCancelled ? item.quantity : remaining}
        </p>

        {!isCancelled && cancelledQty > 0 && (
          <p className="mt-0.5 text-xs text-red-500">
            {cancelledQty} cancelled
          </p>
        )}
      </div>
    </div>
  );
}

export default OrderItemRow;
