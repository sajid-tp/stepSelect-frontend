import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import { GoogleLogin } from '@react-oauth/google';

import {
  loginUser,
  googleLogin,
  clearAuthError,
} from '../features/user/authSlice';

function Login() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const status = useSelector((state) => state.auth.status);
  const error = useSelector((state) => state.auth.error);

  const isSubmitting = status === 'loading';
 
  const [form, setForm] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });

  const errors = {
    email: !form.email
      ? 'Email is required'
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
      ? 'Enter a valid email address'
      : '',
   password: !form.password
  ? 'Password is required'
  : !/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(form.password)
  ? 'Password must be at least 8 characters and contain an uppercase letter, a lowercase letter, a number, and a special character'
  : '',
  };

  const isValid = !errors.email && !errors.password;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({ email: true, password: true });

 
    if (!isValid) return;

    dispatch(clearAuthError());

    try {
      await dispatch(loginUser(form)).unwrap();
      navigate('/');
    } catch (err) {
   
    }
  };

  useEffect(()=>{
    dispatch(clearAuthError());
  },[dispatch])

  

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      await dispatch(googleLogin({ token })).unwrap();
      navigate('/');
    } catch (err) {
     
    }
  };

  const handleGoogleError = () => {


  };

  return (
    <AuthLayout
      imageSrc="https://placehold.co/800x1000/3a3a3a/e5e5e5?text=Login"
      overlayTitle="Welcome Back."
    >
      <h1 className="mb-2 text-3xl font-bold">
        Log <span className="text-[#f4511e]">In</span>
      </h1>
      <p className="mb-8 text-sm text-muted">
        Welcome back. Enter your details to continue.
      </p>

      {error && (
        <p className="mb-4 text-sm font-medium text-[#f4511e]">{error}</p>
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
        <FormField
          label="Password"
          name="password"
          type="password"
          placeholder="Your password"
          value={form.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password ? errors.password : ''}
          rightElement={
            <Link to="/forgot-password" className="text-xs font-semibold text-[#f4511e]">
              Forgot password?
            </Link>
          }
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-md bg-[#f4511e] py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-300"></div>
        <span className="text-sm text-muted">OR</span>
        <div className="h-px flex-1 bg-gray-300"></div>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-ink underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Login;
