import { formatDateTime } from "../utils/orderFormat";

/*
  Tracking timeline for ONE item, built from what really happened:
  the item's statusHistory (sent by the server) + the order's placed date.

  Normal flow:  Order Placed -> Shipped -> Out for Delivery -> Delivered
  Steps that have not happened yet are greyed out.
  Return / cancel events are added after the flow when they exist.
*/

const FLOW = [
  { status: "shipped", label: "Shipped" },
  { status: "out_for_delivery", label: "Out for Delivery" },
  { status: "delivered", label: "Delivered" },
];

const EXTRA = {
  return_requested: "Return Requested",
  returned: "Returned",
  return_rejected: "Return Rejected",
  cancelled: "Cancelled",
};

// first time the item reached this status
const timeOf = (history, status) =>
  (history || []).find((h) => h.status === status)?.updatedAt || null;

function buildSteps(item, order) {
  const history = item.statusHistory || [];
  const steps = [
    { label: "Order Placed", time: order.createdAt, done: true },
  ];

  const cancelled = history.some((h) => h.status === "cancelled");

  // A cancelled item never reaches the next stages, so do not show them
  if (!cancelled) {
    FLOW.forEach(({ status, label }) => {
      const time = timeOf(history, status);
      steps.push({ label, time, done: Boolean(time) });
    });
  }

  Object.entries(EXTRA).forEach(([status, label]) => {
    const entry = history.filter((h) => h.status === status).pop();
    if (entry) {
      steps.push({
        label,
        time: entry.updatedAt,
        done: true,
        note: entry.note,
      });
    }
  });

  return steps;
}

function TrackItemModal({ item, order, onClose }) {
  const steps = buildSteps(item, order);

  // the last finished step is the "current" one
  let currentIndex = -1;
  steps.forEach((s, i) => {
    if (s.done) currentIndex = i;
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="track-title"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="track-title" className="text-lg font-bold text-gray-900">
              Track item
            </h2>
            <p className="mt-1 truncate text-xs text-muted">
              {item.name}
              {item.size ? ` | Size ${item.size}` : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <ol>
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const isCurrent = index === currentIndex;

            return (
              <li key={step.label} className="relative flex gap-4 pb-6 last:pb-0">
                {/* line to the next step */}
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className={`absolute left-[11px] top-6 h-full w-0.5 ${
                      step.done && steps[index + 1].done
                        ? "bg-[#f4511e]"
                        : "bg-gray-200"
                    }`}
                  />
                )}

                {/* dot */}
                <span
                  className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] ${
                    step.done
                      ? "border-[#f4511e] bg-[#f4511e] text-white"
                      : "border-gray-200 bg-white text-transparent"
                  }`}
                >
                  <i className="fa-solid fa-check" />
                </span>

                <div className="min-w-0 pt-0.5">
                  <p
                    className={`text-sm ${
                      step.done ? "font-semibold text-ink" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                    {isCurrent && (
                      <span className="ml-2 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase text-[#f4511e]">
                        Latest
                      </span>
                    )}
                  </p>

                  <p className="mt-0.5 text-xs text-muted">
                    {step.time ? formatDateTime(step.time) : "Not yet"}
                  </p>

                  {step.note && (
                    <p className="mt-0.5 text-xs text-gray-500">{step.note}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default TrackItemModal;
