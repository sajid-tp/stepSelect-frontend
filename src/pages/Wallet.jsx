import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AccountSidebar from "../components/AccountSideBar";
import Pagination from "../components/Pagination";
import AddMoneyModal from "../components/AddMoneyModal";
import { formatMoney } from "../components/CartItem";
import { formatDateTime } from "../utils/orderFormat";
import { fetchWallet, addMoney } from "../features/user/walletSlice";

/*
  /profile/wallet
  Balance card + the full history of the wallet (newest first, filter, pages).
  Money comes in from: demo top-ups, cancelled orders (at once), returns (after admin approval).
  Money goes out when an order is paid with the wallet at checkout.
*/

const PAGE_SIZE = 10;

const FILTERS = [
  { id: "", label: "All" },
  { id: "credit", label: "Money in" },
  { id: "debit", label: "Money out" },
];

// Title shown for each reason money moved
const SOURCE_TITLE = {
  ADD_MONEY: "Money added",
  ORDER_PAYMENT: "Paid for an order",
  ORDER_CANCEL_REFUND: "Refund: order cancelled",
  ORDER_RETURN_REFUND: "Refund: return approved",
  REFERRAL_REWARD: "Referral reward",
};

function TransactionRow({ tx }) {
  const isCredit = tx.type === "credit";

  return (
    <li className="flex items-center justify-between gap-4 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs ${
            isCredit ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          }`}
        >
          <i className={`fa-solid ${isCredit ? "fa-arrow-down" : "fa-arrow-up"}`} />
        </span>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {SOURCE_TITLE[tx.source] || (isCredit ? "Money in" : "Money out")}
          </p>

          <p className="mt-0.5 truncate text-[11px] text-muted">
            {tx.description}
            {tx.orderNumber && (
              <>
                {" · "}
                <Link
                  to={`/orders/${tx.orderNumber}`}
                  className="font-semibold text-[#b13600] hover:underline"
                >
                  View order
                </Link>
              </>
            )}
          </p>

          <p className="mt-0.5 text-[10px] text-gray-400">{formatDateTime(tx.createdAt)}</p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className={`text-sm font-extrabold ${isCredit ? "text-green-600" : "text-red-600"}`}>
          {isCredit ? "+" : "−"}
          {formatMoney(tx.amount)}
        </p>
        <p className="mt-0.5 text-[10px] text-gray-400">Balance {formatMoney(tx.balanceAfter)}</p>
      </div>
    </li>
  );
}

function Wallet() {
  const dispatch = useDispatch();
  const { balance, transactions, pagination, topUpEnabled, limits, status, error } = useSelector(
    (state) => state.wallet
  );

  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [modalError, setModalError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(
    () => dispatch(fetchWallet({ type: filter, page, limit: PAGE_SIZE })),
    [dispatch, filter, page]
  );

  useEffect(() => {
    load();
  }, [load]);

  // The success message goes away by itself
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const openModal = () => {
    setModalError("");
    setModalOpen(true);
  };

  const handleAdd = async (amount) => {
    setAdding(true);
    setModalError("");

    try {
      await dispatch(addMoney(amount)).unwrap();
      setModalOpen(false);
      setNotice(`${formatMoney(amount)} was added to your wallet.`);

      // Newest rows first: show page 1 of "All" so the new row is visible
      if (filter !== "" || page !== 1) {
        setFilter("");
        setPage(1);
      } else {
        load();
      }
    } catch (message) {
      setModalError(typeof message === "string" ? message : "We couldn't add money to your wallet.");
    } finally {
      setAdding(false);
    }
  };

  const isLoading = status === "idle" || (status === "loading" && transactions.length === 0);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="w-full flex-1 px-4 py-6 sm:px-8 md:py-8 lg:px-12 xl:px-16">
        <p className="mb-4 text-xs uppercase tracking-wide text-muted md:mb-6">
          Home / Account / <span className="font-semibold text-ink">My Wallet</span>
        </p>

        <div className="flex flex-col items-start gap-8 lg:flex-row xl:gap-12">
          <aside className="w-full shrink-0 lg:w-[280px]">
            <AccountSidebar />
          </aside>

          <section className="w-full min-w-0 flex-1">
            <h1 className="mb-6 text-xl font-bold sm:text-2xl">
              My <span className="text-[#f4511e]">Wallet</span>
            </h1>

            {notice && (
              <div
                role="status"
                className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
              >
                <i className="fa-regular fa-circle-check" />
                {notice}
              </div>
            )}

            {/* BALANCE */}
            <div className="flex flex-col gap-5 rounded-xl bg-[#2b2b2b] px-6 py-7 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">
                  Available balance
                </p>
                <p className="mt-2 text-3xl font-extrabold sm:text-4xl">{formatMoney(balance)}</p>
                <p className="mt-2 max-w-sm text-[11px] leading-relaxed text-white/50">
                  Refunds for cancelled and returned orders are added here. You can use this money to
                  pay at checkout.
                </p>
              </div>

              <button
                type="button"
                onClick={openModal}
                disabled={!topUpEnabled}
                title={topUpEnabled ? "" : "Adding money is switched off"}
                className="shrink-0 rounded-md bg-[#b13600] px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-[#8f2c00] disabled:cursor-not-allowed disabled:opacity-50"
              >
                + Add money
              </button>
            </div>

            {/* HISTORY */}
            <div className="mt-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink">
                  Transaction history
                </h2>

                <div className="flex gap-1.5" role="tablist" aria-label="Filter transactions">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id || "all"}
                      type="button"
                      role="tab"
                      aria-selected={filter === f.id}
                      onClick={() => {
                        setFilter(f.id);
                        setPage(1);
                      }}
                      className={`rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition ${
                        filter === f.id
                          ? "border-[#b13600] bg-[#b13600] text-white"
                          : "border-line bg-white text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-line bg-white px-5">
                {isLoading && (
                  <div className="space-y-4 py-5">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
                    ))}
                  </div>
                )}

                {!isLoading && status === "failed" && (
                  <div className="py-10 text-center">
                    <p className="text-sm font-semibold text-red-600">{error}</p>
                    <button
                      type="button"
                      onClick={load}
                      className="mt-4 rounded-md bg-[#b13600] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#8f2c00]"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {!isLoading && status !== "failed" && transactions.length === 0 && (
                  <div className="py-12 text-center">
                    <i className="fa-solid fa-wallet text-2xl text-gray-300" />
                    <p className="mt-3 text-sm font-semibold text-ink">No transactions yet</p>
                    <p className="mt-1 text-xs text-muted">
                      {filter
                        ? "Nothing matches this filter."
                        : "Add money or get a refund and it will show up here."}
                    </p>
                  </div>
                )}

                {!isLoading && transactions.length > 0 && (
                  <ul className={`divide-y divide-line ${status === "loading" ? "opacity-60" : ""}`}>
                    {transactions.map((tx) => (
                      <TransactionRow key={tx.id} tx={tx} />
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-5">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  totalResults={pagination.totalItems}
                  limit={pagination.limit}
                  onPageChange={setPage}
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      {modalOpen && (
        <AddMoneyModal
          limits={limits}
          busy={adding}
          error={modalError}
          onAdd={handleAdd}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

export default Wallet;
