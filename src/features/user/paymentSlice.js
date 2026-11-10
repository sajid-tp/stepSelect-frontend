import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { logoutUser } from "./authSlice";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  fallback;

export const initiatePayment = createAsyncThunk(
  "payment/initiate",
  async ({ addressId, gateway }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/payments/initiate", { addressId, gateway });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "We couldn't start your payment."));
    }
  }
);

export const verifyRazorpayPayment = createAsyncThunk(
  "payment/verifyRazorpay",
  async (body, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/payments/razorpay/verify", body);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "We couldn't verify your payment."));
    }
  }
);

export const reportPaymentFailure = createAsyncThunk(
  "payment/reportFailure",
  async ({ orderNumber, reason, paymentId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `/payments/${encodeURIComponent(orderNumber)}/failed`,
        { reason, paymentId }
      );
      return res.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Could not record the payment result."));
    }
  }
);

export const retryPayment = createAsyncThunk(
  "payment/retry",
  async ({ orderNumber, gateway }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `/payments/${encodeURIComponent(orderNumber)}/retry`,
        { gateway }
      );
      return res.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "We couldn't restart your payment."));
    }
  }
);

export const abandonPayment = createAsyncThunk(
  "payment/abandon",
  async (orderNumber, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `/payments/${encodeURIComponent(orderNumber)}/abandon`
      );
      return res.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Could not cancel this payment."));
    }
  }
);

export const fetchPaymentStatus = createAsyncThunk(
  "payment/fetchStatus",
  async (orderNumber, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/payments/${encodeURIComponent(orderNumber)}/status`
      );
      return res.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "We couldn't load this payment."));
    }
  }
);

const initialState = {
  result: null,
  status: "idle",
  error: null,
  failureModal: { open: false, orderNumber: null, reason: "", error: "" },
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    resetPayment: (state) => ({ ...initialState, failureModal: state.failureModal }),
    openPaymentFailure: (state, action) => {
      const { orderNumber, reason = "", error = "" } = action.payload || {};
      state.failureModal = { open: true, orderNumber, reason, error };
    },
    closePaymentFailure: (state) => {
      state.failureModal = { open: false, orderNumber: null, reason: "", error: "" };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentStatus.pending, (state, action) => {
        if (!state.result || state.result.orderNumber !== action.meta.arg) state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPaymentStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.result = action.payload;
      })
      .addCase(fetchPaymentStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "We couldn't load this payment.";
      })
      .addCase(verifyRazorpayPayment.fulfilled, (state, action) => {
        state.result = action.payload;
      })
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(logoutUser.rejected, () => initialState);
  },
});

export const { resetPayment, openPaymentFailure, closePaymentFailure } = paymentSlice.actions;

export default paymentSlice.reducer;
