import { useEffect, useState } from 'react';

import { validateReferral } from '../features/user/referralSlice';
import { MESSAGES as VALIDATION } from '../utils/validators';

// "Complete your account" step shown to brand-new Google users on the signup page.
// Google has already verified the person; here they add an optional referral code
// and accept the Terms before the account is created.
function GoogleCompleteAccount({
  profile,
  initialReferral = '',
  isSubmitting,
  onComplete, // (referralCode) => void
  onCancel,
}) {
  const [referral, setReferral] = useState(initialReferral);
  const [referralCheck, setReferralCheck] = useState({ state: 'idle', name: '' }); // idle | checking | valid | invalid
  const [accepted, setAccepted] = useState(false);
  const [termsError, setTermsError] = useState('');
  const [imageFailed, setImageFailed] = useState(false);

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
      setReferralCheck({ state: 'idle', name: '' }); // could not check: the server checks again
      return 'idle';
    }
  };

  // A code that came from an invite link is checked as soon as this step opens
  useEffect(() => {
    if (initialReferral) checkReferral(initialReferral);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!accepted) {
      setTermsError(VALIDATION.TERMS_REQUIRED);
      return;
    }

    const code = referral.trim();
    if (code) {
      let status = referralCheck.state;
      if (status !== 'valid') status = await checkReferral(code);
      if (status === 'invalid') {
        document.getElementById('google-referral')?.focus();
        return;
      }
    }

    onComplete(code);
  };

  const name = profile?.name || 'Google user';

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Verified Google account */}
      <div className="mb-6 flex items-center gap-3 rounded-md border border-line px-4 py-3">
        {profile?.picture && !imageFailed ? (
          <img
            src={profile.picture}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
            {name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{name}</p>
          <p className="truncate text-xs text-muted">{profile?.email}</p>
          <p className="mt-0.5 text-xs font-medium text-emerald-600">✓ Google account verified</p>
        </div>
      </div>

      {/* Referral code (optional) */}
      <div className="mb-5">
        <label
          htmlFor="google-referral"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted"
        >
          Referral code <span className="font-normal normal-case text-gray-400">(optional)</span>
        </label>
        <input
          id="google-referral"
          value={referral}
          onChange={(e) => {
            setReferral(e.target.value.toUpperCase());
            setReferralCheck({ state: 'idle', name: '' });
          }}
          onBlur={(e) => checkReferral(e.target.value)}
          placeholder="Enter referral code"
          maxLength={40}
          aria-invalid={referralCheck.state === 'invalid'}
          className={`w-full rounded-md border px-4 py-3 text-sm outline-none focus:border-ink ${
            referralCheck.state === 'invalid' ? 'border-red-400' : 'border-line'
          }`}
        />
        {referralCheck.state === 'valid' && (
          <small className="mt-1 block text-emerald-700">
            Invited by {referralCheck.name}. Your first-order offer is ready.
          </small>
        )}
        {referralCheck.state === 'invalid' && (
          <small className="mt-1 block text-red-500">This referral code is not valid.</small>
        )}
        {referralCheck.state === 'idle' && (
          <small className="mt-1 block text-muted">
            Have a referral code? Enter it to receive your referral benefit.
          </small>
        )}
      </div>

      {/* Terms & Conditions (required) */}
      <div className="mb-5">
        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => {
              setAccepted(e.target.checked);
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
        className="w-full rounded-md bg-[#f4511e] py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Creating account…' : 'Complete registration'}
      </button>

      <p className="mt-3 text-center text-xs text-muted">You can leave the referral code empty and continue.</p>

      <p className="mt-6 text-center text-sm text-muted">
        Not you?{' '}
        <button type="button" onClick={onCancel} className="font-semibold text-ink underline">
          Use a different account
        </button>
      </p>
    </form>
  );
}

export default GoogleCompleteAccount;
