import { useEffect, useState } from "react";

import { formatMoney } from "./CartItem";
import { subscribeDemoRazorpay } from "../utils/demoRazorpay";

/*
  Look-alike Razorpay checkout window for the project demo.
  Mounted once in App.jsx. It opens when utils/demoRazorpay.js asks for it, which only happens
  when the server answered with demo: true (RAZORPAY_DEMO_MODE=true and no real keys).
  No real money and no real card data: every field is pre-filled and is never sent anywhere.
*/

const TABS = [
  { id: "card", label: "Card", icon: "fa-regular fa-credit-card" },
  { id: "upi", label: "UPI", icon: "fa-solid fa-mobile-screen" },
  { id: "netbanking", label: "Netbanking", icon: "fa-solid fa-building-columns" },
];

const BANKS = ["HDFC Bank", "State Bank of India", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank"];

const inputClass =
  "mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-[#b13600]";

function Field({ label, children }) {
  return (
    <label className="block text-[11px] font-semibold text-gray-600">
      {label}
      {children}
    </label>
  );
}

function DemoRazorpayHost() {
  const [checkout, setCheckout] = useState(null); // the DemoRazorpay object that asked to open
  const [tab, setTab] = useState("card");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(""); // shown after a simulated failure

  const [card, setCard] = useState({ number: "4111 1111 1111 1111", expiry: "12/30", cvv: "123" });
  const [upi, setUpi] = useState("success@razorpay");
  const [bank, setBank] = useState(BANKS[0]);

  useEffect(
    () =>
      subscribeDemoRazorpay((instance) => {
        setCheckout(instance);
        setTab("card");
        setBusy(false);
        setMessage("");
      }),
    []
  );

  // Escape closes the window, like the real one
  useEffect(() => {
    if (!checkout) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !busy) handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!checkout) return null;

  const { options } = checkout;
  const amount = (Number(options.amount) || 0) / 100;

  const handleClose = () => {
    const current = checkout;
    setCheckout(null);
    current.dismiss();
  };

  const handlePay = () => {
    const missing =
      (tab === "card" && !(card.number.trim() && card.expiry.trim() && card.cvv.trim())) ||
      (tab === "upi" && !upi.trim());
    if (missing) {
      setMessage("Please fill in the payment details.");
      return;
    }

    setMessage("");
    setBusy(true);

    // A short pause so it feels like a real payment being processed
    setTimeout(() => {
      const current = checkout;
      setCheckout(null);
      setBusy(false);
      current.succeed();
    }, 1400);
  };

  const handleFail = () => {
    setMessage("Payment failed. This was a simulated failure for the demo.");
    checkout.fail("Payment failed (simulated in demo mode).");
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Razorpay demo checkout"
    >
      <div className="w-full max-w-[400px] overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3 bg-[#1f2a44] px-5 py-4 text-white">
          <div className="min-w-0">
            <p className="text-sm font-extrabold">{options.name || "Step Select"}</p>
            <p className="mt-0.5 truncate text-[11px] text-white/70">{options.description}</p>
          </div>

          <div className="flex shrink-0 items-start gap-3">
            <div className="text-right">
              <p className="text-base font-extrabold">{formatMoney(amount)}</p>
              <span className="mt-0.5 inline-block rounded bg-amber-400 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#1f2a44]">
                Demo
              </span>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={busy}
              aria-label="Close payment window"
              className="text-white/70 hover:text-white disabled:opacity-40"
            >
              <i className="fa-solid fa-xmark text-base" />
            </button>
          </div>
        </div>

        <p className="bg-amber-50 px-5 py-2 text-[11px] text-amber-800">
          Demo mode: no real money is charged and nothing here is sent to a bank.
        </p>

        {/* TABS */}
        <div className="flex border-b border-gray-200">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              disabled={busy}
              onClick={() => {
                setTab(t.id);
                setMessage("");
              }}
              className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 py-3 text-[11px] font-bold ${
                tab === t.id
                  ? "border-[#b13600] text-[#b13600]"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <i className={`${t.icon} text-xs`} />
              {t.label}
            </button>
          ))}
        </div>

        {/* BODY */}
        <div className="space-y-3 px-5 py-5">
          {tab === "card" && (
            <>
              <Field label="Card number">
                <input
                  className={inputClass}
                  value={card.number}
                  inputMode="numeric"
                  onChange={(e) => setCard({ ...card, number: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Expiry (MM/YY)">
                  <input
                    className={inputClass}
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                  />
                </Field>
                <Field label="CVV">
                  <input
                    className={inputClass}
                    value={card.cvv}
                    type="password"
                    onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                  />
                </Field>
              </div>
            </>
          )}

          {tab === "upi" && (
            <Field label="UPI ID">
              <input className={inputClass} value={upi} onChange={(e) => setUpi(e.target.value)} />
            </Field>
          )}

          {tab === "netbanking" && (
            <Field label="Choose your bank">
              <select className={inputClass} value={bank} onChange={(e) => setBank(e.target.value)}>
                {BANKS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </Field>
          )}

          {message && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-[11px] text-red-700">
              {message}
            </p>
          )}

          <button
            type="button"
            onClick={handlePay}
            disabled={busy}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#b13600] text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#8f2c00] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {busy ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" /> Processing…
              </>
            ) : (
              `Pay ${formatMoney(amount)}`
            )}
          </button>

          <button
            type="button"
            onClick={handleFail}
            disabled={busy}
            className="block w-full text-center text-[11px] font-semibold text-gray-500 hover:text-red-600 disabled:opacity-40"
          >
            Simulate a failed payment
          </button>
        </div>

        <p className="border-t border-gray-100 bg-gray-50 py-2.5 text-center text-[10px] text-gray-400">
          <i className="fa-solid fa-lock mr-1" />
          Razorpay checkout (demo)
        </p>
      </div>
    </div>
  );
}

export default DemoRazorpayHost;
