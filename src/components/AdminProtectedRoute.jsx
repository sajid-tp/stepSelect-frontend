import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
// Ensure this path matches the location and name of your slice file:
import { checkAdminAuth } from '../features/admin/authSlice';

const AdminProtectedRoute = () => {
  const dispatch = useDispatch();
  const { isAdmin, isCheckingAuth } = useSelector((state) => state.adminAuth);

  useEffect(() => {
    // Only check with the backend if we haven't already verified admin status
    if (!isAdmin) {
      dispatch(checkAdminAuth());
    }
  }, [dispatch, isAdmin]);

  // 1. Still waiting for the backend to respond (e.g. on direct URL load or refresh)
  if (isCheckingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Verifying admin authorization...</p>
      </div>
    );
  }

  // 2. Verified and not an admin (logged out or bad cookie) -> redirect to login
  if (!isAdmin) {
    return <Navigate to="/admin/auth/login" replace />;
  }

  // 3. Verified admin -> render protected nested routes (/admin, /admin/users, etc.)
  return <Outlet />;
};

export default AdminProtectedRoute;