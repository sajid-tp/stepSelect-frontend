import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/user/authSlice';
import Modal from './Modals';

export default function AccountSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth?.user);
  const profile = useSelector((state) => state.account?.profile);

  const [imgError, setImgError] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [profile?.profileImage]);

  const name = profile?.username || user?.username || 'User';
  const email = profile?.email || user?.email || '';

  const initials = (name || 'U')
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const hasValidImage = profile?.profileImage && !imgError;

  // Open logout confirmation modal
  const handleLogoutClick = () => {
    setLogoutModalOpen(true);
  };

  // Close logout confirmation modal
  const handleCloseLogoutModal = () => {
    if (loggingOut) return;

    setLogoutModalOpen(false);
  };

  // Confirm logout
  const handleConfirmLogout = async () => {
    try {
      setLoggingOut(true);

      await dispatch(logoutUser()).unwrap();

      setLogoutModalOpen(false);

      navigate('/login', {
        replace: true,
      });
    } catch (error) {
      console.error('Logout failed:', error);

      // Even if the request fails, send the user back to login
      setLogoutModalOpen(false);

      navigate('/login', {
        replace: true,
      });
    } finally {
      setLoggingOut(false);
    }
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
      isActive
        ? 'bg-[#f4511e] text-white'
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  const staticItemClass =
    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-not-allowed opacity-60 whitespace-nowrap shrink-0';

  return (
    <>
      <aside className="w-full md:w-64 shrink-0 rounded-2xl bg-[#fafafa] border border-line/60 p-4 md:p-6">

        {/* User Info Header */}
        <div className="flex flex-row md:flex-col items-center md:text-center gap-4 md:gap-0 pb-4 md:pb-6 border-b border-line">
          <div className="relative shrink-0">
            {hasValidImage ? (
              <img
                src={profile.profileImage}
                alt={name}
                onError={() => setImgError(true)}
                className="h-12 w-12 md:h-16 md:w-16 rounded-full object-cover border border-line shadow-sm"
              />
            ) : (
              <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-[#f4511e] flex items-center justify-center text-white text-sm md:text-base font-bold shadow-sm">
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0 text-left md:text-center">
            <h3 className="md:mt-3 text-sm font-bold text-ink truncate">
              {name}
            </h3>

            <p className="text-xs text-muted truncate max-w-full">
              {email}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 md:mt-6 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-1 px-1 md:mx-0 md:px-0">

          {/* Overview */}
          <NavLink
            to="/profile"
            end
            className={navItemClass}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>

            Overview
          </NavLink>

          {/* Order History */}
          <button
            type="button"
            className={staticItemClass}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
            </svg>

            Order History
          </button>

          {/* My Wallet */}
          <button
            type="button"
            className={staticItemClass}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>

            My Wallet
          </button>

          {/* Wishlist */}
          <button
            type="button"
            className={staticItemClass}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 21s-7.5-4.6-10-9.1C.5 8.6 2 5 5.5 5c2 0 3.4 1.1 4.5 2.6C11.1 6.1 12.5 5 14.5 5 18 5 19.5 8.6 18 11.9 15.5 16.4 12 21 12 21z" />
            </svg>

            Wishlist
          </button>

          {/* Addresses */}
          <NavLink
            to="/profile/addresses"
            className={navItemClass}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>

            Addresses
          </NavLink>

          {/* My Cart */}
          <button
            type="button"
            className={staticItemClass}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>

            My Cart
          </button>

          {/* Logout - Mobile */}
          <button
            type="button"
            onClick={handleLogoutClick}
            disabled={loggingOut}
            className="flex md:hidden items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-red-500 hover:text-red-700 whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>

            Logout
          </button>
        </nav>

        {/* Logout - Desktop */}
        <div className="hidden md:block mt-8 pt-4 border-t border-line">
          <button
            type="button"
            onClick={handleLogoutClick}
            disabled={loggingOut}
            className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-red-500 hover:text-red-700 w-full transition disabled:opacity-50"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>

            Logout
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <Modal
        open={logoutModalOpen}
        title="Logout"
        message="Are you sure you want to logout from your account?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleConfirmLogout}
        onClose={handleCloseLogoutModal}
        loading={loggingOut}
        variant="danger"
      />
    </>
  );
}