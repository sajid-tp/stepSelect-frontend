import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/*
  Guards every customer-only page (profile, cart, checkout, orders, wishlist...).
  No signed-in user in the Redux store -> go to /login instead of rendering the page.
  `replace` keeps the protected URL out of the history stack, so Back can't loop into it.
*/
function ProtectedRoute() {
  const isAuthenticated = useSelector((state) => Boolean(state.auth.user));
  const location = useLocation();

  return isAuthenticated
    ? <Outlet />
    : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

export default ProtectedRoute;
