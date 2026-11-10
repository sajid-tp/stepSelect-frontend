import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { checkAdminAuth } from '../features/admin/authSlice';

const AdminProtectedRoute = () => {
  const dispatch = useDispatch();
  const { isAdmin, isCheckingAuth } = useSelector((state) => state.adminAuth);

  useEffect(() => {
    if (!isAdmin) {
      dispatch(checkAdminAuth());
    }
  }, [dispatch, isAdmin]);

  if (isCheckingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Verifying admin authorization...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/auth/login" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;