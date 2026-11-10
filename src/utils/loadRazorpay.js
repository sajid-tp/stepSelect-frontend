const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

let razorpayScript = null;

export const loadRazorpay = () => {
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
