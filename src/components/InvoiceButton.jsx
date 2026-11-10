import { useState } from "react";
import { useDispatch } from "react-redux";

import { downloadInvoice } from "../features/user/orderSlice";

const DEFAULT_CLASS =
  "w-full rounded-md border border-[#b13600] px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#b13600] transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50";

function InvoiceButton({ orderNumber, className = DEFAULT_CLASS, onError, disabled = false }) {
  const dispatch = useDispatch();
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    if (!orderNumber || downloading) return;

    setDownloading(true);
    setError("");

    try {
      await dispatch(downloadInvoice({ orderId: orderNumber, orderNumber })).unwrap();
    } catch (message) {
      const text =
        typeof message === "string" ? message : "We couldn't download the invoice.";
      if (onError) onError(text);
      else setError(text);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={downloading || disabled}
        onClick={handleClick}
        className={className}
      >
        <i className="fa-solid fa-download mr-2" />
        {downloading ? "Preparing..." : "Download invoice"}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </>
  );
}

export default InvoiceButton;
