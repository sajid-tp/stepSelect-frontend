import { useEffect, useState } from "react";

import { formatMoney } from "./CartItem";

/*
  "Add Money" window of the wallet page.
  Demo: no real payment happens, the server adds the money straight away.

  Mount it only while it is open ({open && <AddMoneyModal ... />}), so the amount starts empty each time.

  Props
    limits       { MIN_TOP_UP, MAX_TOP_UP } from the server (null until loaded)
    busy, error  loading state + message from the server
    onAdd(amount)  called with a number when the amount looks valid
    onClose
*/

const QUICK_AMOUNTS = [500, 1000, 2000];

function AddMoneyModal({ limits, busy = false, error = "", onAdd, onClose }) {
  const [amount, setAmount] = useState("");
  const [localError, setLocalError] = useState("");

  const min = limits?.MIN_TOP_UP ?? 1;
  const max = limits?.MAX_TOP_UP ?? 50000;

  // Escape closes the window
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  // Only digits and one dot, at most 2 decimals
  const handleChange = (e) => {
    const cleaned = e.target.value.replace(/[^\d.]/g, "");
    const match = cleaned.match(/^\d*\.?\d{0,2}/);
    setAmount(match ? match[0] : "");
    setLocalError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = Number(amount);

    if (!amount || !Number.isFinite(value) || value <= 0) {
      setLocalError("Enter the amount you want to add.");
      return;
    }
    if (value < min) {
      setLocalError(`The minimum amount is ${formatMoney(min)}.`);
      return;
    }
    if (value > max) {
      setLocalError(`You can add up to ${formatMoney(max)} at a time.`);
      return;
    }

    onAdd(value);
  };

  const shownError = localError || error;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-label="Add money to wallet"
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl"
      >
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-ink">Add Money</h2>
            <p className="mt-1 text-[11px] text-muted">Top up your wallet instantly</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="text-gray-500 hover:text-ink disabled:opacity-40"
          >
            <i className="fa-solid fa-xmark text-base" />
          </button>
        </div>

        <div className="mt-5 border-t border-line pt-5">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-[10px] font-semibold text-gray-600">
              <i className="fa-solid fa-flask text-[9px]" />
              Demo top-up · no real payment
            </span>
          </div>

          {/* amount */}
          <label className="mt-6 flex items-center gap-2 rounded-lg border border-line bg-[#f7f7f7] px-4 py-4 focus-within:border-[#b13600]">
            <span className="text-lg font-bold text-ink">₹</span>
            <input
              autoFocus
              inputMode="decimal"
              value={amount}
              onChange={handleChange}
              disabled={busy}
              placeholder="Enter amount"
              aria-label="Amount in rupees"
              className="w-full bg-transparent text-lg font-bold text-ink outline-none placeholder:text-sm placeholder:font-normal placeholder:text-gray-400"
            />
          </label>

          {/* quick amounts */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {QUICK_AMOUNTS.map((value) => (
              <button
                key={value}
                type="button"
                disabled={busy}
                onClick={() => {
                  setAmount(String(value));
                  setLocalError("");
                }}
                className={`rounded-md border py-2.5 text-xs font-bold transition ${
                  Number(amount) === value
                    ? "border-[#b13600] bg-[#ffddd0] text-[#b13600]"
                    : "border-[#f1d9cf] bg-white text-ink hover:border-[#b13600]"
                }`}
              >
                ₹{value}
              </button>
            ))}
          </div>

          {shownError && (
            <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-[11px] text-red-700">
              {shownError}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#b13600] text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-[#8f2c00] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {busy ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" /> Adding…
              </>
            ) : (
              <>
                <i className="fa-solid fa-bolt" /> Add to wallet
              </>
            )}
          </button>

          <p className="mt-4 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Instant credit · Up to {formatMoney(max).replace(".00", "")} at a time
          </p>
        </div>
      </form>
    </div>
  );
}

export default AddMoneyModal;
