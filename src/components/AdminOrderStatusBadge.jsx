/*
  Status pill for the admin side.
  The database value "pending" is shown as "Processing" (that is the word in the design).
  Also knows the item-only statuses (return requested / returned ...).
*/
export const ADMIN_STATUS_META = {
  pending: { label: "Processing", cls: "bg-blue-50 text-blue-600" },
  shipped: { label: "Shipped", cls: "bg-purple-50 text-purple-600" },
  out_for_delivery: {
    label: "Out for Delivery",
    cls: "bg-amber-50 text-amber-700",
  },
  delivered: { label: "Delivered", cls: "bg-green-50 text-green-700" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-600" },
  return_requested: {
    label: "Return Requested",
    cls: "bg-orange-50 text-orange-700",
  },
  returned: { label: "Returned", cls: "bg-gray-100 text-gray-600" },
  return_rejected: { label: "Return Rejected", cls: "bg-red-50 text-red-600" },
};

export const getAdminStatusLabel = (status) =>
  ADMIN_STATUS_META[status]?.label ||
  (status ? String(status).replace(/_/g, " ") : "Unknown");

function AdminOrderStatusBadge({ status, className = "" }) {
  const meta = ADMIN_STATUS_META[status] || {
    label: getAdminStatusLabel(status),
    cls: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${meta.cls} ${className}`}
    >
      {meta.label}
    </span>
  );
}

export default AdminOrderStatusBadge;
