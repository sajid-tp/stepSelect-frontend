import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FormField from '../components/FormField';
import OtpVerificationCard from '../components/OtpCard';
import Modal from '../components/Modals';

import {
  updateProfile,
  updatePassword,
  requestEmailChange,
  confirmEmailChange,
  fetchUserProfile,
  uploadProfileImage,
} from '../features/user/accountSlice';

function EditProfile() {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const profile = useSelector((state) => state.account?.profile);


const isGoogleUser = Boolean(profile?.isGoogleUser);

  // --------------------------------------------------
  // Personal Information Form
  // --------------------------------------------------

  const {
    register: registerPersonal,
    reset: resetPersonalForm,
    watch: watchPersonal,
    setValue: setPersonalValue,
    handleSubmit: handlePersonalFormSubmit,
    formState: {
      errors: personalErrors,
      isSubmitting: isUpdatingProfile,
    },
  } = useForm({
    defaultValues: {
      username: '',
      phoneNumber: '',
    },
  });

  useEffect(() => {
    registerPersonal('username', {
      required: 'Name is required',
      minLength: {
        value: 6,
        message: 'Name must be at least 6 characters long',
      },
    });

    registerPersonal('phoneNumber', {
    
      pattern: {
        value: /^\d{10,15}$/,
        message:
          'Phone number must contain only digits and be at least 10 digits long',
      },
    });
  }, [registerPersonal]);

  const username = watchPersonal('username');
  const phoneNumber = watchPersonal('phoneNumber');

  // --------------------------------------------------
  // Security Settings Form
  // --------------------------------------------------

  const {
    register: registerSecurity,
    reset: resetSecurityForm,
    watch: watchSecurity,
    setValue: setSecurityValue,
    handleSubmit: handleSecurityFormSubmit,
    formState: {
      errors: securityErrors,
      isSubmitting: isUpdatingPassword,
    },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    registerSecurity('currentPassword', {
      required: 'Current password is required',
    });

    registerSecurity('newPassword', {
      required: 'New password is required',
      minLength: {
        value: 6,
        message: 'Password must be at least 6 characters long',
      },
      maxLength: {
        value: 15,
        message: 'Password must be at most 15 characters long',
      },
    });

    registerSecurity('confirmPassword', {
      required: 'Please confirm your new password',
    });
  }, [registerSecurity]);

  const currentPassword = watchSecurity('currentPassword');
  const newPassword = watchSecurity('newPassword');
  const confirmPassword = watchSecurity('confirmPassword');

  // --------------------------------------------------
  // Image & Preview States
  // --------------------------------------------------

  const [previewImage, setPreviewImage] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [imageError, setImageError] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // --------------------------------------------------
  // Success Messages
  // --------------------------------------------------

  const [personalSuccess, setPersonalSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // --------------------------------------------------
  // Password Confirmation Modal
  // --------------------------------------------------

  const [passwordConfirmModalOpen, setPasswordConfirmModalOpen] =
    useState(false);

  // --------------------------------------------------
  // Change Email + OTP States
  // --------------------------------------------------

  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);

  // Email confirmation modal
  const [emailConfirmModalOpen, setEmailConfirmModalOpen] = useState(false);

  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  const pendingEmailRef = useRef('');

  // --------------------------------------------------
  // Fetch Profile
  // --------------------------------------------------

  useEffect(() => {
    if (!profile) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, profile]);

  // --------------------------------------------------
  // Populate Personal Form When Profile Loads
  // --------------------------------------------------

  useEffect(() => {
    if (profile) {
      resetPersonalForm(
        {
          username: profile.username || '',
          phoneNumber: profile.phoneNumber || '',
        },
        {
          keepDirtyValues: true,
        }
      );

      if (profile.profileImage) {
        setPreviewImage(profile.profileImage);
        setImgError(false);
      }
    }
  }, [profile, resetPersonalForm]);

  // --------------------------------------------------
  // Image Upload
  // --------------------------------------------------

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageError('');

    if (!file.type.startsWith('image/')) {
      setImageError(
        'Please select a valid image file (PNG, JPG, JPEG, WEBP).'
      );
      return;
    }

    const MAX_SIZE = 3 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      setImageError('Image must be smaller than 3MB.');
      return;
    }

    const localUrl = URL.createObjectURL(file);

    setPreviewImage(localUrl);
    setImgError(false);
    setIsUploadingImage(true);

    try {
      await dispatch(uploadProfileImage(file)).unwrap();
    } catch (err) {
      setImageError(
        err || 'Failed to upload image. Please try again.'
      );

      setPreviewImage(profile?.profileImage || null);
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  // --------------------------------------------------
  // Personal Information Submit
  // --------------------------------------------------

  const onPersonalSubmit = async (data) => {
    setPersonalSuccess('');

    const trimmedName = data.username.trim();
    const trimmedPhone = String(data.phoneNumber).trim();

    try {
      await dispatch(
        updateProfile({
          username: trimmedName,
          phoneNumber: trimmedPhone,
        })
      ).unwrap();

      setPersonalSuccess('Your details have been saved.');

      setTimeout(() => {
        setPersonalSuccess('');
      }, 4000);
    } catch (err) {
      console.error(err);
    }
  };

  // --------------------------------------------------
  // Password Submit
  // --------------------------------------------------

  // First validate password fields and open confirmation modal
  const onSecuritySubmit = async (data) => {
    setPasswordError('');
    setPasswordSuccess('');

    if (data.newPassword !== data.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    // Open confirmation modal
    setPasswordConfirmModalOpen(true);
  };

  // Actually update password after confirmation
  const handleConfirmPasswordChange = async () => {
    setPasswordError('');

    try {
      await dispatch(
        updatePassword({
          currentPassword,
          newPassword,
          confirmPassword,
        })
      ).unwrap();

      // Close confirmation modal
      setPasswordConfirmModalOpen(false);

      // Clear password fields
      resetSecurityForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setPasswordSuccess('Your password has been updated.');

      setTimeout(() => {
        setPasswordSuccess('');
      }, 4000);
    } catch (err) {
      setPasswordError(
        err || 'Failed to update password'
      );

      setPasswordConfirmModalOpen(false);
    }
  };

  // --------------------------------------------------
  // Change Email Handlers
  // --------------------------------------------------

  // Validate email and open confirmation modal
  const handleSendEmailOtp = () => {
    setEmailError('');
    setEmailSuccess('');

    const trimmed = newEmail.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Please enter a valid email');
      return;
    }

    if (trimmed === profile?.email?.toLowerCase()) {
      setEmailError(
        'New email cannot be the same as current email'
      );
      return;
    }

    setNewEmail(trimmed);

    setEmailConfirmModalOpen(true);
  };

  // Actually send OTP after confirmation
  const handleConfirmEmailChange = async () => {
    const trimmed = newEmail.trim().toLowerCase();

    setIsSendingEmailOtp(true);
    setEmailError('');

    try {
      const result = await dispatch(
        requestEmailChange({
          newEmail: trimmed,
        })
      ).unwrap();

      pendingEmailRef.current = trimmed;

      setOtpExpiresAt(result?.expiresAt || null);
      setOtpError('');

      setEmailConfirmModalOpen(false);
      setIsOtpOpen(true);
    } catch (err) {
      setEmailError(
        err || 'Could not send verification code'
      );

      setEmailConfirmModalOpen(false);
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  // --------------------------------------------------
  // Close OTP Modal
  // --------------------------------------------------

  const closeOtpModal = () => {
    setIsOtpOpen(false);
    setOtpError('');
    setOtpExpiresAt(null);
  };

  // --------------------------------------------------
  // OTP Submit
  // --------------------------------------------------

  const handleOtpSubmit = async (code) => {
    if (code.length !== 6) {
      setOtpError('Enter all 6 digits.');
      return;
    }

    setOtpError('');
    setIsVerifyingOtp(true);

    try {
      await dispatch(
        confirmEmailChange({
          otp: code,
        })
      ).unwrap();

      closeOtpModal();

      setNewEmail('');
      setIsChangingEmail(false);

      setEmailSuccess(
        'Your email address has been updated.'
      );

      setTimeout(() => {
        setEmailSuccess('');
      }, 4000);

      // Refresh profile with new email
      dispatch(fetchUserProfile());
    } catch (err) {
      setOtpError(
        err || 'Invalid or expired code. Please try again.'
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // --------------------------------------------------
  // OTP Resend
  // --------------------------------------------------

  const handleOtpResend = async () => {
    setOtpError('');
    setIsResendingOtp(true);

    try {
      const result = await dispatch(
        requestEmailChange({
          newEmail: pendingEmailRef.current,
        })
      ).unwrap();

      setOtpExpiresAt(result?.expiresAt || null);
    } catch (err) {
      setOtpError(
        err || 'Could not resend code. Please try again.'
      );
    } finally {
      setIsResendingOtp(false);
    }
  };

  // --------------------------------------------------
  // Other UI Values
  // --------------------------------------------------

  const userInitial =
    profile?.username?.charAt(0).toUpperCase() || 'U';

  const hasValidImage =
    previewImage && !imgError;

  // --------------------------------------------------
  // JSX
  // --------------------------------------------------

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfb]">

      <Navbar />

      <main className="container flex-1 py-10 max-w-xl mx-auto">

        {/* Breadcrumb */}
        <p className="text-xs text-muted mb-6 tracking-wide uppercase">
          Home / Account /{' '}
          <span className="font-semibold text-ink">
            Edit Profile
          </span>
        </p>

        {/* --------------------------------------------- */}
        {/* Personal Information */}
        {/* --------------------------------------------- */}

        <div className="rounded-2xl border border-line bg-white p-8 shadow-xs mb-8">

          <h2 className="text-xl font-bold mb-6">
            Personal{' '}
            <span className="text-[#f4511e]">
              Information
            </span>
          </h2>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />

            <div className="relative group">

              {hasValidImage ? (
                <img
                  src={previewImage}
                  alt="Profile"
                  onError={() => setImgError(true)}
                  onClick={() => setIsViewerOpen(true)}
                  className="h-20 w-20 rounded-full object-cover border border-line cursor-pointer hover:opacity-90 transition shadow-xs"
                  title="Click to view full image"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-[#f4511e] flex items-center justify-center text-white font-bold text-2xl shadow-xs">
                  {userInitial}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="absolute bottom-0 right-0 bg-ink text-white p-1.5 rounded-full text-xs shadow hover:bg-black transition disabled:opacity-50"
                aria-label="Upload photo"
              >
                {isUploadingImage ? '⏳' : '📷'}
              </button>

            </div>

            <div className="mt-3 flex items-center gap-3 text-xs">

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="font-bold uppercase tracking-wider text-muted hover:text-ink disabled:opacity-50"
              >
                {isUploadingImage
                  ? 'Uploading...'
                  : 'Upload New Photo'}
              </button>

              {hasValidImage && (
                <>
                  <span className="text-gray-300">|</span>

                  <button
                    type="button"
                    onClick={() => setIsViewerOpen(true)}
                    className="font-bold uppercase tracking-wider text-[#f4511e] hover:underline"
                  >
                    View Photo
                  </button>
                </>
              )}

            </div>

            {imageError && (
              <p className="mt-2 text-xs text-red-500 font-medium">
                {imageError}
              </p>
            )}

          </div>

          {/* Personal Success */}
          {personalSuccess && (
            <p className="mb-4 flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>

              {personalSuccess}
            </p>
          )}

          <form
            onSubmit={handlePersonalFormSubmit(onPersonalSubmit)}
            noValidate
          >

            <FormField
              label="Name"
              name="username"
              value={username || ''}
              onChange={(e) =>
                setPersonalValue(
                  'username',
                  e.target.value,
                  {
                    shouldValidate: true,
                    shouldDirty: true,
                  }
                )
              }
              error={personalErrors.username?.message}
            />
{!isGoogleUser && (
  <>
    <FormField
      label="Email Address"
      name="email"
      type="email"
      value={profile?.email || ''}
      disabled
      readOnly
    />

    {/* Email Success */}
    {emailSuccess && (
      <p className="mb-3 rounded-md bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
        {emailSuccess}
      </p>
    )}

    {/* Change Email */}
    {!isChangingEmail ? (
      <p className="text-[11px] text-muted -mt-2 mb-4">
        Need to change your email?{' '}

        <button
          type="button"
          onClick={() => {
            setIsChangingEmail(true);
            setEmailError('');
            setEmailSuccess('');
          }}
          className="text-[#f4511e] font-semibold hover:underline"
        >
          Update it here
        </button>
      </p>
    ) : (
      <div className="mb-4 rounded-md border border-line bg-gray-50 p-4">
        <FormField
          label="New Email Address"
          name="newEmail"
          type="email"
          placeholder="Enter your new email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSendEmailOtp();
            }
          }}
          error={emailError}
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSendEmailOtp}
            disabled={isSendingEmailOtp}
            className="rounded-md bg-[#f4511e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e04515] disabled:opacity-50"
          >
            {isSendingEmailOtp
              ? 'Sending code...'
              : 'Send verification code'}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsChangingEmail(false);
              setNewEmail('');
              setEmailError('');
            }}
            disabled={isSendingEmailOtp}
            className="text-xs font-semibold text-muted hover:text-ink"
          >
            Cancel
          </button>
        </div>
      </div>
    )}
  </>
)}

            <FormField
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              value={phoneNumber || ''}
              onChange={(e) =>
                setPersonalValue(
                  'phoneNumber',
                  e.target.value,
                  {
                    shouldValidate: true,
                    shouldDirty: true,
                  }
                )
              }
              error={personalErrors.phoneNumber?.message}
            />

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="mt-4 w-full rounded-md bg-ink py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-black disabled:opacity-50"
            >
              {isUpdatingProfile
                ? 'Saving...'
                : '💾 Save Personal Details'}
            </button>

          </form>

        </div>

        {/* --------------------------------------------- */}
        {/* Security Settings */}
        {/* --------------------------------------------- */}
{!isGoogleUser && (
        <div className="rounded-2xl border border-line bg-white p-8 shadow-xs mb-8">

          <h2 className="text-xl font-bold mb-6">
            Security{' '}
            <span className="text-[#f4511e]">
              Settings
            </span>
          </h2>

          {/* Password Success */}
          {passwordSuccess && (
            <p className="mb-4 flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>

              {passwordSuccess}
            </p>
          )}

          {/* Password Error */}
          {passwordError && (
            <p className="mb-4 text-xs font-semibold text-[#f4511e]">
              {passwordError}
            </p>
          )}

          <form
            onSubmit={handleSecurityFormSubmit(onSecuritySubmit)}
            noValidate
          >

            <FormField
              label="Current Password"
              name="currentPassword"
              type="password"
              placeholder="Enter current password"
              value={currentPassword || ''}
              onChange={(e) =>
                setSecurityValue(
                  'currentPassword',
                  e.target.value,
                  {
                    shouldValidate: true,
                  }
                )
              }
              error={securityErrors.currentPassword?.message}
              rightElement={
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-[#f4511e]"
                >
                  Forgot Password?
                </Link>
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <FormField
                label="New Password"
                name="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword || ''}
                onChange={(e) =>
                  setSecurityValue(
                    'newPassword',
                    e.target.value,
                    {
                      shouldValidate: true,
                    }
                  )
                }
                error={securityErrors.newPassword?.message}
              />

              <FormField
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword || ''}
                onChange={(e) =>
                  setSecurityValue(
                    'confirmPassword',
                    e.target.value,
                    {
                      shouldValidate: true,
                    }
                  )
                }
                error={securityErrors.confirmPassword?.message}
              />

            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="mt-4 w-full rounded-md bg-ink py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-black disabled:opacity-50"
            >
              {isUpdatingPassword
                ? 'Updating...'
                : '🔒 Update Password'}
            </button>

          </form>

        </div>
)}
        {/* Back to Account */}
        <div className="text-center">
          <Link
            to="/profile"
            className="text-xs font-semibold text-muted hover:text-ink uppercase tracking-wider"
          >
            ← Back to My Account
          </Link>
        </div>

      </main>

      {/* --------------------------------------------- */}
      {/* Password Confirmation Modal */}
      {/* --------------------------------------------- */}

      <Modal
        open={passwordConfirmModalOpen}
        title="Change Password"
        message="Are you sure you want to change your password?"
        confirmText="Yes, Change Password"
        cancelText="Cancel"
        onConfirm={handleConfirmPasswordChange}
        onClose={() => {
          if (!isUpdatingPassword) {
            setPasswordConfirmModalOpen(false);
          }
        }}
        loading={isUpdatingPassword}
        variant="danger"
      />

      {/* --------------------------------------------- */}
      {/* Email Change Confirmation Modal */}
      {/* --------------------------------------------- */}

      <Modal
        open={emailConfirmModalOpen}
        title="Change Email Address"
        message={`Are you sure you want to change your email address to ${newEmail}?`}
        confirmText="Yes, Continue"
        cancelText="Cancel"
        onConfirm={handleConfirmEmailChange}
        onClose={() => {
          if (!isSendingEmailOtp) {
            setEmailConfirmModalOpen(false);
          }
        }}
        loading={isSendingEmailOtp}
        variant="danger"
      />

      {/* --------------------------------------------- */}
      {/* OTP Verification */}
      {/* --------------------------------------------- */}

      {isOtpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">

          <div className="flex flex-col items-center gap-3">

            <OtpVerificationCard
              title="Verify"
              highlightedTitle="New Email"
              description={`Enter the 6-digit code we sent to ${pendingEmailRef.current}.`}
              error={otpError}
              isVerifying={isVerifyingOtp}
              isResending={isResendingOtp}
              onSubmit={handleOtpSubmit}
              onResend={handleOtpResend}
              submitLabel="Verify & update email"
              expiresAt={otpExpiresAt}
            />

            <button
              type="button"
              onClick={closeOtpModal}
              disabled={isVerifyingOtp}
              className="text-xs font-semibold uppercase tracking-wider text-white/80 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>

          </div>

        </div>
      )}

      {/* --------------------------------------------- */}
      {/* Image Viewer */}
      {/* --------------------------------------------- */}

      {isViewerOpen && hasValidImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
          onClick={() => setIsViewerOpen(false)}
        >

          <div
            className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex items-center justify-between px-5 py-4 border-b border-line">

              <h3 className="text-sm font-bold text-ink">
                Profile Picture
              </h3>

              <button
                type="button"
                onClick={() => setIsViewerOpen(false)}
                className="text-gray-400 hover:text-ink text-lg font-bold"
              >
                ✕
              </button>

            </div>

            <div className="p-6 flex justify-center bg-gray-50">

              <img
                src={previewImage}
                alt="Profile Large Preview"
                className="max-h-80 max-w-full rounded-xl object-contain shadow"
              />

            </div>

            <div className="p-4 flex justify-end gap-3 bg-white border-t border-line">

              <button
                type="button"
                onClick={() => {
                  setIsViewerOpen(false);
                  fileInputRef.current?.click();
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#f4511e] text-white rounded-md hover:bg-[#e04515]"
              >
                Change Photo
              </button>

              <button
                type="button"
                onClick={() => setIsViewerOpen(false)}
                className="px-4 py-2 text-xs font-semibold border border-line rounded-md hover:bg-gray-50"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

      <Footer />

    </div>
  );
}

export default EditProfile;