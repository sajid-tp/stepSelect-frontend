// components/OtpCard.jsx
import { useEffect, useRef, useState } from 'react';

const RESEND_COOLDOWN_SECONDS = 60;
const OTP_EXPIRY_SECONDS = 5 * 60; // must match the backend OTP lifetime

function OtpVerificationCard({
  title = 'Verify',
  highlightedTitle = 'Email',
  description,
  error,
  isVerifying,
  isResending,
  onSubmit,
  onResend,
  submitLabel = 'Verify & continue',
  resendCooldown = RESEND_COOLDOWN_SECONDS,
  expiresAt, // ISO string from the backend: the single source of truth
  expiryDuration = OTP_EXPIRY_SECONDS,
}) {
  const inputsRef = useRef([]);

  // ONE ticker. Everything else is calculated from `expiresAt`, so nothing
  // lives in component state that a refresh could reset.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const endTime = expiresAt ? new Date(expiresAt).getTime() : 0;
  const sentAt = endTime - expiryDuration * 1000; // when this code was sent
  const secondsUntil = (t) => Math.max(0, Math.ceil((t - now) / 1000));

  const expirySecondsLeft = secondsUntil(endTime);
  const cooldownSecondsLeft = secondsUntil(sentAt + resendCooldown * 1000);

  const isExpired = expirySecondsLeft === 0;
  const canResend = cooldownSecondsLeft === 0 && !isResending;

  const focusNext = (i) => inputsRef.current[i + 1]?.focus();
  const focusPrev = (i) => inputsRef.current[i - 1]?.focus();

  const handleChange = (e, i) => {
    e.target.value = e.target.value.replace(/\D/g, '');
    if (e.target.value && i < inputsRef.current.length - 1) focusNext(i);
  };

  const handleKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !e.target.value && i > 0) focusPrev(i);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, inputsRef.current.length);

    if (!digits) return;

    digits.split('').forEach((digit, idx) => {
      if (inputsRef.current[idx]) inputsRef.current[idx].value = digit;
    });

    inputsRef.current[Math.min(digits.length, inputsRef.current.length - 1)]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = inputsRef.current.map((input) => input.value).join('');
    onSubmit(code);
  };

  const handleResendClick = async () => {
    inputsRef.current.forEach((input) => { if (input) input.value = ''; });

    // If this succeeds the parent passes a new `expiresAt`, which restarts the
    // countdown and the resend lock automatically. If it fails, nothing changes.
    await onResend();

    // Focus after the re-render, because the boxes are disabled while expired
    setTimeout(() => inputsRef.current[0]?.focus(), 0);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-sm rounded-lg bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#f4511e]/10">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f4511e" strokeWidth="1.8">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      </div>

      <h1 className="mb-2 text-2xl font-bold">
        {title} <span className="text-[#f4511e]">{highlightedTitle}</span>
      </h1>
      <p className="mb-2 text-sm text-muted">{description}</p>

      {/* The only visible timer */}
      <div className="mb-4">
        {isExpired ? (
          <p className="mt-1 text-sm font-semibold text-[#f4511e]">
            Code expired — please resend.
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted">
            Code expires in{' '}
            <span
              className={`font-semibold tabular-nums ${
                expirySecondsLeft <= 30 ? 'text-[#f4511e]' : 'text-ink'
              }`}
            >
              {formatTime(expirySecondsLeft)}
            </span>
          </p>
        )}
      </div>

      {error && <p className="mb-4 text-sm font-medium text-[#f4511e]">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-8 flex justify-center gap-3">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              disabled={isExpired}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className="h-14 w-12 rounded-md border border-line text-center text-lg font-semibold outline-none focus:border-ink disabled:opacity-50"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isVerifying || isExpired}
          className="w-full rounded-md bg-[#f4511e] py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isVerifying ? 'Verifying…' : submitLabel}
        </button>
      </form>

      {/* Resend: locked for the first `resendCooldown` seconds, no second countdown shown */}
      <p className="mt-6 text-sm text-muted">
        Didn&apos;t receive a code?{' '}
        <button
          type="button"
          onClick={handleResendClick}
          disabled={!canResend}
          className="font-semibold text-ink underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-40"
        >
          {isResending ? 'Sending…' : 'Resend'}
        </button>
      </p>
    </div>
  );
}

export default OtpVerificationCard;
