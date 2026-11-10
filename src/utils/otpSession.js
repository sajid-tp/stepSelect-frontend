const KEY = 'otpSession';
const OTP_LIFETIME_MS = 5 * 60 * 1000;

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
  }
};

const ts = (v) => (v ? Date.parse(v) || 0 : 0);

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

  if (session && !session.expiresAt) {
    session = { ...session, expiresAt: new Date(Date.now() + OTP_LIFETIME_MS).toISOString() };
  }
  return session;
};
