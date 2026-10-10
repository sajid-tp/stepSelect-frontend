import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

/*
|--------------------------------------------------------------------------
| GET BRANDS
|--------------------------------------------------------------------------
*/

export const getBrands = createAsyncThunk(
  "adminBrands/getBrands",
  async ({ search = "", page = 1 ,sort} = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/admin/brands", {
        params: {
          search,
          page,
          sort
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to fetch brands."
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| CREATE BRAND
|--------------------------------------------------------------------------
*/

export const createBrand = createAsyncThunk(
  "adminBrands/createBrand",
  async (brandData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/admin/brands",
        brandData
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to create brand."
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| UPDATE BRAND
|--------------------------------------------------------------------------
*/

export const updateBrand = createAsyncThunk(
  "adminBrands/updateBrand",
  async ({ brandId, brandData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/admin/brands/${brandId}`,
        brandData
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to update brand."
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| TOGGLE BRAND STATUS
|--------------------------------------------------------------------------
*/

export const toggleBrandStatus = createAsyncThunk(
  "adminBrands/toggleBrandStatus",
  async (brandId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/admin/brands/${brandId}/status`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to update brand status."
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| DELETE BRAND
|--------------------------------------------------------------------------
*/

export const deleteBrand = createAsyncThunk(
  "adminBrands/deleteBrand",
  async (brandId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `/admin/brands/${brandId}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
          "Failed to delete brand."
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| INITIAL STATE
|--------------------------------------------------------------------------
*/

const initialState = {
  brands: [],

  totalResults: 0,
  totalPages: 1,
  currentPage: 1,
  limit: 5,

  status: "idle",
  error: null,

  createStatus: "idle",
  createError: null,

  updateStatus: "idle",
  updateError: null,

  toggleStatus: "idle",
  toggleError: null,

  deleteStatus: "idle",
  deleteError: null,
};

/*
|--------------------------------------------------------------------------
| SLICE
|--------------------------------------------------------------------------
*/

const brandSlice = createSlice({
  name: "adminBrands",

  initialState,

  reducers: {
    clearBrandErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.toggleError = null;
      state.deleteError = null;
    },

    resetCreateBrandState: (state) => {
      state.createStatus = "idle";
      state.createError = null;
    },

    resetUpdateBrandState: (state) => {
      state.updateStatus = "idle";
      state.updateError = null;
    },
  },

  extraReducers: (builder) => {
    /*
    |--------------------------------------------------------------------------
    | GET BRANDS
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(getBrands.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(getBrands.fulfilled, (state, action) => {
        state.status = "succeeded";

        state.brands = action.payload.brands;

        state.totalResults = action.payload.totalResults;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.page;
        state.limit = action.payload.limit;
      })

      .addCase(getBrands.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    /*
    |--------------------------------------------------------------------------
    | CREATE BRAND
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(createBrand.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })

      .addCase(createBrand.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.createError = null;
      })

      .addCase(createBrand.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload;
      });

    /*
    |--------------------------------------------------------------------------
    | UPDATE BRAND
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(updateBrand.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })

      .addCase(updateBrand.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        state.updateError = null;

        const updatedBrand = action.payload;

        const index = state.brands.findIndex(
          (brand) => brand.id === updatedBrand.id
        );

        if (index !== -1) {
          state.brands[index] = updatedBrand;
        }
      })

      .addCase(updateBrand.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload;
      });

    /*
    |--------------------------------------------------------------------------
    | TOGGLE BRAND STATUS
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(toggleBrandStatus.pending, (state) => {
        state.toggleStatus = "loading";
        state.toggleError = null;
      })

      .addCase(toggleBrandStatus.fulfilled, (state, action) => {
        state.toggleStatus = "succeeded";
        state.toggleError = null;

        const updatedBrand = action.payload;

        const index = state.brands.findIndex(
          (brand) => brand.id === updatedBrand.id
        );

        if (index !== -1) {
          state.brands[index] = {
            ...state.brands[index],
            isActive: updatedBrand.isActive,
            deletedAt: updatedBrand.deletedAt,
          };
        }
      })

      .addCase(toggleBrandStatus.rejected, (state, action) => {
        state.toggleStatus = "failed";
        state.toggleError = action.payload;
      });

    /*
    |--------------------------------------------------------------------------
    | DELETE BRAND
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(deleteBrand.pending, (state) => {
        state.deleteStatus = "loading";
        state.deleteError = null;
      })

      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.deleteError = null;

        const deletedBrand = action.payload;

        state.brands = state.brands.filter(
          (brand) => brand.id !== deletedBrand.id
        );

        state.totalResults = Math.max(
          state.totalResults - 1,
          0
        );
      })

      .addCase(deleteBrand.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError = action.payload;
      });
  },
});

export const {
  clearBrandErrors,
  resetCreateBrandState,
  resetUpdateBrandState,
} = brandSlice.actions;

export default brandSlice.reducer;