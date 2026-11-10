import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;

export const getCoupons = createAsyncThunk(
  "adminCoupons/getCoupons",
  async (
    { search = "", status = "all", page = 1, limit = 9, sort = "newest" } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get("/admin/coupons", {
        params: { search, status, page, limit, sort },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch coupons."));
    }
  }
);

export const getCouponById = createAsyncThunk(
  "adminCoupons/getCouponById",
  async (couponId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/admin/coupons/${couponId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load coupon."));
    }
  }
);

export const createCoupon = createAsyncThunk(
  "adminCoupons/createCoupon",
  async (couponData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/admin/coupons", couponData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create coupon."));
    }
  }
);

export const updateCoupon = createAsyncThunk(
  "adminCoupons/updateCoupon",
  async ({ couponId, couponData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/admin/coupons/${couponId}`,
        couponData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update coupon."));
    }
  }
);

export const toggleCouponStatus = createAsyncThunk(
  "adminCoupons/toggleCouponStatus",
  async (couponId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/admin/coupons/${couponId}/status`
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update coupon status.")
      );
    }
  }
);

export const deleteCoupon = createAsyncThunk(
  "adminCoupons/deleteCoupon",
  async (couponId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/admin/coupons/${couponId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete coupon."));
    }
  }
);

const initialState = {
  coupons: [],
  totalResults: 0,
  totalPages: 1,
  currentPage: 1,
  limit: 9,

  status: "idle",
  error: null,

  current: null,
  currentStatus: "idle",
  currentError: null,

  createStatus: "idle",
  createError: null,

  updateStatus: "idle",
  updateError: null,

  toggleStatus: "idle",
  toggleError: null,

  deleteStatus: "idle",
  deleteError: null,
};

const couponSlice = createSlice({
  name: "adminCoupons",
  initialState,

  reducers: {
    clearCouponErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.toggleError = null;
      state.deleteError = null;
      state.currentError = null;
    },
    resetCouponFormState: (state) => {
      state.createStatus = "idle";
      state.createError = null;
      state.updateStatus = "idle";
      state.updateError = null;
      state.current = null;
      state.currentStatus = "idle";
      state.currentError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getCoupons.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getCoupons.fulfilled, (state, action) => {
        const { coupons, pagination } = action.payload;
        state.status = "succeeded";
        state.coupons = coupons;
        state.totalResults = pagination.totalResults;
        state.totalPages = pagination.totalPages;
        state.currentPage = pagination.page;
        state.limit = pagination.limit;
      })
      .addCase(getCoupons.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(getCouponById.pending, (state) => {
        state.currentStatus = "loading";
        state.currentError = null;
      })
      .addCase(getCouponById.fulfilled, (state, action) => {
        state.currentStatus = "succeeded";
        state.current = action.payload;
      })
      .addCase(getCouponById.rejected, (state, action) => {
        state.currentStatus = "failed";
        state.currentError = action.payload;
      })

      .addCase(createCoupon.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createCoupon.fulfilled, (state) => {
        state.createStatus = "succeeded";
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload;
      })

      .addCase(updateCoupon.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        const index = state.coupons.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state.coupons[index] = action.payload;
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload;
      })

      .addCase(toggleCouponStatus.pending, (state) => {
        state.toggleStatus = "loading";
        state.toggleError = null;
      })
      .addCase(toggleCouponStatus.fulfilled, (state, action) => {
        state.toggleStatus = "succeeded";
        const index = state.coupons.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.coupons[index].isActive = action.payload.isActive;
        }
      })
      .addCase(toggleCouponStatus.rejected, (state, action) => {
        state.toggleStatus = "failed";
        state.toggleError = action.payload;
      })

      .addCase(deleteCoupon.pending, (state) => {
        state.deleteStatus = "loading";
        state.deleteError = null;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.coupons = state.coupons.filter((c) => c.id !== action.payload.id);
        state.totalResults = Math.max(state.totalResults - 1, 0);
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError = action.payload;
      });
  },
});

export const { clearCouponErrors, resetCouponFormState } = couponSlice.actions;

export default couponSlice.reducer;
