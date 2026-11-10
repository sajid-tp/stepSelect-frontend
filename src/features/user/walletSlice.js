import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { logoutUser } from "./authSlice";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  fallback;

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
  status: "idle",
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
