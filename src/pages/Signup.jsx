import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import GoogleCompleteAccount from '../components/GoogleCompleteAccount';

import {
  signupUser,
  otpSignup,
  googleSignup,
  googleComplete,
  clearAuthError,
} from '../features/user/authSlice';

import { GoogleLogin } from '@react-oauth/google';
import { validateReferral } from '../features/user/referralSlice';
import { REFERRAL_STORAGE_KEY } from './InviteRedirect';
import {
  validateUsername,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  normalizeEmail,
  MESSAGES as VALIDATION,
} from '../utils/validators';

// Live checklist shown under the password field. These mirror validatePassword()
// in utils/validators.js (the server enforces the same rule).
const PASSWORD_CHECKS = [
  { label: '8 to 64 characters', test: (p) => p.length >= 8 && p.length <= 64 },
  { label: 'An uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'A lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'A number', test: (p) => /\d/.test(p) },
  { label: 'A special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

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

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Referral (optional): a typed code, or the token from an invite link (?ref=...)
  const [referral, setReferral] = useState('');
  const [fromLink, setFromLink] = useState(false);
  const [referralCheck, setReferralCheck] = useState({ state: 'idle', name: '' }); // idle | checking | valid | invalid
  const [showReferral, setShowReferral] = useState(false); // collapsed behind "Have a referral code?"

  // Set when Google verified a brand-new account: { token, profile }.
  // The signup page then shows the "Complete your account" step.
  const [googleSignupData, setGoogleSignupData] = useState(null);

  const checkReferral = async (value) => {
    const ref = value.trim();
    if (!ref) {
      setReferralCheck({ state: 'idle', name: '' });
      return 'idle';
    }
    setReferralCheck({ state: 'checking', name: '' });
    try {
      const result = await validateReferral(ref);
      setReferralCheck(
        result.valid ? { state: 'valid', name: result.referrerName } : { state: 'invalid', name: '' }
      );
      return result.valid ? 'valid' : 'invalid';
    } catch {
      setReferralCheck({ state: 'idle', name: '' }); // could not check: the server checks again on submit
      return 'idle';
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
      setShowReferral(true);
      checkReferral(ref);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The auth error lives in shared Redux state, so clear any error left over
  // from another page (e.g. the login page) when this page opens.
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

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

  // Same rules and messages as the server (see utils/validators.js)
  const errors = {
    username: validateUsername(form.username),
    email: validateEmail(form.email),
    password: validatePassword(form.password),
    confirmPassword: validateConfirmPassword(form.confirmPassword, form.password),
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

    if (!acceptedTerms) {
      setTermsError(VALIDATION.TERMS_REQUIRED);
    }

    if (!isValid) {
      // Take the user straight to the first problem (FormField ids = field names)
      const firstInvalid = ['username', 'email', 'password', 'confirmPassword'].find(
        (field) => errors[field]
      );
      document.getElementById(firstInvalid)?.focus();
      return;
    }
    if (!acceptedTerms) return;
    if (referralCheck.state === 'invalid') return;

    dispatch(clearAuthError());

    // Send the same normalised email everywhere (trimmed + lower-case)
    const email = normalizeEmail(form.email);

    try {
      await dispatch(
        signupUser({
          username: form.username.trim(),
          email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          termsAccepted: true,
          referralCode: referral.trim(),
        })
      ).unwrap();
      try { sessionStorage.removeItem(REFERRAL_STORAGE_KEY); } catch { /* ignore */ }
      const otpRes = await dispatch(otpSignup({ email })).unwrap();

      navigate('/verify-otp', {
        state: { email, type: 'signup', expiresAt: otpRes.expiresAt },
      });
    } catch (err) {
      console.log(err);
    }
  };

  // Step 1: Google verifies the person. Existing account -> logged in.
  // New account -> nothing is created yet; show the "Complete your account" step.
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const result = await dispatch(googleSignup({ token })).unwrap();

      if (result?.isNewUser) {
        setGoogleSignupData({ token, profile: result.profile });
        return;
      }
      navigate('/', { replace: true });
    } catch (err) {
      console.log('Google signup failed:', err);
    }
  };

  // Step 2: terms accepted + optional referral code -> create the account
  const handleGoogleComplete = async (referralCode) => {
    try {
      await dispatch(googleComplete({ token: googleSignupData.token, referralCode })).unwrap();
      try { sessionStorage.removeItem(REFERRAL_STORAGE_KEY); } catch { /* ignore */ }
      navigate('/', { replace: true });
    } catch (err) {
      console.log('Google signup failed:', err);
    }
  };

  const handleGoogleCancel = () => {
    setGoogleSignupData(null);
    dispatch(clearAuthError());
  };

  const handleGoogleError = () => {
    console.log('Google Login Failed');
  };

  if (googleSignupData) {
    return (
      <AuthLayout
        imageSrc="/images/auth/signup.jpg"
        overlayTitle={
          <>
            Join STEP
            <br />
            SELECT.
          </>
        }
      >
        <h1 className="mb-2 text-3xl font-bold">
          Complete Your <span className="text-[#f4511e]">Account</span>
        </h1>

        <p className="mb-8 text-sm text-muted">Just one more step before you join Step Select.</p>

        {authError && (
          <p className="mb-4 text-sm font-medium text-[#f4511e]">{authError}</p>
        )}

        <GoogleCompleteAccount
          profile={googleSignupData.profile}
          initialReferral={referral}
          isSubmitting={isSubmitting}
          onComplete={handleGoogleComplete}
          onCancel={handleGoogleCancel}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      imageSrc="/images/auth/signup.jpg"
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
          placeholder="8+ characters: Aa, 1 and a symbol"
          value={form.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password && !form.password ? errors.password : ''}
          invalid={touched.password && Boolean(errors.password)}
        />

        {form.password && (
          <ul className="-mt-3 mb-5 space-y-1 text-xs" aria-live="polite">
            {PASSWORD_CHECKS.map(({ label, test }) => {
              const met = test(form.password);
              return (
                <li
                  key={label}
                  className={met ? 'text-emerald-600' : touched.password ? 'text-red-500' : 'text-muted'}
                >
                  {met ? '✓' : '○'} {label}
                </li>
              );
            })}
          </ul>
        )}

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

        {/* Referral (optional): collapsed until the user asks for it or arrives via an invite link */}
        {!showReferral && !referral ? (
          <button
            type="button"
            onClick={() => setShowReferral(true)}
            className="mb-5 text-sm font-semibold text-[#f4511e] underline"
          >
            Have a referral code?
          </button>
        ) : (
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
              aria-invalid={referralCheck.state === 'invalid'}
              className={`w-full rounded-md border px-4 py-3 text-sm outline-none focus:border-ink ${
                referralCheck.state === 'invalid' ? 'border-red-400' : 'border-line'
              }`}
            />
          )}

          {!fromLink && referralCheck.state === 'valid' && (
            <small className="text-emerald-700">Invited by {referralCheck.name}. Your first-order offer is ready.</small>
          )}
          {referralCheck.state === 'invalid' && !fromLink && (
            <small className="text-red-500">This referral code is not valid.</small>
          )}
        </div>
        )}

        {/* Terms & Conditions (required) */}
        <div className="mb-5">
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-muted">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                if (e.target.checked) setTermsError('');
              }}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#f4511e]"
            />
            <span>
              I agree to the{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-ink underline"
              >
                Terms &amp; Conditions
              </a>
            </span>
          </label>
          {termsError && <small className="mt-1 block text-red-500">{termsError}</small>}
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