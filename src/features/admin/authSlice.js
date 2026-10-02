import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// 1. Admin Login
export const loginAdmin = createAsyncThunk(
  "adminAuth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/admin/auth/login", {
        email,
        password,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

// 2. Admin Logout
export const adminLogout = createAsyncThunk(
  "adminAuth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/admin/auth/logout");
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Logout failed"
      );
    }
  }
);

// 3. Verify Admin Session (Runs when page reloads or user opens URL directly)
export const checkAdminAuth = createAsyncThunk(
  "adminAuth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/auth/me");
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Session invalid or expired"
      );
    }
  }
);

const authSlice = createSlice({
  name: "adminAuth",

  initialState: {
    isAdmin: false,
    status: "idle",
    isCheckingAuth: true, // Set to true initially so route guards wait before deciding
    error: null,
  },

  reducers: {
    logout(state) {
      state.isAdmin = false;
      state.status = "idle";
      state.error = null;
      state.isCheckingAuth = false;
    },

    clearAuth(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginAdmin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state) => {
        state.isAdmin = true;
        state.status = "succeeded";
        state.isCheckingAuth = false;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.status = "failed";
        state.isAdmin = false;
        state.isCheckingAuth = false;
        state.error = action.payload;
      })

      // LOGOUT
      .addCase(adminLogout.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(adminLogout.fulfilled, (state) => {
        state.isAdmin = false;
        state.status = "idle";
        state.isCheckingAuth = false;
        state.error = null;
      })
      .addCase(adminLogout.rejected, (state, action) => {
        // Clear local state even if the network call failed
        state.isAdmin = false;
        state.status = "idle";
        state.isCheckingAuth = false;
        state.error = action.payload;
      })

      // CHECK AUTH (Session Check)
      .addCase(checkAdminAuth.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(checkAdminAuth.fulfilled, (state) => {
        state.isAdmin = true;
        state.status = "succeeded";
        state.isCheckingAuth = false;
        state.error = null;
      })
      .addCase(checkAdminAuth.rejected, (state) => {
        state.isAdmin = false;
        state.status = "idle";
        state.isCheckingAuth = false;
      });
  },
});

export default authSlice.reducer;

export const { logout, clearAuth } = authSlice.actions;