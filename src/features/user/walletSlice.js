import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { logoutUser } from "./authSlice";

/*
  Backend endpoints used by the wallet

  GET  /wallet?type=credit|debit&page=1&limit=10   -> data { balance, transactions[], pagination, topUpEnabled, razorpayDemo, limits }
  POST /wallet/top-up/initiate { amount }           -> data { razorpayOrderId, amount(paise), key, currency, demo? }  (opens Razorpay)
  POST /wallet/top-up/verify   { razorpay_* }       -> data { balance, transaction, amount }   (money is added here)
  POST /payments/wallet/pay    { addressId }        -> data { orderNumber, paymentStatus, ... }  (pay an order from the wallet)

  Money goes in ONLY through Razorpay and can never be taken back out (no withdraw endpoint exists).
  The server keeps the balance and decides everything; this slice only passes things along.
*/

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  fallback;

// Balance + history (one page of it)
export const fetchWallet = createAsyncThunk(
  "wallet/fetch",
  async ({ type, page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (type) params.type = type;
      const res = await axiosInstance.get("/wallet", { params });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "We couldn't load your wallet."));
    }
  }
);

// Add money, step 1: the server checks the amount and creates the Razorpay order
export const initiateTopUp = createAsyncThunk(
  "wallet/initiateTopUp",
  async (amount, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/wallet/top-up/initiate", { amount });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "We couldn't start the payment."));
    }
  }
);

// Add money, step 2: after paying, the server checks the payment and adds the money
export const verifyTopUp = createAsyncThunk(
  "wallet/verifyTopUp",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/wallet/top-up/verify", payload);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "We couldn't verify your payment."));
    }
  }
);

// Checkout: pay the whole order from the wallet
export const payWithWallet = createAsyncThunk(
  "wallet/payOrder",
  async ({ addressId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/payments/wallet/pay", { addressId });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "We couldn't complete the wallet payment."));
    }
  }
);

const initialState = {
  balance: 0,
  transactions: [],
  pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 1 },
  topUpEnabled: true,
  razorpayDemo: false,
  limits: null,
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    resetWallet: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.balance = action.payload.balance;
        state.transactions = action.payload.transactions;
        state.pagination = action.payload.pagination;
        state.topUpEnabled = action.payload.topUpEnabled;
        state.razorpayDemo = Boolean(action.payload.razorpayDemo);
        state.limits = action.payload.limits;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "We couldn't load your wallet.";
      })
      .addCase(verifyTopUp.fulfilled, (state, action) => {
        state.balance = action.payload.balance;
      })
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(logoutUser.rejected, () => initialState);
  },
});

export const { resetWallet } = walletSlice.actions;

export default walletSlice.reducer;
