import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';

import {
  signupUser,
  otpSignup,
  googleSignup,
  clearAuthError,
} from '../features/user/authSlice';

import { GoogleLogin } from '@react-oauth/google';
import { validateReferral } from '../features/user/referralSlice';
import { REFERRAL_STORAGE_KEY } from './InviteRedirect';

function Signup() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Referral (optional): a typed code, or the token from an invite link (?ref=...)
  const [referral, setReferral] = useState('');
  const [fromLink, setFromLink] = useState(false);
  const [referralCheck, setReferralCheck] = useState({ state: 'idle', name: '' }); // idle | checking | valid | invalid

  const checkReferral = async (value) => {
    const ref = value.trim();
    if (!ref) {
      setReferralCheck({ state: 'idle', name: '' });
      return;
    }
    setReferralCheck({ state: 'checking', name: '' });
    try {
      const result = await validateReferral(ref);
      setReferralCheck(
        result.valid ? { state: 'valid', name: result.referrerName } : { state: 'invalid', name: '' }
      );
    } catch {
      setReferralCheck({ state: 'idle', name: '' }); // could not check: the server checks again on submit
    }
  };

  useEffect(() => {
    let ref = searchParams.get('ref') || '';
    if (!ref) {
      try {
        ref = sessionStorage.getItem(REFERRAL_STORAGE_KEY) || '';
      } catch {
        ref = '';
      }
    }
    if (ref) {
      setReferral(ref);
      setFromLink(true);
      checkReferral(ref);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearReferral = () => {
    setReferral('');
    setFromLink(false);
    setReferralCheck({ state: 'idle', name: '' });
    try {
      sessionStorage.removeItem(REFERRAL_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  // Single source of truth now — no local isSubmitting/submitError
  const authStatus = useSelector((state) => state.auth.status);
  const authError = useSelector((state) => state.auth.error);
  const isSubmitting = authStatus === 'loading';

  const errors = {
    username: !form.username
      ? 'Username is required'
      : form.username.length < 3
      ? 'Username must be at least 3 characters'
      : '',

    email: !form.email
      ? 'Email is required'
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
      ? 'Enter a valid email address'
      : '',

password: !form.password
  ? 'Password is required'
  : !/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(form.password)
  ? 'Password must be at least 8 characters and contain an uppercase letter, a lowercase letter, a number, and a special character'
  : '',

    confirmPassword: !form.confirmPassword
      ? 'Please confirm your password'
      : form.confirmPassword !== form.password
      ? 'Passwords do not match'
      : '',
  };

  const isValid =
    !errors.username &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!isValid) return;
    if (referralCheck.state === 'invalid') return;

    dispatch(clearAuthError());

    try {
      await dispatch(signupUser({ ...form, referralCode: referral.trim() })).unwrap();
      try { sessionStorage.removeItem(REFERRAL_STORAGE_KEY); } catch { /* ignore */ }
     const otpRes = await dispatch(otpSignup({ email: form.email })).unwrap();

      navigate('/verify-otp', {
        state: { email: form.email, type: 'signup', expiresAt: otpRes.expiresAt },
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      await dispatch(googleSignup({ token, referralCode: referral.trim() })).unwrap();
      navigate('/');
    } catch (err) {
      console.log('Google signup failed:', err);
    }
  };

  const handleGoogleError = () => {
    console.log('Google Login Failed');
  };

  return (
    <AuthLayout
      imageSrc="https://placehold.co/800x1000/2b2b2b/e5e5e5?text=Runner"
      overlayTitle={
        <>
          Join STEP
          <br />
          SELECT.
        </>
      }
    >
      <h1 className="mb-2 text-3xl font-bold">
        Create <span className="text-[#f4511e]">Account</span>
      </h1>

      <p className="mb-8 text-sm text-muted">
        Join Step Select and get early access to new drops.
      </p>

      {authError && (
        <p className="mb-4 text-sm font-medium text-[#f4511e]">{authError}</p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          label="Username"
          name="username"
          placeholder="yourname"
          value={form.username}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.username ? errors.username : ''}
        />

        <FormField
          label="Email address"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.email ? errors.email : ''}
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          placeholder="At least 6 characters"
          value={form.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password ? errors.password : ''}
        />

        <FormField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          placeholder="Re-enter password"
          value={form.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.confirmPassword ? errors.confirmPassword : ''}
        />

        {/* Referral (optional) */}
        <div className="mb-5">
          <label htmlFor="referral" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
            Referral code <span className="font-normal normal-case text-gray-400">(optional)</span>
          </label>

          {fromLink ? (
            <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <span>
                {referralCheck.state === 'valid'
                  ? `Invited by ${referralCheck.name}`
                  : referralCheck.state === 'invalid'
                  ? 'This invite link is not valid'
                  : 'Invite link applied'}
              </span>
              <button type="button" onClick={clearReferral} className="text-xs font-semibold underline">
                Remove
              </button>
            </div>
          ) : (
            <input
              id="referral"
              name="referral"
              value={referral}
              onChange={(e) => {
                setReferral(e.target.value.toUpperCase());
                setReferralCheck({ state: 'idle', name: '' });
              }}
              onBlur={(e) => checkReferral(e.target.value)}
              placeholder="e.g. SAJID-7K2Q"
              maxLength={40}
              className="w-full rounded-md border border-line px-4 py-3 text-sm outline-none focus:border-ink"
            />
          )}

          {!fromLink && referralCheck.state === 'valid' && (
            <small className="text-emerald-700">Invited by {referralCheck.name}. Your first-order offer is ready.</small>
          )}
          {referralCheck.state === 'invalid' && !fromLink && (
            <small className="text-red-500">This referral code is not valid.</small>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-md bg-[#f4511e] py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-300"></div>
        <span className="text-sm text-muted">OR</span>
        <div className="h-px flex-1 bg-gray-300"></div>
      </div>

      <div className="flex justify-center">
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-ink underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Signup;