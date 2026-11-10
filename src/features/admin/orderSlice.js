import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;

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

export const handleAdminReturn = createAsyncThunk(
  "adminOrders/handleAdminReturn",
  async ({ orderId, itemId, action, reason, restock }, { rejectWithValue }) => {
    try {
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

const initialState = {
  orders: [],
  pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 1 },
  pendingReturnOrders: 0,
  status: "idle",
  error: null,

  current: null,
  currentStatus: "idle",
  currentError: null,
};

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

      .addCase(updateAdminItemStatus.fulfilled, applyUpdatedOrder)
      .addCase(updateAdminOrderStatus.fulfilled, applyUpdatedOrder)

      .addCase(handleAdminReturn.fulfilled, (state, action) => {
        state.current = action.payload.order;
        state.currentStatus = "succeeded";
      });
  },
});

export const { clearAdminOrder } = adminOrderSlice.actions;

export default adminOrderSlice.reducer;
