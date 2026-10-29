import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  initiatePayment,
  verifyRazorpayPayment,
  reportPaymentFailure,
  retryPayment,
} from "../features/user/paymentSlice";
import { getCart } from "../features/user/cartSlice";
import { getWishlistIds } from "../features/user/wishlistSlice";
import { DemoRazorpay } from "../utils/demoRazorpay";

/*
  Opens the right payment screen and sends the customer to the right result page.
  Used by the checkout page (pay) and the payment failed page (retry).

    Razorpay -> popup on this page -> /payment-success/:orderNumber  or  /payment-failed/:orderNumber
      - real Razorpay test popup when the server has Razorpay test keys
      - look-alike demo popup (utils/demoRazorpay.js) when the server runs in demo mode (session.demo)
*/

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

let razorpayScript = null;

const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve();
  if (razorpayScript) return razorpayScript;

  razorpayScript = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.onload = resolve;
    script.onerror = () => {
      razorpayScript = null;
      reject("We couldn't load Razorpay. Check your internet connection and try again.");
    };
    document.body.appendChild(script);
  });

  return razorpayScript;
};

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

  const goToFailed = useCallback(
    (orderNumber, reason) => {
      navigate(`/payment-failed/${orderNumber}`, { replace: true, state: { reason } });
    },
    [navigate]
  );

  // `session` is what the server answered to initiate / retry
  const openGateway = useCallback(
    async (session) => {
      const { orderNumber } = session;

      // ---------- Razorpay popup (real, or the demo look-alike) ----------
      if (!session.demo) await loadRazorpay();
      const RazorpayCheckout = session.demo ? DemoRazorpay : window.Razorpay;

      await new Promise((resolve) => {
        let finished = false;
        let lastFailure = "";

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
            ondismiss: () => {
              if (finished) return;
              finished = true;
              if (!lastFailure) {
                dispatch(reportPaymentFailure({ orderNumber, reason: "Payment window closed" }));
              }
              goToFailed(orderNumber, lastFailure || "You closed the payment window before paying.");
              resolve();
            },
          },
        });

        // A failed try stays inside the popup (the customer can try another card there).
        // We only remember the reason; the failed page opens when the popup is closed.
        razorpay.on("payment.failed", (response) => {
          lastFailure = response?.error?.description || "Your payment could not be completed.";
          dispatch(reportPaymentFailure({ orderNumber, reason: lastFailure }));
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

  // Failed page: pay the SAME order again. Rejects with the error text.
  const retry = useCallback(
    async ({ orderNumber, gateway }) => {
      const session = await dispatch(retryPayment({ orderNumber, gateway })).unwrap();
      await openGateway(session);
    },
    [dispatch, openGateway]
  );

  return { payNow, retry, goToSuccess, goToFailed };
}
