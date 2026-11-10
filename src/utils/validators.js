import { parsePhoneNumberFromString } from 'libphonenumber-js/mobile';

const PHONE_COUNTRY = 'IN';

export const LIMITS = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 25,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 64,
  PROFILE_IMAGE_MAX_BYTES: 3 * 1024 * 1024,
};

export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
export const OTP_REGEX = /^\d{6}$/;
const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9])/;

export const PROFILE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const MESSAGES = {
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Enter a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_RULES:
    'Password must be 8 to 64 characters and include an uppercase letter, a lowercase letter, a number and a special character',
  CONFIRM_PASSWORD_REQUIRED: 'Please confirm your password',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  PHONE_INVALID: 'Enter a valid 10-digit Indian mobile number',
  PHONE_REQUIRED: 'Phone number is required',
  OTP_INVALID: 'Enter a valid 6-digit code',
  TERMS_REQUIRED: 'Please accept the Terms & Conditions to create your account',
  NEW_PASSWORD_SAME_AS_CURRENT: 'New password must be different from current password',
  IMAGE_TYPE: 'Please select a valid image file (PNG, JPG, JPEG, WEBP).',
  IMAGE_SIZE: 'Image must be smaller than 3MB.',
};

export const normalizeEmail = (value) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

export const validateUsername = (value, label = 'Username') => {
  const v = typeof value === 'string' ? value.trim() : '';
  if (!v) return `${label} is required`;
  if (v.length < LIMITS.USERNAME_MIN || v.length > LIMITS.USERNAME_MAX) {
    return `${label} must be between ${LIMITS.USERNAME_MIN} and ${LIMITS.USERNAME_MAX} characters`;
  }
  return '';
};

export const validateEmail = (value) => {
  const v = normalizeEmail(value);
  if (!v) return MESSAGES.EMAIL_REQUIRED;
  if (
    v.length > 254 ||
    v.indexOf('@') > 64 ||
    !EMAIL_REGEX.test(v) ||
    !v.split('@')[1].includes('.')
  ) {
    return MESSAGES.EMAIL_INVALID;
  }
  return '';
};

export const validatePassword = (value) => {
  if (typeof value !== 'string' || !value) return MESSAGES.PASSWORD_REQUIRED;
  if (
    value.length < LIMITS.PASSWORD_MIN ||
    value.length > LIMITS.PASSWORD_MAX ||
    !PASSWORD_COMPLEXITY_REGEX.test(value)
  ) {
    return MESSAGES.PASSWORD_RULES;
  }
  return '';
};

export const validateConfirmPassword = (confirm, password) => {
  if (!confirm) return MESSAGES.CONFIRM_PASSWORD_REQUIRED;
  if (confirm !== password) return MESSAGES.PASSWORDS_DO_NOT_MATCH;
  return '';
};

export const normalizePhone = (value) => {
  const v = value === undefined || value === null ? '' : String(value).trim();
  if (!v) return '';
  const parsed = parsePhoneNumberFromString(v, PHONE_COUNTRY);
  return parsed && parsed.isValid() && parsed.country === PHONE_COUNTRY
    ? parsed.nationalNumber
    : '';
};

export const validatePhone = (value) => {
  const v = value === undefined || value === null ? '' : String(value).trim();
  if (!v) return '';
  return normalizePhone(v) ? '' : MESSAGES.PHONE_INVALID;
};

export const validateRequiredPhone = (value) => {
  const v = value === undefined || value === null ? '' : String(value).trim();
  if (!v) return MESSAGES.PHONE_REQUIRED;
  return normalizePhone(v) ? '' : MESSAGES.PHONE_INVALID;
};

export const validateOtp = (value) =>
  OTP_REGEX.test(String(value ?? '').trim()) ? '' : MESSAGES.OTP_INVALID;

export const validateProfileImage = (file) => {
  if (!PROFILE_IMAGE_TYPES.includes(file.type)) return MESSAGES.IMAGE_TYPE;
  if (file.size > LIMITS.PROFILE_IMAGE_MAX_BYTES) return MESSAGES.IMAGE_SIZE;
  return '';
};
