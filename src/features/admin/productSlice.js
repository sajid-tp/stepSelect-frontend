import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";


// =====================================================
// GET PRODUCTS
// =====================================================

export const getProducts = createAsyncThunk(
  "adminProducts/getProducts",
  async (
    {
      search = "",
      page = 1,
      limit = 5,
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get(
        "/admin/products",
        {
          params: {
            search,
            page,
            limit,
          },
        }
      );

      return response.data;

    } catch (error) {

      return rejectWithValue(
        error.response?.data?.error?.message ||
        "Failed to fetch products."
      );
    }
  }
);


// =====================================================
// GET ONE PRODUCT
// =====================================================

export const getProduct = createAsyncThunk(
  "adminProducts/getProduct",
  async (productId, { rejectWithValue }) => {
    try {

      const response = await axiosInstance.get(
        `/admin/products/${productId}`
      );

      return response.data;

    } catch (error) {

      return rejectWithValue(
        error.response?.data?.error?.message ||
        "Failed to fetch product."
      );
    }
  }
);


// =====================================================
// CREATE PRODUCT
// =====================================================

export const createProduct = createAsyncThunk(
  "adminProducts/createProduct",
  async (productData, { rejectWithValue }) => {

    try {

      const response = await axiosInstance.post(
        "/admin/products",
        productData
      );

      return response.data;

    } catch (error) {

      return rejectWithValue(
        error.response?.data?.error?.message ||
        "Failed to create product."
      );
    }
  }
);


// =====================================================
// UPDATE PRODUCT
// =====================================================

export const updateProduct = createAsyncThunk(
  "adminProducts/updateProduct",
  async (
    {
      productId,
      productData,
    },
    { rejectWithValue }
  ) => {

    try {

      const response = await axiosInstance.patch(
        `/admin/products/${productId}`,
        productData
      );

      return response.data;

    } catch (error) {

      return rejectWithValue(
        error.response?.data?.error?.message ||
        "Failed to update product."
      );
    }
  }
);


// =====================================================
// DELETE PRODUCT
// =====================================================

export const deleteProduct = createAsyncThunk(
  "adminProducts/deleteProduct",
  async (productId, { rejectWithValue }) => {

    try {

      const response = await axiosInstance.delete(
        `/admin/products/${productId}`
      );

      return {
        productId,
        ...response.data,
      };

    } catch (error) {

      return rejectWithValue(
        error.response?.data?.error?.message ||
        "Failed to delete product."
      );
    }
  }
);


// =====================================================
// TOGGLE PRODUCT STATUS
// =====================================================

export const toggleProductStatus = createAsyncThunk(
  "adminProducts/toggleProductStatus",
  async (productId, { rejectWithValue }) => {

    try {

      const response = await axiosInstance.patch(
        `/admin/products/${productId}/status`
      );

      return response.data;

    } catch (error) {

      return rejectWithValue(
        error.response?.data?.error?.message ||
        "Failed to update product status."
      );
    }
  }
);


// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {

  products: [],

  totalResults: 0,
  totalPages: 1,
  currentPage: 1,
  limit: 5,

  selectedProduct: null,

  status: "idle",
  error: null,

  createStatus: "idle",
  createError: null,

  updateStatus: "idle",
  updateError: null,

  deleteStatus: "idle",
  deleteError: null,

  statusUpdateStatus: "idle",
  statusUpdateError: null,
};


// =====================================================
// SLICE
// =====================================================

