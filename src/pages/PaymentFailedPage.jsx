import { useEffect } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";

import { openPaymentFailure } from "../features/user/paymentSlice";

/*
  /payment-failed/:orderNumber  (old link, kept so bookmarks and e-mails still work)
  The payment-failure modal replaced this page: it opens the modal on top of the order's details page,
  where the order can be retried, or (once it is closed) seen as "Payment failed".
*/
function PaymentFailedPage() {
  const { orderNumber } = useParams();
  const { state } = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(openPaymentFailure({ orderNumber, reason: state?.reason || "" }));
  }, [dispatch, orderNumber, state]);

  return <Navigate to={`/orders/${orderNumber}`} replace />;
}

export default PaymentFailedPage;
