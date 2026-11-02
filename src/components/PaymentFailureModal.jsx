import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import PaymentFailed from "./PaymentFailed";
import useOnlinePayment from "../hooks/useOnlinePayment";
import {
  abandonPayment,
  closePaymentFailure,
  fetchPaymentStatus,
  openPaymentFailure,
  resetPayment,
} from "../features/user/paymentSlice";

/*
  The ONE payment-failure modal. Mounted once in App.jsx; the payment hook opens it (dispatch openPaymentFailure)
  after any failed attempt, from the checkout page or from Order Details.

  It always asks the server for the real state, so what it shows (attempts left, the 30 minute hold,
  the 2 minute cool-down before the final attempt, or "Payment failed" once the order is closed) can never drift.
    Retry payment / Make final attempt -> opens Razorpay again for the SAME order
    View order                         -> Order Details (a closed order stays in Order History as Payment failed)
    Cancel payment                     -> gives the held items back, then the cart opens
*/
function PaymentFailureModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { retry } = useOnlinePayment();

  const { failureModal, result, status } = useSelector((state) => state.payment);
  const { open, orderNumber, reason, error: openError } = failureModal;

  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState("");

  // Opened: load the real state of this payment from the server
  useEffect(() => {
    if (!open || !orderNumber) return;
    setRetryError(openError || "");
    dispatch(resetPayment());
    dispatch(fetchPaymentStatus(orderNumber));
  }, [dispatch, open, orderNumber, openError]);

  const current = result?.orderNumber === orderNumber ? result : null;
  const isPaid = current && ["paid", "refunded"].includes(current.paymentStatus);

  // Paid in the meantime (slow UPI, another tab): show the good news instead
  useEffect(() => {
    if (open && isPaid) {
      dispatch(closePaymentFailure());
      navigate(`/payment-success/${orderNumber}`, { replace: true });
    }
  }, [open, isPaid, orderNumber, dispatch, navigate]);

  // Escape closes the modal (the order and its attempts stay as they are)
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape" && !retrying) dispatch(closePaymentFailure());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, retrying, dispatch]);

  if (!open || !orderNumber) return null;

  const close = () => dispatch(closePaymentFailure());
  const refresh = () => dispatch(fetchPaymentStatus(orderNumber));

  const handleRetry = async () => {
    if (!current) return;
    setRetrying(true);
    setRetryError("");
    close(); // the Razorpay popup takes over; a new failure opens this modal again with fresh numbers
    try {
      await retry({ orderNumber, gateway: current.paymentMethod });
    } catch (message) {
      // The server refused (cool-down not over, no attempts left, ...): show why, with the real numbers
      dispatch(
        openPaymentFailure({
          orderNumber,
          reason,
          error: typeof message === "string" ? message : "We couldn't restart your payment.",
        })
      );
    } finally {
      setRetrying(false);
    }
  };

  const handleCancelPayment = async () => {
    setRetrying(true);
    await dispatch(abandonPayment(orderNumber)); // never blocks the redirect
    setRetrying(false);
    close();
    navigate("/cart");
  };

  const handleViewOrder = () => {
    close();
    navigate(`/orders/${orderNumber}`);
  };

  const isLoading = status === "idle" || status === "loading" || (status === "succeeded" && !current);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label="Payment failed"
    >
      <div className="relative w-full max-w-md">
        <button
          type="button"
          onClick={close}
          disabled={retrying}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
        >
          <i className="fa-solid fa-xmark" />
        </button>

        {isLoading && <div className="h-[520px] w-full animate-pulse rounded-xl bg-white" />}

        {!isLoading && status === "failed" && (
          <div className="w-full rounded-xl border border-red-100 bg-red-50 px-6 py-10 text-center">
            <h1 className="text-base font-semibold text-red-700">We couldn't load this payment</h1>
            <button
              type="button"
              onClick={refresh}
              className="mt-5 inline-block rounded-md bg-[#b13600] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#8f2c00]"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && current && !isPaid && (
          <PaymentFailed
            payment={current}
            reason={reason || current.failureReason}
            retrying={retrying}
            error={retryError}
            onRetry={handleRetry}
            onCancelPayment={handleCancelPayment}
            onViewOrder={handleViewOrder}
            onRefresh={refresh}
          />
        )}
      </div>
    </div>
  );
}

export default PaymentFailureModal;