const productSlice = createSlice({

  name: "adminProducts",

  initialState,

  reducers: {

    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },

    clearProductErrors: (state) => {

      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.statusUpdateError = null;

    },

    resetCreateStatus: (state) => {

      state.createStatus = "idle";
      state.createError = null;

    },

    resetUpdateStatus: (state) => {

      state.updateStatus = "idle";
      state.updateError = null;

    },

  },

  extraReducers: (builder) => {

    // =================================================
    // GET PRODUCTS
    // =================================================

    builder

      .addCase(
        getProducts.pending,
        (state) => {

          state.status = "loading";
          state.error = null;

        }
      )

      .addCase(
        getProducts.fulfilled,
        (state, action) => {

          state.status = "succeeded";

          state.products =
            action.payload.products || [];

          state.totalResults =
            action.payload.pagination?.totalProducts || 0;

          state.totalPages =
            action.payload.pagination?.totalPages || 1;

          state.currentPage =
            action.payload.pagination?.currentPage || 1;

          state.limit =
            action.payload.pagination?.limit || 5;

        }
      )

      .addCase(
        getProducts.rejected,
        (state, action) => {

          state.status = "failed";

          state.error =
            action.payload || "Failed to fetch products.";

        }
      );


    // =================================================
    // GET PRODUCT
    // =================================================

    builder

      .addCase(
        getProduct.pending,
        (state) => {

          state.status = "loading";
          state.error = null;

        }
      )

      .addCase(
        getProduct.fulfilled,
        (state, action) => {

          state.status = "succeeded";

          state.selectedProduct =
            action.payload;

        }
      )

      .addCase(
        getProduct.rejected,
        (state, action) => {

          state.status = "failed";

          state.error =
            action.payload || "Failed to fetch product.";

        }
      );


    // =================================================
    // CREATE PRODUCT
    // =================================================

    builder

      .addCase(
        createProduct.pending,
        (state) => {

          state.createStatus = "loading";
          state.createError = null;

        }
      )

      .addCase(
        createProduct.fulfilled,
        (state, action) => {

          state.createStatus = "succeeded";

          state.createError = null;

          if (action.payload) {
            state.selectedProduct =
              action.payload;
          }

        }
      )

      .addCase(
        createProduct.rejected,
        (state, action) => {

          state.createStatus = "failed";

          state.createError =
            action.payload || "Failed to create product.";

        }
      );


    // =================================================
    // UPDATE PRODUCT
    // =================================================

    builder

      .addCase(
        updateProduct.pending,
        (state) => {

          state.updateStatus = "loading";
          state.updateError = null;

        }
      )

      .addCase(
        updateProduct.fulfilled,
        (state, action) => {

          state.updateStatus = "succeeded";

          state.updateError = null;

          const updatedProduct =
            action.payload;

          state.selectedProduct =
            updatedProduct;

          const index =
            state.products.findIndex(
              (product) =>
                product.id === updatedProduct.id
            );

          if (index !== -1) {

            state.products[index] = {
              ...state.products[index],
              ...updatedProduct,
            };

          }

        }
      )

      .addCase(
        updateProduct.rejected,
        (state, action) => {

          state.updateStatus = "failed";

          state.updateError =
            action.payload || "Failed to update product.";

        }
      );


    // =================================================
    // DELETE PRODUCT
    // =================================================

    builder

      .addCase(
        deleteProduct.pending,
        (state) => {

          state.deleteStatus = "loading";
          state.deleteError = null;

        }
      )

      .addCase(
        deleteProduct.fulfilled,
        (state, action) => {

          state.deleteStatus = "succeeded";

          const productId =
            action.payload.productId;

          state.products =
            state.products.filter(
              (product) =>
                product.id !== productId
            );

          state.totalResults =
            Math.max(0, state.totalResults - 1);

        }
      )

      .addCase(
        deleteProduct.rejected,
        (state, action) => {

          state.deleteStatus = "failed";

          state.deleteError =
            action.payload || "Failed to delete product.";

        }
      );


    // =================================================
    // TOGGLE STATUS
    // =================================================

    builder

      .addCase(
        toggleProductStatus.pending,
        (state) => {

          state.statusUpdateStatus =
            "loading";

          state.statusUpdateError =
            null;

        }
      )

      .addCase(
        toggleProductStatus.fulfilled,
        (state, action) => {

          state.statusUpdateStatus =
            "succeeded";

          const updatedProduct =
            action.payload;

          const index =
            state.products.findIndex(
              (product) =>
                product.id === updatedProduct.id
            );

          if (index !== -1) {

            state.products[index].isActive =
              updatedProduct.isActive;

          }

          if (
            state.selectedProduct &&
            state.selectedProduct.id ===
              updatedProduct.id
          ) {

            state.selectedProduct.isActive =
              updatedProduct.isActive;

          }

        }
      )

      .addCase(
        toggleProductStatus.rejected,
        (state, action) => {

          state.statusUpdateStatus =
            "failed";

          state.statusUpdateError =
            action.payload ||
            "Failed to update product status.";

        }
      );

  },
});


export const {
  clearSelectedProduct,
  clearProductErrors,
  resetCreateStatus,
  resetUpdateStatus,
} = productSlice.actions;


export default productSlice.reducer;