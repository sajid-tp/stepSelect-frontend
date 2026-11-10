export const STATUS_META = {
  pending: {
    label: "Pending",
    cls: "border-amber-200 bg-amber-50 text-amber-700",
  },
  shipped: {
    label: "Shipped",
    cls: "border-orange-200 bg-orange-50 text-[#f4511e]",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    cls: "border-blue-200 bg-blue-50 text-blue-700",
  },
  delivered: {
    label: "Delivered",
    cls: "border-green-200 bg-green-50 text-green-700",
  },
  cancelled: {
    label: "Cancelled",
    cls: "border-red-200 bg-red-50 text-red-600",
  },
  return_requested: {
    label: "Return Requested",
    cls: "border-purple-200 bg-purple-50 text-purple-700",
  },
  returned: {
    label: "Returned",
    cls: "border-gray-200 bg-gray-100 text-gray-600",
  },
  return_rejected: {
    label: "Return Rejected",
    cls: "border-red-200 bg-red-50 text-red-600",
  },
  payment_pending: {
    label: "Payment Pending",
    cls: "border-amber-200 bg-amber-50 text-amber-700",
  },
  payment_failed: {
    label: "Payment Failed",
    cls: "border-red-200 bg-red-50 text-red-600",
  },
};

export const getStatusMeta = (status) =>
  STATUS_META[status] || {
    label: status ? String(status).replace(/_/g, " ") : "Unknown",
    cls: "border-gray-200 bg-gray-100 text-gray-600",
  };

export const TRACKABLE_ITEM_STATUSES = [
  "pending",
  "shipped",
  "out_for_delivery",
  "delivered",
  "return_requested",
  "returned",
  "return_rejected",
];

export const REVIEWABLE_ITEM_STATUSES = [
  "delivered",
  "return_requested",
  "return_rejected",
];

export const DEFAULT_CANCEL_REASONS = [
  "Changed my mind",
  "Ordered by mistake",
  "Found a better price",
  "Delivery is taking too long",
  "Other",
];

export const DEFAULT_RETURN_REASONS = [
  "Wrong size",
  "Damaged product",
  "Defective product",
  "Wrong item received",
  "Quality not as expected",
  "Other",
];

export const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const date = d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${date} at ${time}`;
};

export const paymentLabel = (method) => {
  if (method === "COD") return "Cash on Delivery";
  if (method === "RAZORPAY") return "Razorpay Online";
  if (method === "WALLET") return "My Wallet";
  return method || "-";
};

export const paymentState = (order) => {
  switch (order?.paymentStatus) {
    case "paid":
      return { text: "Payment received", cls: "text-green-600" };
    case "refunded":
      return { text: "Refunded", cls: "text-gray-500" };
    case "failed":
      return { text: "Payment failed", cls: "text-red-600" };
    default:
      return {
        text:
          order?.paymentMethod === "COD"
            ? "Pay when it arrives"
            : "Payment pending",
        cls: "text-amber-600",
      };
  }
};
