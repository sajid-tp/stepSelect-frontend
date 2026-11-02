// A stand-in for window.Razorpay, used only when the server runs in demo mode (no real Razorpay keys).
// It has the same shape as the real popup (new X(options), .on(), .open()), so the payment hook
// treats both the same way. The look-alike window itself is components/DemoRazorpayHost.jsx.

let showWindow = null; // set by DemoRazorpayHost while it is mounted (called with the checkout to show, or null to hide)

export const subscribeDemoRazorpay = (fn) => {
  showWindow = fn;
  return () => {
    if (showWindow === fn) showWindow = null;
  };
};

const randomHex = (bytes = 7) =>
  Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export class DemoRazorpay {
  constructor(options) {
    this.options = options;
    this.handlers = {};
  }

  on(event, callback) {
    this.handlers[event] = callback;
  }

  open() {
    if (!showWindow) throw new Error("The demo payment window is not ready.");
    showWindow(this);
  }

  // Closed from code (like the real popup's close()): hides the window, does not call ondismiss
  close() {
    showWindow?.(null);
  }

  // Customer pressed Pay: same data the real popup hands to `handler`
  succeed() {
    return this.options.handler?.({
      razorpay_order_id: this.options.order_id,
      razorpay_payment_id: `pay_demo_${randomHex()}`,
      razorpay_signature: "demo_signature", // the server accepts this only in demo mode
    });
  }

  // Customer chose "simulate a failed payment": the window stays open, like the real one
  // Like the real popup, the event carries the id of the payment that failed (the server counts these)
  fail(description = "Payment failed (simulated in demo mode).") {
    this.handlers["payment.failed"]?.({
      error: {
        description,
        metadata: { order_id: this.options.order_id, payment_id: `pay_demo_${randomHex()}` },
      },
    });
  }

  // Window closed without paying
  dismiss() {
    this.options.modal?.ondismiss?.();
  }
}
