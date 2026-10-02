import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchUserProfile = createAsyncThunk(
  'account/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/account/profile');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'account/updateProfile',
  async ({ username, phoneNumber }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch('/account/profile', { username, phoneNumber });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const uploadProfileImage = createAsyncThunk(
  'account/uploadProfileImage',
  async (imageFile, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('profileImage', imageFile);

      // Let axios set the multipart Content-Type (it must include the boundary)
      const res = await axiosInstance.post('/account/profile-image', formData);

      // Backend responds with { message, data: updatedUser }
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to upload photo');
    }
  }
);

export const updatePassword = createAsyncThunk(
  'account/updatePassword',
  async ({ currentPassword, newPassword, confirmPassword }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch('/account/password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const requestEmailChange = createAsyncThunk(
  'account/requestEmailChange',
  async ({ newEmail }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/account/change-email', { newEmail });
      return res.data; // { message, expiresAt }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const confirmEmailChange = createAsyncThunk(
  'account/confirmEmailChange',
  async ({ otp }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/account/verify-change-email-otp', { otp });
      // Backend responds with { message, data: updatedUser }
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const accountSlice = createSlice({
  name: 'account',
  initialState: {
    profile: null,
    status: 'idle',
    error: null,
    successMessage: null,
    emailChangeStatus: 'idle',
    emailChangeError: null,
    otpExpiresAt: null,
  },
  reducers: {
    clearAccountMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    resetEmailChange: (state) => {
      state.emailChangeStatus = 'idle';
      state.emailChangeError = null;
      state.otpExpiresAt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.successMessage = 'Profile updated successfully';
      })
      .addCase(uploadProfileImage.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
     .addCase(uploadProfileImage.fulfilled, (state, action) => {
  state.profile = { ...state.profile, ...action.payload };
})
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(requestEmailChange.pending, (state) => {
        state.emailChangeStatus = 'requesting';
        state.emailChangeError = null;
      })
      .addCase(requestEmailChange.fulfilled, (state, action) => {
        state.emailChangeStatus = 'otpSent';
        state.otpExpiresAt = action.payload.expiresAt;
      })
      .addCase(requestEmailChange.rejected, (state, action) => {
        state.emailChangeStatus = 'failed';
        state.emailChangeError = action.payload;
      })
      .addCase(confirmEmailChange.pending, (state) => {
        state.emailChangeStatus = 'confirming';
        state.emailChangeError = null;
      })
      .addCase(confirmEmailChange.fulfilled, (state, action) => {
        state.emailChangeStatus = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(confirmEmailChange.rejected, (state, action) => {
        state.emailChangeStatus = 'failed';
        state.emailChangeError = action.payload;
      });
  },
});

export const { clearAccountMessages, resetEmailChange } = accountSlice.actions;
export default accountSlice.reducer;
