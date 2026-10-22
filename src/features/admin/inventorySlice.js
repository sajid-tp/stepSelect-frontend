import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

/*
|--------------------------------------------------------------------------
| Backend endpoints used by the admin inventory page
|--------------------------------------------------------------------------
| GET   /admin/inventory?search&stockFilter=low|out|in&sort&page&limit
|         -> data { items[], summary, lowStockLimit, pagination }
| PATCH /admin/inventory/:variantId/stock
|         body { size, stock }   set an exact number
|          or  { size, adjust }  add (+) or remove (-) units
|         -> data  the updated row
*/

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;

// =====================================================
// LIST
// =====================================================
export const getAdminInventory = createAsyncThunk(
  "adminInventory/getAdminInventory",
  async (
    {
      search = "",
      stockFilter = "all",
      sort = "newest",
      page = 1,
      limit = 10,
    } = {},
    { rejectWithValue }
  ) => {
    try {
      // "all" and empty values are simply not sent
      const params = { sort, page, limit };
      if (search) params.search = search;
      if (stockFilter && stockFilter !== "all") params.stockFilter = stockFilter;

      const response = await axiosInstance.get("/admin/inventory", { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load the inventory.")
      );
    }
  }
);

// =====================================================
// CHANGE THE STOCK OF ONE SIZE
// =====================================================
export const updateAdminStock = createAsyncThunk(
  "adminInventory/updateAdminStock",
  async ({ variantId, size, stock, adjust }, { rejectWithValue }) => {
    try {
      const body = { size };
      if (adjust !== undefined) body.adjust = adjust;
      else body.stock = stock;

      const response = await axiosInstance.patch(
        `/admin/inventory/${variantId}/stock`,
        body
      );
      return { message: response.data.message, item: response.data.data };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update the stock.")
      );
    }
  }
);

// =====================================================
// SLICE
// =====================================================
const initialState = {
  items: [],
  summary: { total: 0, inStock: 0, low: 0, out: 0, units: 0 },
  lowStockLimit: 5,
  pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 1 },
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const inventorySlice = createSlice({
  name: "adminInventory",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(getAdminInventory.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getAdminInventory.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items || [];
        state.summary = action.payload.summary || initialState.summary;
        state.lowStockLimit =
          action.payload.lowStockLimit ?? initialState.lowStockLimit;
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(getAdminInventory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load the inventory.";
      })

      // stock changed: update that row in place (the page also refreshes the summary)
      .addCase(updateAdminStock.fulfilled, (state, action) => {
        const updated = action.payload.item;
        state.items = state.items.map((row) =>
          row.variantId === updated.variantId
            ? { ...row, ...updated, productName: updated.productName || row.productName }
            : row
        );
      });
  },
});

export default inventorySlice.reducer;
