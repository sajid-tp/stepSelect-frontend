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
  expiresAt, // optional ISO string or Date from the backend (most accurate)
  expiryDuration = OTP_EXPIRY_SECONDS, // total lifetime of the code, in seconds
}) {
  const inputsRef = useRef([]);
  const [secondsLeft, setSecondsLeft] = useState(resendCooldown);

  // If the backend does not send `expiresAt`, count down locally from the full duration
  const [fallbackEnd, setFallbackEnd] = useState(
    () => Date.now() + expiryDuration * 1000
  );
  const endTime = expiresAt ? new Date(expiresAt).getTime() : fallbackEnd;

  const getRemaining = () =>
    Math.max(0, Math.ceil((endTime - Date.now()) / 1000));

  const [expirySecondsLeft, setExpirySecondsLeft] = useState(getRemaining);

  const isCoolingDown = secondsLeft > 0;

  // Resend cooldown
  useEffect(() => {
    if (!isCoolingDown) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isCoolingDown]);

  // Expiry countdown (restarts whenever the end time changes)
  useEffect(() => {
    const tick = () => {
      setExpirySecondsLeft(
        Math.max(0, Math.ceil((endTime - Date.now()) / 1000))
      );
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const focusNext = (i) => inputsRef.current[i + 1]?.focus();
  const focusPrev = (i) => inputsRef.current[i - 1]?.focus();

  const handleChange = (e, i) => {
    // Digits only
    e.target.value = e.target.value.replace(/\D/g, '');
    if (e.target.value && i < inputsRef.current.length - 1) focusNext(i);
  };

  const handleKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !e.target.value && i > 0) focusPrev(i);
  };

  // Pasting a full code fills all six boxes
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
    await onResend();
    setSecondsLeft(resendCooldown);

    // New code sent -> restart the full expiry time (used when no `expiresAt` prop is given)
    setFallbackEnd(Date.now() + expiryDuration * 1000);

    // Focus after the re-render, because the boxes are disabled while the code is expired
    setTimeout(() => inputsRef.current[0]?.focus(), 0);
  };

  const canResend = secondsLeft === 0 && !isResending;
  const isExpired = expirySecondsLeft === 0;

  const formatDuration = (s) => {
    const m = Math.floor(s / 60);
    const rem = s % 60;
    if (m && !rem) return `${m} minute${m > 1 ? 's' : ''}`;
    if (!m) return `${rem} seconds`;
    return `${m} min ${rem} sec`;
  };

  const expiryClock = new Date(endTime).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

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

      {/* Full expiry time + live countdown (always shown) */}
      <div className="mb-4">
        {/* <p className="text-xs text-muted">
          This code is valid for {formatDuration(expiryDuration)} (until {expiryClock}).
        </p> */}

        {isExpired ? (
          <p className="mt-1 text-sm font-semibold text-[#f4511e]">
            Code expired — please resend.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted">
              Time left:{' '}
              <span
                className={`font-semibold tabular-nums ${
                  expirySecondsLeft <= 30 ? 'text-[#f4511e]' : 'text-ink'
                }`}
              >
                {formatTime(expirySecondsLeft)}
              </span>
            </p>

            {/* <div className="mx-auto mt-2 h-1 w-40 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-[#f4511e] transition-[width] duration-1000 ease-linear"
                style={{
                  width: `${Math.min(100, (expirySecondsLeft / expiryDuration) * 100)}%`,
                }}
              />
            </div> */}
          </>
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

      <p className="mt-6 text-sm text-muted">
        {canResend ? (
          <>
            Didn&apos;t receive a code?{' '}
            <button
              type="button"
              onClick={handleResendClick}
              disabled={isResending}
              className="font-semibold text-ink underline disabled:opacity-60"
            >
              {isResending ? 'Sending…' : 'Resend'}
            </button>
          </>
        ) : (
          <>Resend code in <span className="font-semibold text-ink">{formatTime(secondsLeft)}</span></>
        )}
      </p>
    </div>
  );
}

export default OtpVerificationCard;
