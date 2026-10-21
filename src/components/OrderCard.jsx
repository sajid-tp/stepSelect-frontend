import { Link } from "react-router-dom";

import OrderStatusBadge from "./OrderStatusBadge";
import { formatMoney } from "./CartItem";
import { formatDate } from "../utils/orderFormat";

// One row of the Order History page.
// Only "View Details" here: invoice, cancel and return all live on the details page.
function OrderCard({ order, backTo = "/orders" }) {
  const items = order.items || [];
  const first = items[0];
  const extra = Math.max(items.length - 1, 0);

  const isCancelled = order.status === "cancelled";
  const hasReturn = items.some((i) => i.status === "return_requested");

  const dateText =
    order.status === "delivered" && order.deliveredAt
      ? `Delivered ${formatDate(order.deliveredAt)}`
      : order.status === "cancelled" && order.cancelledAt
      ? `Cancelled ${formatDate(order.cancelledAt)}`
      : `Placed ${formatDate(order.createdAt)}`;

  const detailsLink = `/orders/${order.orderNumber}`;

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-line bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:gap-5">
      {/* IMAGE */}
      <Link
        to={detailsLink}
        state={{ from: backTo }}
        className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#f7f7f7]"
      >
        {first?.image ? (
          <img
            src={first.image}
            alt={first.name || "Product"}
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

      {/* DETAILS */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-extrabold uppercase tracking-tight text-ink">
          {first?.name || "Order"}
          {extra > 0 && (
            <span className="ml-2 text-[11px] font-semibold normal-case tracking-normal text-muted">
              +{extra} more {extra === 1 ? "item" : "items"}
            </span>
          )}
        </h3>

        <p className="mt-1 text-xs text-muted">
          Order #{order.orderNumber} <span className="mx-1">|</span> {dateText}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.status} />
          {hasReturn && <OrderStatusBadge status="return_requested" />}
        </div>
      </div>

      {/* PRICE + LINK */}
      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center sm:gap-2">
        <p
          className={`text-base font-extrabold ${
            isCancelled ? "text-gray-400 line-through" : "text-ink"
          }`}
        >
          {formatMoney(order.pricing?.totalAmount)}
        </p>

        <Link
          to={detailsLink}
          state={{ from: backTo }}
          className="text-[11px] font-bold uppercase tracking-wider text-[#b13600] transition hover:text-[#8f2c00]"
        >
          View details
        </Link>
      </div>
    </article>
  );
}

export default OrderCard;
