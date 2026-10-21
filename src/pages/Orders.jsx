import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AccountSidebar from "../components/AccountSideBar";
import OrderCard from "../components/OrderCard";
import Pagination from "../components/Pagination";

import { fetchOrders } from "../features/user/orderSlice";

const LIMIT = 5;

/*
  Order History  (/orders?page=2)
  The page number lives in the URL, so "back" from an order's details
  lands on the same page of the list.
*/
function Orders() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { list, pagination, listStatus, listError } = useSelector(
    (state) => state.orders
  );

  const page = Math.max(parseInt(searchParams.get("page"), 10) || 1, 1);

  useEffect(() => {
    dispatch(fetchOrders({ page, limit: LIMIT }));
  }, [dispatch, page]);

  // ?page=9 but only 3 pages exist -> go to the last real page
  useEffect(() => {
    if (
      listStatus === "succeeded" &&
      list.length === 0 &&
      pagination.totalPages > 0 &&
      page > pagination.totalPages
    ) {
      setSearchParams({ page: String(pagination.totalPages) }, { replace: true });
    }
  }, [listStatus, list.length, pagination.totalPages, page, setSearchParams]);

  const goToPage = (next) => {
    setSearchParams(next === 1 ? {} : { page: String(next) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isLoading = listStatus === "idle" || listStatus === "loading";
  const total = pagination.totalItems;
  const backTo = page > 1 ? `/orders?page=${page}` : "/orders";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10 2xl:px-16">
        <div className="grid gap-6 lg:grid-cols-[256px_minmax(0,1fr)] lg:items-start xl:gap-8">
          {/* SIDEBAR */}
          <AccountSidebar />

          {/* CONTENT */}
          <section className="min-w-0">
            {/* BREADCRUMB */}
            <nav className="mb-4 text-xs uppercase tracking-wide md:mb-6">
              <Link to="/" className="text-muted transition hover:text-ink">
                Home
              </Link>
              <span className="mx-2 text-muted">/</span>
              <Link
                to="/profile"
                className="text-muted transition hover:text-ink"
              >
                Account
              </Link>
              <span className="mx-2 text-muted">/</span>
              <span className="font-semibold text-ink">Orders</span>
            </nav>

            <div className="flex flex-wrap items-end justify-between gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Order <span className="text-[#f4511e]">History</span>
              </h1>

              {listStatus === "succeeded" && total > 0 && (
                <p className="text-sm text-gray-500">
                  {total} {total === 1 ? "order" : "orders"}
                </p>
              )}
            </div>

            {/* LOADING */}
            {isLoading && (
              <div className="mt-6 space-y-4">
                {[0, 1, 2].map((n) => (
                  <div
                    key={n}
                    className="flex animate-pulse items-center gap-5 rounded-xl border border-line p-4"
                  >
                    <div className="h-20 w-20 rounded-lg bg-gray-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/2 rounded bg-gray-100" />
                      <div className="h-3 w-1/3 rounded bg-gray-100" />
                      <div className="h-5 w-20 rounded-full bg-gray-100" />
                    </div>
                    <div className="h-5 w-20 rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            )}

            {/* LOAD ERROR */}
            {!isLoading && listStatus === "failed" && (
              <div className="mt-6 flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 px-6 text-center">
                <h2 className="text-base font-semibold text-red-700">
                  We couldn't load your orders
                </h2>
                <p className="mt-2 max-w-md text-sm text-red-600">
                  {listError}
                </p>
                <button
                  type="button"
                  onClick={() => dispatch(fetchOrders({ page, limit: LIMIT }))}
                  className="mt-5 rounded-lg bg-[#f4511e] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#e64a19]"
                >
                  Try again
                </button>
              </div>
            )}

            {/* EMPTY */}
            {!isLoading && listStatus === "succeeded" && total === 0 && (
              <div className="mt-6 flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-gray-200 px-6 text-center">
                <i className="fa-solid fa-box-open text-4xl text-gray-300" />
                <h2 className="mt-3 text-lg font-semibold text-gray-900">
                  No orders yet
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  When you place an order, it will show up here.
                </p>
                <Link
                  to="/shop"
                  className="mt-5 rounded-lg bg-[#f4511e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e64a19]"
                >
                  Browse shoes
                </Link>
              </div>
            )}

            {/* ORDERS */}
            {!isLoading && list.length > 0 && (
              <>
                <div className="mt-6 space-y-4">
                  {list.map((order) => (
                    <OrderCard key={order.id} order={order} backTo={backTo} />
                  ))}
                </div>

                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  totalResults={pagination.totalItems}
                  limit={pagination.limit}
                  onPageChange={goToPage}
                />
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Orders;
