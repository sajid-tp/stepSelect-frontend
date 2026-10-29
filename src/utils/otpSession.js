// utils/otpSession.js
// Keeps the OTP screen's state (email, type, expiresAt) in sessionStorage so a
// page refresh does not lose it. sessionStorage is per-tab and cleared when the
// tab closes, which suits a short-lived OTP flow.

const KEY = 'otpSession';
const OTP_LIFETIME_MS = 5 * 60 * 1000; // must match the backend OTP lifetime

export const saveOtpSession = (data) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch (err) {
    console.log('Could not save otp session:', err);
  }
};

export const loadOtpSession = () => {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
};

export const clearOtpSession = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch (err) {
    /* ignore */
  }
};

const ts = (v) => (v ? Date.parse(v) || 0 : 0);

// Decide which values the OTP page should start with.
//  - navState: location.state passed by Signup / ForgotPassword (may be stale after a refresh)
//  - saved:    what we last stored (always >= navState if the user pressed Resend)
// If both describe the same flow, the LATER expiresAt wins, because every new
// code expires later than the previous one.
export const resolveOtpSession = (navState) => {
  const saved = loadOtpSession();
  const fromNav = navState?.email
    ? {
        email: navState.email,
        type: navState.type || 'signup',
        expiresAt: navState.expiresAt || null,
      }
    : null;

  let session;
  if (fromNav && saved && saved.email === fromNav.email && saved.type === fromNav.type) {
    session = {
      ...fromNav,
      expiresAt: ts(fromNav.expiresAt) >= ts(saved.expiresAt) ? fromNav.expiresAt : saved.expiresAt,
    };
  } else {
    session = fromNav || saved;
  }

  // Last resort (e.g. server did not send expiresAt): start the clock now, but
  // because the result is saved, a refresh will no longer restart it.
  if (session && !session.expiresAt) {
    session = { ...session, expiresAt: new Date(Date.now() + OTP_LIFETIME_MS).toISOString() };
  }
  return session;
};
