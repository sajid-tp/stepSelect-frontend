import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { logoutUser } from "./authSlice";
import { downloadBlob } from "../../utils/downloadFile";

/*
  Backend endpoints used by the order pages (all under /api/orders)

  GET  /orders?page=&limit=                    -> data { orders[], pagination }
  GET  /orders/reasons                         -> data { cancelReasons[], returnReasons[] }
  GET  /orders/:orderId                        -> data order   (orderId = _id or orderNumber)
  POST /orders/:orderId/cancel                 body { reason? }
  POST /orders/:orderId/items/:itemId/cancel   body { quantity, reason? }
  POST /orders/:orderId/return                 body { reason, description? }
  POST /orders/:orderId/items/:itemId/return   body { quantity, reason, description? }
  GET  /orders/:orderId/invoice                -> PDF

  Every cancel / return call answers with the UPDATED order, so the details page
  just shows whatever the server sends back. This slice never calculates money.
*/

// The review API is not on the server yet (Week 5). Change this ONE line when it is.
const reviewEndpoint = (productId) => `/products/${productId}/reviews`;

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  fallback;

// Errors from a blob request (invoice) arrive as a Blob, so read the JSON out of it
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

// =====================================================
// ORDER HISTORY (paginated)
// =====================================================
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

// =====================================================
// ONE ORDER
// =====================================================
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

// =====================================================
// CANCEL / RETURN REASONS (dropdown options)
// =====================================================
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

// =====================================================
// CANCEL WHOLE ORDER
// =====================================================
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

// =====================================================
// CANCEL ONE ITEM (some or all of its units)
// =====================================================
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

// =====================================================
// RETURN WHOLE ORDER (every delivered item, full quantity)
// =====================================================
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

// =====================================================
// RETURN ONE ITEM (some or all of its units)
// =====================================================
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

// =====================================================
// INVOICE PDF
// =====================================================
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

// =====================================================
// REVIEW  (needs the review API, see reviewEndpoint above)
// =====================================================
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

// =====================================================
// SLICE
// =====================================================
const emptyPagination = { page: 1, limit: 5, totalItems: 0, totalPages: 0 };

const initialState = {
  // order history
  list: [],
  pagination: emptyPagination,
  listStatus: "idle", // idle | loading | succeeded | failed
  listError: null,

  // order details
  current: null,
  currentStatus: "idle",
  currentError: null,

  // cancel / return dropdown options
  reasons: null, // { cancelReasons[], returnReasons[] }
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
      // ----- history -----
      .addCase(fetchOrders.pending, (state) => {
        // keep showing the old page while the next one loads
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

      // ----- details -----
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

      // ----- reasons -----
      .addCase(fetchReasons.fulfilled, (state, action) => {
        state.reasons = action.payload;
      })

      // ----- cancel / return: the server sends back the updated order -----
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
          // keep the history list in step, in case it is shown again
          state.list = state.list.map((o) =>
            o.id === updated.id ? updated : o
          );
        }
      )

      // ----- clear on logout -----
      .addMatcher(
        isAnyOf(logoutUser.fulfilled, logoutUser.rejected),
        () => initialState
      );
  },
});

export const { clearCurrentOrder, resetOrders } = orderSlice.actions;

export default orderSlice.reducer;
