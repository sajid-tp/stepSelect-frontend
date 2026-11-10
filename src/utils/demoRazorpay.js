let showWindow = null;

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

  close() {
    showWindow?.(null);
  }

  succeed() {
    return this.options.handler?.({
      razorpay_order_id: this.options.order_id,
      razorpay_payment_id: `pay_demo_${randomHex()}`,
      razorpay_signature: "demo_signature",
    });
  }

  fail(description = "Payment failed (simulated in demo mode).") {
    this.handlers["payment.failed"]?.({
      error: {
        description,
        metadata: { order_id: this.options.order_id, payment_id: `pay_demo_${randomHex()}` },
      },
    });
  }

  dismiss() {
    this.options.modal?.ondismiss?.();
  }
}
