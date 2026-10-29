import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PaymentSuccess from "../components/PaymentSuccess";
import { fetchPaymentStatus, resetPayment } from "../features/user/paymentSlice";

/*
  /payment-success/:orderNumber
  Asks the server for the real payment status (never trusts the URL), then shows the
  PaymentSuccess card. An order that is not paid is sent to the failed page instead.
*/
function PaymentSuccessPage() {
  const { orderNumber } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { result, status, error } = useSelector((state) => state.payment);

  useEffect(() => {
    dispatch(resetPayment());
    dispatch(fetchPaymentStatus(orderNumber));
  }, [dispatch, orderNumber]);

  const isPaid =
    result?.orderNumber === orderNumber &&
    ["paid", "refunded"].includes(result.paymentStatus);

  // Not paid (yet): the right place for this order is the failed page
  useEffect(() => {
    if (status === "succeeded" && result?.orderNumber === orderNumber && !isPaid) {
      navigate(`/payment-failed/${orderNumber}`, { replace: true });
    }
  }, [status, result, orderNumber, isPaid, navigate]);

  const isLoading = status === "idle" || status === "loading" || (status === "succeeded" && !isPaid);

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      <Navbar />

      <main className="mx-auto flex w-full max-w-lg flex-1 items-center px-4 py-12">
        {isLoading && (
          <div className="h-[520px] w-full animate-pulse rounded-xl border border-gray-200 bg-white" />
        )}

        {!isLoading && status === "failed" && (
          <div className="w-full rounded-xl border border-red-100 bg-red-50 px-6 py-10 text-center">
            <h1 className="text-base font-semibold text-red-700">We couldn't load this payment</h1>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <Link
              to="/orders"
              className="mt-5 inline-block rounded-md bg-[#b13600] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#8f2c00]"
            >
              View my orders
            </Link>
          </div>
        )}

        {!isLoading && isPaid && <PaymentSuccess payment={result} />}
      </main>

      <Footer />
    </div>
  );
}

export default PaymentSuccessPage;
