
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

function GuestRoute() {
  // The auth slice has no `isAuthenticated` flag (it was always undefined, so this guard
  // never redirected). A logged-in customer is the one with state.auth.user set.
  const isAuthenticated = useSelector((state) => Boolean(state.auth.user));

  return isAuthenticated
    ? <Navigate to="/" replace />
    : <Outlet />;
}

export default GuestRoute;
