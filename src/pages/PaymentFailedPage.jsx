import { useEffect } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";

import { openPaymentFailure } from "../features/user/paymentSlice";

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
