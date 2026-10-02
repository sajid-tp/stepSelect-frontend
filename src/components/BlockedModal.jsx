import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { logout, clearBlocked } from '../features/user/authSlice';
import Modal from './Modals';

function BlockedModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const blocked = useSelector((state) => state.auth.blocked);

  // Both "OK" and "Close" do the same thing so a blocked user
  // can't dismiss the modal and keep using the app.
  const handleClose = () => {
    dispatch(logout()); // local only: the logout API would return 403 for a blocked user too
    dispatch(clearBlocked());
    navigate('/login', { replace: true });
  };

  return (
    <Modal
      open={blocked}
      title="Account blocked"
      message="Your account has been blocked. Please contact support for help."
      confirmText="OK"
      cancelText="Close"
      onConfirm={handleClose}
      onClose={handleClose}
      variant="danger"
    />
  );
}

export default BlockedModal;
