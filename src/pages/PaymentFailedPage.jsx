import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PaymentFailed from "../components/PaymentFailed";
import useOnlinePayment from "../hooks/useOnlinePayment";
import {
  fetchPaymentStatus,
  abandonPayment,
  resetPayment,
} from "../features/user/paymentSlice";

/*
  /payment-failed/:orderNumber
  Shows the PaymentFailed card with the buttons:
    Retry payment          -> pays the same order again (no need to fill checkout again)
    Change payment method  -> /checkout
    Back to cart           -> gives the held shoes back, then /cart
  The reason comes from the payment window (router state) or from what the server saved.
*/
function PaymentFailedPage() {
  const { orderNumber } = useParams();
  const { state } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { retry } = useOnlinePayment();

  const { result, status, error } = useSelector((reduxState) => reduxState.payment);

  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState("");

  useEffect(() => {
    dispatch(resetPayment());
    dispatch(fetchPaymentStatus(orderNumber));
  }, [dispatch, orderNumber]);

  const current = result?.orderNumber === orderNumber ? result : null;

  // Already paid (for example the customer paid in another tab): show the good news
  useEffect(() => {
    if (current && ["paid", "refunded"].includes(current.paymentStatus)) {
      navigate(`/payment-success/${orderNumber}`, { replace: true });
    }
  }, [current, orderNumber, navigate]);

  const handleRetry = async () => {
    setRetrying(true);
    setRetryError("");

    try {
      await retry({ orderNumber, gateway: current.paymentMethod });
      // The popup flow navigates by itself (success or failed page).
    } catch (message) {
      setRetryError(typeof message === "string" ? message : "We couldn't restart your payment.");
      dispatch(fetchPaymentStatus(orderNumber)); // the attempt may have expired meanwhile
    } finally {
      setRetrying(false);
    }
  };

  const handleBackToCart = async () => {
    setRetrying(true);
    await dispatch(abandonPayment(orderNumber)); // never blocks the redirect
    navigate("/cart");
  };

  const isLoading = status === "idle" || status === "loading" || (status === "succeeded" && !current);
  const isPaid = current && ["paid", "refunded"].includes(current.paymentStatus);

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      <Navbar />

      <main className="mx-auto flex w-full max-w-lg flex-1 items-center px-4 py-12">
        {isLoading && (
          <div className="h-[560px] w-full animate-pulse rounded-xl border border-gray-200 bg-white" />
        )}

        {!isLoading && status === "failed" && (
          <div className="w-full rounded-xl border border-red-100 bg-red-50 px-6 py-10 text-center">
            <h1 className="text-base font-semibold text-red-700">We couldn't load this payment</h1>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <Link
              to="/cart"
              className="mt-5 inline-block rounded-md bg-[#b13600] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#8f2c00]"
            >
              Back to cart
            </Link>
          </div>
        )}

        {!isLoading && current && !isPaid && (
          <PaymentFailed
            payment={current}
            reason={state?.reason || current.failureReason}
            retrying={retrying}
            error={retryError}
            onRetry={handleRetry}
            onBackToCart={handleBackToCart}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default PaymentFailedPage;
