import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { logout } from '../features/user/authSlice';
import { getItem } from '../utils/localStorage';

/*
  Keeps the in-memory session honest when the page comes back from somewhere
  that did not re-run our code:

  1. Back/Forward cache: the browser can restore a whole page, Redux state included,
     exactly as it was before logout ("pageshow" with event.persisted).
  2. Another tab logged out: localStorage 'user' disappears ("storage" event).

  In both cases, if localStorage no longer has a user but Redux still does, we log out
  locally. ProtectedRoute then sends the person to /login.
  Render it once inside <BrowserRouter> (see App.jsx). It shows nothing.
*/
function SessionGuard() {
  const dispatch = useDispatch();
  const hasUser = useSelector((state) => Boolean(state.auth.user));

  useEffect(() => {
    if (!hasUser) return undefined;

    const syncSession = () => {
      if (!getItem('user')) dispatch(logout());
    };

    const onPageShow = (event) => {
      if (event.persisted) syncSession();
    };

    const onStorage = (event) => {
      if (event.key === 'user' || event.key === null) syncSession();
    };

    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('storage', onStorage);
    };
  }, [dispatch, hasUser]);

  return null;
}

export default SessionGuard;
