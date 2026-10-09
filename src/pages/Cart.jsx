import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Navbar from "../components/Navbar";
import AccountSidebar from "../components/AccountSideBar";
import CartItem from "../components/CartItem";
import OrderSummary from "../components/OrderSummary";
import Modal from "../components/Modals";

import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../features/user/cartSlice";

const lineKey = (item) => `${item.variantId}-${item.size}`;

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, totalPrice, status, error, maxQuantityPerItem } = useSelector(
    (state) => state.cart
  );

  // Only one cart action runs at a time, so rapid clicks can't race each other.
  const [isBusy, setIsBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  const runAction = async (action) => {
    if (isBusy) return;

    setIsBusy(true);
    setActionError("");

    try {
      await dispatch(action).unwrap();
    } catch (message) {
      setActionError(
        typeof message === "string" ? message : "Something went wrong. Please try again."
      );
      // Stock or availability probably changed: re-sync with the server.
      dispatch(getCart());
    } finally {
      setIsBusy(false);
    }
  };

  const handleQuantity = (item, quantity) =>
    runAction(updateCartItem({ variantId: item.variantId, size: item.size, quantity }));

  const handleRemove = (item) =>
    runAction(removeCartItem({ variantId: item.variantId, size: item.size }));

  const handleConfirmClear = async () => {
    setClearing(true);
    setActionError("");

    try {
      await dispatch(clearCart()).unwrap();
    } catch (message) {
      setActionError(
        typeof message === "string" ? message : "Could not clear your cart."
      );
    } finally {
      setClearing(false);
      setClearOpen(false);
    }
  };

  // ---------- derived ----------
  const availableItems = items.filter((item) => item.isAvailable);
  const unavailableCount = items.length - availableItems.length;
  const availableUnits = availableItems.reduce((sum, item) => sum + item.quantity, 0);

  const canCheckout = availableItems.length > 0 && unavailableCount === 0 && !isBusy;

  const isLoading = status === "idle" || status === "loading";

  // ---------- render ----------
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white">
      <Navbar />

      <main className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10 2xl:px-16">
        <div className="grid gap-6 lg:grid-cols-[256px_minmax(0,1fr)] lg:items-start xl:grid-cols-[256px_minmax(0,1fr)_320px] xl:gap-8">
          {/* SIDEBAR */}
          <div className="lg:row-span-2 xl:row-span-1">
            <AccountSidebar />
          </div>

          {/* CART ITEMS */}
          <section className="min-w-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Shopping <span className="text-[#f4511e]">Cart</span>
            </h1>

            {actionError && (
              <div
                role="alert"
                className="mt-5 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <span>{actionError}</span>
                <button
                  type="button"
                  onClick={() => setActionError("")}
                  className="shrink-0 font-semibold hover:underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* LOADING */}
            {isLoading && (
              <div className="mt-6 space-y-4">
                {[0, 1].map((n) => (
                  <div
                    key={n}
                    className="flex animate-pulse gap-5 rounded-xl border border-gray-200 p-5"
                  >
                    <div className="h-28 w-28 rounded-lg bg-gray-100" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-2/3 rounded bg-gray-100" />
                      <div className="h-4 w-1/3 rounded bg-gray-100" />
                      <div className="h-6 w-24 rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LOAD ERROR */}
            {!isLoading && status === "failed" && (
              <div className="mt-6 flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 px-6 text-center">
                <h2 className="text-base font-semibold text-red-700">
                  We couldn't load your cart
                </h2>
                <p className="mt-2 max-w-md text-sm text-red-600">{error}</p>
                <button
                  type="button"
                  onClick={() => dispatch(getCart())}
                  className="mt-5 rounded-lg bg-[#f4511e] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#e64a19]"
                >
                  Try again
                </button>
              </div>
            )}

            {/* EMPTY */}
            {!isLoading && status === "succeeded" && items.length === 0 && (
              <div className="mt-6 flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-gray-200 px-6 text-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Your cart is empty
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Pick a pair and it will show up here.
                </p>
                <Link
                  to="/shop"
                  className="mt-5 rounded-lg bg-[#f4511e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e64a19]"
                >
                  Browse shoes
                </Link>
              </div>
            )}

            {/* ITEMS */}
            {!isLoading && items.length > 0 && (
              <>
                <div className="mt-6 space-y-4">
                  {items.map((item) => (
                    <CartItem
                      key={lineKey(item)}
                      item={item}
                      maxPerItem={maxQuantityPerItem}
                      disabled={isBusy}
                      onIncrease={() => handleQuantity(item, item.quantity + 1)}
                      onDecrease={() => handleQuantity(item, item.quantity - 1)}
                      onRemove={() => handleRemove(item)}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setClearOpen(true)}
                  disabled={isBusy}
                  className="mt-6 rounded-lg bg-gray-900 px-6 py-3.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear cart
                </button>
              </>
            )}
          </section>

          {/* ORDER SUMMARY */}
          {!isLoading && items.length > 0 && (
            <div className="lg:col-start-2 xl:col-start-3 xl:sticky xl:top-6">
              <OrderSummary
                itemCount={availableUnits}
                subtotal={totalPrice}
                unavailableCount={unavailableCount}
                canCheckout={canCheckout}
                onCheckout={() => navigate("/checkout")}
              />
            </div>
          )}
        </div>
      </main>

      <Modal
        open={clearOpen}
        title="Clear cart"
        message="Remove every item from your cart?"
        confirmText="Clear cart"
        cancelText="Keep items"
        onConfirm={handleConfirmClear}
        onClose={() => !clearing && setClearOpen(false)}
        loading={clearing}
        variant="danger"
      />
    </div>
  );
}

export default Cart;
