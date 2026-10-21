import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

/*
  Backend endpoints used by the checkout page

  GET    /checkout              -> data { addresses[], defaultAddressId, items[], pricing, coupon, couponMessage,
                                          paymentMethods[], canPlaceOrder }
  GET    /coupons               -> data { coupons[] }
  POST   /cart/apply-coupon     body { couponCode }
  DELETE /cart/coupon
  POST   /checkout/place-order  body { addressId, paymentMethod } -> data { orderId, orderNumber, totalAmount, ... }

  The server stores the applied coupon on the cart and recalculates every price,
  so this slice never calculates money. It only stores what the server sends.
*/

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  fallback;

// Mongo sends `_id`; the rest of the UI uses `id`
const normalizeAddress = (address) => ({
  ...address,
  id: address._id ?? address.id,
});

// =====================================================
// GET CHECKOUT SUMMARY
// =====================================================
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

// =====================================================
// AVAILABLE COUPONS (dropdown)
// =====================================================
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

// =====================================================
// APPLY / REMOVE COUPON  (then reload the summary so totals stay correct)
// =====================================================
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

// =====================================================
// PLACE ORDER (COD)
// =====================================================
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
  data: null, // the checkout summary
  status: "idle", // idle | loading | succeeded | failed
  refreshing: false, // reloading in the background (data already on screen)
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
