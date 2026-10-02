import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminLogout } from "../features/admin/authSlice";
import Modal from "./Modals";

const menuItems = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },

  {
    name: "Products",
    path: "/admin/products",
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M6 3h12l3 5-9 13L3 8l3-5Z" />
        <path d="M3 8h18" />
        <path d="M8 3l4 5 4-5" />
      </svg>
    ),
  },

  {
    name: "Orders",
    path: "/admin/orders",
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="9" cy="20" r="1" />
        <circle cx="19" cy="20" r="1" />
        <path d="M2 3h3l2.5 11.5a2 2 0 0 0 2 1.5h8.5a2 2 0 0 0 2-1.5L21 7H6" />
      </svg>
    ),
  },

  {
    name: "Users",
    path: "/admin/users",
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c.5-3.5 2.5-5 6-5s5.5 1.5 6 5" />
        <path d="M16 5a3 3 0 0 0 0 6" />
        <path d="M17 15c2.5.5 3.8 2 4 5" />
      </svg>
    ),
  },

  {
    name: "Categories",
    path: "/admin/categories",
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="7" cy="7" r="2.5" />
        <circle cx="17" cy="7" r="2.5" />
        <circle cx="7" cy="17" r="2.5" />
        <circle cx="17" cy="17" r="2.5" />
      </svg>
    ),
  },

  {
    name: "Brands",
    path: "/admin/brands",
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 9h10M7 13h6" />
      </svg>
    ),
  },

  {
    name: "Coupons",
    path: "/admin/coupons",
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M4 6h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4V6Z" />
        <path d="M9 9h6M9 15h6" />
      </svg>
    ),
  },

  {
    name: "Banners",
    path: "/admin/banners",
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8" cy="9" r="1.5" />
        <path d="m5 17 5-5 3 3 2-2 4 4" />
      </svg>
    ),
  },

  {
    name: "Sales Report",
    path: "/admin/sales-report",
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M4 19V5" />
        <path d="M4 19h17" />
        <path d="m7 15 4-4 3 2 5-6" />
      </svg>
    ),
  },

  {
    name: "Offers",
    path: "/admin/offers",
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M20 12 12 20l-8-8V4h8l8 8Z" />
        <circle cx="8" cy="8" r="1" />
      </svg>
    ),
  },
];

function AdminSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const adminAuth = useSelector((state) => state.adminAuth);

  // Logout modal state
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Open logout confirmation modal
  const handleLogoutClick = () => {
    setLogoutModalOpen(true);
  };

  // Close logout confirmation modal
  const handleCloseLogoutModal = () => {
    if (loggingOut) return;

    setLogoutModalOpen(false);
  };

  // Actually logout
  const handleConfirmLogout = async () => {
    try {
      setLoggingOut(true);

      await dispatch(adminLogout()).unwrap();

      // Close modal
      setLogoutModalOpen(false);

      // Go back to admin login
      navigate("/admin/auth/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Admin logout failed:", error);

      /*
       * Even if the backend logout request fails,
       * you can still send the admin back to login.
       */
      setLogoutModalOpen(false);

      navigate("/admin/auth/login", {
        replace: true,
      });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* ================= SIDEBAR ================= */}

      <aside className="fixed left-0 top-0 z-40 flex h-screen w-[214px] flex-col border-r border-[#e8e8e8] bg-white">

        {/* ================= LOGO ================= */}

        <div className="border-b border-[#eeeeee] px-6 py-5">

          <h1 className="text-[18px] font-extrabold tracking-[0.08em] text-[#f4511e]">
            STEP SELECT
          </h1>

          <p className="mt-1 text-[9px] font-medium tracking-[0.2em] text-[#555]">
            ADMIN CONSOLE
          </p>

        </div>

        {/* ================= NAVIGATION ================= */}

        <nav className="flex-1 overflow-y-auto px-2.5 py-6">

          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.name === "Dashboard"}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-3 rounded-md px-3 py-3
                text-[13px] font-medium transition-all duration-150
                ${
                  isActive
                    ? "bg-[#f4511e] text-white"
                    : "text-[#333] hover:bg-[#f7f7f7] hover:text-[#222]"
                }`
              }
            >
              {item.icon}

              <span>{item.name}</span>
            </NavLink>
          ))}

        </nav>

        {/* ================= SIGN OUT ================= */}

        <div className="border-t border-[#eeeeee] px-2.5 py-4">

          <button
            type="button"
            onClick={handleLogoutClick}
            disabled={
              adminAuth?.status === "loading" ||
              loggingOut
            }
            className="
              flex w-full items-center gap-3
              rounded-md px-3 py-3
              text-[13px] font-medium text-[#333]
              transition-all
              hover:bg-[#f7f7f7]
              hover:text-[#d32f2f]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >

            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />

              <polyline points="16 17 21 12 16 7" />

              <line
                x1="21"
                y1="12"
                x2="9"
                y2="12"
              />
            </svg>

            {loggingOut
              ? "Signing Out..."
              : "Sign Out"}

          </button>

        </div>

      </aside>

      {/* ================= LOGOUT MODAL ================= */}

      <Modal
        open={logoutModalOpen}
        title="Sign Out"
        message="Are you sure you want to sign out of the admin panel?"
        confirmText="Sign Out"
        cancelText="Cancel"
        onConfirm={handleConfirmLogout}
        onClose={handleCloseLogoutModal}
        loading={loggingOut}
        variant="danger"
      />
    </>
  );
}

export default AdminSidebar;