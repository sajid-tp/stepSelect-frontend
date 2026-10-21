import { Link, useLocation, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { formatMoney } from "../components/CartItem";

/*
  Shown after POST /checkout/place-order succeeds.
  Checkout.jsx passes the order summary through router state
  ({ order: { orderNumber, totalAmount, couponCode, couponDiscount, paymentMethod } }),
  so a refresh of this page still works (history state survives) and a direct
  visit just shows the order number from the URL.
*/
function OrderSuccess() {
  const { orderNumber } = useParams();
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      <Navbar />

      <main className="mx-auto flex w-full max-w-lg flex-1 items-center px-4 py-12">
        <div className="w-full rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-2xl text-green-600">
            <i className="fa-solid fa-check" />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-[#141414]">
            Order <span className="text-[#b13600]">placed!</span>
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Thank you for shopping with Step Select. We've received your order
            and will start getting it ready.
          </p>

          <dl className="mt-6 space-y-3 rounded-lg bg-[#fafafa] px-5 py-4 text-left text-xs">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Order number</dt>
              <dd className="font-bold tracking-wide text-gray-900">{orderNumber}</dd>
            </div>

            {order && (
              <>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Payment</dt>
                  <dd className="font-semibold text-gray-900">
                    {order.paymentMethod === "COD"
                      ? "Cash on Delivery"
                      : order.paymentMethod}
                  </dd>
                </div>

                {order.couponCode && order.couponDiscount > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Coupon ({order.couponCode})</dt>
                    <dd className="font-semibold text-green-700">
                      − {formatMoney(order.couponDiscount)}
                    </dd>
                  </div>
                )}

                <div className="flex justify-between gap-4 border-t border-gray-200 pt-3">
                  <dt className="font-bold text-gray-900">Total to pay</dt>
                  <dd className="text-base font-extrabold text-[#b13600]">
                    {formatMoney(order.totalAmount)}
                  </dd>
                </div>
              </>
            )}
          </dl>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/orders"
              className="flex-1 rounded-md bg-[#b13600] px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-[#8f2c00]"
            >
              View my orders
            </Link>
            <Link
              to="/shop"
              className="flex-1 rounded-md border border-gray-200 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-700 transition hover:bg-gray-50"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default OrderSuccess;
