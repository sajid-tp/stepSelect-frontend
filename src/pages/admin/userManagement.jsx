import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUsers,
  toggleBlockUser,
} from "../../features/admin/userSlice";

import AdminSidebar from "../../components/AdminSideBar";
import Modal from "../../components/Modals";
import AdminPagination from "../../components/Pagination";

function Users() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);


  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [blockingUser, setBlockingUser] = useState(false);

  const dispatch = useDispatch();

  const {
    users = [],
    totalPages = 1,
    totalUsers = 0,
    status,
  } = useSelector((state) => state.adminUsers);

  // Fetch users
  useEffect(() => {
    dispatch(getUsers({ search, page}));
  }, [dispatch, search, page]);

  // Search
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
  };

  // Open confirmation modal
  const handleBlockToggle = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    if (blockingUser) return;

    setModalOpen(false);
    setSelectedUser(null);
  };

  // Confirm block/unblock
  const handleConfirmBlock = async () => {
    if (!selectedUser) return;

    try {
      setBlockingUser(true);

      await dispatch(
        toggleBlockUser(selectedUser.id)
      ).unwrap();

      setModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to change user status:", error);
    } finally {
      setBlockingUser(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#f8fafc]">

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="ml-[214px] min-h-screen p-8">

        {/* ================= HEADER ================= */}
        <div className="mb-6 flex items-start justify-between">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Team
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              User{" "}
              <span className="text-[#f4511e]">
                Database
              </span>
            </h1>
          </div>
            
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {totalUsers}
            </p>

            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Total Customers
            </p>
          </div>

        </div>

        {/* ================= SEARCH ================= */}
        <div className="mb-6 flex items-center gap-3">

          <div className="relative flex-1">

            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
              />

              <line
                x1="16.65"
                y1="16.65"
                x2="21"
                y2="21"
              />
            </svg>

            <input
              type="text"
              placeholder="Search users"
              value={search}
              onChange={handleSearchChange}
              className="w-full rounded-md border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#f4511e] focus:ring-1 focus:ring-[#f4511e]"
            />

          </div>

          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
            >
              Clear
            </button>
          )}

        </div>

        {/* ================= LOADING ================= */}
        {status === "loading" && (
          <div className="mb-4 rounded-md bg-white px-4 py-3 text-sm text-gray-500">
            Loading users...
          </div>
        )}

        {/* ================= USERS TABLE ================= */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px] text-left text-sm">

              {/* Table Header */}
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-400">

                  <th className="px-5 py-4">
                    Customer
                  </th>

                  <th className="px-5 py-4">
                    Email
                  </th>

                  <th className="px-5 py-4">
                    Joined On
                  </th>

                  <th className="px-5 py-4">
                    Orders
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4">
                    Actions
                  </th>

                </tr>
              </thead>

              {/* Table Body */}
              <tbody>

                {users.length > 0 ? (

                  users.map((user) => (

                    <tr
                      key={user.id}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                    >

                      {/* Customer */}
                      <td className="px-5 py-4">

                        <div className="font-semibold text-gray-900">
                          {user.username}
                        </div>

                      </td>

                      {/* Email */}
                      <td className="px-5 py-4 text-gray-500">
                        {user.email}
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4 text-gray-500">
                        {user.joinedOn
                          ? new Date(
                              user.joinedOn
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      {/* Orders */}
                      <td className="px-5 py-4 text-gray-700">
                        {user.orderCount ?? 0} Orders
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            user.isBlocked
                              ? "bg-red-50 text-red-600"
                              : "bg-green-50 text-green-600"
                          }`}
                        >
                          {user.isBlocked
                            ? "Blocked"
                            : "Active"}
                        </span>

                      </td>

                      {/* Action */}
                      <td className="px-5 py-4">

                        <button
                          type="button"
                          onClick={() =>
                            handleBlockToggle(user)
                          }
                          className={`rounded-md px-3 py-1.5 text-xs font-semibold text-white transition ${
                            user.isBlocked
                              ? "bg-gray-800 hover:bg-gray-700"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          {user.isBlocked
                            ? "Unblock"
                            : "Block Access"}
                        </button>

                      </td>

                    </tr>

                  ))

                ) : status !== "loading" ? (

                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-12 text-center text-sm text-gray-400"
                    >
                      No users found
                    </td>
                  </tr>

                ) : null}

              </tbody>

            </table>

          </div>

        </div>

        {/* ================= PAGINATION ================= */}
        <AdminPagination
  currentPage={page}
  totalPages={totalPages}
  totalResults={totalUsers}
  limit={10}
  onPageChange={setPage}
/>
      </main>

      {/* ================= CONFIRMATION MODAL ================= */}
      <Modal
        open={modalOpen}
        title={
          selectedUser?.isBlocked
            ? "Unblock User"
            : "Block User"
        }
        message={
          selectedUser
            ? `Are you sure you want to ${
                selectedUser.isBlocked
                  ? "unblock"
                  : "block"
              } ${selectedUser.username}?`
            : ""
        }
        confirmText={
          selectedUser?.isBlocked
            ? "Unblock User"
            : "Block User"
        }
        cancelText="Cancel"
        onConfirm={handleConfirmBlock}
        onClose={handleCloseModal}
        loading={blockingUser}
        variant={
          selectedUser?.isBlocked
            ? "primary"
            : "danger"
        }
      />

    </div>
  );
}

export default Users;