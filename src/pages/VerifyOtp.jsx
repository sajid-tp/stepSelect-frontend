// pages/VerifyOtp.jsx
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOtp, resendOtp, verifyResetOtp } from '../features/user/authSlice';
import OtpVerificationCard from '../components/OtpCard';

function VerifyOtp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { email, type = 'signup',expiresAt : initialExpiresAt } = location.state || {};

  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt || null); 

  const handleSubmit = async (code) => {
    if (!email) {
      setError('Missing email — please restart signup or password reset.');
      return;
    }
    if (code.length !== 6) {
      setError('Enter all 6 digits.');
      return;
    }

    setError('');
    setIsVerifying(true);
    try {
      if (type === 'reset') {
        await dispatch(verifyResetOtp({ email, otp: code })).unwrap();
        navigate('/update-password', { state: { email } });
      } else {
        await dispatch(verifyOtp({ email, otp: code })).unwrap();
        navigate('/');
      }
    } catch (err) {
      setError(err || 'Invalid or expired code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {

    if (!email) {
      setError('Missing email — please restart signup or password reset.');
      return;
    }

    setError('');
    setIsResending(true);
    try {
      const result = await dispatch(resendOtp({ email, type })).unwrap();
      console.log('The result of expires at is :'.result);
      setExpiresAt(result.expiresAt);
    } catch (err) {
      setError(err || 'Could not resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f6f4]">
      <header className="border-b border-line bg-white">
        <div className="container flex h-16 items-center">
          <span className="text-[15px] font-bold tracking-wide">STEP SELECT</span>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-6">
        <OtpVerificationCard
          description="Enter the 6-digit code we sent to your email address."
          error={error}
          isVerifying={isVerifying}
          isResending={isResending}
          onSubmit={handleSubmit}
          onResend={handleResend}
          expiresAt={expiresAt}
        />
      </div>
    </div>
  );
}

export default VerifyOtp;