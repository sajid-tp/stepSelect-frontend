import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";


// =====================================================
// GET PRODUCTS
// =====================================================

export const getProducts = createAsyncThunk(
  "userProducts/getProducts",

  async (
    {
      search = "",
      category = "",
      brand = "",
      gender = "",
      minPrice = "",
      maxPrice = "",
      sort = "",
      page = 1,
      limit = 12,
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.get(
        "/products",
        {
          params: {
            search,
            category,
            brand,
            gender,
            minPrice,
            maxPrice,
            sort,
            page,
            limit,
          },
        }
      );

      return res.data;

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
        "Failed to fetch products"
      );
    }
  }
);


// =====================================================
// GET CATEGORIES
// =====================================================

export const getCategories = createAsyncThunk(
  "userProducts/getCategories",

  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        "/categories"
      );

      return res.data;

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
        "Failed to fetch categories"
      );
    }
  }
);


// =====================================================
// GET BRANDS
// =====================================================

export const getBrands = createAsyncThunk(
  "userProducts/getBrands",

  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        "/brands"
      );

      return res.data;

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
        "Failed to fetch brands"
      );
    }
  }
);



export const getProductById = createAsyncThunk(
  "userProducts/getProductById",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/products/${productId}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
        "Failed to fetch product"
      );
    }
  }
);


// =====================================================
// INITIAL STATE
// =====================================================

const initialState = {

  // Products
  products: [],

  // Categories
  categories: [],

  // Brands
  brands: [],

  // Pagination
  totalResults: 0,
  totalPages: 1,
  currentPage: 1,
  limit: 12,

  // Product GET
  productStatus: "idle",
  productError: null,

  productDetails: null,
productDetailsStatus: "idle",
productDetailsError: null,

  // Category GET
  categoryStatus: "idle",
  categoryError: null,

  // Brand GET
  brandStatus: "idle",
  brandError: null,

};


// =====================================================
// SLICE
// =====================================================

const userProductSlice = createSlice({

  name: "userProducts",

  initialState,

  reducers: {},

  extraReducers: (builder) => {

    // =================================================
    // GET PRODUCTS
    // =================================================

    builder

      .addCase(
        getProducts.pending,
        (state) => {

          state.productStatus = "loading";
          state.productError = null;

        }
      )

      .addCase(
        getProducts.fulfilled,
        (state, action) => {

          state.productStatus = "succeeded";
          state.productError = null;

          const data = action.payload.data;

          state.products =
            data?.products || [];

          state.totalResults =
            data?.pagination?.totalResults || 0;

          state.totalPages =
            data?.pagination?.totalPages || 1;

          state.currentPage =
            data?.pagination?.page || 1;

          state.limit =
            data?.pagination?.limit || 12;

        }
      )

      .addCase(
        getProducts.rejected,
        (state, action) => {

          state.productStatus = "failed";

          state.productError =
            action.payload;

          state.products = [];

        }
      );


    // =================================================
    // GET CATEGORIES
    // =================================================

    builder

      .addCase(
        getCategories.pending,
        (state) => {

          state.categoryStatus = "loading";
          state.categoryError = null;

        }
      )

      .addCase(
        getCategories.fulfilled,
        (state, action) => {

          state.categoryStatus = "succeeded";
          state.categoryError = null;

          state.categories =
            action.payload.data?.categories || [];

        }
      )

      .addCase(
        getCategories.rejected,
        (state, action) => {

          state.categoryStatus = "failed";

          state.categoryError =
            action.payload;

        }
      )
      .addCase(getProductById.pending, (state) => {
  state.productDetailsStatus = "loading";
  state.productDetailsError = null;
})

.addCase(getProductById.fulfilled, (state, action) => {
  state.productDetailsStatus = "succeeded";
  state.productDetails = action.payload.data || null;
})

.addCase(getProductById.rejected, (state, action) => {
  state.productDetailsStatus = "failed";
  state.productDetailsError = action.payload;
});


    // =================================================
    // GET BRANDS
    // =================================================

    builder

      .addCase(
        getBrands.pending,
        (state) => {

          state.brandStatus = "loading";
          state.brandError = null;

        }
      )

      .addCase(
        getBrands.fulfilled,
        (state, action) => {

          state.brandStatus = "succeeded";
          state.brandError = null;

          state.brands =
            action.payload.data?.brands || [];

        }
      )

      .addCase(
        getBrands.rejected,
        (state, action) => {

          state.brandStatus = "failed";

          state.brandError =
            action.payload;

        }
      );

  },

});


export default userProductSlice.reducer;