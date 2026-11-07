import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

/*
|--------------------------------------------------------------------------
| Backend endpoints used by the admin order pages
|--------------------------------------------------------------------------
| GET   /admin/orders?search&status&sort&from&to&page&limit
|         -> data { orders[] (each with returnRequestCount), pagination, pendingReturnOrders }
|         status can also be "return_requested" = the Returns tab
| GET   /admin/orders/:orderId
|         -> data order (+ user; every item has its own allowedStatuses[])
| PATCH /admin/orders/:orderId/items/:itemId/status   body { status }
|         -> data order (same shape as GET one)
|
| Every PRODUCT (item) of an order has its own delivery status. The order's
| status is worked out by the server from its items, so it is never edited.
| The server decides which status changes are allowed (one step forward,
| cancel only while still pending) and sends them in each item's
| `allowedStatuses`, so this slice and the pages never repeat those rules.
*/

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;

// =====================================================
// LIST
// =====================================================
export const getAdminOrders = createAsyncThunk(
  "adminOrders/getAdminOrders",
  async (
    {
      search = "",
      status = "all",
      sort = "newest",
      from = "",
      to = "",
      page = 1,
      limit = 10,
    } = {},
    { rejectWithValue }
  ) => {
    try {
      // "all" and empty values are simply not sent
      const params = { sort, page, limit };
      if (search) params.search = search;
      if (status && status !== "all") params.status = status;
      if (from) params.from = from;
      if (to) params.to = to;

      const response = await axiosInstance.get("/admin/orders", { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch orders."));
    }
  }
);

// =====================================================
// ONE ORDER (edit page)
// =====================================================
export const getAdminOrder = createAsyncThunk(
  "adminOrders/getAdminOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/admin/orders/${encodeURIComponent(orderId)}`
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load order."));
    }
  }
);

// =====================================================
// CHANGE THE DELIVERY STATUS OF ONE PRODUCT (item) OF AN ORDER
// =====================================================
export const updateAdminItemStatus = createAsyncThunk(
  "adminOrders/updateAdminItemStatus",
  async ({ orderId, itemId, status }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/admin/orders/${orderId}/items/${itemId}/status`,
        { status }
      );
      return { message: response.data.message, order: response.data.data };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update the item status.")
      );
    }
  }
);

// =====================================================
// CHANGE STATUS OF EVERY OPEN ITEM AT ONCE (not used by the pages any more)
// =====================================================
export const updateAdminOrderStatus = createAsyncThunk(
  "adminOrders/updateAdminOrderStatus",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/admin/orders/${orderId}`, {
        status,
      });
      return { message: response.data.message, order: response.data.data };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update order status.")
      );
    }
  }
);

// =====================================================
// APPROVE / REJECT A RETURN REQUEST (one item)
// =====================================================
export const handleAdminReturn = createAsyncThunk(
  "adminOrders/handleAdminReturn",
  async ({ orderId, itemId, action, reason, restock }, { rejectWithValue }) => {
    try {
      // restock (approve only): true = add the returned units back to stock, false = do not
      const body = { action, reason };
      if (restock !== undefined) body.restock = restock;

      const response = await axiosInstance.patch(
        `/admin/orders/${orderId}/items/${itemId}/return`,
        body
      );
      return { message: response.data.message, order: response.data.data };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update the return request.")
      );
    }
  }
);

// =====================================================
// SLICE
// =====================================================
const initialState = {
  orders: [],
  pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 1 },
  pendingReturnOrders: 0, // orders with a return waiting for the admin (badge on the Returns tab)
  status: "idle", // idle | loading | succeeded | failed
  error: null,

  current: null,
  currentStatus: "idle",
  currentError: null,
};

// An item (or the whole order) changed: show the new order and keep the list row in step
const applyUpdatedOrder = (state, action) => {
  const updated = action.payload.order;
  state.current = updated;
  state.currentStatus = "succeeded";
  state.orders = state.orders.map((o) =>
    o.id === updated.id
      ? { ...o, status: updated.status, paymentStatus: updated.paymentStatus }
      : o
  );
};

const adminOrderSlice = createSlice({
  name: "adminOrders",
  initialState,

  reducers: {
    clearAdminOrder: (state) => {
      state.current = null;
      state.currentStatus = "idle";
      state.currentError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // ----- list -----
      .addCase(getAdminOrders.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getAdminOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.orders = action.payload.orders || [];
        state.pagination = action.payload.pagination || initialState.pagination;
        state.pendingReturnOrders = action.payload.pendingReturnOrders || 0;
      })
      .addCase(getAdminOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch orders.";
      })

      // ----- one order -----
      .addCase(getAdminOrder.pending, (state) => {
        state.currentStatus = "loading";
        state.currentError = null;
      })
      .addCase(getAdminOrder.fulfilled, (state, action) => {
        state.currentStatus = "succeeded";
        state.current = action.payload;
      })
      .addCase(getAdminOrder.rejected, (state, action) => {
        state.currentStatus = "failed";
        state.currentError = action.payload || "Failed to load order.";
      })

      // ----- status changed: show the new order, keep the list row in step -----
      .addCase(updateAdminItemStatus.fulfilled, applyUpdatedOrder)
      .addCase(updateAdminOrderStatus.fulfilled, applyUpdatedOrder)

      // ----- return approved / rejected: show the refreshed order -----
      .addCase(handleAdminReturn.fulfilled, (state, action) => {
        state.current = action.payload.order;
        state.currentStatus = "succeeded";
      });
  },
});

export const { clearAdminOrder } = adminOrderSlice.actions;

export default adminOrderSlice.reducer;
