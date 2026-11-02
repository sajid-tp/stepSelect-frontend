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

/*
  Opens the right payment screen and shows the right result.
  Used by the checkout page (pay) and by the payment-failure modal / Order Details (retry).

    Razorpay -> popup on this page -> /payment-success/:orderNumber  or  the payment-failure modal
      - real Razorpay test popup when the server has Razorpay test keys
      - look-alike demo popup (utils/demoRazorpay.js) when the server runs in demo mode (session.demo)

  Payment rules (the server enforces them, the modal shows them): the order holds its stock for 30 minutes,
  4 attempts in total, the final (4th) attempt opens only after a 2 minute cool-down.
*/

export default function useOnlinePayment() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);

  const goToSuccess = useCallback(
    (orderNumber) => {
      dispatch(getCart()); // the server emptied the cart: refresh the navbar badge
      dispatch(getWishlistIds()); // ...and took the bought pairs off the wishlist
      navigate(`/payment-success/${orderNumber}`, { replace: true });
    },
    [dispatch, navigate]
  );

  // A failed attempt: the same payment-failure modal opens on whatever page the customer is on
  const goToFailed = useCallback(
    (orderNumber, reason) => {
      dispatch(openPaymentFailure({ orderNumber, reason }));
    },
    [dispatch]
  );

  // `session` is what the server answered to initiate / retry
  const openGateway = useCallback(
    async (session) => {
      const { orderNumber } = session;

      // ---------- Razorpay popup (real, or the demo look-alike) ----------
      // The attempt is already counted on the server, so if the popup cannot even open it must be reported as failed
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
        // The one in-flight "this attempt failed" report. The popup often closes by itself right after
        // payment.failed, so BOTH paths below must wait for this same report before the failure modal opens
        let failureReport = null;
        const reportOnce = (reason, paymentId) => {
          if (!failureReport) {
            failureReport = dispatch(reportPaymentFailure({ orderNumber, reason, paymentId }))
              .unwrap()
              .catch(() => {
                /* the failure screen loads the real status anyway */
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

          // No retrying inside the popup: every failed payment comes back to our failure modal, where the
          // server shows the real "attempts left" and the cool-down before the final attempt. (Razorpay's web
          // checkout cannot limit the number of retries itself; max_count only exists in its Android / iOS SDKs.)
          retry: { enabled: false },

          // Paid: the server checks the signature before it marks the order paid
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

          // Closed without paying
          modal: {
            ondismiss: async () => {
              if (finished) return;
              finished = true;
              // WAIT for the server to count this attempt as failed: the page reloads the order as soon as
              // this promise resolves, and it must not read the old "payment in progress" state
              await reportOnce("Payment window closed");
              goToFailed(orderNumber, lastFailure || "You closed the payment window before paying.");
              resolve();
            },
          },
        });

        // A failed payment: remember the reason and tell the server which payment failed (it counts the attempts,
        // 4 at most). Retry inside the popup is switched off above, so the popup is always closed here and
        // the customer sees the failure modal (Retry button, attempts left, cool-down).
        razorpay.on("payment.failed", async (response) => {
          lastFailure = response?.error?.description || "Your payment could not be completed.";
          await reportOnce(lastFailure, response?.error?.metadata?.payment_id);

          if (finished) return; // the customer already closed the popup
          finished = true;
          try {
            razorpay.close();
          } catch {
            /* already closed */
          }
          goToFailed(orderNumber, lastFailure);
          resolve();
        });

        razorpay.open();
      });
    },
    [dispatch, user, goToSuccess, goToFailed]
  );

  // Checkout page: create the order and start paying. Rejects with the error text.
  const payNow = useCallback(
    async ({ addressId, gateway }) => {
      const session = await dispatch(initiatePayment({ addressId, gateway })).unwrap();
      await openGateway(session);
    },
    [dispatch, openGateway]
  );

  // Failure modal / Order Details: pay the SAME order again. Rejects with the error text.
  const retry = useCallback(
    async ({ orderNumber, gateway }) => {
      const session = await dispatch(retryPayment({ orderNumber, gateway })).unwrap();
      // The money had already arrived (slow UPI, closed tab): nothing to pay again
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
