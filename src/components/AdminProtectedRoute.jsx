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

  // After logout, Back/Forward can restore the old dashboard from the browser cache.
  // Re-verify the session whenever a page is restored that way.
  useEffect(() => {
    const onPageShow = (event) => {
      if (event.persisted) dispatch(checkAdminAuth());
    };

    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, [dispatch]);

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