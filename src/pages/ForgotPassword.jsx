

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import { forgotPassword } from '../features/user/authSlice';


function ForgotPassword() {
  const [form, setForm] = useState({
    email: '',
  });

  const [touched, setTouched] = useState({
    email: false,
  });

  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();


  const errors = {
    email: !form.email
      ? 'Email is required'
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
      ? 'Enter a valid email address'
      : '',
  };

  const isValid = !errors.email;

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
      email: true,
    });

    if (!isValid) return;

    setServerError('');
    setIsSubmitting(true);

    try {
      await dispatch(forgotPassword({ email: form.email })).unwrap();

      navigate('/verify-otp', {
        state: {
          email: form.email,
          type: 'reset',
        },
      });
    } catch (err) {
      setServerError(err || 'Could not send reset code. Please check the email and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      imageSrc="https://placehold.co/800x1000/4a4a4a/e5e5e5?text=Secure"
      overlayTitle="Secure Your Account."
    >
      <h1 className="mb-2 text-3xl font-bold">
        Forgot <span className="text-[#f4511e]">Password?</span>
      </h1>

      <p className="mb-8 text-sm text-muted">
        No worries. Enter your email and we will send a reset code.
      </p>

      {serverError && (
        <p className="mb-4 text-sm font-medium text-[#f4511e]">{serverError}</p>
      )}

      <form onSubmit={handleSubmit} noValidate>
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-md bg-[#f4511e] py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Sending…' : 'Send reset code'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Remember your password?{' '}
        <Link to="/login" className="font-semibold text-ink underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default ForgotPassword;
