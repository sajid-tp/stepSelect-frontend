import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { logoutUser } from "./authSlice";

/*
  Backend endpoints used by online payment (all under /api/payments)

  POST /payments/initiate                { addressId, gateway }     -> data { orderNumber, gateway, ...gateway data }
  POST /payments/razorpay/verify         { orderNumber, razorpay_order_id, razorpay_payment_id, razorpay_signature }
  POST /payments/:orderNumber/failed     { reason, paymentId? }     (the open attempt failed; 4 attempts per order)
  POST /payments/:orderNumber/retry      { gateway? }               -> data { orderNumber, gateway, ...gateway data }
                                                                       (or { alreadyPaid: true } when the money had already arrived)
  POST /payments/:orderNumber/abandon
  GET  /payments/:orderNumber/status     -> data { orderNumber, displayStatus, paymentStatus, paymentMethod, totalAmount,
                                                   failureReason, canRetry, closedReason (expired | exhausted | abandoned),
                                                   failedAttempts, attemptsUsed, maxAttempts, attemptsLeft,
                                                   nextAttemptIsFinal, cooldownSecondsLeft, secondsLeft (30 minute hold), ... }

  Business rules (decided by the server, shown here): the order holds its stock for 30 minutes from the moment it was created,
  4 attempts in total, and the 4th (final) attempt opens only after a 2 minute cool-down. After that the order is "Payment failed".

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
  // The one payment-failure modal (components/PaymentFailureModal.jsx). Any page can open it.
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

export const { resetPayment, openPaymentFailure, closePaymentFailure } = paymentSlice.actions;

export default paymentSlice.reducer;
