import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

/*
|--------------------------------------------------------------------------
| Backend endpoint used by the admin Dashboard
|--------------------------------------------------------------------------
| GET /admin/dashboard?period&from&to
|       period = daily | weekly | monthly | yearly | custom (custom needs from + to)
|       -> data { range, summary, trend, topProducts[], topCategories[], topBrands[] }
*/

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;

export const getAdminDashboard = createAsyncThunk(
  "adminDashboard/getAdminDashboard",
  async ({ period = "weekly", from = "", to = "" } = {}, { rejectWithValue }) => {
    try {
      const params = { period };
      if (period === "custom") {
        params.from = from;
        params.to = to;
      }
      const response = await axiosInstance.get("/admin/dashboard", { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load the dashboard.")
      );
    }
  }
);

const initialState = {
  data: null,
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAdminDashboard.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getAdminDashboard.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(getAdminDashboard.rejected, (state, action) => {
        // A request cancelled because a newer one started: ignore it
        if (action.meta.aborted) return;
        state.status = "failed";
        state.error = action.payload || "Failed to load the dashboard.";
      });
  },
});

export default adminDashboardSlice.reducer;
