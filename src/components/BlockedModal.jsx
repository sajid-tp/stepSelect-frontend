import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { logout, clearBlocked } from '../features/user/authSlice';
import Modal from './Modals';

function BlockedModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const blocked = useSelector((state) => state.auth.blocked);

  const handleClose = () => {
    dispatch(logout());
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
