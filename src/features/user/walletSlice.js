import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { logoutUser } from "./authSlice";

/*
  Backend endpoints used by the wallet

  GET  /wallet?type=credit|debit&page=1&limit=10   -> data { balance, transactions[], pagination, topUpEnabled, limits }
  POST /wallet/add-money      { amount }            -> data { balance, transaction }     (demo top-up, no real payment)
  POST /payments/wallet/pay   { addressId }         -> data { orderNumber, paymentStatus, ... }  (pay an order from the wallet)

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

// Demo top-up
export const addMoney = createAsyncThunk(
  "wallet/addMoney",
  async (amount, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/wallet/add-money", { amount });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "We couldn't add money to your wallet."));
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
        state.limits = action.payload.limits;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "We couldn't load your wallet.";
      })
      .addCase(addMoney.fulfilled, (state, action) => {
        state.balance = action.payload.balance;
      })
      .addCase(logoutUser.fulfilled, () => initialState)
      .addCase(logoutUser.rejected, () => initialState);
  },
});

export const { resetWallet } = walletSlice.actions;

export default walletSlice.reducer;
