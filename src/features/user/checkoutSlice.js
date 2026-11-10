import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  fallback;

const normalizeAddress = (address) => ({
  ...address,
  id: address._id ?? address.id,
});

export const fetchCheckout = createAsyncThunk(
  "checkout/fetchCheckout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/checkout");
      const data = res.data.data;

      return { ...data, addresses: (data.addresses || []).map(normalizeAddress) };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "We couldn't load your checkout.")
      );
    }
  }
);

export const fetchAvailableCoupons = createAsyncThunk(
  "checkout/fetchAvailableCoupons",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/coupons");
      return res.data.data.coupons || [];
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "We couldn't load your coupons.")
      );
    }
  }
);

export const applyCoupon = createAsyncThunk(
  "checkout/applyCoupon",
  async (couponCode, { dispatch, rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/cart/apply-coupon", { couponCode });
      await dispatch(fetchCheckout());
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "This coupon could not be applied.")
      );
    }
  }
);

export const removeCoupon = createAsyncThunk(
  "checkout/removeCoupon",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete("/cart/coupon");
      await dispatch(fetchCheckout());
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "We couldn't remove the coupon.")
      );
    }
  }
);

export const placeOrder = createAsyncThunk(
  "checkout/placeOrder",
  async ({ addressId, paymentMethod = "COD" }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/checkout/place-order", {
        addressId,
        paymentMethod,
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "We couldn't place your order. Please try again.")
      );
    }
  }
);

const initialState = {
  data: null,
  status: "idle",
  refreshing: false,
  error: null,

  coupons: [],
  couponsStatus: "idle",
  couponsError: null,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,

  reducers: {
    resetCheckout: () => initialState,
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchCheckout.pending, (state) => {
        state.error = null;
        if (state.data) state.refreshing = true;
        else state.status = "loading";
      })
      .addCase(fetchCheckout.fulfilled, (state, action) => {
        state.data = action.payload;
        state.status = "succeeded";
        state.refreshing = false;
      })
      .addCase(fetchCheckout.rejected, (state, action) => {
        state.refreshing = false;
        state.error = action.payload;
        if (!state.data) state.status = "failed";
      })

      .addCase(fetchAvailableCoupons.pending, (state) => {
        state.couponsStatus = "loading";
        state.couponsError = null;
      })
      .addCase(fetchAvailableCoupons.fulfilled, (state, action) => {
        state.couponsStatus = "succeeded";
        state.coupons = action.payload;
      })
      .addCase(fetchAvailableCoupons.rejected, (state, action) => {
        state.couponsStatus = "failed";
        state.couponsError = action.payload;
      });
  },
});

export const { resetCheckout } = checkoutSlice.actions;

export default checkoutSlice.reducer;
