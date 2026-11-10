import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

function GuestRoute() {
  const isAuthenticated = useSelector((state) => Boolean(state.auth.user));

  return isAuthenticated
    ? <Navigate to="/" replace />
    : <Outlet />;
}

export default GuestRoute;
