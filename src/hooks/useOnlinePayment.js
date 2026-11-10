import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  initiatePayment,
  verifyRazorpayPayment,
  reportPaymentFailure,
  retryPayment,
  openPaymentFailure,
} from "../features/user/paymentSlice";
import { getCart } from "../features/user/cartSlice";
import { getWishlistIds } from "../features/user/wishlistSlice";
import { DemoRazorpay } from "../utils/demoRazorpay";
import { loadRazorpay } from "../utils/loadRazorpay";

export default function useOnlinePayment() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);

  const goToSuccess = useCallback(
    (orderNumber) => {
      dispatch(getCart());
      dispatch(getWishlistIds());
      navigate(`/payment-success/${orderNumber}`, { replace: true });
    },
    [dispatch, navigate]
  );

  const goToFailed = useCallback(
    (orderNumber, reason) => {
      dispatch(openPaymentFailure({ orderNumber, reason }));
    },
    [dispatch]
  );

  const openGateway = useCallback(
    async (session) => {
      const { orderNumber } = session;

      try {
        if (!session.demo) await loadRazorpay();
      } catch (message) {
        const reason = typeof message === "string" ? message : "We couldn't open the payment window.";
        await dispatch(reportPaymentFailure({ orderNumber, reason })).unwrap().catch(() => {});
        goToFailed(orderNumber, reason);
        return;
      }
      const RazorpayCheckout = session.demo ? DemoRazorpay : window.Razorpay;

      await new Promise((resolve) => {
        let finished = false;
        let lastFailure = "";
        let failureReport = null;
        const reportOnce = (reason, paymentId) => {
          if (!failureReport) {
            failureReport = dispatch(reportPaymentFailure({ orderNumber, reason, paymentId }))
              .unwrap()
              .catch(() => {
              });
          }
          return failureReport;
        };

        const razorpay = new RazorpayCheckout({
          key: session.key,
          order_id: session.razorpayOrderId,
          amount: session.amount,
          currency: session.currency,
          name: "Step Select",
          description: `Order ${orderNumber}`,
          prefill: {
            name: user?.username || "",
            email: user?.email || "",
            contact: user?.phoneNumber || "",
          },
          theme: { color: "#b13600" },

          retry: { enabled: false },

          handler: async (response) => {
            finished = true;
            try {
              await dispatch(
                verifyRazorpayPayment({
                  orderNumber,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                })
              ).unwrap();
              goToSuccess(orderNumber);
            } catch (message) {
              goToFailed(
                orderNumber,
                typeof message === "string" ? message : "We couldn't verify your payment."
              );
            }
            resolve();
          },

          modal: {
            ondismiss: async () => {
              if (finished) return;
              finished = true;
              await reportOnce("Payment window closed");
              goToFailed(orderNumber, lastFailure || "You closed the payment window before paying.");
              resolve();
            },
          },
        });

        razorpay.on("payment.failed", async (response) => {
          lastFailure = response?.error?.description || "Your payment could not be completed.";
          await reportOnce(lastFailure, response?.error?.metadata?.payment_id);

          if (finished) return;
          finished = true;
          try {
            razorpay.close();
          } catch {
          }
          goToFailed(orderNumber, lastFailure);
          resolve();
        });

        razorpay.open();
      });
    },
    [dispatch, user, goToSuccess, goToFailed]
  );

  const payNow = useCallback(
    async ({ addressId, gateway }) => {
      const session = await dispatch(initiatePayment({ addressId, gateway })).unwrap();
      await openGateway(session);
    },
    [dispatch, openGateway]
  );

  const retry = useCallback(
    async ({ orderNumber, gateway }) => {
      const session = await dispatch(retryPayment({ orderNumber, gateway })).unwrap();
      if (session.alreadyPaid) {
        goToSuccess(orderNumber);
        return;
      }
      await openGateway(session);
    },
    [dispatch, openGateway, goToSuccess]
  );

  return { payNow, retry, goToSuccess, goToFailed };
}
