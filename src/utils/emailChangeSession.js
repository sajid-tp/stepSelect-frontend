const KEY = 'emailChangeOtpSession';
const OTP_LIFETIME_MS = 5 * 60 * 1000;

// Keeps the "enter the code we sent to your new email" step alive across a page reload.
// Stored per tab (sessionStorage) and tied to the signed-in user.

export const saveEmailChangeSession = ({ userId, email, expiresAt }) => {
  try {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({
        userId: userId ? String(userId) : null,
        email,
        expiresAt: expiresAt || new Date(Date.now() + OTP_LIFETIME_MS).toISOString(),
      })
    );
  } catch (err) {
    console.log('Could not save email change session:', err);
  }
};

export const clearEmailChangeSession = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch (err) {
    // ignore
  }
};

// Returns { email, expiresAt } for this user while the code is still valid, otherwise null.
export const loadEmailChangeSession = (userId) => {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;

    const saved = JSON.parse(raw);
    const expired = !saved?.expiresAt || Date.parse(saved.expiresAt) <= Date.now();
    const sameUser = userId && saved?.userId === String(userId);

    if (!saved?.email || !sameUser || expired) {
      clearEmailChangeSession();
      return null;
    }
    return { email: saved.email, expiresAt: saved.expiresAt };
  } catch (err) {
    return null;
  }
};
