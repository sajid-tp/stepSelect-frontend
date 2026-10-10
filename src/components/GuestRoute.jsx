
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

function GuestRoute() {
  const isAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated
  );

  return isAuthenticated
    ? <Navigate to="/" replace />
    : <Outlet />;
}

export default GuestRoute;
