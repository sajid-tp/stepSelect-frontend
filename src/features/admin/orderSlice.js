import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

/*
|--------------------------------------------------------------------------
| Backend endpoints used by the admin order pages
|--------------------------------------------------------------------------
| GET   /admin/orders?search&status&sort&from&to&page&limit
|         -> data { orders[], pagination }
| GET   /admin/orders/:orderId
|         -> data order (+ user, allowedStatuses[])
| PATCH /admin/orders/:orderId        body { status }
|         -> data order (same shape as GET one)
|
| The server decides which status changes are allowed (forward only,
| cancel only before delivery) and sends them in `allowedStatuses`,
| so this slice and the pages never repeat those rules.
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
// CHANGE STATUS (the only thing the admin can edit)
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
// SLICE
// =====================================================
const initialState = {
  orders: [],
  pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 1 },
  status: "idle", // idle | loading | succeeded | failed
  error: null,

  current: null,
  currentStatus: "idle",
  currentError: null,
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
      .addCase(updateAdminOrderStatus.fulfilled, (state, action) => {
        const updated = action.payload.order;
        state.current = updated;
        state.currentStatus = "succeeded";
        state.orders = state.orders.map((o) =>
          o.id === updated.id
            ? { ...o, status: updated.status, paymentStatus: updated.paymentStatus }
            : o
        );
      });
  },
});

export const { clearAdminOrder } = adminOrderSlice.actions;

export default adminOrderSlice.reducer;
