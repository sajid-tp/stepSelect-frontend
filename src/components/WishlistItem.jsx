import { Link } from "react-router-dom";

const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const getNotice = (issue) => {
  switch (issue) {
    case "UNAVAILABLE":
      return "This product is no longer available.";
    case "OUT_OF_STOCK":
      return "Out of stock in this size.";
    default:
      return null;
  }
};

function WishlistItem({ item, disabled, moving, onRemove, onMoveToCart }) {
  const {
    productId,
    name,
    brand,
    color,
    size,
    image,
    price,
    discountPercent,
    finalPrice,
    isAvailable,
    issue,
    stock,
  } = item;

  const canMove = isAvailable && issue !== "OUT_OF_STOCK" && !disabled;
  const notice = getNotice(issue);
  const link = productId ? `/products/${productId}` : "#";

  return (
    <div className="group flex w-full max-w-[260px] flex-col">
      {/* IMAGE */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#f7f7f7]">
        <Link to={link} className="block h-full w-full">
          {image ? (
            <img
              src={image}
              alt={name || "Product"}
              className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                isAvailable ? "" : "opacity-50"
              }`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
              No image
            </div>
          )}
        </Link>

        {isAvailable && discountPercent > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-[#f4511e] px-2 py-1 text-[10px] font-semibold text-white">
            {discountPercent}% OFF
          </span>
        )}

        {/* REMOVE */}
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Remove ${name || "item"} from wishlist`}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 shadow-sm transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="text-lg leading-none">♥</span>
        </button>

        {issue && (
          <span className="absolute bottom-2 left-2 rounded-full bg-gray-900/85 px-2 py-1 text-[10px] font-semibold text-white">
            {issue === "OUT_OF_STOCK" ? "Out of stock" : "Unavailable"}
          </span>
        )}
      </div>

      {/* PRODUCT INFO */}
      <div className="mt-2 flex flex-1 flex-col">
        <p className="line-clamp-1 text-[10px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs">
          {brand?.name || ""}
        </p>

        <Link to={link} className="mt-1 block">
          <h3 className="line-clamp-2 min-h-[36px] text-xs font-medium leading-[18px] text-gray-900 transition group-hover:text-[#f4511e] sm:text-sm">
            {name || "Unavailable product"}
          </h3>
        </Link>

        {isAvailable && (
          <p className="mt-1 line-clamp-1 text-[10px] text-gray-500 sm:text-xs">
            {color ? `Color: ${color}` : ""}
            {size ? ` · Size: ${size}` : ""}
          </p>
        )}

        {finalPrice !== null && (
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold text-gray-900">
              {formatMoney(finalPrice)}
            </span>

            {discountPercent > 0 && (
              <span className="text-[10px] text-gray-400 line-through sm:text-xs">
                {formatMoney(price)}
              </span>
            )}
          </div>
        )}

        {notice ? (
          <p className="mt-2 text-[10px] font-medium text-amber-700 sm:text-xs">
            {notice}
          </p>
        ) : (
          isAvailable &&
          stock > 0 &&
          stock <= 5 && (
            <p className="mt-2 text-[10px] font-medium text-amber-600 sm:text-xs">
              Only {stock} left
            </p>
          )
        )}

        {/* MOVE TO CART */}
        <div className="mt-auto pt-3">
          <button
            type="button"
            onClick={onMoveToCart}
            disabled={!canMove || moving}
            className="w-full rounded-lg bg-[#f4511e] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#e64a19] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {moving ? "Moving..." : "Move to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WishlistItem;