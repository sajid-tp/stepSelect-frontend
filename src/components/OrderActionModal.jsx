import { useState } from "react";

/*
  One modal for all four actions: cancel order, cancel item, return order, return item.
  The page decides what to show through props, so this file has no order logic.

  Mount it only while it is open ({open && <OrderActionModal ... />}),
  that way its fields start empty every time.

  Props
    title, description, confirmText, variant ("danger" | "primary")
    reasons          list of reason strings for the dropdown
    reasonRequired   true for returns, false for cancels
    maxQuantity      shows a quantity dropdown (1..max) when set
    quantityLabel
    showDescription  shows the optional "tell us more" box (returns)
    busy, error      loading state + message from the server
    onConfirm({ reason, quantity, description })
    onClose
*/
function OrderActionModal({
  title,
  description,
  confirmText = "Confirm",
  variant = "danger",
  reasons = [],
  reasonRequired = false,
  maxQuantity = null,
  quantityLabel = "Quantity",
  showDescription = false,
  busy = false,
  error = "",
  onConfirm,
  onClose,
}) {
  const [reason, setReason] = useState("");
  const [quantity, setQuantity] = useState(maxQuantity || 1);
  const [note, setNote] = useState("");
  const [localError, setLocalError] = useState("");

  const confirmStyles = {
    danger: "bg-red-600 hover:bg-red-700",
    primary: "bg-[#b13600] hover:bg-[#8f2c00]",
  };

  const handleConfirm = () => {
    if (reasonRequired && !reason) {
      setLocalError("Please choose a reason.");
      return;
    }

    setLocalError("");
    onConfirm({
      reason,
      quantity: maxQuantity ? Number(quantity) : undefined,
      description: note.trim(),
    });
  };

  const shownError = localError || error;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-action-title"
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <h2
            id="order-action-title"
            className="text-lg font-bold text-gray-900"
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {description && (
          <p className="mb-4 text-sm leading-6 text-gray-500">{description}</p>
        )}

        <div className="space-y-4">
          {/* QUANTITY */}
          {maxQuantity && (
            <div>
              <label
                htmlFor="order-action-qty"
                className="mb-1 block text-xs font-semibold text-gray-700"
              >
                {quantityLabel}
              </label>
              <select
                id="order-action-qty"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={busy}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#f4511e]"
              >
                {Array.from({ length: maxQuantity }, (_, i) => i + 1).map(
                  (n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  )
                )}
              </select>
            </div>
          )}

          {/* REASON */}
          <div>
            <label
              htmlFor="order-action-reason"
              className="mb-1 block text-xs font-semibold text-gray-700"
            >
              Reason {reasonRequired ? "*" : "(optional)"}
            </label>
            <select
              id="order-action-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setLocalError("");
              }}
              disabled={busy}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#f4511e]"
            >
              <option value="">
                {reasonRequired ? "Select a reason" : "No reason"}
              </option>
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* DESCRIPTION */}
          {showDescription && (
            <div>
              <label
                htmlFor="order-action-note"
                className="mb-1 block text-xs font-semibold text-gray-700"
              >
                Tell us more (optional)
              </label>
              <textarea
                id="order-action-note"
                rows={3}
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={busy}
                className="w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#f4511e]"
              />
              <p className="mt-1 text-right text-[11px] text-gray-400">
                {note.length}/500
              </p>
            </div>
          )}
        </div>

        {shownError && (
          <p
            role="alert"
            className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
          >
            {shownError}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Go back
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className={`rounded-md px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
              confirmStyles[variant] || confirmStyles.danger
            }`}
          >
            {busy ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderActionModal;
