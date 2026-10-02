import { createSlice, createAsyncThunk, isAnyOf } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { setItem, getItem, removeItem } from '../../utils/localStorage';

// Profile thunks: when any of these succeed, auth.user is kept in sync
// so the Navbar never shows stale data. Adjust the path if needed.
import {
  fetchUserProfile,
  updateProfile,
  uploadProfileImage,
  confirmEmailChange,
} from './accountSlice';

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      return res.data; // { id, username }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signup',
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/auth/signup', { username, email, password });
      return res.data; // { _id, username }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/auth/logout');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const googleSignup = createAsyncThunk(
  'auth/googleSignup',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/google', { token });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Google signup failed');
    }
  }
);

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/google', { token });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Google login failed');
    }
  }
);

export const otpSignup = createAsyncThunk(
  'auth/sendOtp',
  async ({ email }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/auth/send-otp', { email });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Carries `type` so the backend knows whether this is the signup flow
// or the forgot-password flow re-sending a code.
export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async ({ email, type }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/auth/resend-otp', { email, type });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/auth/verify-otp', { email, otp });
      return res.data; // { id, username } — verifying logs the user in
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const verifyResetOtp = createAsyncThunk(
  'auth/verifyResetOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/auth/verify-reset-otp', { email, otp });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/auth/forgot-password', { email });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ newPassword, resetToken }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/auth/reset-password', { newPassword, resetToken });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getItem('user') || null,
    status: 'idle',
    error: null,
    resetToken: null,
    blocked: false, // true when the backend says this user is blocked
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.status = 'idle';
      state.error = null;
      removeItem('user');
    },
    clearAuthError(state) {
      state.error = null;
    },
    setBlocked(state) {
      state.blocked = true;
    },
    clearBlocked(state) {
      state.blocked = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // ---------- login ----------
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        setItem('user', action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // ---------- signup ----------
      .addCase(signupUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // ---------- send otp ----------
      .addCase(otpSignup.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(otpSignup.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(otpSignup.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // ---------- verify otp ----------
      .addCase(verifyOtp.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        setItem('user', action.payload);
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // ---------- resend otp ----------
      // Deliberately not touching state.status: resend is a background
      // action on the same screen.
      .addCase(resendOtp.pending, (state) => {
        state.error = null;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ---------- verify reset otp ----------
      .addCase(verifyResetOtp.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verifyResetOtp.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.resetToken = action.payload.resetToken;
      })
      .addCase(verifyResetOtp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // ---------- forgot password ----------
      .addCase(forgotPassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // ---------- reset password ----------
      .addCase(resetPassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = 'succeeded';
        // no state.user: reset doesn't log anyone in
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // ---------- google signup ----------
      .addCase(googleSignup.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(googleSignup.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.error = null;
        setItem('user', action.payload); // persist so refresh keeps the session
      })
      .addCase(googleSignup.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // ---------- google login ----------
      .addCase(googleLogin.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.error = null;
        setItem('user', action.payload); // persist so refresh keeps the session
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // ---------- logout ----------
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
        state.error = null;
        removeItem('user'); // clear persisted user too
      })

      // ---------- keep auth.user in sync with profile changes ----------
      // NOTE: addMatcher must come AFTER all addCase calls.
      .addMatcher(
        isAnyOf(
          fetchUserProfile.fulfilled,
          updateProfile.fulfilled,
          uploadProfileImage.fulfilled,
          confirmEmailChange.fulfilled
        ),
        (state, action) => {
          if (state.user && action.payload) {
            state.user = { ...state.user, ...action.payload };
            setItem('user', state.user);
          }
        }
      );
  },
});

export const { logout, clearAuthError, setBlocked, clearBlocked } = authSlice.actions;
export default authSlice.reducer;
