import { useState } from "react";
import { Link } from "react-router-dom";

function ProductCard({ product, onAddToCart, inCart = false, onViewCart }) {
  const [liked, setLiked] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const image = product?.images?.[0];

  const price = Number(product?.price || 0);

  const discountPercent = Number(product?.discountPercent || 0);

  const discountedPrice =
    discountPercent > 0
      ? Math.round(price - (price * discountPercent) / 100)
      : price;

  const handleAddToCart = async (e) => {
    // Prevent opening product details
    e.preventDefault();
    e.stopPropagation();

    if (adding) return;

    // Already in the cart: the button takes the user there.
    if (inCart) {
      onViewCart?.();
      return;
    }

    try {
      setAdding(true);
      setError("");
      await onAddToCart?.(product);
    } catch (message) {
      setError(typeof message === "string" ? message : "Could not add to cart.");
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setLiked((previous) => !previous);
  };

  return (
    <div className="group">
      {/* PRODUCT IMAGE */}
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[#f7f7f7]">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
              No image
            </div>
          )}

          {/* DISCOUNT */}
          {discountPercent > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-[#f4511e] px-2.5 py-1 text-[11px] font-semibold text-white sm:px-3 sm:text-xs">
              {discountPercent}% OFF
            </span>
          )}

          {/* HEART */}
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-105"
          >
            <span
              className={`text-[20px] leading-none transition-colors ${
                liked ? "text-red-500" : "text-gray-700"
              }`}
            >
              {liked ? "♥" : "♡"}
            </span>
          </button>
        </div>
      </Link>

      {/* PRODUCT INFORMATION */}
      <div className="mt-3">
        {/* BRAND */}
        <p className="line-clamp-1 text-[11px] font-medium uppercase tracking-wide text-gray-500 sm:text-xs">
          {product?.brand?.name || product?.brandName || ""}
        </p>

        {/* PRODUCT NAME */}
        <Link to={`/products/${product.id}`} className="mt-1 block">
          <h3 className="line-clamp-2 min-h-[40px] text-sm font-medium leading-5 text-gray-900 transition group-hover:text-[#f4511e]">
            {product.name}
          </h3>
        </Link>

        {/* PRICE */}
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold text-gray-900 sm:text-base">
            ₹{discountedPrice.toLocaleString("en-IN")}
          </span>

          {discountPercent > 0 && (
            <span className="text-xs text-gray-400 line-through">
              ₹{price.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* ADD TO CART */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={adding}
          className={`mt-3 w-full rounded-lg px-4 py-2.5 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 sm:py-3 sm:text-sm ${
            inCart ? "bg-gray-900 hover:bg-black" : "bg-[#f4511e] hover:bg-[#e64a19]"
          }`}
        >
          {adding ? "Adding..." : inCart ? "Added to Cart ✓" : "Add to Cart"}
        </button>

        {error && (
          <p role="alert" className="mt-2 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
