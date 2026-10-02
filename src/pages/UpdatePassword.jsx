
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import { resetPassword } from '../features/user/authSlice'; // adjust path to match your slice location
import { useSelector } from 'react-redux';

function UpdatePassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const resetToken = useSelector((state)=>state.auth.resetToken);


  const { email } = location.state || {};

  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = {
    password: !form.password
      ? 'Password is required'
      : form.password.length < 6
      ? 'Password must be at least 6 characters'
      : '',
    confirmPassword: !form.confirmPassword
      ? 'Please confirm your password'
      : form.confirmPassword !== form.password
      ? 'Passwords do not match'
      : '',
  };

  const isValid = !errors.password && !errors.confirmPassword;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      password: true,
      confirmPassword: true,
    });

    if (!email) {
      setServerError('Missing verification — please restart the password reset process.');
      return;
    }

    if (!isValid) return;

    setServerError('');
    setIsSubmitting(true);

    try {
      await dispatch(resetPassword({ newPassword: form.password, resetToken })).unwrap();
      navigate('/login');
    } catch (err) {
      setServerError(err || 'Could not update password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      imageSrc="https://placehold.co/800x1000/dcdcdc/6b6b6b?text=Sneaker"
      overlayTitle="Secure Your Account."
    >
      <h1 className="mb-2 text-3xl font-bold">
        Update <span className="text-[#f4511e]">Password?</span>
      </h1>

      <p className="mb-8 text-sm text-muted">
        Set a new password. Make sure it&apos;s something you&apos;ll remember.
      </p>

      {serverError && (
        <p className="mb-4 text-sm font-medium text-[#f4511e]">{serverError}</p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          label="New password"
          name="password"
          type="password"
          placeholder="At least 6 characters"
          value={form.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password ? errors.password : ''}
        />

        <FormField
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          placeholder="Re-enter password"
          value={form.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.confirmPassword ? errors.confirmPassword : ''}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-md bg-[#f4511e] py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </AuthLayout>
  );
}

export default UpdatePassword;
