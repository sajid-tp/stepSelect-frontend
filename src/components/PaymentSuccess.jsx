import { Link } from "react-router-dom";

import { formatMoney } from "./CartItem";
import { paymentLabel, formatDateTime } from "../utils/orderFormat";

/*
  Payment successful card.
  Props:
    payment  -> the server's payment status { orderNumber, paymentMethod, totalAmount, paymentId, paidAt, couponCode, couponDiscount }
  Shows a statement, an illustration, the payment details and two buttons:
  "View order details" and "Continue shopping".
*/

// Little drawing: a parcel with a check badge
function SuccessIllustration() {
  return (
    <svg viewBox="0 0 200 160" className="mx-auto h-36 w-44" role="img" aria-label="Payment successful">
      <ellipse cx="100" cy="146" rx="62" ry="8" fill="#f1ece8" />
      {/* confetti */}
      <circle cx="30" cy="40" r="4" fill="#f4511e" />
      <circle cx="170" cy="52" r="5" fill="#fbbf24" />
      <rect x="22" y="84" width="8" height="8" rx="2" fill="#22c55e" transform="rotate(20 26 88)" />
      <rect x="168" y="96" width="8" height="8" rx="2" fill="#b13600" transform="rotate(-15 172 100)" />
      <path d="M44 22l6 10M52 22l-6 10" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
      <path d="M150 24l8 8M158 24l-8 8" stroke="#f4511e" strokeWidth="3" strokeLinecap="round" />
      {/* box */}
      <path d="M52 66l48-20 48 20v54l-48 20-48-20z" fill="#ffddd0" stroke="#b13600" strokeWidth="3" strokeLinejoin="round" />
      <path d="M52 66l48 20 48-20" fill="none" stroke="#b13600" strokeWidth="3" strokeLinejoin="round" />
      <path d="M100 86v54" stroke="#b13600" strokeWidth="3" />
      <path d="M76 56l48 20" stroke="#b13600" strokeWidth="3" strokeLinecap="round" />
      {/* badge */}
      <circle cx="140" cy="48" r="22" fill="#16a34a" />
      <path d="M129 48l8 8 14-16" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PaymentSuccess({ payment }) {
  const {
    orderNumber,
    paymentMethod,
    totalAmount,
    paymentId,
    paidAt,
    couponCode,
    couponDiscount,
    referralDiscount,
  } = payment;

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
      <SuccessIllustration />

      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#141414]">
        Payment <span className="text-green-600">successful!</span>
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Thank you for shopping with Step Select. We received your payment of{" "}
        <span className="font-semibold text-gray-900">{formatMoney(totalAmount)}</span> and your
        order is confirmed. We'll start getting it ready right away.
      </p>

      <dl className="mt-6 space-y-3 rounded-lg bg-[#fafafa] px-5 py-4 text-left text-xs">
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">Order number</dt>
          <dd className="font-bold tracking-wide text-gray-900">{orderNumber}</dd>
        </div>

        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">Payment method</dt>
          <dd className="font-semibold text-gray-900">{paymentLabel(paymentMethod)}</dd>
        </div>

        {paymentId && (
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Transaction ID</dt>
            <dd className="break-all text-right font-semibold text-gray-900">{paymentId}</dd>
          </div>
        )}

        {paidAt && (
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Paid on</dt>
            <dd className="text-right font-semibold text-gray-900">{formatDateTime(paidAt)}</dd>
          </div>
        )}

        {referralDiscount > 0 && (
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Referral offer</dt>
            <dd className="font-semibold text-green-700">− {formatMoney(referralDiscount)}</dd>
          </div>
        )}

        {couponCode && couponDiscount > 0 && (
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Coupon ({couponCode})</dt>
            <dd className="font-semibold text-green-700">− {formatMoney(couponDiscount)}</dd>
          </div>
        )}

        <div className="flex justify-between gap-4 border-t border-gray-200 pt-3">
          <dt className="font-bold text-gray-900">Amount paid</dt>
          <dd className="text-base font-extrabold text-[#b13600]">{formatMoney(totalAmount)}</dd>
        </div>
      </dl>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Link
          to={`/orders/${orderNumber}`}
          className="flex-1 rounded-md bg-[#b13600] px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-[#8f2c00]"
        >
          View order details
        </Link>
        <Link
          to="/shop"
          className="flex-1 rounded-md border border-gray-200 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-700 transition hover:bg-gray-50"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

export default PaymentSuccess;
