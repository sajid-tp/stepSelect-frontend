import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { logoutUser } from "./authSlice";

/*
  Backend endpoints used by online payment (all under /api/payments)

  POST /payments/initiate                { addressId, gateway }     -> data { orderNumber, gateway, ...gateway data }
  POST /payments/razorpay/verify         { orderNumber, razorpay_order_id, razorpay_payment_id, razorpay_signature }
  POST /payments/:orderNumber/failed     { reason }
  POST /payments/:orderNumber/retry      { gateway? }               -> data { orderNumber, gateway, ...gateway data }
  POST /payments/:orderNumber/abandon
  GET  /payments/:orderNumber/status     -> data { orderNumber, paymentStatus, paymentMethod, totalAmount,
                                                   paymentId, paidAt, failureReason, canRetry, ... }

  The server decides every amount and checks every payment; this slice only passes things along.
*/

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  fallback;

// Step 1: create the order + the gateway payment
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

// Razorpay popup finished: the server checks the signature
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
  async ({ orderNumber, reason }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `/payments/${encodeURIComponent(orderNumber)}/failed`,
        { reason }
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

// "Back to cart": the shoes held for this order go back on the shelf
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
  result: null, // the latest payment status the server sent
  status: "idle", // idle | loading | succeeded | failed (for fetchPaymentStatus)
  error: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    resetPayment: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentStatus.pending, (state) => {
        state.status = "loading";
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

export const { resetPayment } = paymentSlice.actions;

export default paymentSlice.reducer;
