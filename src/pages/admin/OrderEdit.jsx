import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import AdminSidebar from "../../components/AdminSideBar";
import AdminOrderStatusBadge, {
  getAdminStatusLabel,
} from "../../components/AdminOrderStatusBadge";
import Modal from "../../components/Modals";
import { formatMoney } from "../../components/CartItem";
import {
  formatDate,
  formatDateTime,
  paymentLabel,
} from "../../utils/orderFormat";

import {
  clearAdminOrder,
  getAdminOrder,
  updateAdminOrderStatus,
} from "../../features/admin/orderSlice";

const cardClass = "rounded-xl border border-gray-200 bg-white p-6 shadow-sm";
const labelClass =
  "text-[11px] font-bold uppercase tracking-wider text-gray-400";

const PAYMENT_STATUS_TEXT = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

/*
  Edit order  (/admin/orders/:orderId)

  The whole order is read-only. The ONLY thing the admin can change is the status:
  the dropdown lists exactly what the server allows right now (order.allowedStatuses):
    forward only: Processing -> Shipped -> Out for Delivery -> Delivered
    or Cancelled any time before delivery.
  Delivered and Cancelled orders are final, so the dropdown is replaced by a note.
*/
function OrderEdit() {
  const { orderId } = useParams();
  const dispatch = useDispatch();

  const { current, currentStatus, currentError } = useSelector(
    (state) => state.adminOrders
  );

  // only use the stored order if it is the one in the URL
  const order =
    current && (current.id === orderId || current.orderNumber === orderId)
      ? current
      : null;

  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [toast, setToast] = useState(null); // { type, text }

  useEffect(() => {
    dispatch(clearAdminOrder());
    dispatch(getAdminOrder(orderId));

    return () => {
      dispatch(clearAdminOrder());
    };
  }, [dispatch, orderId]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const allowed = order?.allowedStatuses || [];
  const isFinal = Boolean(order) && allowed.length === 0;

  /* ---------------- SAVE ---------------- */
  const save = async () => {
    if (!order || !newStatus || saving) return;

    try {
      setSaving(true);
      const result = await dispatch(
        updateAdminOrderStatus({ orderId: order.id, status: newStatus })
      ).unwrap();

      setToast({ type: "success", text: result.message || "Order status updated." });
      setNewStatus("");
    } catch (err) {
      setToast({
        type: "error",
        text: typeof err === "string" ? err : "Could not update the status.",
      });
    } finally {
      setSaving(false);
      setConfirmCancel(false);
    }
  };

  const handleSaveClick = () => {
    // cancelling cannot be undone (stock goes back), so ask first
    if (newStatus === "cancelled") setConfirmCancel(true);
    else save();
  };

  const isLoading = !order && currentStatus !== "failed";
  const pricing = order?.pricing || {};
  const addr = order?.shippingAddress;

  /* ---------------- RENDER ---------------- */
  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <AdminSidebar />

      <main className="ml-[214px] min-h-screen">
        {/* HEADER */}
        <header className="border-b border-gray-200 bg-white px-12 py-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            <Link to="/admin/orders" className="transition hover:text-gray-700">
              Order Management
            </Link>
            <span className="mx-2">/</span>
            Edit
          </p>
          <h1 className="mt-1 break-words text-3xl font-extrabold tracking-tight text-[#071a33]">
            Order <span className="text-[#ff5722]">#{order?.orderNumber || orderId}</span>
          </h1>
        </header>

        <section className="px-12 py-8">
          {/* LOADING */}
          {isLoading && (
            <div className="grid animate-pulse gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="h-96 rounded-xl border border-gray-200 bg-white" />
              <div className="h-56 rounded-xl border border-gray-200 bg-white" />
            </div>
          )}

          {/* ERROR */}
          {!isLoading && !order && currentStatus === "failed" && (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 px-6 text-center">
              <h2 className="text-base font-semibold text-red-700">
                We couldn't load this order
              </h2>
              <p className="mt-2 max-w-md text-sm text-red-600">{currentError}</p>
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => dispatch(getAdminOrder(orderId))}
                  className="rounded-lg bg-[#ff5722] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#f4511e]"
                >
                  Try again
                </button>
                <Link
                  to="/admin/orders"
                  className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Back to orders
                </Link>
              </div>
            </div>
          )}

          {order && (
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              {/* ================= LEFT: READ-ONLY DETAILS ================= */}
              <div className="space-y-6">
                {/* customer + address + payment */}
                <div className={`${cardClass} grid gap-6 md:grid-cols-3`}>
                  <div>
                    <h2 className={labelClass}>Customer</h2>
                    {order.user ? (
                      <div className="mt-3 text-sm leading-6 text-gray-600">
                        <p className="font-semibold text-[#071a33]">
                          {order.user.username}
                        </p>
                        <p className="break-all">{order.user.email}</p>
                        {order.user.phoneNumber && <p>{order.user.phoneNumber}</p>}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm italic text-gray-400">
                        Deleted user
                      </p>
                    )}
                  </div>

                  <div>
                    <h2 className={labelClass}>Shipping address</h2>
                    {addr ? (
                      <address className="mt-3 text-sm not-italic leading-6 text-gray-600">
                        <p className="font-semibold text-[#071a33]">{addr.name}</p>
                        <p>{addr.detailedAddress}</p>
                        <p>
                          {addr.city}, {addr.country} - {addr.pinCode}
                        </p>
                        <p>{addr.phoneNumber}</p>
                      </address>
                    ) : (
                      <p className="mt-3 text-sm text-gray-400">Not available</p>
                    )}
                  </div>

                  <div>
                    <h2 className={labelClass}>Payment</h2>
                    <div className="mt-3 text-sm leading-6 text-gray-600">
                      <p className="font-semibold text-[#071a33]">
                        {paymentLabel(order.paymentMethod)}
                      </p>
                      <p>
                        {PAYMENT_STATUS_TEXT[order.paymentStatus] ||
                          order.paymentStatus}
                      </p>
                      <p className="text-xs text-gray-400">
                        Placed {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* items */}
                <div className={cardClass}>
                  <h2 className="text-base font-bold text-[#071a33]">
                    Items ({order.items?.length || 0})
                  </h2>

                  <div className="mt-2 divide-y divide-gray-100">
                    {(order.items || []).map((item) => {
                      const cancelled = item.status === "cancelled";
                      const qty = cancelled
                        ? item.quantity
                        : item.remainingQuantity ?? item.quantity;
                      const total = cancelled
                        ? item.itemTotal
                        : item.remainingTotal ?? item.itemTotal;

                      return (
                        <div key={item.id} className="flex items-start gap-4 py-4">
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-[#f7f7f7]">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className={`h-full w-full object-cover ${
                                  cancelled ? "opacity-50" : ""
                                }`}
                              />
                            ) : null}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#071a33]">
                              {item.name}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {[item.color, item.size ? `Size ${item.size}` : null]
                                .filter(Boolean)
                                .join(" | ")}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <AdminOrderStatusBadge
                                status={item.status}
                                className="!px-2.5 !py-0.5 !text-[11px]"
                              />
                              {item.cancelledQuantity > 0 && !cancelled && (
                                <span className="text-xs text-red-500">
                                  {item.cancelledQuantity} cancelled
                                </span>
                              )}
                              {item.status === "return_requested" && (
                                <span className="text-xs text-gray-500">
                                  {item.returnReason}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <p
                              className={`text-sm font-semibold ${
                                cancelled
                                  ? "text-gray-400 line-through"
                                  : "text-[#071a33]"
                              }`}
                            >
                              {formatMoney(total)}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500">Qty: {qty}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ================= RIGHT: STATUS + SUMMARY ================= */}
              <div className="space-y-6">
                {/* STATUS (the only editable part) */}
                <div className={cardClass}>
                  <h2 className={labelClass}>Order status</h2>

                  <div className="mt-3">
                    <AdminOrderStatusBadge status={order.status} />
                  </div>

                  {order.status === "delivered" && order.deliveredAt && (
                    <p className="mt-2 text-xs text-gray-500">
                      Delivered on {formatDate(order.deliveredAt)}
                    </p>
                  )}
                  {order.status === "cancelled" && order.cancelledAt && (
                    <p className="mt-2 text-xs text-gray-500">
                      Cancelled on {formatDate(order.cancelledAt)}
                    </p>
                  )}

                  {isFinal ? (
                    <p className="mt-5 rounded-lg bg-gray-50 px-3 py-3 text-xs leading-5 text-gray-500">
                      {order.status === "delivered"
                        ? "This order is delivered, so its status can't be changed any more."
                        : "This order is cancelled, so its status can't be changed any more."}
                    </p>
                  ) : (
                    <div className="mt-5">
                      <label
                        htmlFor="new-status"
                        className="mb-1 block text-xs font-semibold text-gray-600"
                      >
                        Change status to
                      </label>

                      <select
                        id="new-status"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        disabled={saving}
                        className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/10 disabled:opacity-60"
                      >
                        <option value="">Select new status</option>
                        {allowed.map((s) => (
                          <option key={s} value={s}>
                            {getAdminStatusLabel(s)}
                          </option>
                        ))}
                      </select>

                      {newStatus === "delivered" && (
                        <p className="mt-2 text-xs text-gray-500">
                          Marking it delivered also marks the payment as paid.
                        </p>
                      )}
                      {newStatus === "cancelled" && (
                        <p className="mt-2 text-xs text-red-500">
                          Every open item will be cancelled and its stock returned.
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={handleSaveClick}
                        disabled={!newStatus || saving}
                        className="mt-4 w-full rounded-lg bg-[#ff5722] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#f4511e] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save status"}
                      </button>
                    </div>
                  )}
                </div>

                {/* SUMMARY */}
                <div className={cardClass}>
                  <h2 className={labelClass}>Order summary</h2>

                  <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-600">Subtotal</dt>
                      <dd className="text-[#071a33]">{formatMoney(pricing.subtotal)}</dd>
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
                        <dd className="text-[#071a33]">{formatMoney(pricing.taxTotal)}</dd>
                      </div>
                    )}

                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-600">Shipping</dt>
                      <dd
                        className={
                          pricing.shippingFee > 0
                            ? "text-[#071a33]"
                            : "font-semibold text-green-600"
                        }
                      >
                        {pricing.shippingFee > 0
                          ? formatMoney(pricing.shippingFee)
                          : "FREE"}
                      </dd>
                    </div>

                    <div className="flex justify-between gap-4 border-t border-gray-100 pt-3">
                      <dt className="font-bold text-[#ff5722]">Grand total</dt>
                      <dd className="font-bold text-[#ff5722]">
                        {formatMoney(pricing.totalAmount)}
                      </dd>
                    </div>
                  </dl>
                </div>

                <Link
                  to="/admin/orders"
                  className="block text-center text-sm font-medium text-gray-500 transition hover:text-gray-800"
                >
                  ← Back to orders
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* CANCEL CONFIRMATION */}
      <Modal
        open={confirmCancel}
        title="Cancel this order?"
        message="Every item that hasn't been delivered will be cancelled and its stock returned to the shop. This can't be undone."
        confirmText="Cancel order"
        cancelText="Go back"
        variant="danger"
        loading={saving}
        onConfirm={save}
        onClose={() => {
          if (!saving) setConfirmCancel(false);
        }}
      />

      {/* TOAST */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-[110] max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg ${
            toast.type === "error"
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}

export default OrderEdit;
