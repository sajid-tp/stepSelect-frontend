import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import OrderStatusBadge from "../components/OrderStatusBadge";
import OrderItemRow from "../components/OrderItemRow";
import OrderActionModal from "../components/OrderActionModal";
import TrackItemModal from "../components/TrackItemModal";
import ReviewModal from "../components/ReviewModal";
import { formatMoney } from "../components/CartItem";

import {
  cancelOrder,
  cancelOrderItem,
  clearCurrentOrder,
  downloadInvoice,
  fetchOrder,
  fetchReasons,
  returnOrder,
  returnOrderItem,
  submitReview,
} from "../features/user/orderSlice";

import {
  DEFAULT_CANCEL_REASONS,
  DEFAULT_RETURN_REASONS,
  formatDate,
  formatDateTime,
  paymentLabel,
  paymentState,
} from "../utils/orderFormat";

const sectionLabel =
  "text-[11px] font-bold uppercase tracking-wider text-gray-400";

/*
  Order Details  (/orders/:orderNumber)

  Buttons follow the status (the server also sends canCancel / canReturn flags):

    Pending                       item: Cancel item        bottom: Cancel order
    Shipped / Out for delivery    item: Track item         (cancelling is closed by the server)
    Delivered                     item: Track, Return, Rate & review
                                  bottom: Return order, Download invoice
    Cancelled                     no buttons
*/
function OrderDetails() {
  const { orderNumber } = useParams();
  const { state } = useLocation();
  const dispatch = useDispatch();

  const { current, currentStatus, currentError, reasons } = useSelector(
    (s) => s.orders
  );

  // Only use the stored order if it is the one in the URL
  const order =
    current &&
    (current.orderNumber === orderNumber || current.id === orderNumber)
      ? current
      : null;

  // modal = { type: "cancelOrder" | "cancelItem" | "returnOrder" | "returnItem" | "track" | "review", item? }
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [modalError, setModalError] = useState("");
  const [notice, setNotice] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    dispatch(clearCurrentOrder());
    dispatch(fetchOrder(orderNumber));

    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, orderNumber]);

  useEffect(() => {
    if (!reasons) dispatch(fetchReasons());
  }, [dispatch, reasons]);

  const cancelReasons = reasons?.cancelReasons || DEFAULT_CANCEL_REASONS;
  const returnReasons = reasons?.returnReasons || DEFAULT_RETURN_REASONS;

  const errorText = (message, fallback) =>
    typeof message === "string" ? message : fallback;

  const openModal = (type, item = null) => {
    setModalError("");
    setModal({ type, item });
  };

  const closeModal = () => {
    if (busy) return;
    setModal(null);
    setModalError("");
  };

  /* ---------- cancel / return ---------- */
  const handleConfirm = async ({ reason, quantity, description }) => {
    if (!order || !modal) return;

    setBusy(true);
    setModalError("");

    try {
      let result;

      switch (modal.type) {
        case "cancelOrder":
          result = await dispatch(
            cancelOrder({ orderId: order.id, reason })
          ).unwrap();
          break;

        case "cancelItem":
          result = await dispatch(
            cancelOrderItem({
              orderId: order.id,
              itemId: modal.item.id,
              quantity,
              reason,
            })
          ).unwrap();
          break;

        case "returnOrder":
          result = await dispatch(
            returnOrder({ orderId: order.id, reason, description })
          ).unwrap();
          break;

        case "returnItem":
          result = await dispatch(
            returnOrderItem({
              orderId: order.id,
              itemId: modal.item.id,
              quantity,
              reason,
              description,
            })
          ).unwrap();
          break;

        default:
          return;
      }

      setModal(null);
      setNotice({ type: "success", text: result.message });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (message) {
      setModalError(errorText(message, "Something went wrong. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  /* ---------- review ---------- */
  const handleReview = async ({ rating, comment }) => {
    if (!order || !modal?.item) return;

    setBusy(true);
    setModalError("");

    try {
      const result = await dispatch(
        submitReview({
          productId: modal.item.productId,
          orderId: order.id,
          rating,
          comment,
        })
      ).unwrap();

      setModal(null);
      setNotice({ type: "success", text: result.message });
    } catch (message) {
      setModalError(errorText(message, "We couldn't submit your review."));
    } finally {
      setBusy(false);
    }
  };

  /* ---------- invoice ---------- */
  const handleInvoice = async () => {
    if (!order || downloading) return;

    setDownloading(true);
    setNotice(null);

    try {
      await dispatch(
        downloadInvoice({ orderId: order.id, orderNumber: order.orderNumber })
      ).unwrap();
    } catch (message) {
      setNotice({
        type: "error",
        text: errorText(message, "We couldn't download the invoice."),
      });
    } finally {
      setDownloading(false);
    }
  };

  /* ---------- what to show ---------- */
  // Nothing to show yet and no error either -> still loading
  const isLoading = !order && currentStatus !== "failed";
  const backTo = state?.from || "/orders";

  const isDelivered = order?.status === "delivered";
  const isCancelled = order?.status === "cancelled";
  const inTransit =
    order?.status === "shipped" || order?.status === "out_for_delivery";

  const showCancelOrder = Boolean(order?.canCancel);
  const showReturnOrder = Boolean(order?.canReturn);
  const showInvoice = isDelivered && order?.canDownloadInvoice !== false;
  const hasBottomActions = showCancelOrder || showReturnOrder || showInvoice;

  const pricing = order?.pricing || {};
  const pay = order ? paymentState(order) : null;
  const addr = order?.shippingAddress;

  // Settings for the shared cancel / return modal
  const actionModal = (() => {
    if (!order || !modal) return null;

    switch (modal.type) {
      case "cancelOrder":
        return {
          title: "Cancel this order?",
          description:
            "Every item in this order will be cancelled and the stock goes back to the shop. If you already paid, the money is added to your wallet right away.",
          confirmText: "Cancel order",
          variant: "danger",
          reasons: cancelReasons,
        };

      case "cancelItem":
        return {
          title: "Cancel this item?",
          description: `${modal.item.name}. If you already paid, the money is added to your wallet right away.`,
          confirmText: "Cancel item",
          variant: "danger",
          reasons: cancelReasons,
          maxQuantity: modal.item.maxCancelQuantity || modal.item.remainingQuantity,
          quantityLabel: "How many pairs to cancel?",
        };

      case "returnOrder":
        return {
          title: "Return this order?",
          description:
            "Every delivered item in this order will be sent back. We'll review your request, and once it is approved the refund is added to your wallet.",
          confirmText: "Request return",
          variant: "primary",
          reasons: returnReasons,
          reasonRequired: true,
          showDescription: true,
        };

      case "returnItem":
        return {
          title: "Return this item?",
          description: `${modal.item.name}. Once the return is approved, the refund is added to your wallet.`,
          confirmText: "Request return",
          variant: "primary",
          reasons: returnReasons,
          reasonRequired: true,
          showDescription: true,
          maxQuantity: modal.item.maxReturnQuantity || modal.item.remainingQuantity,
          quantityLabel: "How many pairs to return?",
        };

      default:
        return null;
    }
  })();

  return (
    <div className="flex min-h-screen flex-col bg-[#f3f4f6]">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {/* BREADCRUMB */}
        <nav className="mb-4 text-xs uppercase tracking-wide">
          <Link to="/" className="text-muted transition hover:text-ink">
            Home
          </Link>
          <span className="mx-2 text-muted">/</span>
          <Link to={backTo} className="text-muted transition hover:text-ink">
            Orders
          </Link>
          <span className="mx-2 text-muted">/</span>
          <span className="font-semibold text-ink">#{orderNumber}</span>
        </nav>

        {/* NOTICE */}
        {notice && (
          <div
            role={notice.type === "error" ? "alert" : "status"}
            className={`mb-4 flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
              notice.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            <span>{notice.text}</span>
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
          <div className="animate-pulse rounded-2xl bg-white p-8 shadow-sm">
            <div className="h-8 w-2/3 rounded bg-gray-100" />
            <div className="mt-3 h-4 w-1/2 rounded bg-gray-100" />
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {[0, 1, 2].map((n) => (
                <div key={n} className="h-24 rounded bg-gray-100" />
              ))}
            </div>
            <div className="mt-8 h-24 rounded bg-gray-100" />
          </div>
        )}

        {/* LOAD ERROR */}
        {!isLoading && !order && currentStatus === "failed" && (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-6 text-center">
            <h2 className="text-base font-semibold text-red-700">
              We couldn't load this order
            </h2>
            <p className="mt-2 max-w-md text-sm text-red-600">{currentError}</p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => dispatch(fetchOrder(orderNumber))}
                className="rounded-lg bg-[#f4511e] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#e64a19]"
              >
                Try again
              </button>
              <Link
                to="/orders"
                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Back to orders
              </Link>
            </div>
          </div>
        )}

        {/* ORDER */}
        {order && (
          <article className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {/* HEADER */}
            <header className="flex flex-col gap-3 border-b border-line px-6 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-8">
              <div className="min-w-0">
                <h1 className="break-words text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                  Order #{order.orderNumber}
                </h1>

                <p className="mt-1.5 text-sm text-muted">
                  Placed on {formatDateTime(order.createdAt)}
                  {isDelivered && order.deliveredAt && (
                    <>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="font-medium text-green-700">
                        Delivered {formatDate(order.deliveredAt)}
                      </span>
                    </>
                  )}
                  {isCancelled && order.cancelledAt && (
                    <>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="font-medium text-red-600">
                        Cancelled {formatDate(order.cancelledAt)}
                      </span>
                    </>
                  )}
                </p>
              </div>

              <OrderStatusBadge
                status={order.status}
                className="self-start px-3 py-1 text-[11px]"
              />
            </header>

            {/* ADDRESS / PAYMENT / SUMMARY */}
            <section className="grid gap-8 border-b border-line px-6 py-6 sm:px-8 md:grid-cols-3">
              {/* shipping address */}
              <div>
                <h2 className={sectionLabel}>Shipping address</h2>
                {addr ? (
                  <address className="mt-3 text-sm not-italic leading-6 text-gray-600">
                    <p className="font-semibold text-ink">{addr.name}</p>
                    <p>{addr.detailedAddress}</p>
                    <p>
                      {addr.city}, {addr.country} - {addr.pinCode}
                    </p>
                    <p>{addr.phoneNumber}</p>
                  </address>
                ) : (
                  <p className="mt-3 text-sm text-muted">Not available</p>
                )}
              </div>

              {/* payment */}
              <div>
                <h2 className={sectionLabel}>Payment method</h2>
                <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-ink">
                  <i className="fa-regular fa-credit-card text-gray-500" />
                  {paymentLabel(order.paymentMethod)}
                </p>
                <p className={`mt-1 text-xs font-medium ${pay.cls}`}>
                  {pay.text}
                </p>
                {order.payment?.refundedAmount > 0 && (
                  <p className="mt-1 text-xs font-medium text-gray-600">
                    {formatMoney(order.payment.refundedAmount)} refunded to your{" "}
                    <Link to="/profile/wallet" className="font-semibold text-[#b13600] hover:underline">
                      wallet
                    </Link>
                  </p>
                )}
              </div>

              {/* summary */}
              <div>
                <h2 className={sectionLabel}>Order summary</h2>

                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-600">Subtotal</dt>
                    <dd className="text-ink">{formatMoney(pricing.subtotal)}</dd>
                  </div>

                  {pricing.discountTotal > 0 && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-600">Discount</dt>
                      <dd className="text-green-600">
                        − {formatMoney(pricing.discountTotal)}
                      </dd>
                    </div>
                  )}

                  {pricing.couponDiscount > 0 && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-600">
                        Coupon{order.couponCode ? ` (${order.couponCode})` : ""}
                      </dt>
                      <dd className="text-green-600">
                        − {formatMoney(pricing.couponDiscount)}
                      </dd>
                    </div>
                  )}

                  {pricing.taxTotal > 0 && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-600">Tax</dt>
                      <dd className="text-ink">{formatMoney(pricing.taxTotal)}</dd>
                    </div>
                  )}

                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-600">Shipping</dt>
                    <dd
                      className={
                        pricing.shippingFee > 0
                          ? "text-ink"
                          : "font-semibold text-green-600"
                      }
                    >
                      {pricing.shippingFee > 0
                        ? formatMoney(pricing.shippingFee)
                        : "FREE"}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4 border-t border-line pt-3">
                    <dt className="font-bold text-[#f4511e]">Grand total</dt>
                    <dd className="font-bold text-[#f4511e]">
                      {formatMoney(pricing.totalAmount)}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            {/* ITEMS */}
            <section className="px-6 py-6 sm:px-8">
              <h2 className="text-lg font-bold text-ink">Items in this order</h2>

              <div className="mt-2 divide-y divide-line">
                {(order.items || []).map((item) => (
                  <OrderItemRow
                    key={item.id}
                    item={item}
                    orderStatus={order.status}
                    disabled={busy || downloading}
                    onTrack={() => openModal("track", item)}
                    onCancel={() => openModal("cancelItem", item)}
                    onReturn={() => openModal("returnItem", item)}
                    onReview={() => openModal("review", item)}
                  />
                ))}
              </div>

              {inTransit && (
                <p className="mt-2 text-xs text-muted">
                  This order has already left our warehouse, so it can no longer
                  be cancelled. Once it's delivered you can return it if needed.
                </p>
              )}
            </section>

            {/* ORDER-LEVEL BUTTONS */}
            {hasBottomActions && (
              <footer className="flex flex-wrap items-center justify-center gap-3 border-t border-line px-6 py-6 sm:px-8">
                {showCancelOrder && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => openModal("cancelOrder")}
                    className="rounded-lg bg-red-50 px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <i className="fa-regular fa-circle-xmark mr-2" />
                    Cancel order
                  </button>
                )}

                {showReturnOrder && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => openModal("returnOrder")}
                    className="rounded-lg border border-[#b13600] px-6 py-3 text-sm font-semibold text-[#b13600] transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <i className="fa-solid fa-rotate-left mr-2" />
                    Return order
                  </button>
                )}

                {showInvoice && (
                  <button
                    type="button"
                    disabled={downloading}
                    onClick={handleInvoice}
                    className="rounded-lg bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <i className="fa-solid fa-download mr-2" />
                    {downloading ? "Preparing..." : "Download invoice"}
                  </button>
                )}
              </footer>
            )}
          </article>
        )}
      </main>

      <Footer />

      {/* MODALS (mounted only while open so their fields reset each time) */}
      {actionModal && (
        <OrderActionModal
          {...actionModal}
          busy={busy}
          error={modalError}
          onConfirm={handleConfirm}
          onClose={closeModal}
        />
      )}

      {modal?.type === "track" && order && (
        <TrackItemModal item={modal.item} order={order} onClose={closeModal} />
      )}

      {modal?.type === "review" && (
        <ReviewModal
          item={modal.item}
          busy={busy}
          error={modalError}
          onSubmit={handleReview}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default OrderDetails;
