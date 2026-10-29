import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Navbar from "../components/Navbar";
import AccountSidebar from "../components/AccountSideBar";
import WishlistItem from "../components/WishlistItem";
import Pagination from "../components/Pagination";
import Modal from "../components/Modals";

import {
  getWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../features/user/wishlistSlice";

import { addToCart } from "../features/user/cartSlice";

const LIMIT = 12;

const lineKey = (item) => `${item.variantId}-${item.size}`;

function Wishlist() {
  const dispatch = useDispatch();

  const { items, pagination, status, error } = useSelector(
    (state) => state.wishlist
  );

  const cartItems = useSelector((state) => state.cart.items);

  const [page, setPage] = useState(1);

  const [isBusy, setIsBusy] = useState(false);
  const [movingKey, setMovingKey] = useState(null);
  const [notice, setNotice] = useState(null);

  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    dispatch(getWishlist({ page, limit: LIMIT }));
  }, [dispatch, page]);

  // If the last item of a page is removed, go back one page.
  useEffect(() => {
    if (status === "succeeded" && items.length === 0 && page > 1) {
      setPage((p) => p - 1);
    }
  }, [status, items.length, page]);

  const refresh = () => dispatch(getWishlist({ page, limit: LIMIT }));

  const errorText = (message, fallback) =>
    typeof message === "string" ? message : fallback;

  const handleRemove = async (item) => {
    if (isBusy) return;

    setIsBusy(true);
    setNotice(null);

    try {
      await dispatch(
        removeFromWishlist({
          variantId: item.variantId,
          size: item.size,
        })
      ).unwrap();

      refresh();
    } catch (message) {
      setNotice({
        type: "error",
        text: errorText(message, "Could not remove this item."),
      });

      refresh();
    } finally {
      setIsBusy(false);
    }
  };

  const handleMoveToCart = async (item) => {
    if (isBusy) return;

    setIsBusy(true);
    setMovingKey(lineKey(item));
    setNotice(null);

    try {
      const alreadyInCart = cartItems.some(
        (line) =>
          String(line.variantId) === String(item.variantId) &&
          String(line.size) === String(item.size)
      );

      if (!alreadyInCart) {
        // The server takes this line off the wishlist when it goes into the cart,
        // and the wishlist slice drops it too (so the heart in the shop turns empty).
        await dispatch(
          addToCart({
            variantId: item.variantId,
            size: item.size,
            quantity: 1,
          })
        ).unwrap();
      } else {
        // Already in the cart: nothing was added, so remove it from the wishlist ourselves
        await dispatch(
          removeFromWishlist({
            variantId: item.variantId,
            size: item.size,
          })
        ).unwrap();
      }

      setNotice({
        type: "success",
        text: alreadyInCart
          ? "This item is already in your cart, so it was removed from the wishlist."
          : "Moved to your cart.",
      });

      refresh();
    } catch (message) {
      setNotice({
        type: "error",
        text: errorText(message, "Could not move this item to the cart."),
      });

      refresh();
    } finally {
      setMovingKey(null);
      setIsBusy(false);
    }
  };

  const handleConfirmClear = async () => {
    setClearing(true);
    setNotice(null);

    try {
      await dispatch(clearWishlist()).unwrap();
      setPage(1);
    } catch (message) {
      setNotice({
        type: "error",
        text: errorText(message, "Could not clear your wishlist."),
      });
    } finally {
      setClearing(false);
      setClearOpen(false);
    }
  };

  const isLoading = status === "idle" || status === "loading";
  const total = pagination.totalItems;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white">
      <Navbar />

      <main className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10 2xl:px-16">
        <div className="grid gap-6 lg:grid-cols-[256px_minmax(0,1fr)] lg:items-start xl:gap-8">
          {/* SIDEBAR */}
          <AccountSidebar />

          {/* CONTENT */}
          <section className="min-w-0">
            {/* BREADCRUMB */}
            <nav className="mb-4 text-xs uppercase tracking-wide md:mb-6">
              <Link
                to="/"
                className="text-muted transition hover:text-ink"
              >
                Home
              </Link>

              <span className="mx-2 text-muted">/</span>

              <Link
                to="/account"
                className="text-muted transition hover:text-ink"
              >
                Account
              </Link>

              <span className="mx-2 text-muted">/</span>

              <span className="font-semibold text-ink">
                Wishlist
              </span>
            </nav>

            <div className="flex flex-wrap items-end justify-between gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                My <span className="text-[#f4511e]">Wishlist</span>
              </h1>

              {status === "succeeded" && total > 0 && (
                <p className="text-sm text-gray-500">
                  {total} {total === 1 ? "item" : "items"}
                </p>
              )}
            </div>

            {/* NOTIFICATIONS */}
            {notice && (
              <div
                role={notice.type === "error" ? "alert" : "status"}
                className={`mt-5 flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
                  notice.type === "error"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-green-200 bg-green-50 text-green-700"
                }`}
              >
                <span>
                  {notice.text}{" "}
                  {notice.type === "success" && (
                    <Link to="/cart" className="font-semibold underline">
                      View cart
                    </Link>
                  )}
                </span>

                <button
                  type="button"
                  onClick={() => setNotice(null)}
                  className="shrink-0 font-semibold hover:underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* LOADING */}
            {isLoading && (
              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {[0, 1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="w-full max-w-[260px] animate-pulse"
                  >
                    <div className="aspect-square w-full rounded-xl bg-gray-100" />
                    <div className="mt-3 h-3 w-1/3 rounded bg-gray-100" />
                    <div className="mt-2 h-4 w-3/4 rounded bg-gray-100" />
                    <div className="mt-2 h-4 w-1/2 rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            )}

            {/* LOAD ERROR */}
            {!isLoading && status === "failed" && (
              <div className="mt-6 flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 px-6 text-center">
                <h2 className="text-base font-semibold text-red-700">
                  We couldn't load your wishlist
                </h2>

                <p className="mt-2 max-w-md text-sm text-red-600">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={refresh}
                  className="mt-5 rounded-lg bg-[#f4511e] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#e64a19]"
                >
                  Try again
                </button>
              </div>
            )}

            {/* EMPTY WISHLIST */}
            {!isLoading &&
              status === "succeeded" &&
              items.length === 0 &&
              total === 0 && (
                <div className="mt-6 flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-gray-200 px-6 text-center">
                  <span className="text-4xl text-gray-300">♡</span>

                  <h2 className="mt-3 text-lg font-semibold text-gray-900">
                    Your wishlist is empty
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Tap the heart on any pair to save it for later.
                  </p>

                  <Link
                    to="/shop"
                    className="mt-5 rounded-lg bg-[#f4511e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e64a19]"
                  >
                    Browse shoes
                  </Link>
                </div>
              )}

            {/* WISHLIST ITEMS */}
            {!isLoading && items.length > 0 && (
              <>
                <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {items.map((item) => (
                    <WishlistItem
                      key={lineKey(item)}
                      item={item}
                      disabled={isBusy}
                      moving={movingKey === lineKey(item)}
                      onRemove={() => handleRemove(item)}
                      onMoveToCart={() => handleMoveToCart(item)}
                    />
                  ))}
                </div>

                <div className="mt-10">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    totalResults={pagination.totalItems}
                    limit={pagination.limit}
                    onPageChange={(next) => {
                      setPage(next);
                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setClearOpen(true)}
                  disabled={isBusy}
                  className="mt-6 rounded-lg bg-gray-900 px-6 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear wishlist
                </button>
              </>
            )}
          </section>
        </div>
      </main>

      <Modal
        open={clearOpen}
        title="Clear wishlist"
        message="Remove every item from your wishlist?"
        confirmText="Clear wishlist"
        cancelText="Keep items"
        onConfirm={handleConfirmClear}
        onClose={() => !clearing && setClearOpen(false)}
        loading={clearing}
        variant="danger"
      />
    </div>
  );
}

export default Wishlist;