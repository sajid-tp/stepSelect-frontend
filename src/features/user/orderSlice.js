import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { logoutUser } from "./authSlice";
import { downloadBlob } from "../../utils/downloadFile";

const reviewEndpoint = (productId) => `/products/${productId}/reviews`;

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  fallback;

const getBlobErrorMessage = async (error, fallback) => {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      return parsed?.error?.message || parsed?.message || fallback;
    } catch {
      return fallback;
    }
  }
  return getErrorMessage(error, fallback);
};

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async ({ page = 1, limit = 5 } = {}, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/orders", {
        params: { page, limit },
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "We couldn't load your orders.")
      );
    }
  }
);

export const fetchOrder = createAsyncThunk(
  "orders/fetchOrder",
  async (orderRef, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        `/orders/${encodeURIComponent(orderRef)}`
      );
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "We couldn't load this order.")
      );
    }
  }
);

export const fetchReasons = createAsyncThunk(
  "orders/fetchReasons",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/orders/reasons");
      return res.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Could not load reasons."));
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/orders/${orderId}/cancel`, {
        reason: reason || undefined,
      });
      return { message: res.data.message, order: res.data.data };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "We couldn't cancel this order.")
      );
    }
  }
);

export const cancelOrderItem = createAsyncThunk(
  "orders/cancelOrderItem",
  async ({ orderId, itemId, quantity, reason }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `/orders/${orderId}/items/${itemId}/cancel`,
        { quantity, reason: reason || undefined }
      );
      return { message: res.data.message, order: res.data.data };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "We couldn't cancel this item.")
      );
    }
  }
);

export const returnOrder = createAsyncThunk(
  "orders/returnOrder",
  async ({ orderId, reason, description }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/orders/${orderId}/return`, {
        reason,
        description: description || undefined,
      });
      return { message: res.data.message, order: res.data.data };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "We couldn't request this return.")
      );
    }
  }
);

export const returnOrderItem = createAsyncThunk(
  "orders/returnOrderItem",
  async (
    { orderId, itemId, quantity, reason, description },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.post(
        `/orders/${orderId}/items/${itemId}/return`,
        { quantity, reason, description: description || undefined }
      );
      return { message: res.data.message, order: res.data.data };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "We couldn't request this return.")
      );
    }
  }
);

export const downloadInvoice = createAsyncThunk(
  "orders/downloadInvoice",
  async ({ orderId, orderNumber }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/orders/${orderId}/invoice`, {
        responseType: "blob",
      });
      downloadBlob(
        new Blob([res.data], { type: "application/pdf" }),
        `invoice-${orderNumber || orderId}.pdf`
      );
      return true;
    } catch (error) {
      return rejectWithValue(
        await getBlobErrorMessage(error, "We couldn't download the invoice.")
      );
    }
  }
);

export const submitReview = createAsyncThunk(
  "orders/submitReview",
  async ({ productId, orderId, rating, comment }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(reviewEndpoint(productId), {
        rating,
        comment,
        orderId,
      });
      return { message: res.data.message || "Thanks for your review!" };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "We couldn't submit your review.")
      );
    }
  }
);

const emptyPagination = { page: 1, limit: 5, totalItems: 0, totalPages: 0 };

const initialState = {
  list: [],
  pagination: emptyPagination,
  listStatus: "idle",
  listError: null,

  current: null,
  currentStatus: "idle",
  currentError: null,

  reasons: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,

  reducers: {
    clearCurrentOrder: (state) => {
      state.current = null;
      state.currentStatus = "idle";
      state.currentError = null;
    },
    resetOrders: () => initialState,
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        if (state.listStatus !== "succeeded") state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.list = action.payload.orders || [];
        state.pagination = action.payload.pagination || emptyPagination;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = action.payload || "We couldn't load your orders.";
      })

      .addCase(fetchOrder.pending, (state) => {
        if (!state.current) state.currentStatus = "loading";
        state.currentError = null;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.currentStatus = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.currentStatus = "failed";
        state.currentError = action.payload || "We couldn't load this order.";
      })

      .addCase(fetchReasons.fulfilled, (state, action) => {
        state.reasons = action.payload;
      })

      .addMatcher(
        isAnyOf(
          cancelOrder.fulfilled,
          cancelOrderItem.fulfilled,
          returnOrder.fulfilled,
          returnOrderItem.fulfilled
        ),
        (state, action) => {
          const updated = action.payload.order;
          state.current = updated;
          state.currentStatus = "succeeded";
          state.list = state.list.map((o) =>
            o.id === updated.id ? updated : o
          );
        }
      )

      .addMatcher(
        isAnyOf(logoutUser.fulfilled, logoutUser.rejected),
        () => initialState
      );
  },
});

export const { clearCurrentOrder, resetOrders } = orderSlice.actions;

export default orderSlice.reducer;
