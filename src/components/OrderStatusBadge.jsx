import { getStatusMeta } from "../utils/orderFormat";

// Small coloured pill: Pending / Shipped / Out for Delivery / Delivered / Cancelled ...
function OrderStatusBadge({ status, className = "" }) {
  const meta = getStatusMeta(status);

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.cls} ${className}`}
    >
      {meta.label}
    </span>
  );
}

export default OrderStatusBadge;
