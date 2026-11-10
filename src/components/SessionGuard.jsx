import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { logout } from '../features/user/authSlice';
import { getItem } from '../utils/localStorage';

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
