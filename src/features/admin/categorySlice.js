import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";


// =====================================================
// GET CATEGORIES
// =====================================================

export const getCategories = createAsyncThunk(
  "adminCategories/getCategories",

  async (
    {
      search = "",
      page = 1,
      limit = 5,
      sort
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.get(
        "/admin/categories",
        {
          params: {
            search,
            page,
            limit,
            sort
          },
        }
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
// CREATE CATEGORY
// =====================================================

export const createCategory = createAsyncThunk(
  "adminCategories/createCategory",

  async (categoryData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        "/admin/categories",
        categoryData
      );

      return res.data;

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
        "Failed to create category"
      );
    }
  }
);


// =====================================================
// UPDATE CATEGORY
// =====================================================

export const updateCategory = createAsyncThunk(
  "adminCategories/updateCategory",

  async (
    { categoryId, categoryData },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.patch(
        `/admin/categories/${categoryId}`,
        categoryData
      );

      return res.data;

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
        "Failed to update category"
      );
    }
  }
);


// =====================================================
// TOGGLE CATEGORY STATUS
// =====================================================

export const toggleCategoryStatus = createAsyncThunk(
  "adminCategories/toggleCategoryStatus",

  async (categoryId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(
        `/admin/categories/${categoryId}/status`
      );

      return res.data;

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
        "Failed to update category status"
      );
    }
  }
);


// =====================================================
// DELETE CATEGORY
// =====================================================

export const deleteCategory = createAsyncThunk(
  "adminCategories/deleteCategory",

  async (categoryId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(
        `/admin/categories/${categoryId}`
      );

      return res.data;

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error?.message ||
        "Failed to delete category"
      );
    }
  }
);


// =====================================================
// SLICE
// =====================================================

const adminCategorySlice = createSlice({

  name: "adminCategories",

  initialState: {

    categories: [],

    totalResults: 0,

    totalPages: 1,

    currentPage: 1,

    limit: 5,

    // GET
    status: "idle",
    error: null,

    // CREATE
    createStatus: "idle",
    createError: null,

    // UPDATE
    updateStatus: "idle",
    updateError: null,

    // DELETE
    deleteStatus: "idle",
    deleteError: null,

  },


  reducers: {},


  extraReducers: (builder) => {

    builder

      // =================================================
      // GET
      // =================================================

      .addCase(
        getCategories.pending,
        (state) => {

          state.status = "loading";
          state.error = null;

        }
      )

      .addCase(
        getCategories.fulfilled,
        (state, action) => {

          state.status = "succeeded";

          state.categories =
            action.payload.categories;

          state.totalResults =
            action.payload.totalResults;

          state.totalPages =
            action.payload.totalPages;

          state.currentPage =
            action.payload.page;

          state.limit =
            action.payload.limit;

        }
      )

      .addCase(
        getCategories.rejected,
        (state, action) => {

          state.status = "failed";

          state.error =
            action.payload;

        }
      )


      // =================================================
      // CREATE
      // =================================================

      .addCase(
        createCategory.pending,
        (state) => {

          state.createStatus = "loading";
          state.createError = null;

        }
      )

      .addCase(
        createCategory.fulfilled,
        (state) => {

          state.createStatus = "succeeded";
          state.createError = null;

        }
      )

      .addCase(
        createCategory.rejected,
        (state, action) => {

          state.createStatus = "failed";

          state.createError =
            action.payload;

        }
      )


      // =================================================
      // UPDATE
      // =================================================

      .addCase(
        updateCategory.pending,
        (state) => {

          state.updateStatus = "loading";
          state.updateError = null;

        }
      )

      .addCase(
        updateCategory.fulfilled,
        (state, action) => {

          state.updateStatus = "succeeded";
          state.updateError = null;

          const updatedCategory =
            action.payload;

          const index =
            state.categories.findIndex(
              (category) =>
                category.id ===
                updatedCategory.id
            );

          if (index !== -1) {

            state.categories[index] =
              updatedCategory;

          }

        }
      )

      .addCase(
        updateCategory.rejected,
        (state, action) => {

          state.updateStatus = "failed";

          state.updateError =
            action.payload;

        }
      )


      // =================================================
      // TOGGLE STATUS
      // =================================================

      .addCase(
        toggleCategoryStatus.pending,
        (state) => {

          state.error = null;

        }
      )

      .addCase(
        toggleCategoryStatus.fulfilled,
        (state, action) => {

          const {
            id,
            isActive,
          } = action.payload;

          const category =
            state.categories.find(
              (category) =>
                category.id === id
            );

          if (category) {

            category.isActive =
              isActive;

          }

        }
      )

      .addCase(
        toggleCategoryStatus.rejected,
        (state, action) => {

          state.error =
            action.payload;

        }
      )


      // =================================================
      // DELETE
      // =================================================

      .addCase(
        deleteCategory.pending,
        (state) => {

          state.deleteStatus = "loading";
          state.deleteError = null;

        }
      )

      .addCase(
        deleteCategory.fulfilled,
        (state, action) => {

          state.deleteStatus = "succeeded";
          state.deleteError = null;

          const deletedId =
            action.payload.id;

          state.categories =
            state.categories.filter(
              (category) =>
                category.id !== deletedId
            );

          state.totalResults =
            Math.max(
              0,
              state.totalResults - 1
            );

          state.totalPages =
            Math.max(
              1,
              Math.ceil(
                state.totalResults /
                state.limit
              )
            );

        }
      )

      .addCase(
        deleteCategory.rejected,
        (state, action) => {

          state.deleteStatus = "failed";

          state.deleteError =
            action.payload;

        }
      );

  },

});


export default adminCategorySlice.reducer;