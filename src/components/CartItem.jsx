import { Link } from "react-router-dom";

export const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getNotice = (item, maxPerItem) => {
  switch (item.issue) {
    case "UNAVAILABLE":
      return "This product is no longer available. Remove it to continue.";
    case "OUT_OF_STOCK":
      return "Out of stock. Remove it to continue.";
    case "INSUFFICIENT_STOCK":
      return `Only ${item.stock} left. Lower the quantity to continue.`;
    default:
      break;
  }

  if (item.quantity >= item.maxQuantity) {
    return item.stock < maxPerItem
      ? `Only ${item.stock} in stock.`
      : `Limit of ${maxPerItem} per item.`;
  }

  return null;
};

function CartItem({ item, maxPerItem, disabled, onIncrease, onDecrease, onRemove }) {
  const { productId, name, color, size, price, quantity, lineTotal, image, isAvailable, issue } =
    item;

  const isGone = issue === "UNAVAILABLE";
  const canDecrease = quantity > 1 && !disabled;
  const canIncrease = isAvailable && quantity < item.maxQuantity && !disabled;
  const notice = getNotice(item, maxPerItem);

  return (
    <div
      className={`flex gap-4 rounded-xl border bg-white p-4 sm:gap-5 sm:p-5 ${
        isAvailable ? "border-gray-200" : "border-amber-200 bg-amber-50/40"
      }`}
    >
      {/* IMAGE */}
      <Link
        to={productId ? `/products/${productId}` : "#"}
        className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[#f3f3f3] sm:h-28 sm:w-28"
      >
        {image ? (
          <img
            src={image}
            alt={name || "Product"}
            className={`h-full w-full object-cover ${isAvailable ? "" : "opacity-50"}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            No image
          </div>
        )}
      </Link>

      {/* DETAILS */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-gray-900 sm:text-lg">
              {name || "Unavailable product"}
            </h3>

            {!isGone && (
              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Color: {color}
                {size ? ` · Size: ${size}` : ""}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            aria-label={`Remove ${name || "item"} from cart`}
            className="shrink-0 rounded-md p-1.5 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>

        {/* PRICE + QUANTITY */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-3">
          <div>
            <p className="text-lg font-extrabold text-gray-900 sm:text-xl">
              {price === null ? "—" : formatMoney(price)}
            </p>
            {quantity > 1 && price !== null && (
              <p className="text-xs text-gray-500">
                {formatMoney(lineTotal)} for {quantity}
              </p>
            )}
          </div>

          <div
            className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50/60"
            role="group"
            aria-label="Quantity"
          >
            <button
              type="button"
              onClick={onDecrease}
              disabled={!canDecrease}
              aria-label="Decrease quantity"
              className="flex h-9 w-9 items-center justify-center text-lg text-gray-600 transition hover:text-[#f4511e] disabled:cursor-not-allowed disabled:opacity-30"
            >
              −
            </button>

            <span className="min-w-6 text-center text-sm font-semibold text-gray-900">
              {quantity}
            </span>

            <button
              type="button"
              onClick={onIncrease}
              disabled={!canIncrease}
              aria-label="Increase quantity"
              className="flex h-9 w-9 items-center justify-center text-lg text-gray-600 transition hover:text-[#f4511e] disabled:cursor-not-allowed disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>

        {notice && (
          <p
            className={`mt-2 text-xs font-medium ${
              isAvailable ? "text-gray-500" : "text-amber-700"
            }`}
          >
            {notice}
          </p>
        )}
      </div>
    </div>
  );
}

export default CartItem;
