import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { initiateTopUp, verifyTopUp } from "../features/user/walletSlice";
import { DemoRazorpay } from "../utils/demoRazorpay";
import { loadRazorpay } from "../utils/loadRazorpay";

export default function useWalletTopUp() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user);

  const topUp = useCallback(
    async (amount) => {
      const session = await dispatch(initiateTopUp(amount)).unwrap();

      if (!session.demo) await loadRazorpay();
      const RazorpayCheckout = session.demo ? DemoRazorpay : window.Razorpay;

      return new Promise((resolve, reject) => {
        let finished = false;
        let lastFailure = "";

        const razorpay = new RazorpayCheckout({
          key: session.key,
          order_id: session.razorpayOrderId,
          amount: session.amount,
          currency: session.currency,
          name: "Step Select",
          description: "Add money to wallet",
          prefill: {
            name: user?.username || "",
            email: user?.email || "",
            contact: user?.phoneNumber || "",
          },
          theme: { color: "#b13600" },

          handler: async (response) => {
            finished = true;
            try {
              const data = await dispatch(
                verifyTopUp({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                })
              ).unwrap();
              resolve(data);
            } catch (message) {
              reject(typeof message === "string" ? message : "We couldn't verify your payment.");
            }
          },

          modal: {
            ondismiss: () => {
              if (finished) return;
              finished = true;
              reject(lastFailure || "Payment was not completed, so no money was added.");
            },
          },
        });

        razorpay.on("payment.failed", (response) => {
          lastFailure = response?.error?.description || "Your payment could not be completed.";
        });

        try {
          razorpay.open();
        } catch (err) {
          reject(err?.message || "We couldn't open Razorpay.");
        }
      });
    },
    [dispatch, user]
  );

  return { topUp };
}
