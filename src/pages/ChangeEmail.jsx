import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FormField from '../components/FormField';
import { requestEmailChange, confirmEmailChange, resetEmailChange } from '../features/user/accountSlice';

function ChangeEmail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const emailChangeStatus = useSelector((state) => state.account?.emailChangeStatus);
  const emailChangeError = useSelector((state) => state.account?.emailChangeError);

  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState('');

  // 'otpSent' means step 1 succeeded — show the OTP form.
  // Anything else (idle/requesting/failed before a send) stays on step 1.
  const otpStep = emailChangeStatus === 'otpSent' || emailChangeStatus === 'confirming';

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLocalError('');

    const trimmedEmail = newEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setLocalError('Please enter a valid email address');
      return;
    }

    try {
      await dispatch(requestEmailChange({ newEmail: trimmedEmail })).unwrap();
    } catch (err) {
      // emailChangeError in the store already holds this, but keeping a
      // local copy means the message doesn't vanish if the user navigates
      // back to step 1 and the store gets reset elsewhere.
      setLocalError(err || 'Failed to send verification code');
    }
  };

  const handleConfirmOtp = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!otp.trim()) {
      setLocalError('Please enter the code sent to your new email');
      return;
    }

    try {
      await dispatch(confirmEmailChange({ otp: otp.trim() })).unwrap();
      navigate('/profile/edit');
    } catch (err) {
      setLocalError(err || 'Invalid or expired code');
    }
  };

  const handleBackToStepOne = () => {
    dispatch(resetEmailChange());
    setOtp('');
    setLocalError('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfb]">
      <Navbar />

      <main className="container flex-1 py-10 max-w-xl mx-auto">
        <p className="text-xs text-muted mb-6 tracking-wide uppercase">
          Home / Account / Edit Profile /{' '}
          <span className="font-semibold text-ink">Change Email</span>
        </p>

        <div className="rounded-2xl border border-line bg-white p-8 shadow-xs">
          <h2 className="text-xl font-bold mb-2">
            Change <span className="text-[#f4511e]">Email Address</span>
          </h2>
          <p className="text-xs text-muted mb-6">
            {otpStep
              ? `Enter the verification code sent to ${newEmail.trim()}.`
              : 'Enter your new email address. We\'ll send a code there to confirm it\'s yours.'}
          </p>

          {(localError || emailChangeError) && (
            <p className="mb-4 text-xs font-semibold text-[#f4511e]">
              {localError || emailChangeError}
            </p>
          )}

          {!otpStep ? (
            <form onSubmit={handleRequestOtp} noValidate>
              <FormField
                label="New Email Address"
                name="newEmail"
                type="email"
                placeholder="you@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />

              <button
                type="submit"
                disabled={emailChangeStatus === 'requesting'}
                className="mt-4 w-full rounded-md bg-ink py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-black disabled:opacity-50"
              >
                {emailChangeStatus === 'requesting' ? 'Sending code...' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleConfirmOtp} noValidate>
              <FormField
                label="Verification Code"
                name="otp"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <button
                type="submit"
                disabled={emailChangeStatus === 'confirming'}
                className="mt-4 w-full rounded-md bg-ink py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-black disabled:opacity-50"
              >
                {emailChangeStatus === 'confirming' ? 'Verifying...' : 'Confirm New Email'}
              </button>

              <button
                type="button"
                onClick={handleBackToStepOne}
                className="mt-3 w-full text-center text-[11px] font-semibold text-muted hover:text-ink uppercase tracking-wider"
              >
                ← Use a different email
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-6">
          <Link
            to="/profile/edit"
            className="text-xs font-semibold text-muted hover:text-ink uppercase tracking-wider"
          >
            ← Back to Edit Profile
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ChangeEmail;
